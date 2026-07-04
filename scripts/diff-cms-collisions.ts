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
 * Two data sources, selected by `--environment=<id>`:
 *  - Default (no flag): GraphQL Content Delivery API against `master`. Our
 *    CDA token is scoped only to master (confirmed 2026-07-04 — querying
 *    any other environment via GraphQL 400s with UNKNOWN_ENVIRONMENT).
 *  - `--environment=<id>`: Content Management API against that specific
 *    environment (needed for e.g. "development", which is NOT a clean
 *    mirror of master — 792 vs 791 blogPosts, some entries missing —
 *    confirmed 2026-07-04). Requires CONTENTFUL_MANAGEMENT_TOKEN.
 *
 * Output: export/collision-diff.json (master) or
 * export/collision-diff.<environment>.json — machine-readable, keyed by
 * slug, feeds Phase 4's actual import script — + a console summary table.
 *
 * Re-runnable: `yarn diff:cms` / `yarn diff:cms -- --environment=development`.
 * Rerun before the real import to catch drift since this was generated.
 */
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

const POSTS_DIR = path.join(process.cwd(), "export", "posts");

interface RichTextNode {
  nodeType: string;
  value?: string;
  content?: RichTextNode[];
}

interface CfBlogPost {
  entryId: string;
  slug: string;
  title: string;
  nid: string | null;
  heroImage: { width: number; height: number } | null;
  revistaSlug: string | null;
  body: RichTextNode | null;
  /** True when the entry is archived in Contentful (Management API only —
   * the CDA/GraphQL path never returns archived entries). Archived matches
   * are deliberate removals (2026-07-04 duplicate cleanup: WP-slug losers
   * whose canonical content lives under a VAMOS-slug twin) — they must be
   * neither updated (the API refuses) nor recreated. */
  archived: boolean;
}

function richTextToPlainLength(node: RichTextNode | null | undefined): number {
  if (!node) return 0;
  let total = node.value?.length ?? 0;
  for (const child of node.content ?? []) {
    total += richTextToPlainLength(child);
  }
  return total;
}

// ---------------------------------------------------------------------------
// Source 1: GraphQL Content Delivery API against master (default).
// ---------------------------------------------------------------------------

async function fetchViaGraphQL(slugs: string[]): Promise<Map<string, CfBlogPost>> {
  const spaceId = process.env.CONTENTFUL_SPACE_ID;
  const token = process.env.CONTENTFUL_ACCESS_TOKEN;
  if (!spaceId || !token) {
    throw new Error("Missing CONTENTFUL_SPACE_ID or CONTENTFUL_ACCESS_TOKEN in .env.local");
  }
  const endpoint = `https://graphql.contentful.com/content/v1/spaces/${spaceId}`;

  async function gql<T>(query: string, variables: Record<string, unknown>): Promise<T> {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
      body: JSON.stringify({ query, variables }),
    });
    const json = await res.json();
    if (json.errors) throw new Error(`Contentful GraphQL error: ${JSON.stringify(json.errors)}`);
    return json.data as T;
  }

  const found = new Map<string, CfBlogPost>();
  const BATCH = 40;
  for (let i = 0; i < slugs.length; i += BATCH) {
    const batch = slugs.slice(i, i + BATCH);
    const data = await gql<{
      blogPostCollection: {
        items: Array<{
          sys: { id: string };
          slug: string;
          title: string;
          nid: string | null;
          heroImage: { width: number; height: number } | null;
          revista: { slug: string } | null;
          body: { json: RichTextNode } | null;
        }>;
      };
    }>(
      `query($slugs: [String]) {
        blogPostCollection(where: { slug_in: $slugs }, limit: ${BATCH}) {
          items {
            sys { id }
            slug
            title
            nid
            heroImage { width height }
            revista { slug }
            body { json }
          }
        }
      }`,
      { slugs: batch },
    );
    for (const item of data.blogPostCollection.items) {
      found.set(item.slug, {
        entryId: item.sys.id,
        slug: item.slug,
        title: item.title,
        nid: item.nid,
        heroImage: item.heroImage,
        revistaSlug: item.revista?.slug ?? null,
        body: item.body?.json ?? null,
        archived: false, // CDA only serves published entries
      });
    }
    process.stderr.write(".");
  }
  process.stderr.write("\n");
  return found;
}

// ---------------------------------------------------------------------------
// Source 2: Content Management API against an arbitrary environment.
// Resolves heroImage (Asset link) and revista (Entry link) references
// manually, since the Management API returns unresolved links, not the
// GraphQL API's auto-resolved shape.
// ---------------------------------------------------------------------------

