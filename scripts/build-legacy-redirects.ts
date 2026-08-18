/**
 * Phase 7d — turn `data/media-redirect-map.json` (the Phase 7b inventory) plus
 * the frozen WordPress `/la-revista/` URL space into actual `vercel.json`
 * rules, so nothing that had inbound links 404s when WordPress is switched off.
 *
 * Every rule lands the visitor on a CLEAN first-party URL — a raw
 * `assets.ctfassets.net` link is never the visible destination:
 *
 *   1. Magazine PDFs -> `/revistavamos/<slug>/`, the edition page. It carries
 *      the cover, the intro and a working PDF link, and keeps link equity here.
 *   2. Other migrated documents -> `/recursos/<filename>`, a first-party path
 *      that a companion rewrite proxies to the Contentful asset. Same trick as
 *      the revista PDFs in build-revista-pdf-rewrites.ts, same reason.
 *   3. Legacy `/la-revista/<slug>/` whose slug drifted in the CMS -> the
 *      current `/revistavamos/<slug>/`. The blanket `/la-revista/:path*` rule
 *      would 301 these straight into a 404 (or, for the three slugs in
 *      `liveOnNewSite`, into the WRONG edition).
 *
 * Images are deliberately NOT emitted: WordPress serves generated size
 * variants (`-300x200.jpg`) that appear in no API, so the URL space cannot be
 * enumerated 1:1 — see docs/media-redirect-review.md.
 *
 * Ownership: this script replaces only the rules it generates, identified by
 * source prefix, and prepends them so the exact-path rules win over the
 * hand-written `/la-revista/:path*` wildcard. Hand-written rules and the
 * `/revistavamos/**.pdf` rewrites from build-revista-pdf-rewrites.ts survive.
 *
 * Re-runnable: `yarn build:legacy-redirects`.
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const VERCEL_JSON = path.join(process.cwd(), "vercel.json");
const MEDIA_MAP = path.join(process.cwd(), "data", "media-redirect-map.json");
const REVISTA_ALIASES = path.join(
  process.cwd(),
  "data",
  "legacy-revista-aliases.json",
);

interface Redirect {
  source: string;
  destination: string;
  permanent: boolean;
}
interface Rewrite {
  source: string;
  destination: string;
}

interface MediaEntry {
  path: string;
  fileName: string;
  bucket: "vamos-pdf" | "contentful-asset" | "unresolved-doc" | "image" | "junk";
  destination?: string;
}

interface RevistaAliases {
  slugAliases: Record<string, string>;
  liveOnNewSite: string[];
  pdfToSlug: Record<string, string>;
}

/** Redirects this script owns. Anything else in vercel.json is left alone. */
function ownsRedirect(source: string): boolean {
  if (source.startsWith("/wp-content/uploads/")) return true;
  // Exact-path legacy revista aliases only — never the `:path*` wildcards or
  // the bare `/la-revista` rules, which are hand-written.
  for (const prefix of ["/la-revista/", "/revistavamos/"]) {
    if (source.startsWith(prefix) && source.length > prefix.length) {
      return !source.includes(":");
    }
  }
  return false;
}

/** Rewrites this script owns. The `/revistavamos/**.pdf` proxies belong to
 * build-revista-pdf-rewrites.ts and must survive a re-run here. */
function ownsRewrite(source: string): boolean {
  return source.startsWith("/recursos/");
}

async function main() {
  const media = JSON.parse(await readFile(MEDIA_MAP, "utf8")) as {
    entries: MediaEntry[];
  };
  const aliases = JSON.parse(
    await readFile(REVISTA_ALIASES, "utf8"),
  ) as RevistaAliases;

  const redirects: Redirect[] = [];
  const rewrites: Rewrite[] = [];
  const unresolved: string[] = [];

  // 3. Legacy revista slugs. Emitted first so they precede `/la-revista/:path*`.
  const collides = new Set(aliases.liveOnNewSite);
  for (const [from, to] of Object.entries(aliases.slugAliases)) {
    const destination = `/revistavamos/${to}/`;
    redirects.push({
      source: `/la-revista/${from}`,
      destination,
      permanent: true,
    });
    // WordPress mirrored the same slugs under /revistavamos/. Mirroring the
    // alias there too would hijack a live, canonical URL of the new site when
    // the legacy slug happens to name a different edition.
    if (!collides.has(from)) {
      redirects.push({
        source: `/revistavamos/${from}`,
        destination,
        permanent: true,
      });
    }
  }

  // 1 + 2. /wp-content/uploads/
  for (const entry of media.entries) {
    if (entry.bucket === "image" || entry.bucket === "junk") continue;

    const editionSlug = aliases.pdfToSlug[entry.path];
    if (editionSlug) {
      redirects.push({
        source: entry.path,
        destination: `/revistavamos/${editionSlug}/`,
        permanent: true,
      });
      continue;
    }
    if (entry.bucket === "vamos-pdf" && entry.destination) {
      redirects.push({
        source: entry.path,
        destination: entry.destination,
        permanent: true,
      });
      continue;
    }
    if (entry.bucket === "contentful-asset" && entry.destination) {
      const pretty = `/recursos/${entry.fileName}`;
      redirects.push({ source: entry.path, destination: pretty, permanent: true });
      rewrites.push({ source: pretty, destination: entry.destination });
      continue;
    }
    unresolved.push(entry.path);
  }

  const raw = await readFile(VERCEL_JSON, "utf8");
  const config = JSON.parse(raw) as {
    redirects?: Redirect[];
    rewrites?: Rewrite[];
    [k: string]: unknown;
  };

  const keptRedirects = (config.redirects ?? []).filter(
    (r) => !ownsRedirect(r.source),
  );
  const keptRewrites = (config.rewrites ?? []).filter(
    (r) => !ownsRewrite(r.source),
  );

  config.redirects = [...redirects, ...keptRedirects];
  config.rewrites = [...keptRewrites, ...rewrites];

  await writeFile(VERCEL_JSON, JSON.stringify(config, null, 2) + "\n");

  console.log(
    `Wrote ${redirects.length} generated redirects (+${keptRedirects.length} hand-written) ` +
      `and ${rewrites.length} generated rewrites (+${keptRewrites.length} kept).`,
  );
  console.log(
    `Budget: ${config.redirects.length} redirects (Vercel limit 2,048) + ` +
      `${config.rewrites.length} rewrites.`,
  );
  if (unresolved.length) {
    console.log(
      `\n${unresolved.length} documents have no destination and will 404 ` +
        `(no Contentful asset carries them):`,
    );
    for (const p of unresolved) console.log(`  ${p}`);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
