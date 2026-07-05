/**
 * Phase 0 — export all misionessim.org blog posts into a neutral,
 * vendor-independent intermediate: one markdown file per post (YAML
 * frontmatter + body) plus downloaded featured images with an integrity
 * manifest. This is the canonical backup (§3 Approach C rationale) and the
 * direct input to the Phase 4 Contentful import.
 *
 * Per the §2.5 quality audit: WP text has a systemic mojibake bug (broken
 * smart-quote bytes) that this script cleans up before conversion — the
 * exported markdown should never carry that corruption forward.
 *
 * Re-runnable: `yarn export:wp`. Only exports blog posts (335) — revista
 * export needs the keydesign-portfolio REST-exposure mu-plugin (not yet
 * added; see docs/PROGRESS.md).
 */
import TurndownService from "turndown";
import matter from "gray-matter";
import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SITE = "https://misionessim.org";
const POSTS_DIR = path.join(process.cwd(), "export", "posts");
const MEDIA_DIR = path.join(process.cwd(), "export", "media", "blog");
const MANIFEST_PATH = path.join(process.cwd(), "export", "manifest-blog.json");

const turndown = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
  bulletListMarker: "-",
});

// Tables → GFM pipe format so markdown-to-richtext.ts can convert them to
// Contentful table nodes. Rules fire depth-first (cells → rows → table).
turndown.addRule("table-cell", {
  filter: ["th", "td"],
  replacement: (content) =>
    ` ${content.replace(/\n+/g, " ").replace(/\|/g, "\\|").trim()} |`,
});

turndown.addRule("table-row", {
  filter: "tr",
  replacement: (content, node) => {
    const row = `|${content}\n`;
    const hasHeaders = Array.from((node as Element).children).some(
      (c) => c.nodeName === "TH",
    );
    if (hasHeaders) {
      const cellCount = (content.match(/ \|/g) ?? []).length;
      return row + `|${" --- |".repeat(cellCount)}\n`;
    }
    return row;
  },
});

turndown.addRule("table-block", {
  filter: ["table", "thead", "tbody", "tfoot"],
  replacement: (content) => `\n\n${content}\n\n`,
});

// iframes (YouTube / video embeds) → [video](url) standalone link.
// The HYPERLINK renderer in page.tsx detects this pattern and renders an
// <iframe> embed; other callers treat it as a regular external link.
turndown.addRule("iframe", {
  filter: "iframe",
  replacement: (_content, node) => {
    const src = (node as Element).getAttribute("src") ?? "";
    return src ? `\n\n[video](${src})\n\n` : "";
  },
});

// ---------------------------------------------------------------------------
// Mojibake cleanup (§2.5): WP's content.rendered stores smart quotes/dashes
// as raw Windows-1252 control-range codepoints (U+0080-U+009F) instead of
// their proper Unicode punctuation equivalents — a classic copy-from-Word
// encoding bug. Confirmed present in 5/6 sampled 2020 posts (2-11
// occurrences each). Fix before markdown conversion so it isn't carried
// into the CMS.
const MOJIBAKE_MAP: Record<string, string> = {
  "": "‘", // '
  "": "’", // '
  "": "“", // "
  "": "”", // "
  "": "–", // en dash
  "": "—", // em dash
  "": "…", // ellipsis
};
const MOJIBAKE_RE = new RegExp(`[${Object.keys(MOJIBAKE_MAP).join("")}]`, "g");

export function cleanMojibake(text: string): string {
  return text.replace(MOJIBAKE_RE, (ch) => MOJIBAKE_MAP[ch]);
}

