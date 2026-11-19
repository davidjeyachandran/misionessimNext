import { timingSafeEqual } from "node:crypto";

export interface DraftEntry {
  slug: string;
  publishDate: string | null;
}

// A never-published post may have no publishDate yet; the current month keeps
// its preview URL valid. The path is built from the entry, never from the
// request, so the redirect can't be steered off-site.
export function draftPostPath(entry: DraftEntry, now: Date = new Date()): string {
  const segment = entry.publishDate
    ? entry.publishDate.slice(0, 7)
    : now.toISOString().slice(0, 7);
  return `/blog/${segment}/${encodeURIComponent(entry.slug)}/`;
}

export function isValidPreviewSecret(
  given: string | null,
  expected: string | undefined,
): boolean {
  if (!given || !expected) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

// Exiting a never-published post's preview would land on a 404.
export function draftExitPath(path: string, published: boolean): string {
  const local = path.startsWith("/") && !path.startsWith("//") && !path.includes("\\");
  return local && published ? path : "/blog/";
}
