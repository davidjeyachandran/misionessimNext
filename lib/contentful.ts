import type { Document as RichTextDocument } from "@contentful/rich-text-types";
import { cache } from "react";
import { buildMemo } from "./build-memo";
import { buildBlogCatalogue } from "./content/blog-catalogue";
import {
  buildRevistaCatalogue,
  normalizeRevistaSlug as normalizeStoredRevistaSlug,
} from "./content/revista-catalogue";
import { createContentfulClient } from "./contentful/client";
import { revistaPdfPath as buildRevistaPdfPath } from "./publishing/paths";

// Contentful GraphQL caps collection `limit` at 100, so the full-catalogue
// fetch pages through in chunks of this size.
const PAGE_SIZE = 100;


const contentfulClient = createContentfulClient({
  spaceId: process.env.CONTENTFUL_SPACE_ID ?? "",
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN ?? "",
});

function gql<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  return contentfulClient.query<T>(query, variables);
}

// ---------------------------------------------------------------------------
// Types

export interface ContentfulImage {
  url: string;
  description?: string | null;
  width?: number | null;
  height?: number | null;
}

export interface BlogPostCard {
  slug: string;
  title: string;
  publishDate: string;
  description?: string | null;
  heroImage?: ContentfulImage | null;
  categories?: string[] | null;
  tags?: string[] | null;
  revistaSlug?: string | null;
}

export interface BlogPost extends BlogPostCard {
  /** CMS publish timestamp — the closest thing we have to a last-modified
   *  date, since the WordPress import did not carry one. Used for JSON-LD. */
  sys?: { publishedAt?: string | null } | null;
  body?: {
    json: RichTextDocument;
    links?: {
      assets?: {
        block?: Array<{
          sys: { id: string };
          url: string;
          title?: string | null;
          description?: string | null;
          width?: number | null;
          height?: number | null;
        } | null>;
      };
    };
  } | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  revista?: {
    slug: string;
    title: string;
  } | null;
}

// ---------------------------------------------------------------------------
// De-duplication
//
// The Contentful space is shared with mi-movilicemos and holds ~911 blogPost
// entries: 335 imported from the misionessim.org WordPress site plus ~576
// from the VAMOS magazine PDF pipeline. 34 articles exist as duplicate rows
// (32 pairs + 2 triplicates = 36 surplus rows) because the two import
// pipelines generated different slug conventions for the same article
// (e.g. `abuelas-a-distancia` vs `abuelas-distancia`). We show all articles
// but collapse duplicates at the display layer — deleting rows is unsafe
// because the VAMOS entries are linked to `revista` issues that mi-movilicemos
// reads from the same space. Losing entries stay resolvable by direct URL
// (getBlogPostBySlug is unfiltered); they're just not surfaced in listings.

interface RawEntry {
  slug: string;
  title: string;
  publishDate: string | null;
  description?: string | null;
  categories?: string[] | null;
  tags?: string[] | null;
  author?: string | null;
  heroImage?: ContentfulImage | null;
  revista?: { slug: string; title: string } | null;
}

const CATALOGUE_FIELDS = `
  slug
  title
  publishDate
  description
  categories
  tags
  author
  heroImage { url description width height }
  revista { slug title }
`;

// Fetch every blogPost once (paged) — ~10 GraphQL calls, memoized for the
// whole build. This was `cache()`, which reset on every page render; see
// `buildMemo` for why that cost ~3,000 calls a build.
const getAllEntries = buildMemo(async (): Promise<RawEntry[]> => {
  const all: RawEntry[] = [];
  let skip = 0;
  while (true) {
    const data = await gql<{
      blogPostCollection: { total: number; items: RawEntry[] };
    }>(
      `query ($limit: Int!, $skip: Int!) {
        blogPostCollection(order: publishDate_DESC, limit: $limit, skip: $skip) {
          total
          items { ${CATALOGUE_FIELDS} }
        }
      }`,
      { limit: PAGE_SIZE, skip },
    );
    all.push(...data.blogPostCollection.items);
    if (all.length >= data.blogPostCollection.total || data.blogPostCollection.items.length === 0) {
      break;
    }
    skip += PAGE_SIZE;
  }
  return all;
});

function toCard(e: RawEntry): BlogPostCard {
  return {
    slug: e.slug,
    title: e.title,
    publishDate: e.publishDate ?? "",
    description: e.description,
    heroImage: e.heroImage,
    categories: e.categories,
    tags: e.tags,
    revistaSlug: e.revista?.slug ?? null,
  };
}

// The de-duplicated, date-sorted catalogue used by every listing. Entries
// without a publishDate are dropped from listings (they can't form a valid
// /blog/[date]/[slug] URL); they remain reachable by direct slug.
const getCanonicalEntries = buildMemo(async (): Promise<RawEntry[]> => {
  const all = await getAllEntries();
  return buildBlogCatalogue(all);
});

// ---------------------------------------------------------------------------
// Listing queries (operate on the cached, de-duplicated catalogue)

