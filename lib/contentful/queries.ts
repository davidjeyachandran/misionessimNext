import type { BlogPost, RawEntry, RawRevista } from "../contentful";
import type { ContentfulClient } from "./client";

// These are the only three reads the site makes against Contentful. They live
// apart from `lib/contentful.ts` so that the snapshot sync (which has to issue
// the very same queries) and the live build path share one definition.

// Contentful GraphQL caps collection `limit` at 100, so the full-catalogue
// fetch pages through in chunks of this size.
const PAGE_SIZE = 100;

// `sys.publishedAt` rides along so the snapshot sync can tell which posts have
// changed without re-downloading their bodies.
const CATALOGUE_FIELDS = `
  sys { publishedAt }
  slug
  title
  publishDate
  description
  categories
  tags
  author
  heroImage { url description width height }
  revista { sys { id } slug title }
`;

const REVISTA_CARD_FIELDS = `
  sys { id }
  slug
  title
  fecha
  coverImage { url description width height }
  revistaPdf { url }
  body { json }
`;

async function fetchCollection<T>(
  client: ContentfulClient,
  collection: string,
  order: string,
  fields: string,
): Promise<T[]> {
  const all: T[] = [];
  let skip = 0;
  while (true) {
    const data = await client.query<
      Record<string, { total: number; items: T[] }>
    >(
      `query ($limit: Int!, $skip: Int!) {
        ${collection}(order: ${order}, limit: $limit, skip: $skip) {
          total
          items { ${fields} }
        }
      }`,
      { limit: PAGE_SIZE, skip },
    );
    const page = data[collection];
    all.push(...page.items);
    if (all.length >= page.total || page.items.length === 0) break;
    skip += PAGE_SIZE;
  }
  return all;
}

// Every blogPost, paged — ~10 GraphQL calls.
export function fetchAllEntries(client: ContentfulClient): Promise<RawEntry[]> {
  return fetchCollection<RawEntry>(
    client,
    "blogPostCollection",
    "publishDate_DESC",
    CATALOGUE_FIELDS,
  );
}

// Every revista, paged.
export function fetchAllRevistas(
  client: ContentfulClient,
): Promise<RawRevista[]> {
  return fetchCollection<RawRevista>(
    client,
    "revistaCollection",
    "fecha_DESC",
    REVISTA_CARD_FIELDS,
  );
}

// One full post, body included — one GraphQL call.
export async function fetchPostBySlug(
  client: ContentfulClient,
  slug: string,
): Promise<BlogPost | null> {
  const data = await client.query<{
    blogPostCollection: { items: BlogPost[] };
  }>(
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
}
