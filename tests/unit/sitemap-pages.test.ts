import { describe, expect, it } from "vitest";
import {
  listingPagesAfterFirst,
  type DatedListingItem,
} from "../../lib/content/sitemap-pages";

/** `count` items dated newest-first, one day apart from 2024-01-31 backwards. */
function items(count: number): DatedListingItem[] {
  return Array.from({ length: count }, (_, i) => ({
    publishDate: `2024-01-${String(31 - i).padStart(2, "0")}`,
  }));
}

describe("listingPagesAfterFirst", () => {
  it("returns nothing for a listing that fits on one page", () => {
    expect(listingPagesAfterFirst(items(12), 12)).toEqual([]);
    expect(listingPagesAfterFirst(items(5), 12)).toEqual([]);
    expect(listingPagesAfterFirst([], 12)).toEqual([]);
  });

  it("starts at page 2 — page 1 lives at the listing's own URL", () => {
    const pages = listingPagesAfterFirst(items(13), 12);
    expect(pages.map((p) => p.page)).toEqual([2]);
  });

  it("emits a page per full slice plus the trailing partial one", () => {
    expect(listingPagesAfterFirst(items(25), 12).map((p) => p.page)).toEqual([2, 3]);
    expect(listingPagesAfterFirst(items(24), 12).map((p) => p.page)).toEqual([2]);
  });

  it("dates each page by the newest post on it", () => {
    // perPage 5: page 2 opens at index 5, page 3 at index 10.
    const pages = listingPagesAfterFirst(items(12), 5);
    expect(pages).toEqual([
      { page: 2, lastModified: "2024-01-26" },
      { page: 3, lastModified: "2024-01-21" },
    ]);
  });

  it("covers every item beyond the first page", () => {
    const all = items(1026);
    const pages = listingPagesAfterFirst(all, 12);
    // 1026 posts / 12 = 86 pages, so pages 2..86.
    expect(pages).toHaveLength(85);
    expect(pages.at(-1)?.page).toBe(86);
    // The last page's date is the newest post in the final slice.
    expect(pages.at(-1)?.lastModified).toBe(all[85 * 12].publishDate);
  });

  it("rejects a nonsensical page size rather than looping forever", () => {
    expect(() => listingPagesAfterFirst(items(10), 0)).toThrow(RangeError);
  });
});
