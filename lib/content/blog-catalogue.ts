export interface BlogCatalogueImage {
  url: string;
  description?: string | null;
  width?: number | null;
  height?: number | null;
}

export interface BlogCatalogueEntry {
  slug: string;
  title: string;
  publishDate: string | null;
  description?: string | null;
  categories?: string[] | null;
  tags?: string[] | null;
  author?: string | null;
  heroImage?: BlogCatalogueImage | null;
  revista?: { slug: string; title: string } | null;
}

function normalizeTitle(title: string): string {
  return (title || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function richness(entry: BlogCatalogueEntry): number {
  let score = 0;
  if (entry.heroImage?.url) score += 1_000_000;
  if (entry.revista?.slug) score += 100_000;
  score += Math.min((entry.description ?? "").length, 9_999);
  if (entry.categories?.length || entry.author) score += 0.5;
  return score;
}

/**
 * Returns the date-sorted set of Blog posts that may be published in a
 * listing. Title-equivalent records are collapsed to the richest entry, while
 * records without a publish date remain available to callers outside listings.
 */
export function buildBlogCatalogue(
  entries: readonly BlogCatalogueEntry[],
): BlogCatalogueEntry[] {
  const groups = new Map<string, BlogCatalogueEntry[]>();
  for (const entry of entries) {
    const key = normalizeTitle(entry.title) || entry.slug;
    const group = groups.get(key);
    if (group) group.push(entry);
    else groups.set(key, [entry]);
  }

  return [...groups.values()]
    .map((group) => [...group].sort((a, b) => richness(b) - richness(a))[0])
    .filter((entry): entry is BlogCatalogueEntry & { publishDate: string } => Boolean(entry.publishDate))
    .sort((a, b) => b.publishDate.localeCompare(a.publishDate));
}
