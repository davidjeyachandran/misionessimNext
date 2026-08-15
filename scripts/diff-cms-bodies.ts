/**
 * READ-ONLY body drift report — exported WP posts vs. live Contentful bodies.
 *
 * Why this exists alongside scripts/diff-cms-collisions.ts: that script only
 * compares *plain-text length* (`bodyLengthRatio`), and the local side is raw
 * markdown while the Contentful side is RichText. Markdown syntax (`**`,
 * `1. `, `[text](url)`) inflates the local count, so every matched post looks
 * ~11-100 chars "different" even when the content is byte-identical. That
 * signal cannot distinguish real editorial drift from conversion artifacts.
 *
 * This script compares like with like: it runs the *same* converter the
 * import uses (scripts/lib/markdown-to-richtext.ts) over each local .md, then
 * deep-compares the resulting RichText document against the one stored in
 * Contentful. Three outcomes per post:
 *
 *  - `identical`        — RichText JSON matches exactly. No action.
 *  - `structure-only`   — plain text matches, node tree differs (marks,
 *                         list nesting, embedded nodes). Usually a converter
 *                         change since import, not an editorial edit.
 *  - `text-drift`       — the readable text differs. This is the real signal;
 *                         someone edited one side after the import.
 *
 * Output: export/body-drift.json (per-post verdict + a text diff excerpt for
 * every `text-drift` post) plus a console summary. Writes nothing to
 * Contentful — pair it with `yarn import:cms` to actually push changes.
 *
 * Usage: `yarn diff:bodies`               (all posts, master via GraphQL)
 *        `yarn diff:bodies -- --limit=20` (first 20 posts, quick smoke check)
 */
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { markdownToRichText, type RichTextNode } from "./lib/markdown-to-richtext";
import { rewriteInternalLinks } from "./import-cms";

const POSTS_DIR = path.join(process.cwd(), "export", "posts");
const OUT_PATH = path.join(process.cwd(), "export", "body-drift.json");

type Verdict = "identical" | "structure-only" | "text-drift" | "no-cf-match";

interface DriftEntry {
  slug: string;
  verdict: Verdict;
  contentfulEntryId: string | null;
  localTextChars: number;
  cfTextChars: number;
  /** Character offset of the first divergence, for `text-drift` only. */
  firstDiffAt?: number;
  /** ~120 chars of each side around the first divergence, for eyeballing. */
  localExcerpt?: string;
  cfExcerpt?: string;
}

const IMAGE_URI = /\.(jpe?g|png|gif|webp|avif|svg)(\?|#|$)/i;

/** True for the placeholder our markdown converter emits for `![alt](url)`:
 * a hyperlink to an image URL whose text is the alt (or the literal
 * "imagen"). Contentful stores the same images as `embedded-asset-block`
 * nodes, which carry no text at all — so counting the placeholder text would
 * report drift on every post with an inline image. See
 * scripts/lib/markdown-to-richtext.ts (§"2. Image"). */
function isImagePlaceholder(node: RichTextNode): boolean {
  return (
    node.nodeType === "hyperlink" &&
    IMAGE_URI.test(String((node as { data?: { uri?: string } }).data?.uri ?? ""))
  );
}

/** Key-order-independent serialization. The converter emits object keys as
 * `nodeType, data, content` while Contentful's API returns them as
 * `data, content, nodeType` — identical documents that a plain
 * JSON.stringify comparison would report as different on every single post. */
function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`).join(",")}}`;
}

/** Sentinel standing in for "an image lives here", so that the local side's
 * `paragraph > hyperlink(image-url)` and Contentful's `embedded-asset-block`
 * compare equal. The import promotes the former into the latter and uploads
 * an asset, whose generated ID the local side cannot possibly predict — so
 * comparing the raw nodes would report a false diff on every post with an
 * inline image. See scripts/import-cms.ts (§"Replace image-only hyperlink
 * paragraphs with embedded-asset-block nodes"). */
const IMAGE_SENTINEL = { nodeType: "__image__" };

/** Canonicalize a RichText tree so the two sides are structurally comparable:
 * collapse both image spellings to the sentinel, and drop the `data` bag on
 * embedded assets (asset IDs differ by construction). */
function normalizeTree(node: RichTextNode): RichTextNode {
  if (node.nodeType === "embedded-asset-block" || isImagePlaceholder(node)) {
    return IMAGE_SENTINEL as RichTextNode;
  }
  const children = node.content ?? [];
  // A paragraph wrapping nothing but an image is exactly what the import
  // promotes, so unwrap it to the bare sentinel on both sides.
  if (node.nodeType === "paragraph" && children.length === 1) {
    const only = children[0];
    if (only.nodeType === "embedded-asset-block" || isImagePlaceholder(only)) {
      return IMAGE_SENTINEL as RichTextNode;
    }
  }
  if (!node.content) return node;
  return { ...node, content: children.map(normalizeTree) };
}

/** Readable text of a RichText tree, with block boundaries preserved so that
 * "same words, different paragraph split" counts as drift rather than hiding
 * behind concatenation. */
function plainText(node: RichTextNode | null | undefined): string {
  if (!node) return "";
  if (isImagePlaceholder(node)) return "";
  let out = node.value ?? "";
  for (const child of node.content ?? []) out += plainText(child);
  // Block-level nodes get a separator so paragraph joins/splits are visible.
  if (node.nodeType && !node.nodeType.startsWith("text") && !node.nodeType.includes("hyperlink")) {
    out += "\n";
  }
  return out;
}

