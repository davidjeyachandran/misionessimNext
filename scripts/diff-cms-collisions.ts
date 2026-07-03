/**
 * Phase 4 prep — READ-ONLY collision diff report.
 *
 * Compares every exported WP blog post (export/posts/*.md, from
 * scripts/export-wp.ts) against the existing Contentful BlogPost entries in
 * the shared space, and reports what scripts/import-cms.ts would do under
 * the §2.5 per-field policy — without writing anything.
 *
 * Policy being previewed here (docs/nextjs-migration-analysis.md §2.5/§4):
 *  - WP wins on title/body/image — every matching slug gets those fields
 *    overwritten.
 *  - Contentful wins on the `revista` back-reference — preserved, not
 *    dropped, on entries that already have one.
 *  - No new slug is ever deleted or recreated; matches are always updates.
 *
 * Output: export/collision-diff.json (machine-readable, keyed by slug,
 * feeds Phase 4's actual import script) + a console summary table.
 *
 * Re-runnable: `yarn diff:cms`. Rerun before the real import to catch drift
 * (new Contentful edits, newly-published WP posts) since this was generated.
 */
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

const POSTS_DIR = path.join(process.cwd(), "export", "posts");
const OUT_PATH = path.join(process.cwd(), "export", "collision-diff.json");

const spaceId = process.env.CONTENTFUL_SPACE_ID;
const token = process.env.CONTENTFUL_ACCESS_TOKEN;
if (!spaceId || !token) {
  console.error(
    "Missing CONTENTFUL_SPACE_ID or CONTENTFUL_ACCESS_TOKEN — set them in .env.local",
  );
  process.exit(1);
}
const endpoint = `https://graphql.contentful.com/content/v1/spaces/${spaceId}`;

interface CfBlogPost {
  sys: { id: string };
  slug: string;
  title: string;
  publishDate: string | null;
  nid: string | null;
  heroImage: { url: string; width: number; height: number } | null;
  revista: { slug: string; title: string } | null;
  body: { json: RichTextNode } | null;
}

interface RichTextNode {
  nodeType: string;
  value?: string;
  content?: RichTextNode[];
}

async function gql<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) {
    throw new Error(`Contentful GraphQL error: ${JSON.stringify(json.errors)}`);
  }
  return json.data as T;
}

function richTextToPlainLength(node: RichTextNode | null | undefined): number {
  if (!node) return 0;
  let total = node.value?.length ?? 0;
  for (const child of node.content ?? []) {
    total += richTextToPlainLength(child);
  }
  return total;
}

async function fetchContentfulMatches(
  slugs: string[],
): Promise<Map<string, CfBlogPost>> {
  const found = new Map<string, CfBlogPost>();
  const BATCH = 40;
  for (let i = 0; i < slugs.length; i += BATCH) {
    const batch = slugs.slice(i, i + BATCH);
    const data = await gql<{ blogPostCollection: { items: CfBlogPost[] } }>(
      `query($slugs: [String]) {
        blogPostCollection(where: { slug_in: $slugs }, limit: ${BATCH}) {
          items {
            sys { id }
            slug
            title
            publishDate
            nid
            heroImage { url width height }
            revista { slug title }
            body { json }
          }
        }
      }`,
      { slugs: batch },
    );
    for (const item of data.blogPostCollection.items) {
      found.set(item.slug, item);
    }
    process.stderr.write(".");
  }
  process.stderr.write("\n");
  return found;
}

type ImageVerdict =
  | "wp-has-cf-missing" // CF has no image, WP does — clear win, import WP's
  | "wp-higher-res" // both have images, WP's is bigger
  | "cf-higher-res" // both have images, CF's is bigger (rare, per §2.5 mostly WP wins)
  | "wp-missing-cf-has" // WP has none, CF does — keep CF's rather than blank it
  | "neither"; // no image on either side

interface DiffEntry {
  slug: string;
  status: "new" | "update";
  contentfulEntryId: string | null;
  wpTitle: string;
  cfTitle: string | null;
  titleChanged: boolean;
  wpBodyChars: number;
  cfBodyChars: number;
  bodyLengthRatio: number | null; // wp/cf, flags suspiciously different content
  hasRevistaLink: boolean;
  revistaSlug: string | null;
  imageVerdict: ImageVerdict;
  wpImage: { width?: number; height?: number } | null;
  cfImage: { width: number; height: number } | null;
}