export const getAllBlogPostSlugs = cache(
  async (): Promise<{ slug: string; publishDate: string }[]> => {
    const entries = await getCanonicalEntries();
    return entries.map((e) => ({ slug: e.slug, publishDate: e.publishDate ?? "" }));
  },
);

// Cards for a hand-picked set of posts, in the order given. Used by editorial
// pages (e.g. /ora/) that feature specific articles: the copy stays in the CMS
// so titles, dates and excerpts can't drift from the blog.
export const getBlogPostCardsBySlugs = cache(
  async (slugs: string[]): Promise<BlogPostCard[]> => {
    const entries = await getCanonicalEntries();
    const bySlug = new Map(entries.map((e) => [e.slug, e]));
    return slugs
      .map((slug) => bySlug.get(slug))
      .filter((e): e is RawEntry => Boolean(e))
      .map(toCard);
  },
);

export const getBlogPosts = cache(
  async (limit = 12, skip = 0): Promise<{ total: number; items: BlogPostCard[] }> => {
    const entries = await getCanonicalEntries();
    return {
      total: entries.length,
      items: entries.slice(skip, skip + limit).map(toCard),
    };
  },
);

// ---------------------------------------------------------------------------
// Taxonomy archives (category / tag)
//
// Author archives were dropped: the WP import only carries account names
// (admin/SIM Latinoamérica), not editorial bylines. Contentful stores the
// human-readable term names ("Contextualización", "misiones"). Archive URLs
// use a clean slug derived from the name (`/blog/category/contextualizacion/`),
// matched back by comparing slugify(storedName) to the URL segment. A term
// resolves to its display name from the first matching entry.

