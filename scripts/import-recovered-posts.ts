/**
 * Re-import the blog posts recovered from the Wayback Machine in
 * data/recovered-posts/.
 *
 * These two articles were indexed by Google (their WordPress comment feeds
 * turned up in the 2026-08-24 Search Console export) but exist nowhere else:
 * `no-eres-un-empleado-de-dios` is Drupal-era and did not survive the move to
 * WordPress; `camino-de-generosidad` was on WordPress in April 2025 and was
 * deleted afterwards. Neither is in export/posts/, so scripts/import-cms.ts
 * cannot see them — it plans from the WordPress export, and the WordPress
 * export is exactly what these are missing from. Hence a separate entry point
 * rather than a flag on that script.
 *
 * It reuses that script's markdown -> RichText conversion and internal-link
 * rewriting so the stored body is byte-identical in shape to the 335 posts
 * imported from WordPress.
 *
 *   yarn import:recovered                     dry run: plan + schema + collision check
 *   yarn import:recovered -- --live           create and publish against production
 *
 * Creates only. If an entry already carries the slug the script reports it and
 * skips, so a second run is a no-op rather than a duplicate — the shared space
 * already carries 34 duplicate articles from the original migration and does
 * not need more.
 */
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import { markdownToRichText } from "./lib/markdown-to-richtext";
import { rewriteInternalLinks } from "./import-cms";

const RECOVERED_DIR = path.join(process.cwd(), "data", "recovered-posts");
const BLOG_POST_CONTENT_TYPE = "blogPost";

// "master" is an alias onto "main" in this space; both are production, shared
// with mi-movilicemos. import-cms.ts blocks them behind --force because it
// writes 335 entries. This script writes at most two, both of them creates of
// slugs proven absent, so it targets production directly.
const ENVIRONMENT_ID = "master";

interface RecoveredFrontmatter {
  slug: string;
  title: string;
  publishDate: string;
  description: string;
  legacyPath: string;
  recoveredFrom: string;
  categories?: string[];
  tags?: string[];
  seoTitle?: string | null;
  seoDescription?: string | null;
}

async function loadRecovered() {
  const files = (await readdir(RECOVERED_DIR)).filter((f) => f.endsWith(".md"));
  return Promise.all(
    files.sort().map(async (file) => {
      const raw = await readFile(path.join(RECOVERED_DIR, file), "utf8");
      const { data, content } = matter(raw);
      const fm = data as RecoveredFrontmatter;
      for (const key of ["slug", "title", "publishDate", "description"] as const) {
        if (!fm[key]) throw new Error(`${file}: frontmatter is missing \`${key}\``);
      }
      // The recovered files carry the title as an H1 so they read as documents
      // on their own. Contentful stores it in `title`, and the template renders
      // that above the body, so leaving it in would print it twice.
      const withoutH1 = content.replace(/^\s*#\s+.*\n/, "");
      return { file, fm, body: rewriteInternalLinks(markdownToRichText(withoutH1)) };
    }),
  );
}

async function main() {
  const live = process.argv.includes("--live");
  const spaceId = process.env.CONTENTFUL_SPACE_ID;
  const managementToken = process.env.CONTENTFUL_MANAGEMENT_TOKEN;
  if (!spaceId || !managementToken) {
    throw new Error(
      "CONTENTFUL_SPACE_ID and CONTENTFUL_MANAGEMENT_TOKEN must be set in .env.local.",
    );
  }

  const posts = await loadRecovered();
  const { createClient } = await import("contentful-management");
  const client = createClient({ accessToken: managementToken });
  const ctx = { spaceId, environmentId: ENVIRONMENT_ID };

  const contentType = await client.contentType.get({
    ...ctx,
    contentTypeId: BLOG_POST_CONTENT_TYPE,
  });
  const required = contentType.fields
    .filter((f) => f.required && !f.omitted)
    .map((f) => f.id);
  console.log(`Required blogPost fields: ${required.join(", ")}`);

  for (const { file, fm, body } of posts) {
    console.log(`\n--- ${fm.slug} (${file})`);
    const existing = await client.entry.getMany({
      ...ctx,
      query: { content_type: BLOG_POST_CONTENT_TYPE, "fields.slug": fm.slug },
    });
    if (existing.total > 0) {
      console.log(
        `  SKIP — ${existing.total} entry already carries this slug: ` +
          existing.items.map((e) => e.sys.id).join(", "),
      );
      continue;
    }

    const fields: Record<string, unknown> = {
      slug: { "en-US": fm.slug },
      title: { "en-US": fm.title },
      body: { "en-US": body },
      publishDate: { "en-US": fm.publishDate },
      description: { "en-US": fm.description },
      categories: { "en-US": fm.categories ?? [] },
      tags: { "en-US": fm.tags ?? [] },
      seoTitle: { "en-US": fm.seoTitle ?? fm.title },
      seoDescription: { "en-US": fm.seoDescription ?? fm.description },
    };
    const missing = required.filter((id) => !(id in fields));
    if (missing.length) {
      throw new Error(
        `${fm.slug}: required field(s) not supplied: ${missing.join(", ")}`,
      );
    }

    console.log(`  title:       ${fm.title}`);
    console.log(`  publishDate: ${fm.publishDate}  ->  ${fm.legacyPath}`);
    console.log(`  body:        ${body.content.length} top-level nodes`);
    console.log(`  recovered:   ${fm.recoveredFrom}`);

    if (!live) {
      console.log("  dry run — no entry created. Pass --live to execute.");
      continue;
    }

    const entry = await client.entry.create(
      { ...ctx, contentTypeId: BLOG_POST_CONTENT_TYPE },
      { fields },
    );
    await client.entry.publish({ ...ctx, entryId: entry.sys.id }, entry);
    console.log(`  CREATED and published: ${entry.sys.id}`);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
