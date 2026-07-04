import type { MetadataRoute } from "next";
import {
  getAllBlogPostSlugs,
  getAllCategories,
  getAllTags,
  publishDateToSegment,
} from "../lib/contentful";
import { SITE_URL } from "../lib/site";

// Absolute URL with a trailing slash (the app uses trailingSlash: true).
function url(path: string): string {
  const clean = path.endsWith("/") ? path : `${path}/`;
  return `${SITE_URL}${clean}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, categories, tags] = await Promise.all([
    getAllBlogPostSlugs(),
    getAllCategories(),
    getAllTags(),
  ]);

  const staticEntries: MetadataRoute.Sitemap = [
    { url: url("/"), changeFrequency: "weekly", priority: 1 },
    { url: url("/blog"), changeFrequency: "daily", priority: 0.9 },
  ];

  const postEntries: MetadataRoute.Sitemap = posts.map((p) => ({
    url: url(`/blog/${publishDateToSegment(p.publishDate)}/${p.slug}`),
    lastModified: p.publishDate || undefined,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const categoryEntries: MetadataRoute.Sitemap = categories.map((c) => ({
    url: url(`/blog/category/${c.slug}`),
    changeFrequency: "weekly",
    priority: 0.5,
  }));

  const tagEntries: MetadataRoute.Sitemap = tags.map((t) => ({
    url: url(`/blog/tag/${t.slug}`),
    changeFrequency: "weekly",
    priority: 0.4,
  }));

  return [...staticEntries, ...postEntries, ...categoryEntries, ...tagEntries];
}
