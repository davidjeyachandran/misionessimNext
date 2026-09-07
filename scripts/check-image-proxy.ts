/**
 * Post-deploy guard: prove the `/cdn/img/**` rewrite still forwards query
 * strings to Contentful.
 *
 * Images are served first-party (see PROXY_PREFIX in
 * lib/contentful-image-loader.ts) so the LCP hero rides the HTTP/2 connection
 * the browser already has open, instead of paying a second DNS + TCP + TLS
 * handshake. The whole resize lives in the query string —
 * `?w=828&fm=webp&q=70&h=466&fit=fill` — and Vercel's docs describe rewrite
 * `source` matching as excluding the querystring without stating anywhere that
 * the querystring is forwarded to the destination. It is, but that is observed
 * behaviour rather than a documented contract.
 *
 * The failure mode if it ever changes is nasty precisely because it is quiet:
 * Contentful would serve the full-size original, every page would still look
 * correct, and the only symptom would be the Contentful bandwidth meter — the
 * same meter that blocked the space on 2026-08-25. So assert it explicitly.
 *
 * This talks to a live deployment, so it is NOT part of `prebuild`. Run it
 * after a deploy:
 *
 *   yarn check:image-proxy                        # production
 *   yarn check:image-proxy https://<preview>.vercel.app
 */

const DEFAULT_ORIGIN = "https://misionessim.org";

// Any article page will do; it just has to render a Contentful hero.
const SAMPLE_PAGE =
  "/blog/2026-09/como-el-deporte-abrio-puertas-para-el-liderazgo-y-la-esperanza/";

// Vercel's Attack Challenge Mode 403s requests without a browser-shaped UA.
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36";

const fail: string[] = [];
const check = (ok: boolean, message: string) => {
  console.log(`${ok ? "  ok  " : "  FAIL"}  ${message}`);
  if (!ok) fail.push(message);
};

async function main() {
  const origin = (process.argv[2] ?? DEFAULT_ORIGIN).replace(/\/$/, "");
  console.log(`Checking image proxy on ${origin}\n`);

  const page = await fetch(origin + SAMPLE_PAGE, { headers: { "user-agent": UA } });
  if (!page.ok) throw new Error(`${SAMPLE_PAGE} returned ${page.status}`);
  const html = await page.text();

  // Pull a real srcset entry rather than hand-building one, so the check
  // follows the loader's actual output if its params ever change.
  const match = html.match(/\/cdn\/img\/[^\s"'\\]+?\?[^\s"'\\]+/);
  if (!match) {
    throw new Error(
      `No /cdn/img/ URL found in ${SAMPLE_PAGE}. Either the page has no ` +
        `Contentful hero, or the loader is no longer emitting proxied URLs.`,
    );
  }
  const imageUrl = origin + match[0].replace(/&amp;/g, "&");
  const want = new URL(imageUrl).searchParams;
  console.log(`Sample: ${match[0].replace(/&amp;/g, "&")}\n`);

  const res = await fetch(imageUrl, { headers: { "user-agent": UA } });
  const type = res.headers.get("content-type") ?? "";
  const bytes = (await res.arrayBuffer()).byteLength;

  check(res.status === 200, `200 from the proxied URL (got ${res.status})`);

  // The decisive one. Contentful only returns WebP when `fm=webp` reaches it,
  // so a JPEG here means the query string was dropped somewhere in the rewrite
  // and every image on the site is being served at full size.
  check(
    type === `image/${want.get("fm")}`,
    `query string reached Contentful — content-type is image/${want.get("fm")} (got ${type || "none"})`,
  );

  // A resized hero is tens of KB. An unresized WordPress-era original is
  // hundreds. This catches `w=` being dropped while `fm=` survives.
  const w = Number(want.get("w"));
  check(
    bytes > 0 && bytes < 250_000,
    `resized, not the original — ${(bytes / 1024).toFixed(0)}KB at w=${w}`,
  );

  const cache = res.headers.get("cache-control") ?? "";
  check(/max-age=\d{5,}/.test(cache), `long-lived cache-control (got "${cache || "none"}")`);

  if (fail.length) {
    console.error(`\n${fail.length} check(s) failed.`);
    process.exit(1);
  }
  console.log("\nImage proxy is healthy.");
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
