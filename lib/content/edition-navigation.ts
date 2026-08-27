// The reading sequence of a Revista VAMOS edition.
//
// An edition's articles reach us as an unordered set: `blogPost.revista` is a
// plain link, and the edition's own `blogPostsCollection` preserves nothing
// but the order the VAMOS import happened to create the links in (the March
// 2024 edition, for instance, starts at the 10th of the month). So the
// sequence is derived here — oldest first, the order the edition was written
// to be read — and the same sequence answers both "what comes next" on an
// article and "what is in this edition" on the edition page, which is what
// lets an article claim to be number N of M.

export interface EditionLinkedEntry {
  slug: string;
  publishDate: string | null;
  /** The edition this article belongs to. The entry id is the grouping key:
   *  stored revista slugs repeat across editions (see revista-catalogue). */
  revista?: { sys: { id: string } } | null;
}

export interface EditionIndex<T> {
  /** Reading sequence per edition, keyed by the edition's Contentful id. */
  sequences: Map<string, T[]>;
  /** Where an article sits in its edition, keyed by the article's slug. */
  placements: Map<string, { revistaId: string; index: number }>;
}

/**
 * Groups published articles into their editions and orders each edition for
 * reading. Articles without a publish date are left out: they carry no
 * position in the sequence and cannot form a /blog/[date]/[slug] URL.
 */
export function buildEditionIndex<T extends EditionLinkedEntry>(
  entries: readonly T[],
): EditionIndex<T> {
  const sequences = new Map<string, T[]>();

  for (const entry of entries) {
    const revistaId = entry.revista?.sys?.id;
    if (!revistaId || !entry.publishDate) continue;
    const sequence = sequences.get(revistaId);
    if (sequence) sequence.push(entry);
    else sequences.set(revistaId, [entry]);
  }

  const placements = new Map<string, { revistaId: string; index: number }>();
  for (const [revistaId, sequence] of sequences) {
    // Same-day articles are common inside one edition, so the slug breaks the
    // tie — any stable rule beats an order that shifts between builds.
    sequence.sort(
      (a, b) =>
        (a.publishDate ?? "").localeCompare(b.publishDate ?? "") ||
        a.slug.localeCompare(b.slug),
    );
    sequence.forEach((entry, index) => {
      // A duplicate slug would otherwise silently overwrite the first
      // placement; the catalogue already collapses those, so first wins.
      if (!placements.has(entry.slug)) placements.set(entry.slug, { revistaId, index });
    });
  }

  return { sequences, placements };
}

/**
 * Further reading from the same sequence, continuing past the article the
 * reader is on and past the two already offered as previous/next, and
 * wrapping to the top of the edition rather than running out near the end.
 */
export function pickFurtherReading<T>(
  sequence: readonly T[],
  index: number,
  count: number,
): T[] {
  const total = sequence.length;
  if (total <= 1 || count <= 0) return [];

  const alreadyShown = new Set<number>([index]);
  if (index > 0) alreadyShown.add(index - 1);
  if (index < total - 1) alreadyShown.add(index + 1);

  const picks: T[] = [];
  for (let step = 0; step < total && picks.length < count; step++) {
    const at = (index + 1 + step) % total;
    if (alreadyShown.has(at)) continue;
    picks.push(sequence[at]);
  }
  return picks;
}
