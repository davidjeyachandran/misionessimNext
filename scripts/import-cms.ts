/**
 * Phase 4 — import exported WP posts into the shared Contentful space.
 *
 * Two modes:
 *  - `yarn import:cms` (default, dry-run): computes the full import plan
 *    from export/collision-diff.json + export/posts/*.md and writes it to
 *    export/import-plan.json. Makes NO Content Management API calls.
 *  - `yarn import:cms --live --environment=<id>`: executes the plan against
 *    the given Contentful environment. Requires CONTENTFUL_MANAGEMENT_TOKEN.
 *    Refuses to target "master" or "main" without --force ("master" is a
 *    Contentful environment ALIAS pointing at "main" — same production data,
 *    shared infra for mi-movilicemos — see docs/contentful.md). Reads
 *    export/collision-diff.<id>.json (NOT the unsuffixed master one) — run
 *    `yarn diff:cms -- --environment=<id>` first. This matters: environments
 *    are not clean mirrors of each other (confirmed 2026-07-04 — Contentful's
 *    "development" environment has only 22/335 slug matches vs. master's
 *    215, i.e. genuinely different content, not a recent branch of master).
 *
 * As of 2026-07-04 the live path is UNTESTED — dry-run plans have been
 * computed and reviewed for both master and development, but no --live
 * execution has happened yet (see docs/PROGRESS.md).
 *
 * Per-field policy (docs/nextjs-migration-analysis.md §2.5/§4):
 *  - Title/body always come from WP (mojibake-cleaned, already true of the
 *    export/posts/*.md files).
 *  - Image comes from whichever side the collision diff's `imageVerdict`
 *    says has the larger image.
 *  - An existing `revista` back-reference is always preserved, never
 *    touched or cleared.
 *  - Matching slugs are always updates in place — never delete/recreate.
 */
