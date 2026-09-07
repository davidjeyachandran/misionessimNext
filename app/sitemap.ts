import type { MetadataRoute } from "next";
import { PER_PAGE as BLOG_PER_PAGE } from "./blog/_lib/config";
import { PER_PAGE as REVISTA_PER_PAGE } from "./revistavamos/_lib/config";
import {
  getAllBlogPostSlugs,
  getAllCategories,
  getAllRevistas,
  getAllTags,
  getBlogPostsByCategory,
  publishDateToSegment,
} from "../lib/contentful";
import { listingPagesAfterFirst } from "../lib/content/sitemap-pages";
import { SITE_URL } from "../lib/site";

// Emit a static sitemap.xml at build time (required under `output: 'export'`).
export const dynamic = "force-static";

// Absolute URL with a trailing slash (the app uses trailingSlash: true).
function url(path: string): string {
  const clean = path.endsWith("/") ? path : `${path}/`;
  return `${SITE_URL}${clean}`;
}

// Absolute URL for a file path, left exactly as given — `trailingSlash: true`
// does not apply to paths ending in a file extension (see revistaPdfPath).
function fileUrl(path: string): string {
  return `${SITE_URL}${path}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, categories, tags, revistas] = await Promise.all([
    getAllBlogPostSlugs(),
    getAllCategories(),
    getAllTags(),
    getAllRevistas(),
  ]);

  const staticEntries: MetadataRoute.Sitemap = [
    { url: url("/"), changeFrequency: "weekly", priority: 1 },
    { url: url("/blog"), changeFrequency: "daily", priority: 0.9 },
    { url: url("/revistavamos"), changeFrequency: "monthly", priority: 0.9 },
    { url: url("/nosotros"), changeFrequency: "yearly", priority: 0.8 },
    { url: url("/recursos"), changeFrequency: "monthly", priority: 0.8 },
    { url: url("/ora"), changeFrequency: "monthly", priority: 0.8 },
    { url: url("/sirve-con-sim"), changeFrequency: "yearly", priority: 0.8 },
    { url: url("/declaracion-de-fe-de-sim"), changeFrequency: "yearly", priority: 0.5 },
    { url: url("/privacidad"), changeFrequency: "yearly", priority: 0.3 },
  ];

  const revistaEntries: MetadataRoute.Sitemap = revistas.map((r) => ({
    url: url(`/revistavamos/${r.slug}`),
    lastModified: r.fecha || undefined,
    changeFrequency: "yearly",
    priority: 0.7,
  }));

  // The magazine PDFs themselves, at their first-party `/revistavamos/<slug>/
  // <file>.pdf` paths (proxied to Contentful by the generated vercel.json
  // rewrites). Editions whose entry has no PDF asset yield no entry.
  const revistaPdfEntries: MetadataRoute.Sitemap = revistas
    .filter((r): r is typeof r & { pdfUrl: string } => Boolean(r.pdfUrl))
    .map((r) => ({
      url: fileUrl(r.pdfUrl),
      lastModified: r.fecha || undefined,
      changeFrequency: "yearly",
      priority: 0.6,
    }));

  // Pages 2..N of the revista index. The index features the newest edition
  // above the grid and paginates the rest (see RevistaIndexView), so the
  // pagination is over `revistas.slice(1)` — mirror that or the page numbers
  // drift by one against the real route.
  const revistaPagedEntries: MetadataRoute.Sitemap = listingPagesAfterFirst(
    revistas.slice(1).map((r) => ({ publishDate: r.fecha ?? "" })),
    REVISTA_PER_PAGE,
  ).map(({ page, lastModified }) => ({
    url: url(`/revistavamos/page/${page}`),
    lastModified: lastModified || undefined,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  const postEntries: MetadataRoute.Sitemap = posts.map((p) => ({
    url: url(`/blog/${publishDateToSegment(p.publishDate)}/${p.slug}`),
    lastModified: p.publishDate || undefined,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  // Pages 2..N of the blog index. `posts` is the catalogue order the index
  // renders (newest first), so each page is dated by the newest post on it.
  const blogPagedEntries: MetadataRoute.Sitemap = listingPagesAfterFirst(
    posts,
    BLOG_PER_PAGE,
  ).map(({ page, lastModified }) => ({
    url: url(`/blog/page/${page}`),
    lastModified: lastModified || undefined,
    changeFrequency: "daily",
    priority: 0.5,
  }));

  const categoryEntries: MetadataRoute.Sitemap = categories.map((c) => ({
    url: url(`/blog/category/${c.slug}`),
    lastModified: c.latest || undefined,
    changeFrequency: "weekly",
    priority: 0.5,
  }));

  // Pages 2..N of each category archive, mirroring the
  // `category/[category]/page/[page]/` route.
  const categoryPagedEntries: MetadataRoute.Sitemap = (
    await Promise.all(
      categories.map(async (c) => {
        const { items } = await getBlogPostsByCategory(c.slug, c.count, 0);
        return listingPagesAfterFirst(items, BLOG_PER_PAGE).map(
          ({ page, lastModified }): MetadataRoute.Sitemap[number] => ({
            url: url(`/blog/category/${c.slug}/page/${page}`),
            lastModified: lastModified || undefined,
            changeFrequency: "weekly",
            priority: 0.4,
          }),
        );
      }),
    )
  ).flat();

  // Tag archives are single-page: there is no `tag/[tag]/page/[page]/` route
  // (see app/blog/tag/[tag]/page.tsx), so listing paged tag URLs here would
  // put 404s in the sitemap. If that route is ever added, mirror the category
  // block above.
  const tagEntries: MetadataRoute.Sitemap = tags.map((t) => ({
    url: url(`/blog/tag/${t.slug}`),
    lastModified: t.latest || undefined,
    changeFrequency: "weekly",
    priority: 0.4,
  }));

  return [
    ...staticEntries,
    ...revistaEntries,
    ...revistaPdfEntries,
    ...revistaPagedEntries,
    ...postEntries,
    ...blogPagedEntries,
    ...categoryEntries,
    ...categoryPagedEntries,
    ...tagEntries,
  ];
}
