export interface RevistaCatalogueEntry {
  id: string;
  slug: string;
  fecha: string;
}

export interface PublishedRevista<T extends RevistaCatalogueEntry> {
  entry: T;
  slug: string;
}

export function normalizeRevistaSlug(storedSlug: string): string {
  return (storedSlug ?? "").trim().replace(/^\/+|\/+$/g, "");
}

/**
 * Assigns one public slug to each edition. When historical records share a
 * stored slug, the newest edition keeps the base path and older editions use
 * their publication year as a suffix.
 */
export function buildRevistaCatalogue<T extends RevistaCatalogueEntry>(
  entries: readonly T[],
): PublishedRevista<T>[] {
  const taken = new Set<string>();

  return [...entries]
    .sort((a, b) => b.fecha.localeCompare(a.fecha))
    .map((entry) => {
      const base = normalizeRevistaSlug(entry.slug) || entry.id;
      let slug = base;
      if (taken.has(slug)) {
        const year = new Date(entry.fecha).getUTCFullYear();
        slug = `${base}-${year}`;
        let suffix = 2;
        while (taken.has(slug)) slug = `${base}-${year}-${suffix++}`;
      }
      taken.add(slug);
      return { entry, slug };
    });
}
