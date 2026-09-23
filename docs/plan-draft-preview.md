# Plan: Draft preview and Edit link

Status: **planned, not built** (2026-09-23). Branch: `feat/draft-preview`.
Decisions: [ADR 0001](adr/0001-mostly-static-site-with-draft-mode.md), [ADR 0002](adr/0002-edit-link-without-site-login.md). Terms: [CONTEXT.md](../CONTEXT.md).

## Goal

- Editors (3, all with Contentful accounts) can go from a live Blog post or Revista page to its Contentful entry in one click.
- Editors can see an unpublished Blog post, including one never published, in the real site layout before publishing.
- Visitors see no change and make no Contentful calls.

## Scope

**In scope:**
- Draft preview for Blog posts
- Edit link on Blog posts and Revista pages

**Out of scope:**
- Site login
- Mi Movilicemos
- Draft preview for Revista pages
- Draft content in listings
- Live Preview SDK and click-to-edit
- Publishing without a rebuild (on-demand revalidation)

## Contentful budget

| Event | Calls |
| --- | --- |
| Full build | about 12 (unchanged) |
| Visitor page view, including unknown URLs | 0 |
| Draft page view | 1 (Preview API) |
| Opening a draft through the Preview button | 1 (looks up the entry by ID) |
| Rollout builds (local, Vercel preview, production) | about 36 in total |

## Behaviour

### Edit link (ADR 0002)

- Every Blog post and Revista page includes its entry ID in the HTML (for example `data-contentful-entry="<id>"`).
- A small client component in the root layout:
  - reads `?edit` / `?edit=off`
  - remembers the choice in `localStorage` (wrapped in try/catch)
  - when edit is on and the page has an entry ID, shows a fixed "Edit in Contentful" button linking to `https://app.contentful.com/spaces/<space>/entries/<id>`, opening in a new tab
- `?edit` never touches Draft Mode.

### Entering Draft preview

- Contentful "Content preview" platform **misionessim.org**, for the `BlogPost` type only. URL: `https://www.misionessim.org/api/draft/?secret=<CONTENTFUL_PREVIEW_SECRET>&id={entry.sys.id}`
- `app/api/draft/route.ts` (GET):
  1. Rejects a wrong secret with 401, before making any Contentful call.
  2. Fetches `blogPost(id, preview: true)` for its `slug` and `publishDate`. Returns 404 if not found.
  3. Calls `draftMode().enable()` and redirects to `/blog/<YYYY-MM>/<slug>/`, a path built from the entry, never from the query string. If there's no `publishDate`, it uses the current month.

### Rendering in Draft preview

- `app/blog/[date]/[slug]/page.tsx`: when `draftMode().isEnabled`:
  - fetches the post by slug through the Preview API (1 call, `preview: true`, preview token)
  - skips `getPostNavigation`
  - renders an editor bar with a "Draft preview" label, the Edit link, a "Navigation hidden in draft preview" note, and an Exit button
- Exit: a POST route or server action calls `draftMode().disable()` and returns to the same path.
- The preview token and secret are server-only.

### Unknown URLs (ADR 0001)

- All other dynamic routes export `dynamicParams = false`:
  - `revistavamos/[slug]`
  - `revistavamos/page/[page]`
  - `blog/page/[page]`
  - `blog/category/[category]` and its `page/[page]`
  - `blog/tag/[tag]`
- `blog/[date]/[slug]` must still render never-published slugs in Draft preview. **Spike first:** check in Next 16.2.10 whether Draft Mode renders params outside `generateStaticParams` when `dynamicParams = false`.
  - If it does, use `false` here too.
  - If it doesn't, keep `dynamicParams` on and call `notFound()` before any fetch when the request isn't in Draft Mode and isn't part of the build.
- Acceptance check: a visitor requesting `/blog/2026-01/does-not-exist/` gets a 404 with zero Contentful calls.

## Code changes

1. `next.config.ts`: remove `output: "export"` and rewrite its comment (it says there is no server runtime). Keep the custom image loader and `trailingSlash`.
2. `lib/contentful/client.ts`: add a preview option that uses `CONTENTFUL_PREVIEW_ACCESS_TOKEN` and skips the fetch cache.
3. `lib/contentful.ts`:
   - add `sys { id }` to `getBlogPostBySlug`
   - add `getDraftBlogPostBySlug(slug)` and `getDraftBlogPostPathById(id)`
4. `app/api/draft/route.ts` and an exit route or server action.
5. The blog post page: draft branch, editor bar, entry-ID attribute. The Revista page: entry-ID attribute.
6. An `EditLink` client component in `app/layout.tsx`.
7. `dynamicParams = false` on the routes listed above.
8. `.env.example`: add `CONTENTFUL_PREVIEW_ACCESS_TOKEN` and `CONTENTFUL_PREVIEW_SECRET`, separate from `CONTENTFUL_REVALIDATE_SECRET`.
9. Tests:
   - unit tests for the draft route: bad secret gives 401 with no fetch; unknown ID gives 404; no `publishDate` falls back to the current month; the redirect path comes from the entry
   - unit tests for `?edit` persistence
   - a Playwright test that `?edit` shows the button on a post and not on the home page

## Rollout

Vercel only deploys `main`. Branch pushes do not deploy, and merging deploys production.

1. Build locally on the branch with `next build` (about 12 calls). Check that:
   - published pages still prerender
   - an unknown URL returns 404 with no Contentful call
   - the redirects and rewrites in `vercel.json` still apply
2. Run `vercel deploy` manually from the branch to create a preview deployment, with both env vars set on the Preview environment. Add a temporary Contentful platform, "misionessim.org (test)", pointing at that URL. Test the loop with a real draft post: `?edit` → Contentful → Preview → draft page → Exit.
3. **Before merging:** check the Vercel project's Output Directory (it must not be `out`) and its Framework preset. Set both env vars on Production.
4. Merge to `main`, which deploys production. Point the Contentful platform at production and delete the test platform.

## Manual setup (David)

- Create a Preview API key in Contentful (the space's API keys section) and use its preview token as `CONTENTFUL_PREVIEW_ACCESS_TOKEN`.
- Generate `CONTENTFUL_PREVIEW_SECRET` (for example with `openssl rand -hex 32`).
- Add the Content preview platform in Contentful. This needs space admin; our management token is scoped to another space.