/** Collapse runs of whitespace — Contentful's editor and the converter differ
 * on trailing spaces in ways that are not editorial changes. */
function normalizeText(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

async function gql<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  const spaceId = process.env.CONTENTFUL_SPACE_ID;
  const token = process.env.CONTENTFUL_ACCESS_TOKEN;
  if (!spaceId || !token) {
    throw new Error("Missing CONTENTFUL_SPACE_ID or CONTENTFUL_ACCESS_TOKEN in .env.local");
  }
  const res = await fetch(`https://graphql.contentful.com/content/v1/spaces/${spaceId}`, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(`Contentful GraphQL error: ${JSON.stringify(json.errors)}`);
  return json.data as T;
}

interface CfBody {
  entryId: string;
  body: RichTextNode | null;
}

async function fetchBodies(slugs: string[]): Promise<Map<string, CfBody>> {
  const found = new Map<string, CfBody>();
  const BATCH = 20; // RichText bodies are large — smaller pages than the slug-only query
  for (let i = 0; i < slugs.length; i += BATCH) {
    const batch = slugs.slice(i, i + BATCH);
    const data = await gql<{
      blogPostCollection: {
        items: Array<{ sys: { id: string }; slug: string; body: { json: RichTextNode } | null }>;
      };
    }>(
      `query($slugs:[String]){
        blogPostCollection(where:{ slug_in: $slugs }, limit: ${BATCH}) {
          items { sys { id } slug body { json } }
        }
      }`,
      { slugs: batch },
    );
    for (const item of data.blogPostCollection.items) {
      found.set(item.slug, { entryId: item.sys.id, body: item.body?.json ?? null });
    }
    process.stderr.write(".");
  }
  process.stderr.write("\n");
  return found;
}

async function main() {
  const limitArg = process.argv.slice(2).find((a) => a.startsWith("--limit="));
  const limit = limitArg ? Number(limitArg.split("=")[1]) : Infinity;

  const files = (await readdir(POSTS_DIR)).filter((f) => f.endsWith(".md")).slice(0, limit);
  console.log(`Reading ${files.length} exported posts...`);

  const posts = await Promise.all(
    files.map(async (file) => {
      const { data, content } = matter(await readFile(path.join(POSTS_DIR, file), "utf-8"));
      return { slug: data.slug as string, markdown: content };
    }),
  );

  console.log("Fetching Contentful bodies (master via GraphQL)...");
  const cfBodies = await fetchBodies(posts.map((p) => p.slug));

  const entries: DriftEntry[] = posts.map(({ slug, markdown }) => {
    const cf = cfBodies.get(slug);
    // Apply the import's own link rewrite so internal links aren't false diffs.
    const localDoc = rewriteInternalLinks(
      markdownToRichText(markdown),
    ) as unknown as RichTextNode;
    const localText = normalizeText(plainText(localDoc));

    if (!cf || !cf.body) {
      return {
        slug,
        verdict: "no-cf-match",
        contentfulEntryId: cf?.entryId ?? null,
        localTextChars: localText.length,
        cfTextChars: 0,
      };
    }

    const cfText = normalizeText(plainText(cf.body));
    const base: DriftEntry = {
      slug,
      verdict: "identical",
      contentfulEntryId: cf.entryId,
      localTextChars: localText.length,
      cfTextChars: cfText.length,
    };

    const sameTree =
      stableStringify(normalizeTree(localDoc)) === stableStringify(normalizeTree(cf.body));
    if (sameTree) return base;
    if (localText === cfText) return { ...base, verdict: "structure-only" };

    let i = 0;
    while (i < localText.length && i < cfText.length && localText[i] === cfText[i]) i++;
    return {
      ...base,
      verdict: "text-drift",
      firstDiffAt: i,
      localExcerpt: localText.slice(Math.max(0, i - 20), i + 100),
      cfExcerpt: cfText.slice(Math.max(0, i - 20), i + 100),
    };
  });

  const counts = entries.reduce<Record<string, number>>((acc, e) => {
    acc[e.verdict] = (acc[e.verdict] ?? 0) + 1;
    return acc;
  }, {});

  await writeFile(
    OUT_PATH,
    JSON.stringify({ generatedAt: new Date().toISOString(), counts, entries }, null, 2),
  );

  console.log("\n=== Body drift summary ===");
  console.log(`Posts compared:   ${entries.length}`);
  console.log(`  identical:      ${counts.identical ?? 0}`);
  console.log(`  structure-only: ${counts["structure-only"] ?? 0}`);
  console.log(`  text-drift:     ${counts["text-drift"] ?? 0}   <-- real content differences`);
  console.log(
    `  no-cf-match:    ${counts["no-cf-match"] ?? 0}   (incl. archived duplicates — the CDA never serves those)`,
  );

  const drifted = entries.filter((e) => e.verdict === "text-drift");
  if (drifted.length) {
    console.log("\nPosts with real text drift:");
    for (const d of drifted.slice(0, 25)) {
      console.log(`  ${d.slug}  (local ${d.localTextChars} vs cf ${d.cfTextChars} chars)`);
    }
    if (drifted.length > 25) console.log(`  ...and ${drifted.length - 25} more`);
  }
  console.log(`\nFull report: ${OUT_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
