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

/**
 * Duplicates that title matching can no longer see, because the surviving
 * entry was retitled: retired slug -> survivor slug. Each retired slug 301s to
 * its survivor in vercel.json. The row stays in Contentful because it is linked
 * to a revista issue, and the survivor takes over that link so the edition
 * still lists the article.
 */
export const RETIRED_POSTS: ReadonlyMap<string, string> = new Map([
  // Survivor retitled "Cómo ir al campo misionero: pasos, requisitos y preparación".
  ["requisitos-y-pasos-para-ser-misionero-0", "requisitos-y-pasos-para-ser-misionero"],
]);

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
 * Retired duplicates are dropped, handing their revista link to the survivor.
 */
export function buildBlogCatalogue<T extends BlogCatalogueEntry>(
  entries: readonly T[],
): T[] {
  const inherited = new Map<string, T["revista"]>();
  for (const entry of entries) {
    const survivor = RETIRED_POSTS.get(entry.slug);
    if (survivor && entry.revista) inherited.set(survivor, entry.revista);
  }

  const groups = new Map<string, T[]>();
  for (const original of entries) {
    if (RETIRED_POSTS.has(original.slug)) continue;
    const revista = inherited.get(original.slug);
    const entry = revista && !original.revista ? { ...original, revista } : original;
    const key = normalizeTitle(entry.title) || entry.slug;
    const group = groups.get(key);
    if (group) group.push(entry);
    else groups.set(key, [entry]);
  }

  return [...groups.values()]
    .map((group) => [...group].sort((a, b) => richness(b) - richness(a))[0])
    .filter((entry): entry is T & { publishDate: string } => Boolean(entry.publishDate))
    .sort((a, b) => b.publishDate.localeCompare(a.publishDate));
}