async function fetchViaManagementApi(environmentId: string): Promise<Map<string, CfBlogPost>> {
  const spaceId = process.env.CONTENTFUL_SPACE_ID;
  const managementToken = process.env.CONTENTFUL_MANAGEMENT_TOKEN;
  if (!spaceId || !managementToken) {
    throw new Error(
      "Missing CONTENTFUL_SPACE_ID or CONTENTFUL_MANAGEMENT_TOKEN in .env.local (required for --environment)",
    );
  }
  const { createClient } = await import("contentful-management");
  const client = createClient({ accessToken: managementToken });
  const ctx = { spaceId, environmentId };

  console.log(`Fetching all blogPost entries from environment "${environmentId}"...`);
  const allEntries: Array<{
    sys: { id: string; archivedVersion?: number };
    fields: Record<string, Record<string, unknown>>;
  }> = [];
  let skip = 0;
  const PAGE = 100;
  while (true) {
    const page = await client.entry.getMany({
      ...ctx,
      query: { content_type: "blogPost", limit: PAGE, skip },
    });
    allEntries.push(...(page.items as unknown as typeof allEntries));
    process.stderr.write(".");
    if (allEntries.length >= page.total) break;
    skip += PAGE;
  }
  process.stderr.write("\n");
  console.log(`  ${allEntries.length} blogPost entries.`);

  // Collect referenced asset + revista entry IDs to resolve in bulk.
  const assetIds = new Set<string>();
  const revistaIds = new Set<string>();
  for (const e of allEntries) {
    const heroImageId = (e.fields.heroImage?.["en-US"] as { sys?: { id: string } } | undefined)
      ?.sys?.id;
    if (heroImageId) assetIds.add(heroImageId);
    const revistaId = (e.fields.revista?.["en-US"] as { sys?: { id: string } } | undefined)?.sys
      ?.id;
    if (revistaId) revistaIds.add(revistaId);
  }

  async function fetchByIdsInBatches<T>(
    ids: string[],
    fetchPage: (idsCsv: string) => Promise<{ items: T[] }>,
  ): Promise<T[]> {
    const BATCH = 50;
    const results: T[] = [];
    for (let i = 0; i < ids.length; i += BATCH) {
      const batch = ids.slice(i, i + BATCH);
      const page = await fetchPage(batch.join(","));
      results.push(...page.items);
      process.stderr.write(".");
    }
    process.stderr.write("\n");
    return results;
  }

  console.log(`Resolving ${assetIds.size} referenced assets...`);
  const assets = await fetchByIdsInBatches(
    [...assetIds],
    (idsCsv) =>
      client.asset.getMany({
        ...ctx,
        query: { "sys.id[in]": idsCsv, limit: 50 },
      }) as never,
  );
  const assetDims = new Map<string, { width: number; height: number }>();
  for (const a of assets as Array<{
    sys: { id: string };
    fields: { file?: Record<string, { details?: { image?: { width: number; height: number } } }> };
  }>) {
    const details = a.fields.file?.["en-US"]?.details?.image;
    if (details) assetDims.set(a.sys.id, details);
  }

  console.log(`Resolving ${revistaIds.size} referenced revista entries...`);
  const revistas = await fetchByIdsInBatches(
    [...revistaIds],
    (idsCsv) =>
      client.entry.getMany({
        ...ctx,
        query: { "sys.id[in]": idsCsv, content_type: "revista", limit: 50 },
      }) as never,
  );
  const revistaSlugs = new Map<string, string>();
  for (const r of revistas as Array<{
    sys: { id: string };
    fields: { slug?: Record<string, string> };
  }>) {
    const slug = r.fields.slug?.["en-US"];
    if (slug) revistaSlugs.set(r.sys.id, slug);
  }

  const found = new Map<string, CfBlogPost>();
  for (const e of allEntries) {
    const slug = e.fields.slug?.["en-US"] as string | undefined;
    if (!slug) continue; // skip malformed entries with no slug rather than crash
    const heroImageId = (e.fields.heroImage?.["en-US"] as { sys?: { id: string } } | undefined)
      ?.sys?.id;
    const revistaId = (e.fields.revista?.["en-US"] as { sys?: { id: string } } | undefined)?.sys
      ?.id;
    const archived = e.sys.archivedVersion !== undefined;
    // If a live and an archived entry ever share a slug, the live one wins
    // the match — never let an archived row shadow updatable content.
    if (archived && found.has(slug) && !found.get(slug)!.archived) continue;
    found.set(slug, {
      entryId: e.sys.id,
      slug,
      title: (e.fields.title?.["en-US"] as string) ?? "",
      nid: (e.fields.nid?.["en-US"] as string) ?? null,
      heroImage: heroImageId ? (assetDims.get(heroImageId) ?? null) : null,
      revistaSlug: revistaId ? (revistaSlugs.get(revistaId) ?? null) : null,
      body: (e.fields.body?.["en-US"] as RichTextNode) ?? null,
      archived,
    });
  }
  return found;
}

// ---------------------------------------------------------------------------

