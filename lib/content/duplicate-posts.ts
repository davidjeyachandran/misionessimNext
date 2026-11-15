/**
 * Near-duplicate blog posts, decided from a text-similarity audit joined to
 * Search Console traffic (data/duplicate-posts.json).
 *
 * - `noindex`: the page stays live and linked, but search engines are told to
 *   drop it and it is left out of sitemap.xml (a sitemap entry for a noindexed
 *   URL sends Google contradictory signals).
 * - `redirects`: the post has traffic worth keeping, so it 301s to the kept
 *   post. The rules are written into vercel.json by
 *   scripts/build-duplicate-redirects.ts; here they only keep the redirected
 *   posts out of the sitemap.
 *
 * Posts are keyed by slug, which is unique across the blog.
 */
import data from "../../data/duplicate-posts.json";

export interface DuplicatePostEntry {
  slug: string;
  /** `/blog/YYYY-MM/<slug>/` */
  path: string;
  /** The surviving post's path. */
  keep: string;
}

export interface DuplicatePostData {
  noindex: DuplicatePostEntry[];
  redirects: DuplicatePostEntry[];
}

export const duplicatePosts = data as unknown as DuplicatePostData;

const noindexSlugs = new Set(duplicatePosts.noindex.map((e) => e.slug));
const redirectedSlugs = new Set(duplicatePosts.redirects.map((e) => e.slug));

/** True when the post should carry `<meta name="robots" content="noindex">`. */
export function isNoindexedPost(slug: string): boolean {
  return noindexSlugs.has(slug);
}

/** True when the post should not appear in the sitemap (noindexed or redirected). */
export function isExcludedFromSitemap(slug: string): boolean {
  return noindexSlugs.has(slug) || redirectedSlugs.has(slug);
}
