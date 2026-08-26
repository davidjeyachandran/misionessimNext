# Plan — fix the Contentful usage blowout

Date: 2026-08-25 (rewritten same day, twice — see §9). Status: **plan only,
nothing built.** Written after the `SpaceUsageLimitsExceeded` outage on
2026-08-25 and the paid-plan upgrade that unblocked it.

---

## 1. Root cause — settled

| Meter | Usage | Free-tier limit | Verdict |
|---|---:|---:|---|
| API calls (CDA 7.9K · CPA 18 · CMA 0 · **GraphQL 113.33K**) | **121.25K** | **100K** | **over — this is what blocked the space** |
| Asset bandwidth | **3.88 GB** | not the binding constraint | fine |

**The site was blocked by build traffic, not visitor traffic.** GraphQL alone is
93% of all API calls, and every one of those calls comes from `next build`.

### Why a build makes ~3,000 GraphQL calls

The data layer looks cached. It isn't, in the way it needs to be. Two Next 16
behaviours, both confirmed in the docs shipped in `node_modules`:

- `01-app/03-api-reference/04-functions/fetch.md:86` — memoization and the Data
  Cache cover requests "using `GET`". [`lib/contentful/client.ts:39`](../lib/contentful/client.ts)
  issues a **POST**, so it is never memoized and never cached. The
  `next: { tags: ["contentful"] }` option on that call is inert.
- `01-app/01-getting-started/06-fetching-data.md:724` — "`React.cache` is scoped
  to the current request only. Each request gets its own memoization scope with
  no sharing between requests."

So the `cache()` wrappers throughout [`lib/contentful.ts`](../lib/contentful.ts)
deduplicate *within* a single page render and reset for the next one. The
comment at `lib/contentful.ts:111` states this accurately — "cached **per
request**. ~10 GraphQL calls" — it is per **page**, not per build.

Counted against the built output:

| Page type | Count | Calls each | Total |
|---|---:|---:|---:|
| Blog posts (`/blog/YYYY-MM/slug/`) | 902 | 1 (`getBlogPostBySlug`) | 902 |
| Blog listings (index + 75 paginated + 88 category + 30 tag) | 194 | ~10 — each re-pages the whole 903-entry catalogue at `PAGE_SIZE = 100` | ~1,940 |
| Revista editions | 128 | 1 | 128 |
| Revista index, `/ora/`, `generateStaticParams` | ~5 | ~10 | ~50 |
| | | | **~3,000 per build** |

113.33K ÷ ~3,000 ≈ **35–40 builds** — an unremarkable launch month once local
`yarn build`s, production deploys and Vercel preview builds are counted. The
100K ceiling was roughly **33 builds**. We were always going to hit it; launch
week just got us there in three weeks instead of three months.

## 2. The fix

A static export build is a Node process, so a module-level promise singleton
survives every page render where `React.cache` cannot:

```ts
let cataloguePromise: Promise<RawEntry[]> | null = null;
const getAllEntries = () => (cataloguePromise ??= fetchAllEntries());
```

Applied to `getAllEntries`, `getCanonicalEntries` and `getAllRevistas`, the
catalogue is paged once per worker and reused for all 1,235 pages. Shipped as
[`lib/build-memo.ts`](../lib/build-memo.ts), which carries the reasoning and the
`output: "export"` precondition next to the code.

### Measured, 2026-08-27

A full build was instrumented to log every outbound HTTP request to the GraphQL
endpoint (retries included, since the meter counts those too), tagged by process
id. One build, 1,235 pages:

| | calls |
|---|---|
| `getBlogPostBySlug` — 902 posts, one distinct body query each | 902 |
| `getRevistaBySlug` — 120 editions, one linked-posts query each | 120 |
| Catalogue paging — ~12 pages × 7 worker processes | 83 |
| **Total** | **1,105** |

The 1,940 catalogue calls that the 194 listing pages used to force are gone: the
83 remaining catalogue calls are 12 per worker, which is exactly one full paging
pass each. **That is the proof the memo is doing its job** — under `cache()` the
194 listing pages alone could not have come in under 1,940.

**Worker fan-out is real but cheap.** Next forked static generation across 7
processes (`experimental.staticGenerationMinPagesPerWorker`, documented in
`node_modules/next/dist/docs/.../staticGeneration.md`), so the memo is per
worker as suspected. It costs 83 calls instead of 12 — irrelevant next to the
1,022 per-entity queries that now dominate.

**Headroom: 100K ÷ 1,105 ≈ 90 builds a month**, inside the free tier. Before the
fix that was ~33.

One honest limit: **1,105 is measured, ~3,000 is still arithmetic.** No
instrumented build was run against the old code, because doing so would spend
~3% of the monthly quota to confirm a number the composition above already
implies. If that proof is ever wanted, it costs one build.

**Effort:** about an hour including the verification build. Builds also got
faster — the measured build completed in 53s.

### What was deliberately left alone