type ImageVerdict =
  | "wp-has-cf-missing"
  | "wp-higher-res"
  | "cf-higher-res"
  | "wp-missing-cf-has"
  | "neither";

interface DiffEntry {
  slug: string;
  /** "skip-archived": the matching Contentful entry is archived (a deliberate
   * duplicate-cleanup removal) — the import must not update or recreate it. */
  status: "new" | "update" | "skip-archived";
  contentfulEntryId: string | null;
  wpTitle: string;
  cfTitle: string | null;
  titleChanged: boolean;
  wpBodyChars: number;
  cfBodyChars: number;
  bodyLengthRatio: number | null;
  hasRevistaLink: boolean;
  revistaSlug: string | null;
  imageVerdict: ImageVerdict;
  wpImage: { width?: number; height?: number } | null;
  cfImage: { width: number; height: number } | null;
}

async function main() {
  const args = process.argv.slice(2);
  const envArg = args.find((a) => a.startsWith("--environment="));
  const environmentId = envArg?.split("=")[1];

  const outPath = environmentId
    ? path.join(process.cwd(), "export", `collision-diff.${environmentId}.json`)
    : path.join(process.cwd(), "export", "collision-diff.json");

  const files = (await readdir(POSTS_DIR)).filter((f) => f.endsWith(".md"));
  console.log(`Reading ${files.length} exported posts...`);

  const wpPosts = await Promise.all(
    files.map(async (file) => {
      const raw = await readFile(path.join(POSTS_DIR, file), "utf-8");
      const { data, content } = matter(raw);
      return { frontmatter: data, body: content };
    }),
  );

  console.log(
    environmentId
      ? `Querying Contentful environment "${environmentId}" via Management API...`
      : "Querying Contentful (master) via GraphQL...",
  );
  const cfMatches = environmentId
    ? await fetchViaManagementApi(environmentId)
    : await fetchViaGraphQL(wpPosts.map((p) => p.frontmatter.slug as string));

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
    // Strictly-greater: an equal-area tie keeps the existing Contentful
    // asset. After the initial import CF holds the very WP image we uploaded,
    // so a tie means "same image" — treating it as wp-higher-res (as the
    // original >= did) would re-upload a duplicate asset on every re-run.
    else imageVerdict = wpArea > cfArea ? "wp-higher-res" : "cf-higher-res";

    const cfBodyChars = richTextToPlainLength(cf?.body);
    const wpBodyChars = body.length;

    return {
      slug,
      status: cf ? (cf.archived ? "skip-archived" : "update") : "new",
      contentfulEntryId: cf?.entryId ?? null,
      wpTitle: frontmatter.title as string,
      cfTitle: cf?.title ?? null,
      titleChanged: cf ? cf.title.trim() !== (frontmatter.title as string).trim() : true,
      wpBodyChars,
      cfBodyChars,
      bodyLengthRatio: cfBodyChars > 0 ? wpBodyChars / cfBodyChars : null,
      hasRevistaLink: !!cf?.revistaSlug,
      revistaSlug: cf?.revistaSlug ?? null,
      imageVerdict,
      wpImage: wpImage ?? null,
      cfImage: cf?.heroImage ?? null,
    };
  });

  const summary = {
    environment: environmentId ?? "master",
    total: diffs.length,
    new: diffs.filter((d) => d.status === "new").length,
    update: diffs.filter((d) => d.status === "update").length,
    skippedArchived: diffs.filter((d) => d.status === "skip-archived").length,
    updatesWithRevistaLinkToPreserve: diffs.filter((d) => d.hasRevistaLink).length,
    imageVerdicts: diffs.reduce<Record<string, number>>((acc, d) => {
      acc[d.imageVerdict] = (acc[d.imageVerdict] ?? 0) + 1;
      return acc;
    }, {}),
    suspiciousLengthMismatches: diffs.filter(
      (d) =>
        d.status === "update" &&
        d.bodyLengthRatio !== null &&
        (d.bodyLengthRatio > 5 || d.bodyLengthRatio < 0.2),
    ).length,
  };

  await writeFile(
    outPath,
    JSON.stringify({ generatedAt: new Date().toISOString(), summary, diffs }, null, 2),
  );

  console.log("\n=== Collision diff summary ===");
  console.log(`Environment:                 ${summary.environment}`);
  console.log(`Total WP posts:              ${summary.total}`);
  console.log(`New (no Contentful match):   ${summary.new}`);
  console.log(`Updates (slug matches):      ${summary.update}`);
  console.log(`Skipped (archived in CF):    ${summary.skippedArchived}`);
  console.log(`  ...with revista link kept: ${summary.updatesWithRevistaLinkToPreserve}`);
  console.log(`Image verdicts:`, summary.imageVerdicts);
  console.log(`Suspicious length mismatches (needs manual review): ${summary.suspiciousLengthMismatches}`);
  console.log(`\nFull report: ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