export function slugify(value: string): string {
  return (value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export interface TaxonomyTerm {
  name: string;
  slug: string;
  count: number;
}

type TaxonomyKind = "categories" | "tags";

async function aggregateTerms(kind: TaxonomyKind): Promise<TaxonomyTerm[]> {
  const entries = await getCanonicalEntries();
  const bySlug = new Map<string, TaxonomyTerm>();
  for (const e of entries) {
    for (const value of e[kind] ?? []) {
      if (!value) continue;
      const slug = slugify(value);
      if (!slug) continue;
      const existing = bySlug.get(slug);
      if (existing) existing.count++;
      else bySlug.set(slug, { name: value, slug, count: 1 });
    }
  }
  return [...bySlug.values()].sort(
    (a, b) => b.count - a.count || a.name.localeCompare(b.name),
  );
}

export const getAllCategories = cache(() => aggregateTerms("categories"));
export const getAllTags = cache(() => aggregateTerms("tags"));

interface TermArchive {
  name: string;
  total: number;
  items: BlogPostCard[];
}

async function archiveBySlug(
  kind: TaxonomyKind,
  slug: string,
  limit: number,
  skip: number,
): Promise<TermArchive> {
  const entries = await getCanonicalEntries();
  let name = "";
  const matching = entries.filter((e) => {
    const hit = (e[kind] ?? []).find((v) => slugify(v) === slug);
    if (hit && !name) name = hit;
    return Boolean(hit);
  });
  return {
    name,
    total: matching.length,
    items: matching.slice(skip, skip + limit).map(toCard),
  };
}

export const getBlogPostsByCategory = cache(
  (slug: string, limit = 12, skip = 0) => archiveBySlug("categories", slug, limit, skip),
);
export const getBlogPostsByTag = cache(
  (slug: string, limit = 12, skip = 0) => archiveBySlug("tags", slug, limit, skip),
);

// ---------------------------------------------------------------------------
// Single-post query (unfiltered — any slug, including a de-duplicated loser,
// still resolves so existing/shared URLs never 404).

export const getBlogPostBySlug = cache(async (slug: string): Promise<BlogPost | null> => {
  const data = await gql<{ blogPostCollection: { items: (BlogPost & { revista?: { slug: string; title: string } | null })[] } }>(
    `query ($slug: String!) {
      blogPostCollection(where: { slug: $slug }, limit: 1) {
        items {
          sys { publishedAt }
          slug
          title
          publishDate
          description
          categories
          tags
          heroImage { url description width height }
          seoTitle
          seoDescription
          body {
            json
            links {
              assets {
                block { sys { id } url title description width height }
              }
            }
          }
          revista { slug title }
        }
      }
    }`,
    { slug },
  );
  return data.blogPostCollection.items[0] ?? null;
});

// Derive the URL date segment (YYYY-MM) from a publishDate ISO string.
export function publishDateToSegment(publishDate: string): string {
  return publishDate.slice(0, 7); // "2024-01-15T..." → "2024-01"
}

// ---------------------------------------------------------------------------
// Revista VAMOS — magazine editions, served at /revistavamos/. The entries
// come from the earlier VAMOS PDF pipeline (110 published; the last ~5 print
// editions are still to be imported). Each edition links its articles via
// blogPostsCollection and carries the full PDF as a plain asset link (no
// embedder, per the migration decision).

export interface RevistaCard {
  /** Contentful entry id — the only truly unique key (see normalizeRevistaSlug). */
  id: string;
  /** URL-safe slug used for /revistavamos/<slug>/ routes. */
  slug: string;
  title: string;
  fecha: string;
  coverImage?: ContentfulImage | null;
  pdfUrl?: string | null;
  /** Intro paragraph shown below the title (RichText). Empty for most editions. */
  body?: RichTextDocument | null;
}

export interface Revista extends RevistaCard {
  posts: BlogPostCard[];
}

// The original VAMOS import stored most revista slugs with a leading "/"
// ("/la-oracion", "/africa" — ~104 of 110 entries), and two distinct
// editions ("La Oración" 2010 + 2014) share the IDENTICAL stored slug.
// The data is shared with mi-movilicemos, so it stays untouched; URLs are
// normalized here instead, and slug collisions are disambiguated with the
// edition year (newest keeps the base slug — matching the legacy site,
// where only the newer edition was reachable).
export function normalizeRevistaSlug(storedSlug: string): string {
  return normalizeStoredRevistaSlug(storedSlug);
}

const REVISTA_CARD_FIELDS = `
  sys { id }
  slug
  title
  fecha
  coverImage { url description width height }
  revistaPdf { url }
  body { json }
`;

interface RawRevista {
  sys: { id: string };
  slug: string;
  title: string;
  fecha: string;
  coverImage?: ContentfulImage | null;
  revistaPdf?: { url: string } | null;
  body?: { json: RichTextDocument } | null;
}

// The magazine PDF is served from our own domain rather than the raw
// Contentful CDN URL: `/revistavamos/<slug>/<file>.pdf`. A generated rewrite
// block in vercel.json proxies each of those to its ctfassets URL — see
// scripts/build-revista-pdf-rewrites.ts, which MUST derive the same filename
// (the asset URL's last segment, already ASCII-escaped by Contentful) and the
// same slug, or the pretty URL 404s. `trailingSlash: true` does not apply
// here: Vercel exempts paths ending in a file extension.
export function revistaPdfPath(
  urlSlug: string,
  assetUrl: string | null | undefined,
): string | null {
  return buildRevistaPdfPath(urlSlug, assetUrl);
}

function toRevistaCard(r: RawRevista, urlSlug: string): RevistaCard {
  return {
    id: r.sys.id,
    slug: urlSlug,
    title: (r.title ?? "").trim(),
    fecha: r.fecha,
    coverImage: r.coverImage,
    pdfUrl: revistaPdfPath(urlSlug, r.revistaPdf?.url),
    body: r.body?.json ?? null,
  };
}

// All editions, newest first, with unique URL slugs assigned.
export const getAllRevistas = buildMemo(async (): Promise<RevistaCard[]> => {
  const all: RawRevista[] = [];
  let skip = 0;
  while (true) {
    const data = await gql<{
      revistaCollection: { total: number; items: RawRevista[] };
    }>(
      `query ($limit: Int!, $skip: Int!) {
        revistaCollection(order: fecha_DESC, limit: $limit, skip: $skip) {
          total
          items { ${REVISTA_CARD_FIELDS} }
        }
      }`,
      { limit: PAGE_SIZE, skip },
    );
    all.push(...data.revistaCollection.items);
    if (all.length >= data.revistaCollection.total || data.revistaCollection.items.length === 0) {
      break;
    }
    skip += PAGE_SIZE;
  }

  return buildRevistaCatalogue(all.map((entry) => ({ ...entry, id: entry.sys.id }))).map(
    ({ entry, slug }) => toRevistaCard(entry, slug),
  );
});

export const getRevistaBySlug = cache(async (slug: string): Promise<Revista | null> => {
  // Resolve the URL slug through the (cached) catalogue — stored slugs are
  // neither URL-safe nor unique, so the entry id is the real lookup key.
  const card = (await getAllRevistas()).find((r) => r.slug === slug);
  if (!card) return null;

  const data = await gql<{
    revista: {
      blogPostsCollection?: {
        items: ({
          slug: string;
          title: string;
          publishDate: string | null;
          description?: string | null;
          heroImage?: ContentfulImage | null;
        } | null)[];
      } | null;
    } | null;
  }>(
    `query ($id: String!) {
      revista(id: $id) {
        blogPostsCollection(limit: 50) {
          items {
            slug
            title
            publishDate
            description
            heroImage { url description width height }
          }
        }
      }
    }`,
    { id: card.id },
  );
  return {
    ...card,
    // Keep the collection's editorial order (the magazine's own sequence);
    // drop unresolvable links (e.g. a linked post that is archived/draft).
    posts: (data.revista?.blogPostsCollection?.items ?? [])
      .filter((p): p is NonNullable<typeof p> => p !== null && !!p.publishDate)
      .map((p) => ({
        slug: p.slug,
        title: p.title,
        publishDate: p.publishDate!,
        description: p.description,
        heroImage: p.heroImage,
      })),
  };
});
