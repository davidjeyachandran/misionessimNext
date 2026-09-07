/**
 * Pagination arithmetic for the sitemap's listing pages.
 *
 * The blog index and the category archives are paginated (`/blog/page/N/`,
 * `/blog/category/<slug>/page/N/`), but only page 1 of each was ever listed in
 * `sitemap.xml`. That left every listing page from 2 upwards discoverable only
 * by walking the "next" link from page 1 — ~86 sequential hops to reach the
 * oldest posts, which is why Google reported the 2014-2016 archive as
 * "Discovered - currently not indexed" without ever crawling it.
 *
 * Kept free of Contentful and Next types so the arithmetic is unit-testable.
 */

/** The minimum a listing item must carry: the date it was published. */
export interface DatedListingItem {
  publishDate: string;
}

export interface ListingPage {
  /** 1-indexed page number, as it appears in the URL. */
  page: number;
  /** Publish date of the newest post on that page, for `<lastmod>`. */
  lastModified: string;
}

/**
 * The pages *after* page 1 of a listing, newest first.
 *
 * Page 1 is excluded because it is already in the sitemap under the listing's
 * own URL (`/blog/`, `/blog/category/<slug>/`) and has no `page/1/` route.
 * A listing that fits on one page therefore yields no entries.
 *
 * `items` must be in the order the listing renders them (newest first); each
 * page is dated by the newest post on it, which is the first item in its slice.
 */
export function listingPagesAfterFirst(
  items: readonly DatedListingItem[],
  perPage: number,
): ListingPage[] {
  if (perPage < 1) throw new RangeError(`perPage must be >= 1, got ${perPage}`);

  const totalPages = Math.ceil(items.length / perPage);
  const pages: ListingPage[] = [];
  for (let page = 2; page <= totalPages; page++) {
    pages.push({
      page,
      lastModified: items[(page - 1) * perPage].publishDate,
    });
  }
  return pages;
}