// Leftover Drupal Media module embed tokens (misionessim.org was migrated
// off Drupal at some point — confirmed 2026-07-04 by a real example in
// 10-devocionales-en-youversion-sobre-trabajo-y-fe.md: a
// `[[{"fid":"3200","view_mode":"default",...,"type":"media",...}]]` blob
// sitting as literal visible text where an inline image used to render).
// The referenced Drupal file ID is unrecoverable (no access to that site's
// file table), so these are stripped rather than converted. Scanned all
// 335 exported bodies for this pattern: only this one post is affected —
// low frequency, but the regex stays defensive for future re-exports.
//
// Applied AFTER turndown conversion, not on the raw HTML: the source
// stores the quotes as HTML numeric entities (&#8220;/&#8221;, a
// Google-Docs-paste artifact, not the \x93/\x94 mojibake pattern), which
// only become literal curly-quote characters once turndown decodes
// entities during HTML->Markdown conversion. Turndown also
// backslash-escapes every `[`/`]` in the token (including the ones
// embedded in the payload itself, e.g. `field_file_image_alt_text\[und\]`)
// to prevent them being read as markdown link syntax — the regex tolerates
// an optional backslash before each bracket, and matches broadly between
// the opening `[[{` and the `"type":"media"` marker rather than trying to
// enumerate every escaped-bracket field in between.
const DRUPAL_MEDIA_TOKEN_RE =
  /\\?\[\\?\[\s*\{[\s\S]*?["“”]type["“”]\s*:\s*["“”]media["“”][\s\S]*?\}\s*\\?\]\\?\]/g;

export function stripDrupalMediaTokens(text: string): string {
  return text.replace(DRUPAL_MEDIA_TOKEN_RE, "").trim();
}

// title.rendered and excerpt.rendered are plain HTML fragments, not run
// through turndown (which decodes entities as part of markdown conversion)
// — so stripHtml needs its own entity decoding or WP's excerpt truncation
// marker ("&hellip;", present in ~320/335 exported files) and stray
// "&nbsp;" leak through as literal text.
const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  hellip: "…",
  mdash: "—",
  ndash: "–",
  lsquo: "‘",
  rsquo: "’",
  ldquo: "“",
  rdquo: "”",
};

export function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) =>
      String.fromCodePoint(parseInt(hex, 16)),
    )
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(
      /&([a-zA-Z]+);/g,
      (match, name) => NAMED_ENTITIES[name] ?? match,
    );
}

export function stripHtml(html: string): string {
  return decodeHtmlEntities(html.replace(/<[^>]+>/g, "")).trim();
}

// ---------------------------------------------------------------------------

interface WpTerm {
  id: number;
  name: string;
  taxonomy: string;
}

interface WpPost {
  id: number;
  slug: string;
  date_gmt: string;
  modified_gmt: string;
  link: string;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  author: number;
  categories: number[];
  tags: number[];
  yoast_head_json?: {
    title?: string;
    og_description?: string;
    canonical?: string;
    author?: string;
  };
  _embedded?: {
    "wp:featuredmedia"?: Array<{
      source_url?: string;
      media_details?: {
        width?: number;
        height?: number;
      };
    }>;
    "wp:term"?: WpTerm[][];
  };
}

async function fetchAllPosts(): Promise<WpPost[]> {
  const posts: WpPost[] = [];
  let page = 1;
  const perPage = 100;
  while (true) {
    const res = await fetch(
      `${SITE}/wp-json/wp/v2/posts?per_page=${perPage}&page=${page}&_embed`,
      { headers: { "user-agent": "misionessim-migration-bot/1.0" } },
    );
    if (!res.ok) {
      if (res.status === 400 && page > 1) break; // past last page
      throw new Error(`Failed to fetch posts page ${page}: ${res.status}`);
    }
    const batch = (await res.json()) as WpPost[];
    if (batch.length === 0) break;
    posts.push(...batch);
    console.log(`  fetched page ${page} (${batch.length} posts)`);
    if (batch.length < perPage) break;
    page++;
  }
  return posts;
}

