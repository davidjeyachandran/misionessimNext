/**
 * One-off maintenance: repair blogPost slugs that are not URL-safe.
 *
 * Two rows in the shared space carried slugs that still held their source
 * system's path — `ent/requisitos-y-pasos-para-ser-misionero` (Drupal) and
 * ` 2020-01/Siempre-será-un-desafío ` (a date segment, plus stray spaces).
 * Nothing rejected them on import, and unlike revista slugs (which pass
 * through `normalizeRevistaSlug`) blogPost slugs are used verbatim. The
 * result: `generateStaticParams` emitted a route the lookup could not resolve,
 * so both exported as 404 shells at percent-encoded URLs no one could link to.
 *
 * Repair rule, applied to the slug only:
 *   1. drop everything before the last "/" — the prefix is source-system path,
 *      never part of the article's identity;
 *   2. run it through the same `slugify()` the site uses for taxonomy terms;
 *   3. on collision with a slug already in use, append the Drupal-style
 *      numeric suffix this space already contains (`…-0`, `…-2`).
 *
 * Step 1 is what makes this safe rather than merely tidy: for the 2020-01 row
 * it reproduces `siempre-sera-un-desafio`, the exact path the live WordPress
 * site serves, so the legacy URL keeps resolving after cutover.
 *
 * Titles are trimmed at the same time when they carry stray whitespace, since
 * that whitespace reaches the rendered <title> and the JSON-LD headline.
 *
 * Conservative, in the manner of archive-duplicate-posts.ts: dry run unless
 * --live, no entry is created or archived, and a slug change is reversible by
 * re-running with the old value.
 *
 * Usage:
 *   dry run:   node --env-file=.env.local node_modules/.bin/tsx scripts/fix-malformed-blog-slugs.ts --environment=master
 *   execute:   ... --environment=master --live
 */
export {}; // only dynamic imports below — force module scope so `main` doesn't collide across scripts

const SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
const CMA_TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN;
const CMA_BASE = "https://api.contentful.com";
const LOCALE = "en-US";