async function main() {
  const files = (await readdir(POSTS_DIR)).filter((f) => f.endsWith(".md"));
  console.log(`Reading ${files.length} exported posts...`);

  const wpPosts = await Promise.all(
    files.map(async (file) => {
      const raw = await readFile(path.join(POSTS_DIR, file), "utf-8");
      const { data, content } = matter(raw);
      return { frontmatter: data, body: content };
    }),
  );

  console.log("Querying Contentful for matching slugs...");
  const slugs = wpPosts.map((p) => p.frontmatter.slug as string);
  const cfMatches = await fetchContentfulMatches(slugs);

  const diffs: DiffEntry[] = wpPosts.map(({ frontmatter, body }) => {
    const slug = frontmatter.slug as string;
    const cf = cfMatches.get(slug) ?? null;
    const wpImage = frontmatter.featuredImage as
      | { width?: number; height?: number }
      | null;
    const wpArea = wpImage?.width && wpImage?.height ? wpImage.width * wpImage.height : 0;
    const cfArea = cf?.heroImage ? cf.heroImage.width * cf.heroImage.height : 0;

    let imageVerdict: ImageVerdict;
    if (!wpImage && !cf?.heroImage) imageVerdict = "neither";
    else if (!wpImage && cf?.heroImage) imageVerdict = "wp-missing-cf-has";
    else if (wpImage && !cf?.heroImage) imageVerdict = "wp-has-cf-missing";
    else imageVerdict = wpArea >= cfArea ? "wp-higher-res" : "cf-higher-res";

    const cfBodyChars = richTextToPlainLength(cf?.body?.json);
    const wpBodyChars = body.length;

    return {
      slug,
      status: cf ? "update" : "new",
      contentfulEntryId: cf?.sys.id ?? null,
      wpTitle: frontmatter.title as string,
      cfTitle: cf?.title ?? null,
      titleChanged: cf ? cf.title.trim() !== (frontmatter.title as string).trim() : true,
      wpBodyChars,
      cfBodyChars,
      bodyLengthRatio: cfBodyChars > 0 ? wpBodyChars / cfBodyChars : null,
      hasRevistaLink: !!cf?.revista,
      revistaSlug: cf?.revista?.slug ?? null,
      imageVerdict,
      wpImage: wpImage ?? null,
      cfImage: cf?.heroImage ? { width: cf.heroImage.width, height: cf.heroImage.height } : null,
    };
  });

  const summary = {
    total: diffs.length,
    new: diffs.filter((d) => d.status === "new").length,
    update: diffs.filter((d) => d.status === "update").length,
    updatesWithRevistaLinkToPreserve: diffs.filter((d) => d.hasRevistaLink).length,
    imageVerdicts: diffs.reduce<Record<string, number>>((acc, d) => {
      acc[d.imageVerdict] = (acc[d.imageVerdict] ?? 0) + 1;
      return acc;
    }, {}),
    // Flag possible slug collisions between UNRELATED content: same slug,
    // wildly different body length in either direction. Threshold is a
    // judgment call (5x), meant to catch gross mismatches for manual review,
    // not fine-grained rewrites (those are expected — WP wins on purpose).
    suspiciousLengthMismatches: diffs.filter(
      (d) =>
        d.status === "update" &&
        d.bodyLengthRatio !== null &&
        (d.bodyLengthRatio > 5 || d.bodyLengthRatio < 0.2),
    ).length,
  };

  await writeFile(
    OUT_PATH,
    JSON.stringify({ generatedAt: new Date().toISOString(), summary, diffs }, null, 2),
  );

  console.log("\n=== Collision diff summary ===");
  console.log(`Total WP posts:              ${summary.total}`);
  console.log(`New (no Contentful match):   ${summary.new}`);
  console.log(`Updates (slug matches):      ${summary.update}`);
  console.log(`  ...with revista link kept: ${summary.updatesWithRevistaLinkToPreserve}`);
  console.log(`Image verdicts:`, summary.imageVerdicts);
  console.log(`Suspicious length mismatches (needs manual review): ${summary.suspiciousLengthMismatches}`);
  console.log(`\nFull report: ${OUT_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
