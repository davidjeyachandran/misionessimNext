import type { Document as RichTextDocument } from "@contentful/rich-text-types";
import { cache } from "react";

const SPACE_ID = process.env.CONTENTFUL_SPACE_ID!;
const ACCESS_TOKEN = process.env.CONTENTFUL_ACCESS_TOKEN!;
const GQL_URL = `https://graphql.contentful.com/content/v1/spaces/${SPACE_ID}`;

// Contentful GraphQL caps collection `limit` at 100, so the full-catalogue
// fetch pages through in chunks of this size.
const PAGE_SIZE = 100;

async function gql<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const res = await fetch(GQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ACCESS_TOKEN}`,
    },
    body: JSON.stringify({ query, variables }),
    next: { tags: ["contentful"] },
  });
  if (!res.ok) throw new Error(`Contentful GraphQL error: ${res.status}`);
  const { data, errors } = (await res.json()) as { data: T; errors?: unknown[] };
  if (errors?.length) throw new Error(`GraphQL errors: ${JSON.stringify(errors)}`);
  return data;
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
  author?: string | null;
  revistaSlug?: string | null;
}

export interface BlogPost extends BlogPostCard {
  body?: { json: RichTextDocument } | null;
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

// Normalise a title for duplicate grouping: lowercase, strip accents and
// punctuation, collapse whitespace. Two entries with the same normalised
// title are treated as the same article.
function normalizeTitle(title: string): string {
  return (title || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// "Richest entry" score for choosing the winner within a duplicate group,
// per the agreed heuristic: heroImage dominates, then a revista link, then
// body length (approximated by the description/excerpt, which is far cheaper
// to fetch than every RichText body), tie-broken toward the WordPress import
// (WP entries carry categories/author/SEO metadata the VAMOS rows lack).
function richness(e: RawEntry): number {
  let score = 0;
  if (e.heroImage?.url) score += 1_000_000;
  if (e.revista?.slug) score += 100_000;
  score += Math.min((e.description ?? "").length, 9_999);
  const looksLikeWpImport = Boolean(e.categories?.length || e.author);
  if (looksLikeWpImport) score += 0.5;
  return score;
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

// Fetch every blogPost once (paged), cached per request. ~10 GraphQL calls.
const getAllEntries = cache(async (): Promise<RawEntry[]> => {
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
    author: e.author,
    revistaSlug: e.revista?.slug ?? null,
  };
}

// The de-duplicated, date-sorted catalogue used by every listing. Entries
// without a publishDate are dropped from listings (they can't form a valid
// /blog/[date]/[slug] URL); they remain reachable by direct slug.
const getCanonicalEntries = cache(async (): Promise<RawEntry[]> => {
  const all = await getAllEntries();
  const groups = new Map<string, RawEntry[]>();
  for (const e of all) {
    const key = normalizeTitle(e.title) || e.slug;
    const group = groups.get(key);
    if (group) group.push(e);
    else groups.set(key, [e]);
  }

  const canonical: RawEntry[] = [];
  for (const group of groups.values()) {
    group.sort((a, b) => richness(b) - richness(a));
    canonical.push(group[0]);
  }

  return canonical
    .filter((e) => e.publishDate)
    .sort((a, b) => (b.publishDate ?? "").localeCompare(a.publishDate ?? ""));
});

// ---------------------------------------------------------------------------
// Listing queries (operate on the cached, de-duplicated catalogue)

export const getAllBlogPostSlugs = cache(
  async (): Promise<{ slug: string; publishDate: string }[]> => {
    const entries = await getCanonicalEntries();
    return entries.map((e) => ({ slug: e.slug, publishDate: e.publishDate ?? "" }));
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

export const getBlogPostsByCategory = cache(
  async (category: string, limit = 12, skip = 0): Promise<{ total: number; items: BlogPostCard[] }> => {
    const entries = (await getCanonicalEntries()).filter((e) =>
      e.categories?.includes(category),
    );
    return {
      total: entries.length,
      items: entries.slice(skip, skip + limit).map(toCard),
    };
  },
);

export const getBlogPostsByTag = cache(
  async (tag: string, limit = 12, skip = 0): Promise<{ total: number; items: BlogPostCard[] }> => {
    const entries = (await getCanonicalEntries()).filter((e) => e.tags?.includes(tag));
    return {
      total: entries.length,
      items: entries.slice(skip, skip + limit).map(toCard),
    };
  },
);

export const getBlogPostsByAuthor = cache(
  async (author: string, limit = 12, skip = 0): Promise<{ total: number; items: BlogPostCard[] }> => {
    const entries = (await getCanonicalEntries()).filter((e) => e.author === author);
    return {
      total: entries.length,
      items: entries.slice(skip, skip + limit).map(toCard),
    };
  },
);

// ---------------------------------------------------------------------------
// Single-post query (unfiltered — any slug, including a de-duplicated loser,
// still resolves so existing/shared URLs never 404).

export const getBlogPostBySlug = cache(async (slug: string): Promise<BlogPost | null> => {
  const data = await gql<{ blogPostCollection: { items: (BlogPost & { revista?: { slug: string; title: string } | null })[] } }>(
    `query ($slug: String!) {
      blogPostCollection(where: { slug: $slug }, limit: 1) {
        items {
          slug
          title
          publishDate
          description
          categories
          tags
          author
          heroImage { url description width height }
          seoTitle
          seoDescription
          body { json }
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
