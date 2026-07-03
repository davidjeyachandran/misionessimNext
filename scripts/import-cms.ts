/**
 * Phase 4 — import exported WP posts into the shared Contentful space.
 *
 * Two modes:
 *  - `yarn import:cms` (default, dry-run): computes the full import plan
 *    from export/collision-diff.json + export/posts/*.md and writes it to
 *    export/import-plan.json. Makes NO Content Management API calls.
 *  - `yarn import:cms --live --environment=<id>`: executes the plan against
 *    the given Contentful environment. Requires CONTENTFUL_MANAGEMENT_TOKEN.
 *    Refuses to target "master" without --force (this space is shared
 *    production infra for mi-movilicemos — see docs/contentful.md).
 *
 * As of 2026-07-04 the live path is UNTESTED — no Management API
 * credentials scoped to this space exist yet (see docs/PROGRESS.md). Do not
 * run --live until it has been dry-run-reviewed and exercised against a
 * sandbox environment first.
 *
 * Per-field policy (docs/nextjs-migration-analysis.md §2.5/§4):
 *  - Title/body always come from WP (mojibake-cleaned, already true of the
 *    export/posts/*.md files).
 *  - Image comes from whichever side collision-diff.json's `imageVerdict`
 *    says has the larger image.
 *  - An existing `revista` back-reference is always preserved, never
 *    touched or cleared.
 *  - Matching slugs are always updates in place — never delete/recreate.
 */
import { readFile, writeFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { markdownToRichText } from "./lib/markdown-to-richtext";

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
}

interface CollisionDiffEntry {
  slug: string;
  status: "new" | "update";
  contentfulEntryId: string | null;
  hasRevistaLink: boolean;
  revistaSlug: string | null;
  imageVerdict: "wp-higher-res" | "wp-has-cf-missing" | "cf-higher-res" | "wp-missing-cf-has" | "neither";
  wpImage: { width?: number; height?: number } | null;
}

// ---------------------------------------------------------------------------
// Plan computation (runs in both dry-run and --live modes)
// ---------------------------------------------------------------------------

async function buildPlan(): Promise<PostPlan[]> {
  const diffRaw = await readFile(COLLISION_DIFF_PATH, "utf-8");
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

    plans.push({
      slug,
      action: d.status === "new" ? "create" : "update",
      contentfulEntryId: d.contentfulEntryId,
      fields: {
        title: data.title as string,
        body: markdownToRichText(content),
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

    const fields: Record<string, unknown> = {
      slug: { "en-US": plan.slug },
      title: { "en-US": plan.fields.title },
      body: { "en-US": plan.fields.body },
      nid: { "en-US": plan.fields.nid },
      publishDate: { "en-US": plan.fields.publishDate },
      excerpt: { "en-US": plan.fields.excerpt },
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

  console.log("Building import plan from export/collision-diff.json + export/posts/*.md...");
  const plans = await buildPlan();
  const summary = summarize(plans);

  await writeFile(
    PLAN_OUT_PATH,
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
  console.log(`\nFull plan: ${PLAN_OUT_PATH}`);

  if (!live) {
    console.log("\nDry run only — no Contentful API calls made. Pass --live --environment=<id> to execute.");
    return;
  }

  if (!environmentId) {
    throw new Error("--live requires --environment=<id> (no default — refuses to guess).");
  }
  if (environmentId === "master" && !force) {
    throw new Error(
      "Refusing to run --live against the \"master\" environment (shared production space, also used by mi-movilicemos) without --force. Use a sandbox environment first.",
    );
  }

  console.log(`\n--live: executing plan against environment "${environmentId}"...`);
  await runLive(plans, environmentId);
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