async function downloadImage(
  url: string,
  destPath: string,
): Promise<{ sha256: string; bytes: number } | null> {
  try {
    const res = await fetch(url, {
      headers: { "user-agent": "misionessim-migration-bot/1.0" },
    });
    if (!res.ok) {
      console.warn(`  WARN: failed to download ${url}: ${res.status}`);
      return null;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    await mkdir(path.dirname(destPath), { recursive: true });
    await writeFile(destPath, buf);
    return {
      sha256: createHash("sha256").update(buf).digest("hex"),
      bytes: buf.length,
    };
  } catch (err) {
    console.warn(`  WARN: error downloading ${url}: ${(err as Error).message}`);
    return null;
  }
}

async function main() {
  console.log("Fetching all posts from WP REST API...");
  const posts = await fetchAllPosts();
  console.log(`Fetched ${posts.length} posts total.\n`);

  await mkdir(POSTS_DIR, { recursive: true });

  const mediaManifest: Array<{
    postSlug: string;
    sourceUrl: string;
    localPath: string;
    sha256: string;
    bytes: number;
  }> = [];
  const failures: Array<{ slug: string; reason: string }> = [];

  let processed = 0;
  for (const post of posts) {
    try {
      const title = cleanMojibake(stripHtml(post.title.rendered));
      const excerpt = cleanMojibake(stripHtml(post.excerpt.rendered));
      const cleanedContentHtml = cleanMojibake(post.content.rendered);
      // stripDrupalMediaTokens runs post-turndown, not on the raw HTML —
      // see the comment on DRUPAL_MEDIA_TOKEN_RE for why.
      const bodyMarkdown = stripDrupalMediaTokens(
        turndown.turndown(cleanedContentHtml).trim(),
      );

      const terms = post._embedded?.["wp:term"] ?? [];
      const categories = terms
        .flat()
        .filter((t) => t.taxonomy === "category")
        .map((t) => t.name);
      const tags = terms
        .flat()
        .filter((t) => t.taxonomy === "post_tag")
        .map((t) => t.name);

      const media = post._embedded?.["wp:featuredmedia"]?.[0];
      let featuredImage: {
        sourceUrl: string;
        localPath: string;
        width?: number;
        height?: number;
      } | null = null;

      if (media?.source_url) {
        const ext = path.extname(new URL(media.source_url).pathname) || ".jpg";
        const localRelPath = path.join("blog", `${post.slug}${ext}`);
        const localAbsPath = path.join(MEDIA_DIR, `${post.slug}${ext}`);
        const result = await downloadImage(media.source_url, localAbsPath);
        if (result) {
          featuredImage = {
            sourceUrl: media.source_url,
            localPath: path.join("media", localRelPath),
            width: media.media_details?.width,
            height: media.media_details?.height,
          };
          mediaManifest.push({
            postSlug: post.slug,
            sourceUrl: media.source_url,
            localPath: featuredImage.localPath,
            sha256: result.sha256,
            bytes: result.bytes,
          });
        }
      }

      const frontmatter = {
        wpId: post.id,
        slug: post.slug,
        title,
        date: post.date_gmt + "Z",
        modified: post.modified_gmt + "Z",
        legacyUrl: post.link,
        excerpt,
        categories,
        tags,
        author: post.yoast_head_json?.author ?? null,
        authorId: post.author,
        featuredImage,
        seoTitle: post.yoast_head_json?.title
          ? cleanMojibake(decodeHtmlEntities(post.yoast_head_json.title))
          : null,
        seoDescription: post.yoast_head_json?.og_description
          ? cleanMojibake(
              decodeHtmlEntities(post.yoast_head_json.og_description),
            )
          : null,
        canonical: post.yoast_head_json?.canonical ?? null,
      };

      const fileContent = matter.stringify(bodyMarkdown, frontmatter);
      await writeFile(
        path.join(POSTS_DIR, `${post.slug}.md`),
        fileContent,
        "utf-8",
      );

      processed++;
      if (processed % 25 === 0) {
        console.log(`  processed ${processed}/${posts.length}`);
      }
    } catch (err) {
      failures.push({ slug: post.slug, reason: (err as Error).message });
      console.error(`  ERROR on ${post.slug}: ${(err as Error).message}`);
    }
  }

  await writeFile(
    MANIFEST_PATH,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        totalPosts: posts.length,
        exported: processed,
        failed: failures.length,
        failures,
        mediaCount: mediaManifest.length,
        mediaMissing: posts.length - mediaManifest.length,
        media: mediaManifest,
      },
      null,
      2,
    ),
  );

  console.log(`\nExported ${processed}/${posts.length} posts to ${POSTS_DIR}`);
  console.log(
    `Downloaded ${mediaManifest.length}/${posts.length} featured images to ${MEDIA_DIR}`,
  );
  if (failures.length > 0) {
    console.log(`${failures.length} posts FAILED — see ${MANIFEST_PATH}`);
  }
}

// Guard against running on import — tests/unit/export-wp.test.ts imports
// this module for its exported utility functions (cleanMojibake, stripHtml,
// stripDrupalMediaTokens, etc.), and without this check that import would
// trigger a full live WP export (network calls, file writes) as a side
// effect. Confirmed as a real problem 2026-07-04 while ad-hoc testing this
// file's exports via a throwaway script.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
