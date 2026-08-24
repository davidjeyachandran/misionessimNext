/**
 * Phase 7d — turn `data/media-redirect-map.json` (the Phase 7b inventory) plus
 * the frozen WordPress `/la-revista/` URL space into actual `vercel.json`
 * rules, so nothing that had inbound links 404s when WordPress is switched off.
 *
 * Every rule lands the visitor on a CLEAN first-party URL — a raw
 * `assets.ctfassets.net` link is never the visible destination:
 *
 *   1. Magazine PDFs -> `/revistavamos/<slug>/<file>.pdf`, the first-party PDF
 *      path proxied to Contentful by build-revista-pdf-rewrites.ts. The old
 *      URL was a PDF, so it must still open a PDF: landing on the edition page
 *      instead breaks anyone deep-linking the file (and every "download the
 *      issue" link out there). The edition slug is still in the path, so link
 *      equity stays on the domain. Editions with no PDF rewrite fall back to
 *      the edition page.
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
const DRUPAL_MAP = path.join(process.cwd(), "data", "drupal-file-map.json");
const MANUAL_DESTINATIONS = path.join(
  process.cwd(),
  "data",
  "media-manual-destinations.json",
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

interface DrupalHit {
  path: string;
  wpPath: string;
}

interface RevistaAliases {
  slugAliases: Record<string, string>;
  liveOnNewSite: string[];
  pdfToSlug: Record<string, string>;
}

/** Redirects this script owns. Anything else in vercel.json is left alone. */
function ownsRedirect(source: string): boolean {
  if (source.startsWith("/wp-content/uploads/")) return true;
  if (source.startsWith("/sites/default/files/")) return true;
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

/**
 * Edition slug -> its first-party PDF path, read back from the
 * `/revistavamos/<slug>/<file>.pdf` rewrites. Those are generated from
 * Contentful by build-revista-pdf-rewrites.ts, which is the only place the
 * asset filename is known, so run that script first when an edition is added.
 */
function pdfPathsBySlug(rewrites: readonly Rewrite[]): Map<string, string> {
  const bySlug = new Map<string, string>();
  for (const { source } of rewrites) {
    const match = /^\/revistavamos\/([^/]+)\/[^/]+\.pdf$/i.exec(source);
    if (match) bySlug.set(match[1], source);
  }
  return bySlug;
}

async function main() {
  const media = JSON.parse(await readFile(MEDIA_MAP, "utf8")) as {
    entries: MediaEntry[];
  };
  const aliases = JSON.parse(
    await readFile(REVISTA_ALIASES, "utf8"),
  ) as RevistaAliases;
  const drupal = JSON.parse(await readFile(DRUPAL_MAP, "utf8")) as {
    entries: DrupalHit[];
  };
  const manual = JSON.parse(await readFile(MANUAL_DESTINATIONS, "utf8")) as {
    destinations: Record<string, string>;
  };

  const raw = await readFile(VERCEL_JSON, "utf8");
  const config = JSON.parse(raw) as {
    redirects?: Redirect[];
    rewrites?: Rewrite[];
    [k: string]: unknown;
  };
  const pdfBySlug = pdfPathsBySlug(config.rewrites ?? []);
  const withoutPdf: string[] = [];

  /** The PDF itself when we can serve it, else the edition page. */
  const editionTarget = (slug: string, source: string): string => {
    const pdf = pdfBySlug.get(slug);
    if (pdf) return pdf;
    withoutPdf.push(`${source} -> /revistavamos/${slug}/`);
    return `/revistavamos/${slug}/`;
  };

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

    // A document the repo already serves itself: point at our copy rather
    // than uploading the same bytes to Contentful for a second URL.
    const manualDestination = manual.destinations[entry.path];
    if (manualDestination) {
      redirects.push({ source: entry.path, destination: manualDestination, permanent: true });
      continue;
    }

    const editionSlug = aliases.pdfToSlug[entry.path];
    if (editionSlug) {
      redirects.push({
        source: entry.path,
        destination: editionTarget(editionSlug, entry.path),
        permanent: true,
      });
      continue;
    }
    if (entry.bucket === "vamos-pdf" && entry.destination) {
      const slug = entry.destination.replace(/^\/revistavamos\/|\/$/g, "");
      redirects.push({
        source: entry.path,
        destination: editionTarget(slug, entry.path),
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

  // 4. Drupal-era paths. WordPress answers these with a 301 into
  // /wp-content/uploads/, so they resolve today through two hops. We emit the
  // final destination directly: a chain would survive the shutdown only as
  // far as its first hop, and PROGRESS records "no redirect chains" as a
  // property of this file worth keeping.
  const destinationByWpPath = new Map(redirects.map((r) => [r.source, r.destination]));
  const drupalOrphans: string[] = [];
  for (const hit of drupal.entries) {
    const destination = destinationByWpPath.get(hit.wpPath);
    if (!destination) {
      drupalOrphans.push(`${hit.path} -> ${hit.wpPath || "(served in place)"}`);
      continue;
    }
    redirects.push({ source: hit.path, destination, permanent: true });
  }

  if (drupalOrphans.length) {
    console.log(
      `\n${drupalOrphans.length} Drupal paths have no destination (their `
        + `/wp-content/ twin is unresolved):`,
    );
    for (const o of drupalOrphans) console.log(`  ${o}`);
  }

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
  if (withoutPdf.length) {
    console.log(
      `\n${withoutPdf.length} magazine URLs fell back to the edition page ` +
        `(no PDF rewrite — run \`yarn build:revista-rewrites\` first):`,
    );
    for (const line of withoutPdf) console.log(`  ${line}`);
  }
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
