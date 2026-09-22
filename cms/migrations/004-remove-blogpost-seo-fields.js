/**
 * Removes `seoTitle` and `seoDescription` from `blogPost`, added in
 * 002-add-blogpost-seo-and-taxonomy-fields.js for the WP/Yoast import.
 *
 * Audit (2026-09-18): of 306 posts with seoTitle set, 91% were pure Yoast
 * auto-generation (title + " - SIM" suffix, description truncated with an
 * ellipsis) — no independent editorial content. The remaining ~11 posts had
 * genuinely distinct, hand-written copy, but cross-referencing Google Search
 * Console showed no measurable ranking/CTR benefit from it. The fields were
 * also actively causing a bug: the site's title template already appends
 * "· SIM Latinoamérica", so seoTitle's WP suffix produced doubled site names
 * in <title>/OG tags (fixed in app/blog/[date]/[slug]/page.tsx by reading
 * title/description directly instead).
 *
 * Confirmed with the site admin before running — see chat log 2026-09-18.
 *
 * Run with `yarn migrate:cms -- --file=cms/migrations/004-remove-blogpost-seo-fields.js --environment=<id>`.
 */
module.exports = function (migration) {
  const blogPost = migration.editContentType("blogPost");

  blogPost.deleteField("seoTitle");
  blogPost.deleteField("seoDescription");
};
