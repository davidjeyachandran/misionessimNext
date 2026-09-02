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
 *   4. Drupal-era paths Google still requests (`data/legacy-404s.json`, a
 *      frozen Search Console export). WordPress never redirected these either,
 *      so they have been 404ing for years — the new site is simply the first
 *      place the log became visible. Documents resolve by filename against the
 *      `/recursos/` assets emitted above; pages resolve through the
 *      hand-decided `data/legacy-page-map.json`.
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
const DRUPAL_HTACCESS = path.join(
  process.cwd(),
  "data",
  "drupal-htaccess-redirects.json",
);
const MANUAL_DESTINATIONS = path.join(
  process.cwd(),
  "data",
  "media-manual-destinations.json",
);
const LEGACY_404S = path.join(process.cwd(), "data", "legacy-404s.json");
const LEGACY_PAGE_MAP = path.join(process.cwd(), "data", "legacy-page-map.json");

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

interface Legacy404 {
  host: string;
  path: string;
  lastCrawled: string;
}

interface LegacyPageMap {
  revistaSlugAliases: Record<string, string>;
  exact: Record<string, string>;
  wildcards: { source: string; destination: string }[];
}

interface RevistaAliases {
  slugAliases: Record<string, string>;
  liveOnNewSite: string[];
  pdfToSlug: Record<string, string>;
}

/**
 * The Drupal-era prefixes section 4 owns outright — wildcards included, since
 * nothing under them is hand-written. Listed in full rather than matched by a
 * shorter stem so `/recursos-movilicemos/` can't be mistaken for `/recurso/`.
 */
const DRUPAL_PREFIXES = [
  "/images/",
  "/phocadownload/",
  "/content/",
  "/recurso/",
  "/curso-vamos/",
  "/curso-vamos-0/",
  "/cursovamos/",
  "/larevista/",
  "/quienessomos/",
  "/contact/",
  "/ora-con-nosotros/",
  "/ora-por-misiones/",
  "/da-la-obra/",
  "/recursos-movilicemos/",
  "/recursos-misioneros/",
];

