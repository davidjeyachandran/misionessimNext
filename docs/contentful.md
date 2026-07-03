# Contentful

Reference — **copied from the sim-blog project** (2026-07-03). It documents the existing shared Contentful space that the misionessim.org migration will import into; "this app" below means sim-blog, and the relative `src/` links point into that repo, not this one. See [nextjs-migration-analysis.md §4](nextjs-migration-analysis.md) for how this migration reuses and extends the `BlogPost` and `Revista` types described here.

How this app connects to Contentful and how content is structured. Contentful is the source of truth for all learning content (resource groups, magazines, blog posts, external resources); Neon holds only user/progress data.

## Connection

We talk to Contentful exclusively through its **GraphQL Content API** (read-only, published content):

```
https://graphql.contentful.com/content/v1/spaces/${CONTENTFUL_SPACE_ID}
```

Requests use [`graphql-request`](https://github.com/jasonkuhrt/graphql-request)'s `GraphQLClient` with a bearer token. A client is instantiated per module that needs one:

- [`src/lib/contentful/resourceGraphQLClient.ts`](../../src/lib/contentful/resourceGraphQLClient.ts) — resource groups and revistas.
- [`src/lib/contentful/contentGraphQLClient.ts`](../../src/lib/contentful/contentGraphQLClient.ts) — single blog post / resource by slug.
- [`src/lib/contentfulGraphCache.ts`](../../src/lib/contentfulGraphCache.ts) — the full-graph loader (see below). Its client is deliberately separate to avoid circular imports.

All GraphQL query strings live in [`src/lib/graphql.ts`](../../src/lib/graphql.ts) and [`src/lib/contentful/graphql.ts`](../../src/lib/contentful/graphql.ts).

### Environment variables

| Variable | Purpose |
| --- | --- |
| `CONTENTFUL_SPACE_ID` | Space to query (goes in the endpoint URL). |
| `CONTENTFUL_ACCESS_TOKEN` | Content Delivery API token, sent as `Authorization: Bearer …`. |
| `E2E_MOCK_CONTENTFUL` | When `true`, boots an in-process MSW mock instead of hitting Contentful (E2E only). |

These are server-only — Contentful is never called from the browser. All content fetching happens in Server Components, route handlers, and cron jobs.

### Write access (tooling only)

The running app is read-only. Content is created/updated through the **Contentful MCP** and the `/create-course` and `/create-resource` skills, which use a Content Management API token (not stored in the app's env). Rich-text bodies are authored as markdown and converted to Contentful's RichText JSON via [`scripts/create-course.mts`](../../scripts/create-course.mts).

## Caching and error handling

Two conventions run through every fetcher:

- **Per-render dedup.** The hot-path loaders (`getBlogBySlug`, `getResourceBySlug`, `getFullResourceGraph`) are wrapped in React 19's `cache()`, so each executes at most once per server render pass even when called from multiple components.
- **Fail soft.** Every fetcher wraps its request in `try/catch`, logs with a `[functionName]` prefix, and returns `null` or `[]` rather than throwing. Callers are expected to handle empty content (e.g. render an empty state), not to crash.

## Content model

The Contentful side has four content types. The app maps them onto a smaller, cleaner domain model.

```
ResourceGroup  (a learning route)
 └─ resourcesCollection[]  → ordered mix of:
      • Revista   (a magazine issue — internal grouping)
          └─ blogPostsCollection[] → BlogPost
      • Resource  (a single external link/video)
```

### ResourceGroup

The top-level container a user is routed to at `/recursos/{slug}`. Its `resourcesCollection` is an **ordered, heterogeneous list** of `Revista` and `Resource` references — order is the source of truth for the learning route.

Fields: `slug`, `title`, `description`, `heroImage`, `resourcesCollection`.

### Revista

A magazine issue — an internal Contentful grouping, **not** a user-facing type. It exists to bundle many `BlogPost`s together. Users never see a "revista" as a route stop; the app flattens each revista's blog posts inline.

Fields: `slug`, `title`, `fecha`, `coverImage`, `blogPostsCollection`.

### BlogPost

An article-style route item with a rich-text body and an optional quiz.

Fields: `slug`, `title`, `publishDate`, `nid`, `body { json }`, `multipleChoice`, `heroImage`, `revista` (back-reference).

### Resource

A single external item (video, link) with an optional rich-text body and quiz.

Fields: `slug`, `title`, `description`, `link`, `imageLink`, `body { json }`, `multipleChoice`, `heroImage`.

### Shared field types

- **`heroImage` / `coverImage`** → `{ url, description, width, height }` (`ContentfulImage`).
- **`body { json }`** → Contentful **RichText** document (`RichTextDocument`), rendered by [`src/components/shared/content/RichText.tsx`](../../src/components/shared/content/RichText.tsx).
- **`multipleChoice`** → JSON `{ question, options: string[], correct_answer_index }`. Quiz completion awards points (4 on first try, 1 after a miss) tracked in Neon.

All type definitions live in [`src/types/contentful.types.ts`](../../src/types/contentful.types.ts).

## Domain model: RouteItem

The app collapses `BlogPost` and `Resource` into one discriminated union so route rendering and progress tracking don't care which is which:

```ts
type RouteItem = BlogPost | Resource;   // discriminated by `kind`
```

A `Revista` is **not** a `RouteItem` — it's unwrapped into its blog posts during graph traversal.

## Loading strategy: the full resource graph

Navigating a resource group used to fan out into an N+1 pattern (`getAllResourceGroups` → N × `getResourceGroupBySlug` → M × `getRevistaBySlug`). [`getFullResourceGraph()`](../../src/lib/contentfulGraphCache.ts) replaces that with a bounded, two-step load:

1. **Groups + direct references** — paginated over resource groups (page size 50), pulling each group's `Resource`s and `Revista` references (no blog posts yet).
2. **Blog posts** — one batched query per chunk of ≤25 unique revista slugs (`slug_in`), then stitched back onto their revistas.

The result is a `ResourceGraphEntry[]` navigated with pure helper functions (`getOrderedRouteItemsForGroup`, `findGroupSlugForBlogPost`, `listAllBlogSlugsWithGroups`, …) — no further I/O. Blog posts come first (in revista order), then external resources.

The per-slug clients (`getBlogBySlug`, `getResourceBySlug`, `getResourceGroupBySlug`, `getRevistaBySlug`) are still used for detail pages where only one entry is needed.

## E2E mocking

When `E2E_MOCK_CONTENTFUL=true`, [`src/instrumentation.ts`](../../src/instrumentation.ts) starts an [MSW](https://mswjs.io/) server ([`src/lib/contentful.e2e.server.ts`](../../src/lib/contentful.e2e.server.ts)) that intercepts the GraphQL endpoint and image requests, returning canned fixtures ([`src/lib/contentful.e2e.mock.ts`](../../src/lib/contentful.e2e.mock.ts)). This lets the happy-path E2E suite run without real credentials or network access. Fixtures for unit tests live in [`src/shared/fixtures/contentful.fixtures.ts`](../../src/shared/fixtures/contentful.fixtures.ts).
