# Domain context

- **Misiones SIM** — the public Spanish-language SIM site served by this repo.
- **Blog post** — a published article displayed at `/blog/YYYY-MM/slug/`.
- **Revista VAMOS** — a magazine edition displayed at `/revistavamos/slug/`,
  with a first-party PDF path.
- **Published catalogue** — the normalized collection of Blog posts and
  Revista editions available to this site.
- **Published URL manifest** — the derived record of canonical paths, aliases,
  sitemap entries, and Revista PDF rewrites.
- **Content snapshot** — the validated build-time projection of published
  Contentful data consumed by static generation.
- **Draft preview** — a view of the site that renders unpublished Contentful
  content on request, for editors only. Visitors always see the Content snapshot.
  Only the previewed entry's own page shows draft content; listings stay
  published-only. Never-published posts are previewable. Covers Blog posts
  only (not Revista editions), and each draft page view costs one Contentful
  call.
  _Avoid_: preview mode, staging.
- **Editor** — a person with a Contentful account who maintains site content.
  There is no site login; editors authenticate only in Contentful.
- **Edit link** — the "Edit in Contentful" button on a Blog post or Revista
  page, revealed by `?edit`. It opens the page's entry in Contentful and grants
  no access by itself.
  _Avoid_: edit mode, admin mode.
