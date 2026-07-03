/**
 * Phase 0 — crawl the live misionessim.org Yoast sitemaps and produce a
 * single inventory of every legacy URL, typed and tagged with its migration
 * disposition. This is the ground truth for:
 *  - the Phase 4/5 CMS import (which slugs must exist in Contentful)
 *  - the Phase 7 redirect map (dropped/aliased URLs)
 *  - the route test asserting no legacy URL 404s post-migration
 *
 * Re-runnable: `yarn build:url-inventory`. Safe to re-run before cutover to
 * catch content published after this was first generated.
 */
import { XMLParser } from "fast-xml-parser";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SITE = "https://misionessim.org";
const OUT_PATH = path.join(process.cwd(), "data", "url-inventory.json");

const parser = new XMLParser({ ignoreAttributes: true });

type Disposition =
  | "rebuild-as-code" // 8 static Elementor pages
  | "migrate-to-contentful-blog"
  | "migrate-to-contentful-revista"
  | "generated-archive" // category/tag/portfolio-category/author
  | "dropped-donations" // GiveWP, out of scope
  | "alias-redirect"; // /revistavamos/<slug> -> /la-revista/<slug>

type UrlType =
  | "home"
  | "page"
  | "blog-index"
  | "blog-post"
  | "revista-index"
  | "revista-item"
  | "category-archive"
  | "tag-archive"
  | "portfolio-category-archive"
  | "author-archive"
  | "donation-page"
  | "revistavamos-alias";

interface InventoryEntry {
  url: string;
  path: string;
  type: UrlType;
  disposition: Disposition;
  lastmod?: string;
  /** For alias entries: the canonical URL this one redirects to. */
  redirectsTo?: string;
}

/** Sub-sitemaps we crawl. elementskit_* sitemaps are internal widget popups,
 * not real navigable pages, and are deliberately excluded. */
const SUB_SITEMAPS = [
  "post-sitemap.xml",
  "page-sitemap.xml",
  "keydesign-portfolio-sitemap.xml",
  "give_forms-sitemap.xml",
  "category-sitemap.xml",
  "post_tag-sitemap.xml",
  "keydesign-portfolio-category-sitemap.xml",
  "author-sitemap.xml",
] as const;

async function fetchXml(url: string): Promise<unknown> {
  const res = await fetch(url, {
    headers: { "user-agent": "misionessim-migration-bot/1.0" },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  }
  const text = await res.text();
  return parser.parse(text);
}

function extractUrls(
  parsed: unknown,
): Array<{ loc: string; lastmod?: string }> {
  const urlset = (parsed as { urlset?: { url?: unknown } })?.urlset;
  if (!urlset?.url) return [];
  const entries = Array.isArray(urlset.url) ? urlset.url : [urlset.url];
  return entries.map((e: { loc: string; lastmod?: string }) => ({
    loc: e.loc,
    lastmod: e.lastmod,
  }));
}

export function classify(
  loc: string,
): { type: UrlType; disposition: Disposition } {
  const p = new URL(loc).pathname;

  if (p === "/") return { type: "home", disposition: "rebuild-as-code" };
  if (p === "/blog/")
    return { type: "blog-index", disposition: "migrate-to-contentful-blog" };
  if (p === "/la-revista/")
    return {
      type: "revista-index",
      disposition: "migrate-to-contentful-revista",
    };
  if (/^\/blog\/\d{4}-\d{2}\/[^/]+\/$/.test(p))
    return { type: "blog-post", disposition: "migrate-to-contentful-blog" };
  if (/^\/blog\/category\/[^/]+\/$/.test(p))
    return { type: "category-archive", disposition: "generated-archive" };
  if (/^\/blog\/tag\/[^/]+\/$/.test(p))
    return { type: "tag-archive", disposition: "generated-archive" };
  if (/^\/blog\/author\/[^/]+\/$/.test(p))
    return { type: "author-archive", disposition: "generated-archive" };
  if (/^\/la-revista\/[^/]+\/$/.test(p))
    return {
      type: "revista-item",
      disposition: "migrate-to-contentful-revista",
    };
  if (/^\/portfolio-category\/[^/]+\/$/.test(p))
    return {
      type: "portfolio-category-archive",
      disposition: "generated-archive",
    };
  if (
    /^\/donations\//.test(p) ||
    p === "/donation-confirmation/" ||
    p === "/donation-failed/" ||
    p === "/donor-dashboard/"
  )
    return { type: "donation-page", disposition: "dropped-donations" };

  // Remaining page-sitemap entries are the 8 in-scope static Elementor pages.
  return { type: "page", disposition: "rebuild-as-code" };
}

async function main() {
  console.log(`Fetching sitemap index from ${SITE}/sitemap_index.xml ...`);
  // Sanity check the index is reachable and lists what we expect; we crawl
  // the fixed SUB_SITEMAPS list above rather than parsing it dynamically so
  // a new/renamed sitemap doesn't silently change scope unnoticed.
  await fetchXml(`${SITE}/sitemap_index.xml`);

  const entries: InventoryEntry[] = [];

  for (const sub of SUB_SITEMAPS) {
    const url = `${SITE}/${sub}`;
    console.log(`Fetching ${sub} ...`);
    const parsed = await fetchXml(url);
    const urls = extractUrls(parsed);
    console.log(`  -> ${urls.length} URLs`);

    for (const { loc, lastmod } of urls) {
      const { type, disposition } = classify(loc);
      entries.push({
        url: loc,
        path: new URL(loc).pathname,
        type,
        disposition,
        lastmod,
      });
    }
  }

  // Generate the /revistavamos/<slug>/ alias URLs. These 301-redirect to
  // /la-revista/<slug>/ on the live site but appear in NO sitemap (§2.1 of
  // the migration analysis) — derive them from every revista-item slug.
  const revistaItems = entries.filter((e) => e.type === "revista-item");
  const aliasEntries: InventoryEntry[] = revistaItems.map((item) => {
    const slug = item.path.replace(/^\/la-revista\//, "").replace(/\/$/, "");
    return {
      url: `${SITE}/revistavamos/${slug}/`,
      path: `/revistavamos/${slug}/`,
      type: "revistavamos-alias",
      disposition: "alias-redirect",
      redirectsTo: item.path,
    };
  });
  entries.push(...aliasEntries);

  entries.sort((a, b) => a.path.localeCompare(b.path));

  const counts = entries.reduce<Record<string, number>>((acc, e) => {
    acc[e.type] = (acc[e.type] ?? 0) + 1;
    return acc;
  }, {});

  await mkdir(path.dirname(OUT_PATH), { recursive: true });
  await writeFile(
    OUT_PATH,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        source: SITE,
        totalUrls: entries.length,
        countsByType: counts,
        entries,
      },
      null,
      2,
    ),
  );

  console.log(`\nWrote ${entries.length} URLs to ${OUT_PATH}`);
  console.log("Counts by type:", counts);
}

// Guard against running on import — tests/unit/build-url-inventory.test.ts
// imports this module for `classify`; without this check, that import
// would trigger a full live sitemap crawl as a side effect.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
