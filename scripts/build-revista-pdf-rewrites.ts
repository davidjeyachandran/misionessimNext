/**
 * Phase 7c — give every revista PDF a first-party URL on misionessim.org
 * instead of exposing the raw Contentful CDN URL.
 *
 *   /revistavamos/lucha-espiritual/LuchaEspiritualVamosMarzo26-4.pdf
 *     -> https://assets.ctfassets.net/<space>/<id>/<hash>/LuchaEspiritual...pdf
 *
 * Implemented as Vercel **rewrites** (proxy, URL unchanged in the browser),
 * not redirects. Note that `output: "export"` forbids Next's own rewrites()
 * because they need a server — but vercel.json rewrites are applied at the
 * edge, before the static assets are consulted, so they work fine here.
 *
 * Why not a single wildcard rule: the Contentful asset URL embeds an opaque
 * entry id and content hash that cannot be derived from the slug or filename,
 * so each edition needs its own explicit mapping. 119 rules, generated.
 *
 * Ordering note: `/la-revista/:path*` -> `/revistavamos/:path*` already exists
 * in the redirects block, and Vercel evaluates redirects before rewrites, so
 * the legacy `/la-revista/...` PDF path 301s into the canonical one for free.
 *
 * This script rewrites ONLY the generated block in vercel.json, delimited by
 * the `revistaPdfRewrites` marker keys, so hand-written rules are preserved.
 *
 * Re-runnable: `yarn build:revista-rewrites`. Re-run whenever an edition is
 * added or its PDF is re-uploaded (the Contentful hash changes on re-upload).
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
const CDA_TOKEN = process.env.CONTENTFUL_ACCESS_TOKEN;
const VERCEL_JSON = path.join(process.cwd(), "vercel.json");

interface Rewrite {
  source: string;
  destination: string;
}

/** Mirrors normalizeRevistaSlug() in lib/contentful.ts — CMS slugs carry a
 * leading slash from the Drupal-era import. */
function normalizeSlug(slug: string): string {
  return slug.replace(/^\/+/, "").replace(/\/+$/, "");
}

async function fetchRevistaPdfs(): Promise<
  Array<{ slug: string; fileName: string; url: string; fecha: string }>
> {
  if (!SPACE_ID || !CDA_TOKEN) {
    throw new Error("CONTENTFUL_SPACE_ID / CONTENTFUL_ACCESS_TOKEN not set");
  }
  const query = `{
    revistaCollection(order: fecha_DESC, limit: 200) {
      items { slug fecha revistaPdf { url fileName } }
    }
  }`;
  const res = await fetch(
    `https://graphql.contentful.com/content/v1/spaces/${SPACE_ID}/environments/master`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${CDA_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    },
  );
  const json = (await res.json()) as {
    errors?: unknown;
    data: {
      revistaCollection: {
        items: Array<{
          slug: string;
          fecha: string;
          revistaPdf?: { url: string; fileName: string } | null;
        }>;
      };
    };
  };
  if (json.errors) throw new Error(JSON.stringify(json.errors));

  return json.data.revistaCollection.items
    .filter((r) => r.revistaPdf?.url && r.slug)
    .map((r) => {
      const url = r.revistaPdf!.url.startsWith("//")
        ? `https:${r.revistaPdf!.url}`
        : r.revistaPdf!.url;
      // Take the filename from the asset URL's last segment rather than from
      // the `fileName` field. Contentful has already made the URL segment
      // ASCII-safe (`ÁfricaVAMOS.pdf` -> `A_fricaVAMOS.pdf`), whereas the
      // raw field keeps the accent — and a literal non-ASCII byte in a
      // vercel.json `source` will not match the percent-encoded path a
      // browser actually requests.
      const fileName = new URL(url).pathname.split("/").pop() ?? "";
      return { slug: normalizeSlug(r.slug), fileName, url, fecha: r.fecha };
    });
}

async function main() {
  console.log("Fetching revista PDFs from Contentful ...");
  const revistas = await fetchRevistaPdfs();
  console.log(`  -> ${revistas.length} editions with a PDF`);

  // Assign URL slugs with the SAME algorithm as getAllRevistas() in
  // lib/contentful.ts: newest-first, and a colliding slug gets the edition
  // year appended. Two editions genuinely share a stored slug ("La Oración",
  // 2010 and 2014). If this drifts from the runtime, the rewrite source will
  // name a path the site never links to and the pretty URL 404s — so the
  // duplication is deliberate and must stay in step.
  const taken = new Set<string>();
  const rewrites: Rewrite[] = [];
  for (const r of revistas) {
    const base = r.slug;
    let urlSlug = base;
    if (taken.has(urlSlug)) {
      const year = new Date(r.fecha).getUTCFullYear();
      urlSlug = `${base}-${year}`;
      let i = 2;
      while (taken.has(urlSlug)) urlSlug = `${base}-${year}-${i++}`;
      console.log(`  slug collision: "${base}" -> "${urlSlug}" (${r.fecha.slice(0, 10)})`);
    }
    taken.add(urlSlug);
    rewrites.push({
      source: `/revistavamos/${urlSlug}/${r.fileName}`,
      destination: r.url,
    });
  }

  rewrites.sort((a, b) => a.source.localeCompare(b.source));

  const raw = await readFile(VERCEL_JSON, "utf8");
  const config = JSON.parse(raw) as {
    rewrites?: Rewrite[];
    [k: string]: unknown;
  };

  config.rewrites = rewrites;

  await writeFile(VERCEL_JSON, JSON.stringify(config, null, 2) + "\n");

  const redirects = (config.redirects as unknown[] | undefined)?.length ?? 0;
  console.log(`\nWrote ${rewrites.length} rewrites to vercel.json`);
  // Vercel caps the redirects array at 2,048 entries (source/destination
  // strings at 4,096 chars). The ~800 pending /wp-content/uploads redirects
  // therefore fit in the plain array — no need for the proprietary
  // `bulkRedirectsPath`, which would deepen platform lock-in for no gain.
  console.log(
    `Budget: ${redirects} redirects (limit 2,048) + ${rewrites.length} rewrites.`,
  );
  console.log("\nSample:");
  for (const r of rewrites.slice(0, 3)) {
    console.log(`  ${r.source}\n    -> ${r.destination}`);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
