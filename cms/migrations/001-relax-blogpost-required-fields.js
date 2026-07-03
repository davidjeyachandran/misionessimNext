/**
 * The real `blogPost` content type (confirmed via Management API,
 * 2026-07-04) requires both `revista` and `heroImage` on every entry. That
 * doesn't hold for the WP import: most `/blog/` posts were never part of a
 * VAMOS magazine issue (313/335 in "development", 120/335 against
 * production have no revista link), and ~15 posts have no image on either
 * side. Relaxing both to optional is non-breaking — existing entries that
 * already have values are untouched, and mi-movilicemos's GraphQL queries
 * (contentful.md) already handle nullable fields.
 *
 * Run with `yarn migrate:cms -- --file=cms/migrations/001-relax-blogpost-required-fields.js --environment=<id>`.
 *
 * Plain CommonJS (`module.exports = function`), not TypeScript — the
 * contentful-migration loader require()s this file directly and does not
 * unwrap a TS `export default`.
 */
module.exports = function (migration) {
  const blogPost = migration.editContentType("blogPost");
  blogPost.editField("revista", { type: "Link", linkType: "Entry", required: false });
  blogPost.editField("heroImage", { type: "Link", linkType: "Asset", required: false });
};
