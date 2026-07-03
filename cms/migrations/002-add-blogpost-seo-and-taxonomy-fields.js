/**
 * Additive fields for the WP import (docs/nextjs-migration-analysis.md §4):
 * categories, author, seoTitle, seoDescription. None of these previously
 * existed on blogPost (confirmed via Management API, 2026-07-04) — only
 * `tags` did. All new fields are optional, so this is non-breaking for
 * existing entries and for mi-movilicemos's GraphQL queries.
 *
 * `excerpt` is deliberately NOT created here — the schema already has a
 * required `description` field serving that purpose; WP's excerpt maps
 * there instead of adding a redundant field.
 *
 * Run with `yarn migrate:cms -- --file=cms/migrations/002-add-blogpost-seo-and-taxonomy-fields.js --environment=<id>`.
 */
module.exports = function (migration) {
  const blogPost = migration.editContentType("blogPost");

  blogPost.createField("categories", {
    name: "Categories",
    type: "Array",
    items: { type: "Symbol" },
    required: false,
  });

  blogPost.createField("author", {
    name: "Author",
    type: "Symbol",
    required: false,
  });

  blogPost.createField("seoTitle", {
    name: "SEO title",
    type: "Symbol",
    required: false,
  });

  blogPost.createField("seoDescription", {
    name: "SEO description",
    type: "Text",
    required: false,
  });
};