/** Redirects this script owns. Anything else in vercel.json is left alone. */
function ownsRedirect(source: string): boolean {
  const decoded = decodeURIComponent(source);
  // Every rule with a `feed` segment comes from section 6, whatever prefix it
  // sits under — including the `:path*` wildcards, which the `/la-revista/`
  // branch below would otherwise disown and leave behind as duplicates on a
  // re-run, and the `/feed/:type/` forms that do not end in `feed/` at all.
  if (decoded.split("/").includes("feed")) return true;
  for (const prefix of DRUPAL_PREFIXES) {
    if (decoded === prefix || decoded.startsWith(prefix)) return true;
  }
  // Exact media paths only. The `:path`-style image catch-all under the same
  // prefix is hand-written and must survive a re-run — and must stay LAST in
  // the array, since Vercel takes the first match and it would otherwise
  // swallow every document rule above it.
  if (source.startsWith("/wp-content/uploads/")) return !source.includes(":");
  if (source.startsWith("/sites/default/files/")) return !source.includes(":");
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
 * Accent- and case-insensitive key for a filename or slug. The Drupal file
 * space spelled the same document a dozen ways — `Test_Dones_Espirituales.pdf`,
 * `test_dones_espirituales.pdf`, `Pablo_Bajo_Estrés.pdf` — while Vercel matches
 * sources byte-for-byte, so the only way to reunite them with the one asset in
 * Contentful is to compare normalised keys and emit an exact rule per spelling.
 */
function assetKey(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** `assetKey` with any trailing file extension dropped. */
function stemKey(name: string): string {
  return assetKey(name.replace(/\.[a-z0-9]+$/i, ""));
}

/**
 * Vercel matches `source` against the request path as it arrives on the wire,
 * so a legacy path containing a space or an accent needs both spellings: the
 * literal one for the odd client that sends it raw, the percent-encoded one for
 * every browser and for Googlebot.
 */
function sourceVariants(legacyPath: string): string[] {
  const encoded = legacyPath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  return encoded === legacyPath ? [legacyPath] : [legacyPath, encoded];
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
  const htaccess = JSON.parse(await readFile(DRUPAL_HTACCESS, "utf8")) as {
    files: DrupalHit[];
    pages: { path: string; destination: string }[];
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
      // Trailing slash is required: `trailingSlash: true` normalises the
      // request path before redirects are matched, so a slashless source
      // never fires — it 308s to the slashed form and then falls through
      // to a 404.
      source: `/la-revista/${from}/`,
      destination,
      permanent: true,
    });
    // WordPress mirrored the same slugs under /revistavamos/. Mirroring the
    // alias there too would hijack a live, canonical URL of the new site when
    // the legacy slug happens to name a different edition.
    if (!collides.has(from)) {
      redirects.push({
        source: `/revistavamos/${from}/`,
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
  // The probe in data/drupal-file-map.json could only try Drupal filenames it
  // could guess from the WordPress side, so it silently missed every rule where
  // the two names differ — `_0` suffixes WordPress added on re-upload, and
  // editions Drupal stored lowercase. data/drupal-htaccess-redirects.json is
  // the rule table itself, so it supersedes the probe where both describe a
  // path; the probe still contributes the paths the .htaccess handled by other
  // means. Keyed by path, so a re-run cannot double-emit.
  const drupalHits = new Map<string, DrupalHit>();
  for (const hit of drupal.entries) drupalHits.set(hit.path, hit);
  for (const hit of htaccess.files) drupalHits.set(hit.path, hit);
  for (const hit of drupalHits.values()) {
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

  // The .htaccess also carried three slug corrections under /la-revista/. Those
  // are already expressed as aliases.slugAliases above, so nothing is emitted
  // here — this only asserts the two sources still agree, which is the whole
  // reason to keep the captured rules rather than trust the transcription.
  const emittedSources = new Set(redirects.map((r) => r.source));
  const pageDrift = htaccess.pages.filter(
    (rule) => !emittedSources.has(rule.path.replace(/\/?$/, "/")),
  );
  if (pageDrift.length) {
    console.log(
      `\n${pageDrift.length} .htaccess page rules are not covered by `
        + `slugAliases — add them to data/legacy-revista-aliases.json:`,
    );
    for (const r of pageDrift) console.log(`  ${r.path} -> ${r.destination}`);
  }

  // 5. The Drupal-era URL space Google still crawls. These never reached
  // WordPress's redirect table, so they have 404ed for years; the Search
  // Console export in data/legacy-404s.json is the only enumeration we have of
  // them, and it cannot be regenerated once Google stops asking.
  const emitted = new Set(redirects.map((r) => r.source));
  const pushLegacy = (legacyPath: string, destination: string): boolean => {
    let added = false;
    for (const source of sourceVariants(legacyPath)) {
      if (emitted.has(source)) continue;
      redirects.push({ source, destination, permanent: true });
      emitted.add(source);
      added = true;
    }
    return added;
  };

  // Everything reachable under /recursos/, keyed both ways: `assetKey` for a
  // filename that survived intact, `stemKey` for the ones whose extension
  // changed (`*.docx.pdf`) or that only survive as a Drupal page slug.
  const assetByName = new Map<string, string>();
  const assetByStem = new Map<string, string>();
  for (const { source } of rewrites) {
    const fileName = source.slice("/recursos/".length);
    assetByName.set(assetKey(fileName), source);
    if (!assetByStem.has(stemKey(fileName))) {
      assetByStem.set(stemKey(fileName), source);
    }
  }
  const revistaPdfByName = new Map<string, string>();
  for (const { source } of config.rewrites ?? []) {
    const match = /^\/revistavamos\/[^/]+\/([^/]+\.pdf)$/i.exec(source);
    if (match) revistaPdfByName.set(assetKey(match[1]), source);
  }
  // Drupal filed the magazine under its own names (`vamosoct13.pdf`), which
  // Contentful no longer uses. `pdfToSlug` is keyed by the WordPress upload
  // path, but the basename inside it is still the Drupal one — enough to reach
  // the edition, and from there its current PDF.
  const editionByPdfName = new Map<string, string>();
  for (const [wpPath, slug] of Object.entries(aliases.pdfToSlug)) {
    editionByPdfName.set(assetKey(path.posix.basename(wpPath)), slug);
  }

  const pageMap = JSON.parse(
    await readFile(LEGACY_PAGE_MAP, "utf8"),
  ) as LegacyPageMap;

  // Drupal-era edition slugs, under every prefix that ever served them.
  for (const [from, to] of Object.entries(pageMap.revistaSlugAliases)) {
    if (from.startsWith("_")) continue;
    const destination = `/revistavamos/${to}/`;
    for (const prefix of ["/content/", "/la-revista/", "/revistavamos/"]) {
      if (prefix === "/revistavamos/" && collides.has(from)) continue;
      pushLegacy(`${prefix}${from}/`, destination);
    }
  }

  for (const [source, destination] of Object.entries(pageMap.exact)) {
    if (source.startsWith("_")) continue;
    pushLegacy(source, destination);
  }

  const legacy = JSON.parse(await readFile(LEGACY_404S, "utf8")) as {
    entries: Legacy404[];
  };
  const DOCUMENT = /\.(pdf|docx?|xlsx?|pptx?|ppsx|odt)$/i;
  const unmatchedDocs: string[] = [];
  const unmatchedPages: string[] = [];

  for (const entry of legacy.entries) {
    // A different host answers these; a path rule can't reach them.
    if (entry.host !== "misionessim.org") continue;
    const legacyPath = entry.path;
    // `trailingSlash: true` normalises the request before redirects match, so
    // every extension-less rule is stored slashed while the export is not.
    const slashed = legacyPath.endsWith("/") ? legacyPath : `${legacyPath}/`;
    if (emitted.has(legacyPath) || emitted.has(slashed)) continue;

    if (DOCUMENT.test(legacyPath)) {
      const fileName = path.posix.basename(legacyPath);
      const edition = editionByPdfName.get(assetKey(fileName));
      const destination =
        assetByName.get(assetKey(fileName)) ??
        revistaPdfByName.get(assetKey(fileName)) ??
        (edition ? editionTarget(edition, legacyPath) : undefined) ??
        assetByStem.get(stemKey(fileName));
      if (destination) pushLegacy(legacyPath, destination);
      else unmatchedDocs.push(legacyPath);
      continue;
    }

    // A Drupal resource page names one document. Point at the document itself
    // where it survived — the wildcard below only reaches the index.
    const resource = /^\/recurso\/(.+?)\/?$/.exec(legacyPath);
    if (resource) {
      const destination = assetByStem.get(stemKey(resource[1]));
      if (destination) pushLegacy(`/recurso/${resource[1]}/`, destination);
      continue;
    }

    const covered =
      DRUPAL_PREFIXES.some((prefix) => legacyPath.startsWith(prefix)) ||
      legacyPath.startsWith("/la-revista/") ||
      legacyPath.startsWith("/blog/") ||
      legacyPath.startsWith("/sites/") ||
      legacyPath.startsWith("/wp-");
    if (!covered) unmatchedPages.push(legacyPath);
  }

  // Wildcards last: Vercel takes the first match, and every exact rule above
  // is a correction to what the wildcard would otherwise do.
  for (const { source, destination } of pageMap.wildcards) {
    if (!emitted.has(source)) {
      redirects.push({ source, destination, permanent: true });
      emitted.add(source);
    }
  }

  if (unmatchedDocs.length) {
    console.log(
      `\n${unmatchedDocs.length} legacy documents have no surviving asset and ` +
        `will keep 404ing (nothing in Contentful carries the file):`,
    );
    for (const p of unmatchedDocs) console.log(`  ${p}`);
  }
  if (unmatchedPages.length) {
    console.log(
      `\n${unmatchedPages.length} legacy pages have no rule ` +
        `(add them to data/legacy-page-map.json if they deserve one):`,
    );
    for (const p of unmatchedPages) console.log(`  ${p}`);
  }

  const keptRedirects = (config.redirects ?? []).filter(
    (r) => !ownsRedirect(r.source),
  );
  const keptRewrites = (config.rewrites ?? []).filter(
    (r) => !ownsRewrite(r.source),
  );

  // 6. WordPress feed URLs. WordPress published a comment feed beside every
  // post, edition and term, advertised it in <link rel="alternate">, and Google
  // indexed the lot. Nobody subscribes to a per-post comment feed, but they are
  // not harmless: `/la-revista/<slug>/feed/` falls into the hand-written
  // `/la-revista/:path*` wildcard and 308s to `/revistavamos/<slug>/feed/`,
  // which is a 404 — a permanent redirect into a dead end, which Search Console
  // reports as an error and Google keeps re-crawling. Stripping `feed/` lands
  // the visitor on the article the feed belonged to, the only real equivalent.
  //
  // Exact twins come first, derived from the redirect table itself rather than
  // hand-listed, so a slug alias added later gets its feed twin for free — and
  // so the twin points at the SAME final destination as its parent instead of
  // chaining through it. The `/feed/:type/` forms (`/feed/atom/`, `/feed/rss2/`)
  // have no exact spelling and go through the wildcards; for a drifted slug
  // that costs a second hop, which is acceptable for a URL Google never had.
  const FEED_PARENTS = ["/blog/", "/la-revista/", "/revistavamos/"];
  const feedSources = new Set<string>();
  const pushFeed = (source: string, destination: string) => {
    if (feedSources.has(source)) return;
    feedSources.add(source);
    redirects.push({ source, destination, permanent: true });
  };

  for (const rule of [...redirects, ...keptRedirects]) {
    if (rule.source.includes(":") || !rule.source.endsWith("/")) continue;
    if (!FEED_PARENTS.some((prefix) => rule.source.startsWith(prefix))) continue;
    pushFeed(`${rule.source}feed/`, rule.destination);
  }

  // Section fronts, which no wildcard below can express: `:path*` matching zero
  // segments would build `/blog//`.
  pushFeed("/blog/feed/", "/blog/");
  pushFeed("/comments/feed/", "/blog/");
  pushFeed("/feed/", "/blog/");

  // Wildcards last, as everywhere else here: Vercel takes the first match and
  // every exact rule above is a correction to what the wildcard would do.
  for (const [prefix, destination] of [
    // Author archives redirect to the blog index, so their feeds must too —
    // passing the slug through would chain via `/blog/author/:path*/`.
    ["/blog/author/", "/blog/"],
    ["/blog/", "/blog/:path*/"],
    ["/la-revista/", "/revistavamos/:path*/"],
    ["/revistavamos/", "/revistavamos/:path*/"],
  ] as const) {
    pushFeed(`${prefix}:path*/feed/`, destination);
    pushFeed(`${prefix}:path*/feed/:type/`, destination);
  }

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