The 1,022 per-entity queries are genuinely distinct: each post body and each
edition's linked-post list carries data the catalogue doesn't. Collapsing them
would mean fetching all 902 bodies in paged bulk — a much larger change, a much
larger peak memory footprint, and unnecessary at 90 builds a month. Revisit only
if the build count needs to go higher.

## 3. What this means for the media plan — mostly, don't do it

An earlier draft of this document (see §9) diagnosed asset bandwidth as the
cause and proposed moving all images and PDFs onto Cloudflare. **The actual
figure is 3.88 GB/month, which does not justify new infrastructure.** Both the
Cloudflare Worker cache-proxy and the R2 mirror are **shelved** — the reasoning
is preserved in git history if the numbers ever change.

Three findings from that work survive on their own merits:

### 3a. Raw Contentful URLs leak into OG tags, Twitter cards, and JSON-LD — worth fixing

These emit the **full-size original**, bypassing the image loader entirely:

| File | What leaks |
|---|---|
| [`app/blog/[date]/[slug]/page.tsx:44-61`](../app/blog/[date]/[slug]/page.tsx) | `openGraph.images` + `twitter.images` = raw `post.heroImage.url` |
| [`app/revistavamos/[slug]/page.tsx:25-37`](../app/revistavamos/[slug]/page.tsx) | same, `revista.coverImage.url` |
| [`lib/structured-data.ts:128-137`](../lib/structured-data.ts) | JSON-LD `image.url`, `contentUrl`, `thumbnailUrl` |

~1,200 pages advertise an uncapped original to every Googlebot, WhatsApp preview
and Slack unfurl. The fix is appending `?w=1200&fm=webp&q=70` at the point of
use — a few lines, and it makes social cards load faster. Worth doing for
quality even though bandwidth is no longer pressing.

### 3b. `deviceSizes` cap — already made, still uncommitted

`next.config.ts` caps `deviceSizes` to `[640, 828, 1080, 1200, 1920]`, down from
Next's default `[640, 750, 828, 1080, 1200, 1920, 2048, 3840]`. 1,221 of 1,236
pages were offering a `w=3840` variant while only two images on the site render
full-bleed. Harmless, correct, and worth keeping — but it is a page-weight
improvement now, not a quota fix.

### 3c. Reference notes, if media ever does move

265 PDF rewrites in `vercel.json`, not 120: **120 `/revistavamos/**.pdf`** (owned
by `scripts/build-revista-pdf-rewrites.ts`) and **145 `/recursos/**.pdf`** (owned
by `scripts/build-legacy-redirects.ts`). Destination hosts are 261
`assets.ctfassets.net` **and 4 `downloads.ctfassets.net`** — a second host that
any find-and-replace would silently skip.

## 4. The content manager's workflow is unaffected

They keep creating the Revista in Contentful and uploading the PDF into the
`revistaPdf` field. Nothing in this plan touches authoring, and with the media
migration shelved there is no second upload destination even under discussion.

**But there is a real standing bug here, unrelated to quota.** Because
`output: "export"` means no server, a new edition needs a rebuild + redeploy to
appear — and `yarn build:revista-rewrites` is a *separate manual step*. Add an
edition, redeploy without running it, and the new PDF 404s. There is no CI
(`.github/workflows` does not exist) and `CONTENTFUL_REVALIDATE_SECRET` is
reserved but unused. See Q2.

## 5. Phases

**Phase 1 — kill the build amplification (§2). Done, 2026-08-27.** Module-level
memo for `getAllEntries`, `getCanonicalEntries` and `getAllRevistas`.
*Exit met:* an instrumented build consumed **1,105 GraphQL calls** for 1,235
pages — measured, not estimated — of which 1,022 are irreducible per-entity
queries. ~90 builds a month now fit inside the free tier.

**Phase 2 — quality fixes, no urgency. Done, 2026-08-27.** The `deviceSizes`
cap shipped in `409ae7e`. The OG/Twitter/JSON-LD leak (§3a) is fixed via
[`lib/social-image.ts`](../lib/social-image.ts). The PDF `Cache-Control` item
needed no work — `vercel.json` already carries
`max-age=86400, stale-while-revalidate=604800` on both PDF prefixes.
*Exit met:* a site-wide scan of `out/` finds no `og:image`, `twitter:image` or
JSON-LD `thumbnailUrl` pointing at an uncapped Contentful original. Measured on
one real hero: **2,473 KB → 126 KB**, a 95% cut on every link unfurl.

**Phase 3 — remove the silent failure (§4). Done, 2026-08-27.** Not as
originally planned. Generating `vercel.json` during the build does not work:
Vercel reads it as *static deployment configuration*, so a build that rewrites
the file on disk has no reliable effect on routing — it would look like it
worked and change nothing.

