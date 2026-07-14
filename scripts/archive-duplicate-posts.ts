/**
 * One-off maintenance: archive duplicate blogPost rows in the shared
 * Contentful space so the CMS matches the de-duplicated view the site
 * already renders (see lib/contentful.ts for the dedup rationale).
 *
 * The space is shared with the live mi-movilicemos app, so this is
 * deliberately conservative:
 *  - Only LOSER rows are touched; winners are never modified.
 *  - Archiving (not deleting) is reversible from the Contentful UI/API.
 *  - Losers are classified by mi-movilicemos impact:
 *      SAFE    — loser has no revista link, OR its winner points at the
 *                same revista issue (mi-movilicemos still shows the article,
 *                and any in-issue duplicate is cleaned up).
 *      REVIEW  — loser points at a DIFFERENT revista issue than its winner;
 *                archiving removes the article from that issue in
 *                mi-movilicemos. Never archived unless --include-cross-issue.
 *
 * Usage:
 *   dry run (default):  yarn tsx scripts/archive-duplicate-posts.ts --environment=main
 *   execute:            ... --environment=main --live
 *   also cross-issue:   ... --environment=main --live --include-cross-issue
 */
export {}; // only dynamic imports below — force module scope so `main` doesn't collide across scripts

const SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
const CDA_TOKEN = process.env.CONTENTFUL_ACCESS_TOKEN;
const CMA_TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN;

interface Entry {
  sys: { id: string };
  fields: {
    slug?: string;
    title?: string;
    publishDate?: string;
    description?: string;
    categories?: string[];
    author?: string;
    heroImage?: { sys: { id: string } };
    revista?: { sys: { id: string } };
  };
}

function normalizeTitle(title: string): string {
  return (title || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function richness(e: Entry): number {
  const f = e.fields;
  let s = 0;
  if (f.heroImage) s += 1_000_000;
  if (f.revista) s += 100_000;
  s += Math.min((f.description ?? "").length, 9_999);
  if (f.categories?.length || f.author) s += 0.5;
  return s;
}

async function fetchAllBlogPosts(): Promise<Entry[]> {
  const all: Entry[] = [];
  let skip = 0;
  while (true) {
    const url =
      `https://cdn.contentful.com/spaces/${SPACE_ID}/entries` +
      `?content_type=blogPost&limit=200&skip=${skip}` +
      `&select=sys.id,fields.slug,fields.title,fields.publishDate,fields.description,fields.categories,fields.author,fields.heroImage,fields.revista`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${CDA_TOKEN}` } });
    if (!res.ok) throw new Error(`CDA fetch failed: ${res.status}`);
    const data = (await res.json()) as { items: Entry[]; total: number };
    all.push(...data.items);
    if (all.length >= data.total) break;
    skip += 200;
  }
  return all;
}

interface Loser {
  id: string;
  slug: string;
  title: string;
  tier: "SAFE" | "REVIEW";
  reason: string;
}

function computeLosers(all: Entry[]): Loser[] {
  const groups = new Map<string, Entry[]>();
  for (const e of all) {
    const key = normalizeTitle(e.fields.title ?? "") || (e.fields.slug ?? e.sys.id);
    const g = groups.get(key);
    if (g) g.push(e);
    else groups.set(key, [e]);
  }

  const losers: Loser[] = [];
  for (const group of groups.values()) {
    if (group.length < 2) continue;
    group.sort((a, b) => richness(b) - richness(a));
    const [winner, ...rest] = group;
    const winnerRevista = winner.fields.revista?.sys.id ?? null;
    for (const l of rest) {
      const loserRevista = l.fields.revista?.sys.id ?? null;
      let tier: Loser["tier"] = "SAFE";
      let reason: string;
      if (!loserRevista) {
        reason = "no revista link";
      } else if (loserRevista === winnerRevista) {
        reason = "winner in same issue";
      } else {
        tier = "REVIEW";
        reason = `different issue (loser=${loserRevista}, winner=${winnerRevista ?? "none"})`;
      }
      losers.push({
        id: l.sys.id,
        slug: l.fields.slug ?? "",
        title: l.fields.title ?? "",
        tier,
        reason,
      });
    }
  }
  return losers;
}

const CMA_BASE = "https://api.contentful.com";

async function cma(path: string, method: string, version?: number): Promise<Response> {
  const headers: Record<string, string> = { Authorization: `Bearer ${CMA_TOKEN}` };
  if (version !== undefined) headers["X-Contentful-Version"] = String(version);
  return fetch(`${CMA_BASE}${path}`, { method, headers });
}

async function archiveEntry(env: string, id: string): Promise<void> {
  // Get current version + publication state.
  const getRes = await cma(`/spaces/${SPACE_ID}/environments/${env}/entries/${id}`, "GET");
  if (!getRes.ok) throw new Error(`GET ${id} failed: ${getRes.status}`);
  const entry = (await getRes.json()) as { sys: { version: number; publishedVersion?: number } };

  // Archiving requires the entry be unpublished first.
  let version = entry.sys.version;
  if (entry.sys.publishedVersion !== undefined) {
    const unpub = await cma(
      `/spaces/${SPACE_ID}/environments/${env}/entries/${id}/published`,
      "DELETE",
      version,
    );
    if (!unpub.ok) throw new Error(`unpublish ${id} failed: ${unpub.status}`);
    version = ((await unpub.json()) as { sys: { version: number } }).sys.version;
  }

  const arch = await cma(
    `/spaces/${SPACE_ID}/environments/${env}/entries/${id}/archived`,
    "PUT",
    version,
  );
  if (!arch.ok) throw new Error(`archive ${id} failed: ${arch.status} ${await arch.text()}`);
}

async function main() {
  const args = process.argv.slice(2);
  const live = args.includes("--live");
  const includeCrossIssue = args.includes("--include-cross-issue");
  const env = args.find((a) => a.startsWith("--environment="))?.split("=")[1];

  if (!SPACE_ID || !CDA_TOKEN || !CMA_TOKEN) {
    throw new Error("CONTENTFUL_SPACE_ID, CONTENTFUL_ACCESS_TOKEN, CONTENTFUL_MANAGEMENT_TOKEN must be set.");
  }
  if (!env) throw new Error("--environment=<id> is required (no default).");

  const all = await fetchAllBlogPosts();
  const losers = computeLosers(all);
  const safe = losers.filter((l) => l.tier === "SAFE");
  const review = losers.filter((l) => l.tier === "REVIEW");

  console.log(`Fetched ${all.length} blogPost entries.`);
  console.log(`Duplicate losers: ${losers.length}  (SAFE: ${safe.length}, REVIEW: ${review.length})\n`);

  console.log("REVIEW (cross-issue — archived only with --include-cross-issue):");
  for (const l of review) console.log(`  [${l.reason}] ${l.slug}  "${l.title}"`);

  const targets = includeCrossIssue ? [...safe, ...review] : safe;
  console.log(`\nWould archive ${targets.length} entries in environment "${env}".`);

  if (!live) {
    console.log("\nDry run — no changes made. Pass --live to execute.");
    return;
  }

  console.log(`\n--live: archiving ${targets.length} entries...`);
  let done = 0;
  for (const l of targets) {
    await archiveEntry(env, l.id);
    done++;
    if (done % 10 === 0 || done === targets.length) console.log(`  ${done}/${targets.length}`);
  }
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