import { readFile, writeFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { markdownToRichText, type RichTextNode } from "./lib/markdown-to-richtext";

const POSTS_DIR = path.join(process.cwd(), "export", "posts");
const MEDIA_DIR = path.join(process.cwd(), "export", "media");
const COLLISION_DIFF_PATH = path.join(process.cwd(), "export", "collision-diff.json");
const PLAN_OUT_PATH = path.join(process.cwd(), "export", "import-plan.json");

const BLOG_POST_CONTENT_TYPE = "blogPost";

// ---------------------------------------------------------------------------
// Plan types
// ---------------------------------------------------------------------------

interface ImagePlan {
  action: "upload-and-set" | "keep-existing" | "none";
  sourceUrl?: string; // WP source, when action === "upload-and-set"
  localPath?: string; // export/media/... path to upload from
}

interface PostPlan {
  slug: string;
  action: "create" | "update";
  contentfulEntryId: string | null;
  fields: {
    title: string;
    body: ReturnType<typeof markdownToRichText>;
    nid: string;
    // Optional additive fields (§4) — safe for mi-movilicemos, which selects
    // explicit fields in its GraphQL queries.
    excerpt: string;
    categories: string[];
    tags: string[];
    author: string | null;
    seoTitle: string | null;
    seoDescription: string | null;
    publishDate: string;
  };
  image: ImagePlan;
  revista: {
    action: "preserve" | "none";
    slug: string | null;
  };
  inlineImages: Array<{ url: string; alt: string }>;
}

interface CollisionDiffEntry {
  slug: string;
  status: "new" | "update" | "skip-archived";
  contentfulEntryId: string | null;
  hasRevistaLink: boolean;
  revistaSlug: string | null;
  imageVerdict: "wp-higher-res" | "wp-has-cf-missing" | "cf-higher-res" | "wp-missing-cf-has" | "neither";
  wpImage: { width?: number; height?: number } | null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// Strip the auto-truncation marker WP appends to excerpts ("texto… […]").
// Without this, the description field is rendered as a lead paragraph that
// duplicates the opening ~55 words of the body and ends mid-sentence.
function cleanExcerpt(excerpt: string): string {
  return excerpt.replace(/\s*\[…\]\s*$/, "").trim();
}

// Walk a RichText document and make misionessim.org absolute links relative,
// and rewrite /la-revista/ paths to the new /revistavamos/ route.
function rewriteInternalLinks(
  doc: ReturnType<typeof markdownToRichText>,
): ReturnType<typeof markdownToRichText> {
  function walk(nodes: RichTextNode[]): RichTextNode[] {
    return nodes.map((node) => {
      if (node.nodeType === "hyperlink" && typeof node.data?.uri === "string") {
        let uri = node.data.uri as string;
        if (uri.startsWith("https://misionessim.org/")) {
          uri = uri.slice("https://misionessim.org".length);
        }
        if (uri.startsWith("/la-revista/")) {
          uri = uri.replace("/la-revista/", "/revistavamos/");
        }
        return { ...node, data: { uri }, content: node.content ? walk(node.content) : [] };
      }
      if (node.content) return { ...node, content: walk(node.content) };
      return node;
    });
  }
  return { ...doc, content: walk(doc.content) };
}

// Collect all wp-content image hyperlinks from a RichText document so the
// live import can upload them as Contentful assets and replace the hyperlinks
// with embedded-asset-block nodes. Deduplicates by URL.
const IMAGE_EXT_RE = /\.(jpe?g|png|gif|webp|svg)(\?.*)?$/i;

function extractInlineImages(
  doc: ReturnType<typeof markdownToRichText>,
): Array<{ url: string; alt: string }> {
  const seen = new Set<string>();
  const out: Array<{ url: string; alt: string }> = [];
  function walk(nodes: RichTextNode[]) {
    for (const n of nodes) {
      if (
        n.nodeType === "hyperlink" &&
        IMAGE_EXT_RE.test((n.data?.uri as string) ?? "")
      ) {
        const url = n.data.uri as string;
        if (!seen.has(url)) {
          seen.add(url);
          out.push({ url, alt: (n.content?.[0] as { value?: string })?.value ?? "" });
        }
      }
      if (n.content) walk(n.content);
    }
  }
  walk(doc.content);
  return out;
}

// ---------------------------------------------------------------------------
// Plan computation (runs in both dry-run and --live modes)
// ---------------------------------------------------------------------------

async function buildPlan(environmentId?: string): Promise<PostPlan[]> {
  // Each environment can have genuinely different content (confirmed
  // 2026-07-04: "development" has only 22/335 slug matches vs. master's
  // 215 — it is NOT a clean mirror), so the collision diff must be
  // environment-specific. `yarn diff:cms --environment=<id>` produces
  // export/collision-diff.<id>.json; master uses the unsuffixed file.
  const diffPath = environmentId
    ? path.join(process.cwd(), "export", `collision-diff.${environmentId}.json`)
    : COLLISION_DIFF_PATH;
  let diffRaw: string;
  try {
    diffRaw = await readFile(diffPath, "utf-8");
  } catch {
    throw new Error(
      `Missing ${diffPath} — run \`yarn diff:cms${environmentId ? ` -- --environment=${environmentId}` : ""}\` first.`,
    );
  }
  const diff = JSON.parse(diffRaw) as { diffs: CollisionDiffEntry[] };
  const diffBySlug = new Map(diff.diffs.map((d) => [d.slug, d]));

  const fs = await import("node:fs/promises");
  const files = (await fs.readdir(POSTS_DIR)).filter((f) => f.endsWith(".md"));

  const plans: PostPlan[] = [];
  for (const file of files) {
    const raw = await readFile(path.join(POSTS_DIR, file), "utf-8");
    const { data, content } = matter(raw);
    const slug = data.slug as string;
    const d = diffBySlug.get(slug);
    if (!d) {
      throw new Error(
        `No collision-diff entry for ${slug} — rerun \`yarn diff:cms\` after \`yarn export:wp\``,
      );
    }
    if (d.status === "skip-archived") {
      // Archived = deliberately removed (duplicate cleanup); the canonical
      // article lives under another slug. Updating would 400, recreating
      // would resurrect the duplicate.
      console.log(`  skipping ${slug} (Contentful entry is archived)`);
      continue;
    }

    const featuredImage = data.featuredImage as
      | { sourceUrl: string; localPath: string }
      | null;

    let image: ImagePlan;
    if (d.imageVerdict === "wp-higher-res" || d.imageVerdict === "wp-has-cf-missing") {
      image = featuredImage
        ? { action: "upload-and-set", sourceUrl: featuredImage.sourceUrl, localPath: path.join("export", featuredImage.localPath) }
        : { action: "none" };
    } else if (d.imageVerdict === "cf-higher-res" || d.imageVerdict === "wp-missing-cf-has") {
      image = { action: "keep-existing" };
    } else {
      image = { action: "none" };
    }

    const body = rewriteInternalLinks(markdownToRichText(content));
    plans.push({
      slug,
      action: d.status === "new" ? "create" : "update",
      contentfulEntryId: d.contentfulEntryId,
      inlineImages: extractInlineImages(body),
      fields: {
        title: data.title as string,
        body,
        nid: String(data.wpId),
        excerpt: (data.excerpt as string) ?? "",
        categories: (data.categories as string[]) ?? [],
        tags: (data.tags as string[]) ?? [],
        author: (data.author as string | null) ?? null,
        seoTitle: (data.seoTitle as string | null) ?? null,
        seoDescription: (data.seoDescription as string | null) ?? null,
        publishDate: data.date as string,
      },
      image,
      revista: {
        action: d.hasRevistaLink ? "preserve" : "none",
        slug: d.revistaSlug,
      },
    });
  }

  return plans;
}

function summarize(plans: PostPlan[]) {
  return {
    total: plans.length,
    create: plans.filter((p) => p.action === "create").length,
    update: plans.filter((p) => p.action === "update").length,
    imagesToUpload: plans.filter((p) => p.image.action === "upload-and-set").length,
    imagesKeptExisting: plans.filter((p) => p.image.action === "keep-existing").length,
    imagesNone: plans.filter((p) => p.image.action === "none").length,
    revistaLinksPreserved: plans.filter((p) => p.revista.action === "preserve").length,
  };
}

// ---------------------------------------------------------------------------
// Live execution — UNTESTED as of 2026-07-04, no credentials for this space
// yet. Uses the modern plain client API (createClient default), matching
// mi-movilicemos's own SDK usage pattern (contentful.md).
// ---------------------------------------------------------------------------

async function runLive(plans: PostPlan[], environmentId: string) {
  const spaceId = process.env.CONTENTFUL_SPACE_ID;
  const managementToken = process.env.CONTENTFUL_MANAGEMENT_TOKEN;
  if (!spaceId || !managementToken) {
    throw new Error(
      "CONTENTFUL_SPACE_ID and CONTENTFUL_MANAGEMENT_TOKEN must be set in .env.local for --live mode.",
    );
  }

  const { createClient } = await import("contentful-management");
  const client = createClient({ accessToken: managementToken });

  const ctx = { spaceId, environmentId };
  let processed = 0;

  for (const plan of plans) {
    // Upload + process the image first, if this post needs one, so we have
    // an asset ID to attach to the entry.
    let heroImageLink: { sys: { type: "Link"; linkType: "Asset"; id: string } } | undefined;
    if (plan.image.action === "upload-and-set" && plan.image.localPath) {
      const fileBuffer = readFileSync(plan.image.localPath);
      const fileArrayBuffer = fileBuffer.buffer.slice(
        fileBuffer.byteOffset,
        fileBuffer.byteOffset + fileBuffer.byteLength,
      ) as ArrayBuffer;
      const filename = path.basename(plan.image.localPath);
      const asset = await client.asset.createFromFiles(ctx, {
        fields: {
          title: { "en-US": plan.fields.title },
          description: { "en-US": "" },
          file: {
            "en-US": {
              contentType: "image/jpeg",
              fileName: filename,
              file: fileArrayBuffer,
            },
          },
        },
      });
      const processedAsset = await client.asset.processForAllLocales(ctx, asset);
      await client.asset.publish({ ...ctx, assetId: processedAsset.sys.id }, processedAsset);
      heroImageLink = { sys: { type: "Link", linkType: "Asset", id: processedAsset.sys.id } };
    }

    // Upload inline images (wp-content image hyperlinks in the body), then
    // promote their enclosing single-image paragraphs to embedded-asset-block.
    const urlToAssetId = new Map<string, string>();
    for (const { url, alt } of plan.inlineImages) {
      try {
        // rewriteInternalLinks strips "https://misionessim.org" from image
        // URLs before extractInlineImages runs, leaving bare /wp-content/...
        // paths. Restore the origin so fetch() gets an absolute URL.
        const absoluteUrl = url.startsWith("/")
          ? `https://misionessim.org${url}`
          : url;
        const res = await fetch(absoluteUrl, {
          headers: { "user-agent": "misionessim-migration-bot/1.0" },
        });
        if (!res.ok) {
          console.warn(`  WARN: could not download ${url}: ${res.status}`);
          continue;
        }
        const buffer = await res.arrayBuffer();
        const contentType = res.headers.get("content-type") ?? "image/jpeg";
        const fileName = url.split("/").pop()?.split("?")[0] ?? "image.jpg";
        const asset = await client.asset.createFromFiles(ctx, {
          fields: {
            title: { "en-US": alt || fileName },
            description: { "en-US": alt },
            file: { "en-US": { contentType, fileName, file: buffer } },
          },
        });
        const processed = await client.asset.processForAllLocales(ctx, asset);
        await client.asset.publish({ ...ctx, assetId: processed.sys.id }, processed);
        urlToAssetId.set(url, processed.sys.id);
        console.log(`  uploaded inline asset: ${fileName} → ${processed.sys.id}`);
      } catch (e) {
        console.warn(
          `  WARN: failed to upload inline image ${url}: ${(e as Error).message}`,
        );
      }
    }

    // Replace image-only hyperlink paragraphs with embedded-asset-block nodes.
    let bodyDoc = plan.fields.body;
    if (urlToAssetId.size > 0) {
      bodyDoc = {
        ...bodyDoc,
        content: bodyDoc.content.map((node) => {
          if (
            node.nodeType === "paragraph" &&
            node.content?.length === 1 &&
            node.content[0].nodeType === "hyperlink" &&
            urlToAssetId.has(node.content[0].data?.uri as string)
          ) {
            return {
              nodeType: "embedded-asset-block",
              data: {
                target: {
                  sys: {
                    type: "Link" as const,
                    linkType: "Asset" as const,
                    id: urlToAssetId.get(node.content[0].data.uri as string)!,
                  },
                },
              },
              content: [],
            };
          }
          return node;
        }),
      };
    }

    const fields: Record<string, unknown> = {
      slug: { "en-US": plan.slug },
      title: { "en-US": plan.fields.title },
      body: { "en-US": bodyDoc },
      nid: { "en-US": plan.fields.nid },
      publishDate: { "en-US": plan.fields.publishDate },
      // Contentful's field is `description`, not `excerpt` — the schema
      // already had a required `description` field serving the same
      // purpose (confirmed via Management API, 2026-07-04); no `excerpt`
      // field exists. Required, so fall back to the title if WP's excerpt
      // is empty (rare, but happens on very short posts).
      description: { "en-US": cleanExcerpt(plan.fields.excerpt) || plan.fields.title },
      categories: { "en-US": plan.fields.categories },
      tags: { "en-US": plan.fields.tags },
      seoTitle: { "en-US": plan.fields.seoTitle },
      seoDescription: { "en-US": plan.fields.seoDescription },
    };
    if (heroImageLink) fields.heroImage = { "en-US": heroImageLink };
    // revista field is deliberately omitted from `fields` on update — the
    // Management API patches only the keys present, per the SDK's
    // update() semantics with a full EntryProps payload merged over the
    // existing entry; the existing `revista` link is preserved by never
    // being included here.

    if (plan.action === "create") {
      const entry = await client.entry.create(
        { ...ctx, contentTypeId: BLOG_POST_CONTENT_TYPE },
        { fields },
      );
      await client.entry.publish({ ...ctx, entryId: entry.sys.id }, entry);
    } else if (plan.contentfulEntryId) {
      const existing = await client.entry.get({ ...ctx, entryId: plan.contentfulEntryId });
      const merged = { ...existing, fields: { ...existing.fields, ...fields } };
      const updated = await client.entry.update(
        { ...ctx, entryId: plan.contentfulEntryId },
        merged,
      );
      await client.entry.publish({ ...ctx, entryId: plan.contentfulEntryId }, updated);
    }

    processed++;
    if (processed % 25 === 0) console.log(`  ${processed}/${plans.length}`);
  }
}

// ---------------------------------------------------------------------------

async function main() {
  const args = process.argv.slice(2);
  const live = args.includes("--live");
  const force = args.includes("--force");
  const envArg = args.find((a) => a.startsWith("--environment="));
  const environmentId = envArg?.split("=")[1];
  const limitArg = args.find((a) => a.startsWith("--limit="));
  const liveLimit = limitArg ? Number(limitArg.split("=")[1]) : undefined;
  const slugArg = args.find((a) => a.startsWith("--slugs="));
  const onlySlugs = slugArg ? new Set(slugArg.split("=")[1].split(",")) : undefined;

  console.log(
    `Building import plan from ${environmentId ? `collision-diff.${environmentId}.json` : "collision-diff.json"} + export/posts/*.md...`,
  );
  const plans = await buildPlan(environmentId);
  const summary = summarize(plans);

  const planOutPath = environmentId
    ? path.join(process.cwd(), "export", `import-plan.${environmentId}.json`)
    : PLAN_OUT_PATH;
  await writeFile(
    planOutPath,
    JSON.stringify({ generatedAt: new Date().toISOString(), summary, plans }, null, 2),
  );

  console.log("\n=== Import plan summary ===");
  console.log(`Total posts:              ${summary.total}`);
  console.log(`  create (new):           ${summary.create}`);
  console.log(`  update (existing):      ${summary.update}`);
  console.log(`Images to upload (WP):    ${summary.imagesToUpload}`);
  console.log(`Images kept (Contentful): ${summary.imagesKeptExisting}`);
  console.log(`Images: none either side: ${summary.imagesNone}`);
  console.log(`Revista links preserved:  ${summary.revistaLinksPreserved}`);
  console.log(`\nFull plan: ${planOutPath}`);

  if (!live) {
    console.log("\nDry run only — no Contentful API calls made. Pass --live --environment=<id> to execute.");
    return;
  }

  if (!environmentId) {
    throw new Error("--live requires --environment=<id> (no default — refuses to guess).");
  }
  // "master" is a Contentful environment ALIAS, not a real environment — in
  // this space it points at "main" (confirmed 2026-07-04 via
  // client.environmentAlias.getMany). Writing to "main" IS writing to
  // production, identically to writing to "master". Block both.
  const PRODUCTION_ENVIRONMENT_IDS = ["master", "main"];
  if (PRODUCTION_ENVIRONMENT_IDS.includes(environmentId) && !force) {
    throw new Error(
      `Refusing to run --live against "${environmentId}" — production environment (shared space, also used by mi-movilicemos; "master" is an alias for "main", same data). Use a sandbox environment (e.g. "development") first, or pass --force if you really mean it.`,
    );
  }

  let livePlans = plans;
  if (onlySlugs) livePlans = livePlans.filter((p) => onlySlugs.has(p.slug));
  if (liveLimit) livePlans = livePlans.slice(0, liveLimit);

  console.log(
    `\n--live: executing plan against environment "${environmentId}" (${livePlans.length}/${plans.length} posts${liveLimit ? `, --limit=${liveLimit}` : ""}${onlySlugs ? `, --slugs filter` : ""})...`,
  );
  await runLive(livePlans, environmentId);
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