/** Mirrors slugify() in lib/contentful.ts. */
function slugify(value: string): string {
  return (value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function isMalformed(slug: string): boolean {
  return slug !== slug.trim() || /[/%\s]/.test(slug);
}

function repair(slug: string, taken: Set<string>): string {
  const lastSegment = slug.trim().split("/").filter(Boolean).pop() ?? "";
  const base = slugify(lastSegment);
  if (!taken.has(base)) return base;
  // `-0` first: the space already holds Drupal-suffixed rows in this shape
  // (no-tienes-por-que-caminar-solo-0), so a new one is not a new convention.
  let candidate = `${base}-0`;
  let n = 2;
  while (taken.has(candidate)) candidate = `${base}-${n++}`;
  return candidate;
}

interface CmaEntry {
  sys: { id: string; version: number; publishedVersion?: number; archivedVersion?: number };
  fields: Record<string, Record<string, unknown>>;
}

async function cma(
  path: string,
  method: string,
  init: { version?: number; body?: unknown } = {},
): Promise<Response> {
  const headers: Record<string, string> = { Authorization: `Bearer ${CMA_TOKEN}` };
  if (init.version !== undefined) headers["X-Contentful-Version"] = String(init.version);
  if (init.body !== undefined) headers["Content-Type"] = "application/vnd.contentful.management.v1+json";
  return fetch(`${CMA_BASE}${path}`, {
    method,
    headers,
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });
}

async function fetchAllEntries(env: string): Promise<CmaEntry[]> {
  const all: CmaEntry[] = [];
  for (let skip = 0; ; skip += 100) {
    const res = await cma(
      `/spaces/${SPACE_ID}/environments/${env}/entries?content_type=blogPost&limit=100&skip=${skip}`,
      "GET",
    );
    if (!res.ok) throw new Error(`list entries failed: ${res.status} ${await res.text()}`);
    const page = (await res.json()) as { total: number; items: CmaEntry[] };
    all.push(...page.items);
    if (all.length >= page.total || page.items.length === 0) return all;
  }
}

async function applyFix(
  env: string,
  entry: CmaEntry,
  slug: string,
  title: string | null,
): Promise<void> {
  const fields = JSON.parse(JSON.stringify(entry.fields)) as CmaEntry["fields"];
  fields.slug = { ...fields.slug, [LOCALE]: slug };
  if (title !== null) fields.title = { ...fields.title, [LOCALE]: title };

  const put = await cma(
    `/spaces/${SPACE_ID}/environments/${env}/entries/${entry.sys.id}`,
    "PUT",
    { version: entry.sys.version, body: { fields } },
  );
  if (!put.ok) throw new Error(`update ${entry.sys.id} failed: ${put.status} ${await put.text()}`);
  const updated = (await put.json()) as CmaEntry;

  // Only re-publish what was already published; a draft stays a draft.
  if (entry.sys.publishedVersion === undefined) {
    console.log(`    (was a draft — updated, not published)`);
    return;
  }
  const pub = await cma(
    `/spaces/${SPACE_ID}/environments/${env}/entries/${entry.sys.id}/published`,
    "PUT",
    { version: updated.sys.version },
  );
  if (!pub.ok) throw new Error(`publish ${entry.sys.id} failed: ${pub.status} ${await pub.text()}`);
}

async function main() {
  const args = process.argv.slice(2);
  const live = args.includes("--live");
  const env = args.find((a) => a.startsWith("--environment="))?.split("=")[1];

  if (!SPACE_ID || !CMA_TOKEN) {
    throw new Error("CONTENTFUL_SPACE_ID and CONTENTFUL_MANAGEMENT_TOKEN must be set.");
  }
  if (!env) throw new Error("--environment=<id> is required (no default).");

  const entries = await fetchAllEntries(env);
  const slugOf = (e: CmaEntry) => String(e.fields.slug?.[LOCALE] ?? "");
  const titleOf = (e: CmaEntry) => String(e.fields.title?.[LOCALE] ?? "");

  // Archived rows are invisible to the site and to the CDA, so they neither
  // need repair nor reserve a slug. That distinction matters here: the earlier
  // duplicate cleanup archived the two WordPress rows for "Siempre será un
  // desafío" and kept the VAMOS row — whose slug was the malformed one. The
  // free slug is exactly the path the live site serves.
  const active = entries.filter((e) => e.sys.archivedVersion === undefined);
  const broken = active.filter((e) => isMalformed(slugOf(e)));
  const taken = new Set(active.filter((e) => !isMalformed(slugOf(e))).map(slugOf));

  console.log(`Fetched ${entries.length} blogPost entries from "${env}" `
    + `(${entries.length - active.length} archived, ignored).`);
  console.log(`Malformed slugs: ${broken.length}\n`);

  const planned = broken.map((entry) => {
    const slug = repair(slugOf(entry), taken);
    taken.add(slug);
    const title = titleOf(entry);
    return { entry, slug, title: title !== title.trim() ? title.trim() : null };
  });

  for (const { entry, slug, title } of planned) {
    console.log(`  ${entry.sys.id}`);
    console.log(`    slug  ${JSON.stringify(slugOf(entry))}  ->  ${JSON.stringify(slug)}`);
    if (title !== null) console.log(`    title ${JSON.stringify(titleOf(entry))}  ->  ${JSON.stringify(title)}`);
    console.log(`    url   /blog/${String(entry.fields.publishDate?.[LOCALE]).slice(0, 7)}/${slug}/`);
  }

  if (!planned.length) {
    console.log("Nothing to do.");
    return;
  }
  if (!live) {
    console.log("\nDry run — no changes made. Pass --live to execute.");
    return;
  }

  console.log(`\n--live: updating ${planned.length} entries...`);
  for (const { entry, slug, title } of planned) {
    await applyFix(env, entry, slug, title);
    console.log(`  updated ${entry.sys.id} -> ${slug}`);
  }
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
