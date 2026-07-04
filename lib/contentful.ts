import type { Document as RichTextDocument } from "@contentful/rich-text-types";
import { cache } from "react";

const SPACE_ID = process.env.CONTENTFUL_SPACE_ID!;
const ACCESS_TOKEN = process.env.CONTENTFUL_ACCESS_TOKEN!;
const GQL_URL = `https://graphql.contentful.com/content/v1/spaces/${SPACE_ID}`;

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
  author?: string | null;
}

export interface BlogPost extends BlogPostCard {
  body?: { json: RichTextDocument } | null;
  tags?: string[] | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  revista?: {
    slug: string;
    title: string;
  } | null;
}

// ---------------------------------------------------------------------------
// Queries

const BLOG_POST_CARD_FIELDS = `
  slug
  title
  publishDate
  description
  heroImage { url description width height }
  categories
  author
`;

export const getAllBlogPostSlugs = cache(async (): Promise<{ slug: string; publishDate: string }[]> => {
  const data = await gql<{
    blogPostCollection: { items: { slug: string; publishDate: string }[] };
  }>(
    `query {
      blogPostCollection(limit: 1000, order: publishDate_DESC) {
        items { slug publishDate }
      }
    }`,
  );
  return data.blogPostCollection.items;
});

export const getBlogPosts = cache(
  async (limit = 12, skip = 0): Promise<{ total: number; items: BlogPostCard[] }> => {
    const data = await gql<{
      blogPostCollection: { total: number; items: BlogPostCard[] };
    }>(
      `query ($limit: Int!, $skip: Int!) {
        blogPostCollection(order: publishDate_DESC, limit: $limit, skip: $skip) {
          total
          items { ${BLOG_POST_CARD_FIELDS} }
        }
      }`,
      { limit, skip },
    );
    return data.blogPostCollection;
  },
);

export const getBlogPostBySlug = cache(async (slug: string): Promise<BlogPost | null> => {
  const data = await gql<{
    blogPostCollection: { items: BlogPost[] };
  }>(
    `query ($slug: String!) {
      blogPostCollection(where: { slug: $slug }, limit: 1) {
        items {
          ${BLOG_POST_CARD_FIELDS}
          tags
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

export const getBlogPostsByCategory = cache(
  async (category: string, limit = 12, skip = 0): Promise<{ total: number; items: BlogPostCard[] }> => {
    const data = await gql<{
      blogPostCollection: { total: number; items: BlogPostCard[] };
    }>(
      `query ($category: String!, $limit: Int!, $skip: Int!) {
        blogPostCollection(
          where: { categories_contains_some: [$category] }
          order: publishDate_DESC
          limit: $limit
          skip: $skip
        ) {
          total
          items { ${BLOG_POST_CARD_FIELDS} }
        }
      }`,
      { category, limit, skip },
    );
    return data.blogPostCollection;
  },
);

export const getBlogPostsByTag = cache(
  async (tag: string, limit = 12, skip = 0): Promise<{ total: number; items: BlogPostCard[] }> => {
    const data = await gql<{
      blogPostCollection: { total: number; items: BlogPostCard[] };
    }>(
      `query ($tag: String!, $limit: Int!, $skip: Int!) {
        blogPostCollection(
          where: { tags_contains_some: [$tag] }
          order: publishDate_DESC
          limit: $limit
          skip: $skip
        ) {
          total
          items { ${BLOG_POST_CARD_FIELDS} }
        }
      }`,
      { tag, limit, skip },
    );
    return data.blogPostCollection;
  },
);

export const getBlogPostsByAuthor = cache(
  async (author: string, limit = 12, skip = 0): Promise<{ total: number; items: BlogPostCard[] }> => {
    const data = await gql<{
      blogPostCollection: { total: number; items: BlogPostCard[] };
    }>(
      `query ($author: String!, $limit: Int!, $skip: Int!) {
        blogPostCollection(
          where: { author: $author }
          order: publishDate_DESC
          limit: $limit
          skip: $skip
        ) {
          total
          items { ${BLOG_POST_CARD_FIELDS} }
        }
      }`,
      { author, limit, skip },
    );
    return data.blogPostCollection;
  },
);

// Derive the URL date segment (YYYY-MM) from a publishDate ISO string.
export function publishDateToSegment(publishDate: string): string {
  return publishDate.slice(0, 7); // "2024-01-15T..." → "2024-01"
}