Vercel's `vercel.ts` (programmatic config, executes at build time) and
`bulkRedirectsPath` (generated at build time) both exist and were considered.
Neither fits: `bulkRedirectsPath` covers **redirects only**, and these 265 PDF
rules are **rewrites** — a proxy that keeps the PDF on misionessim.org. Moving
them to redirects would expose the raw Contentful CDN URL in the address bar,
which is the exact thing the rewrites were built to avoid. `vercel.ts` could
work, but its `config` export is synchronous and no documented mechanism makes
an async CMS fetch available to it; migrating would also mean deleting
`vercel.json` and putting all 640 redirects plus 265 rewrites through an
unproven path in one step.

So the shipped fix converts a **silent** failure into a **loud** one:
`scripts/check-revista-rewrites.ts` runs as `prebuild`, recomputes the expected
rewrites from Contentful, and fails the build if `vercel.json` disagrees. Both
the generator and the check call one `computeRevistaRewrites()`, so they cannot
drift.
*Exit met:* publishing an edition without regenerating now produces a failed
deploy naming the exact missing rule and the command to fix it, instead of a
PDF that 404s with nobody watching. Verified against a simulated new edition
and a simulated PDF re-upload.

*Still open:* the deploy is not yet automatic — someone must still redeploy
after publishing. That part remains blocked on Q2.

## 6. Risks

- **The worker-process caveat (§2).** If static generation is fanned across
  workers the singleton is per worker. The fix still works; the numbers are just
  different. Measure before declaring victory.
- **A module-level singleton is a build-lifetime cache.** Correct for a static
  export, and it must not be assumed safe if this app ever gains a server
  runtime — a long-lived process would serve stale content forever. Worth a
  comment in the code saying exactly that.
- **`mi-movilicemos` reads the same space** and has its own build behaviour. If
  it shares this data-layer pattern it is contributing to the same 100K meter,
  and nobody has checked. See Q3.
- **No CI.** Every phase here is verified by hand. Standing risk, independent of
  this work.

## 7. Questions for David

1. **Now that we know the fix, do we still need the paid plan?** If builds drop
   from ~3,000 calls to ~12 and asset bandwidth is 3.88 GB, the free tier's 100K
   would fit ~100 builds a month comfortably. Worth checking the *other* free-tier
   limits before assuming a downgrade is safe (record count — we're at ~911
   blogPost plus revistas — user seats, roles). If the paid plan is cheap enough
   to keep as insurance that's a perfectly good answer, but it should be a choice
   rather than a leftover from a panic.

2. **How does a deploy get triggered today — Vercel Redeploy button, or
   push-to-main?** And is there appetite for a Contentful publish webhook that
   redeploys automatically? This is the §4 bug: right now publishing an edition
   needs someone to remember a script *and* a redeploy, with nothing to catch a
   miss.

3. **Does `mi-movilicemos` have the same problem?** It reads the same space and
   counts against the same meter. If it's built on this data layer it may be a
   meaningful share of the 113.33K, and fixing only this repo would leave the
   ceiling in place. Do you want me to look?

4. **Is anything else hitting the API that we haven't accounted for?** ~38 builds
   fits the number well, but if there's a scheduled job, a second preview
   environment, or another integration reading the space, the arithmetic changes.

5. **Should I still do the OG/JSON-LD fix (§3a)?** It's no longer a quota matter
   — it's social-preview quality and page weight. Cheap, but it's scope, and you
   may prefer to bank the build fix and stop.

## 8. Rejected: migrating off Contentful

Three reasons, all unchanged by the new numbers. The problem was our build
pattern, not the CMS. The space is **shared with `mi-movilicemos`**, and
revista↔post links span both sites — see the constraint at
[`lib/contentful.ts:76-83`](../lib/contentful.ts) — so it's a two-site migration.
And the import pipeline (rich text, inline asset links, table nodes, slug
de-duplication) has already been built twice.

## 9. Revision history

This document was wrong twice before it was right, and the corrections are worth
recording because they show how the diagnosis moved.

- **First draft** — diagnosed asset bandwidth as the cause from build-output
  analysis (60,920 image URLs, 3840px variants, 265 PDF proxies) and proposed
  moving media to Cloudflare. Asserted the content API "was never the problem" at
  "~10 GraphQL calls per build".
- **Second draft** — the usage breakdown showed GraphQL at 113.33K. The "~10 per
  build" claim was a misreading of `lib/contentful.ts:111`, where "cached per
  request" means per page. Corrected to ~3,000 per build; both problems presented
  as real.
- **This draft** — the free-tier limit (100K) and real bandwidth (3.88 GB)
  confirm the API meter alone caused the block. The media migration is shelved;
  the build fix is the plan.

- **2026-08-27, after implementing** — the fix was measured rather than
  projected, and the projection was wrong in both directions: the memo saves
  less than the headline "~12 calls" suggested (per-entity queries dominate at
  1,022 of 1,105), and worker fan-out, flagged as the risk, turned out to cost
  83 calls rather than multiplying anything that mattered. The ~950 estimate in
  the second draft was the accurate one.

The lesson worth keeping: the first two drafts inferred usage from the built
output instead of reading the usage dashboard. Measuring the artefact is not the
same as measuring the meter.
