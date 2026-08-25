# Plan — take Contentful out of the visitor request path

Date: 2026-08-25. Status: **plan only, nothing built.** Written after the
`SpaceUsageLimitsExceeded` outage on 2026-08-25 and the paid-plan upgrade that
unblocked it.

Read with: [`docs/legacy-404-triage.md`](legacy-404-triage.md) (where the 640
redirects came from), [`docs/rollback-to-wordpress.md`](rollback-to-wordpress.md).

---

## 1. What actually happened

The site is static only in that its **HTML** is prebuilt. Its **media** is not.
Contentful is doing two unrelated jobs:

| Role | Traffic | Meter |
|---|---|---|
| Content store (authoring + build-time reads) | ~10 GraphQL calls per build | API calls — never close to the limit |
| Image CDN + file server (every visitor, every crawler) | every image and PDF on every page view | **asset bandwidth — this is what blocked us** |

Measured on the built output:

- 1,236 HTML pages, 2,065 distinct Contentful images, **60,920 image URLs** across all srcsets
- **1,221 of 1,236 pages offered a `w=3840` variant** (Next's default `deviceSizes`); 8,564 occurrences total
- A blog index page fires 24 image requests; a post fires 2
- 265 PDF rewrites in `vercel.json` proxy straight to Contentful; 25 sampled averaged **3.39 MB** (max 6.71 MB) → **~0.9 GB per full crawler sweep**
- Launch shipped **640 redirects** covering the whole legacy Drupal/WordPress URL space → search engines recrawled everything, PDFs included

Local originals are small (1,984 images, 116 MB, avg 60 KB), so the waste was
oversized *variants* and full-size PDFs, not heavy source files.

**Nothing is wrong with the CMS. The CMS is being used as a CDN.** The fix is to
split the two roles, not to change CMS.

## 2. Already done (1 file, not yet deployed)

`next.config.ts` — capped `deviceSizes` to `[640, 828, 1080, 1200, 1920]`, down
from Next's default `[640, 750, 828, 1080, 1200, 1920, 2048, 3840]`. Only two
images on the site render full-bleed; the rest top out around 768px CSS, so the
2048/3840 tiers were pure waste on retina desktops.

**This has not been rebuilt or redeployed.** It takes effect on the next deploy.
Expected to remove the single largest slice of image bandwidth on its own.

## 3. Two findings that change the shape of the job

### 3a. Raw Contentful URLs leak into OG tags, Twitter cards, and JSON-LD

The image loader is not the only path to `images.ctfassets.net`. These emit the
**full-size original**, bypassing the loader and the `deviceSizes` cap entirely:

| File | What leaks |
|---|---|
| [`app/blog/[date]/[slug]/page.tsx:44-61`](../app/blog/[date]/[slug]/page.tsx) | `openGraph.images` + `twitter.images` = raw `post.heroImage.url` |
| [`app/revistavamos/[slug]/page.tsx:25-37`](../app/revistavamos/[slug]/page.tsx) | same, `revista.coverImage.url` |
| [`lib/structured-data.ts:128-137`](../lib/structured-data.ts) | JSON-LD `image.url`, `contentUrl`, `thumbnailUrl` |

That's roughly 1,200 pages advertising an uncapped original to every social
crawler, Googlebot, WhatsApp link preview and Slack unfurl. **This is a
bandwidth source we had not accounted for, and capping `deviceSizes` does
nothing for it.** It is cheap to fix independently of everything else in this
plan — append `?w=1200&fm=webp&q=70` at the point of use.

### 3b. It's 265 PDFs, not 120

`vercel.json` rewrites break down as **120 `/revistavamos/**.pdf`** (owned by
`scripts/build-revista-pdf-rewrites.ts`) and **145 `/recursos/**.pdf`** (owned by
`scripts/build-legacy-redirects.ts`). Both scripts must change, not just the
revista one. Destination hosts are 261 `assets.ctfassets.net` + **4
`downloads.ctfassets.net`** — a second host that any mirroring script has to
recognise or it will silently skip four files.

## 4. Answer to "does the content manager have to upload twice?"

**No. Nothing changes for them.**

They keep creating the Revista in Contentful and uploading the PDF into the
`revistaPdf` field. Contentful stays the system of record and the upload UI.
Whatever we put in front of it is delivery-only and never something a human
logs into.

This works because **the public URL is already decoupled from where the bytes
live**. [`lib/publishing/paths.ts`](../lib/publishing/paths.ts) already derives a
first-party path from the filename alone:

```
/revistavamos/lucha-espiritual/LuchaEspiritualVamosMarzo26.pdf
```

and `vercel.json` resolves that to wherever the file actually is. Visitors have
never seen a `ctfassets.net` URL. Only the rewrite **destination** changes.

**The real workflow problem is one we already have, unrelated to this plan.**
Because `output: "export"` means no server, a new edition needs a rebuild +
redeploy before it appears — and `yarn build:revista-rewrites` is a *separate
manual step*. If someone adds an edition and redeploys without running it, the
new PDF 404s. There is no CI (`.github/workflows` does not exist) and
`CONTENTFUL_REVALIDATE_SECRET` is reserved but unused. Whatever we do here,
folding the rewrite generation into the build **removes** a manual step rather
than adding one. See open question Q5.

## 5. Options

### Option A — do the minimum, stay on Contentful delivery
Deploy the `deviceSizes` cap, fix the OG/JSON-LD leak (§3a), add long-lived
cache headers. No new infrastructure, no new failure mode, ~half a day.

Whether this is *sufficient* depends entirely on the paid plan's bandwidth
allowance versus current burn — which I don't have (Q1). If the cap plus the OG
fix brings us to 20% of allowance, this is the correct answer and everything
below is over-engineering.

### Option B — cache proxy in front of Contentful
Point `media.misionessim.org` at a Cloudflare Worker that fetches from
`assets.ctfassets.net` / `images.ctfassets.net` with `cacheEverything` and a long
TTL. Contentful serves each asset **once**; Cloudflare serves every subsequent
request.

- ~20 lines of Worker code. No storage, no sync script, no state to drift.
- Self-healing: a brand-new asset is fetched on first request, no build step involved.
- Re-uploads are safe for free — Contentful puts a content hash in the asset
  path, so a re-upload produces a *different* URL and therefore a different cache
  key. No purge logic needed.
- Costs: Workers free tier is 100k requests/day, which a crawler sweep could
  exceed; paid is $5/mo for 10M.
- Keeps a hard runtime dependency on Contentful being up (a cache miss on a
  blocked space still fails).

### Option C — mirror to R2, own the bytes
A sync script copies every PDF and every image variant into an R2 bucket; the
rewrite destinations and the image loader point at `media.misionessim.org`.

- Fully decouples delivery from Contentful. If the space is ever blocked again,
  the site keeps serving. Also the prerequisite if we ever *do* leave Contentful.
- Zero egress fees; ~1.7 GB estimated total (≈0.8 GB image variants + ≈0.9 GB
  PDFs) sits inside the free 10 GB tier.
- Much more code than B, and it introduces state that can drift.
- **The re-upload trap:** a corrected PDF keeps its filename but changes
  Contentful's content hash. A sync that checks "does this R2 key exist?" would
  silently never publish the correction. It must compare the Contentful hash
  stored as R2 object metadata. Easy to get wrong, miserable to debug months later.

### Rejected: bake media into the static export
`out/` is already ~185 MB / 12,394 files. Adding ~1.7 GB moves the problem to
Vercel's bandwidth meter and makes every deploy enormous.

### Rejected: migrate off Contentful entirely
Three reasons. The content API was never the problem. The space is **shared with
`mi-movilicemos`**, and revista↔post links span both sites — see the constraint
already recorded at [`lib/contentful.ts:76-83`](../lib/contentful.ts) — so it's a
two-site migration, not one. And the import pipeline (rich text, inline asset
links, table nodes, slug de-duplication) has already been built twice.

### Recommendation
**Deploy Option A first and measure.** It is cheap, it is needed under every
other option, and it may be the whole answer. Then pick B or C with real numbers
in hand. If we go further, I lean **B** — it is a fraction of the code and has no
drift, and C's independence-from-Contentful benefit is worth less now that the
space is paid and unblocked. Choose C only if surviving a Contentful outage is
itself a goal (Q3).

## 6. Phases

**Phase 0 — measure (blocked on Q1).** Read current asset bandwidth and the
plan's allowance from the Contentful dashboard. Without this we're guessing at
whether Phases 2+ are needed at all.

**Phase 1 — the cheap wins.** Ship regardless of which option wins.
1. Rebuild + redeploy so the `deviceSizes` cap takes effect.
2. Fix the OG / Twitter / JSON-LD leak (§3a) — 3 files.
3. Add `Cache-Control: public, max-age=31536000, immutable` headers for the PDF
   paths in `vercel.json`. Hash-stamped URLs make this safe.
4. Re-measure after a full crawl cycle (~1 week).
*Exit:* asset bandwidth per week known and comfortably inside allowance, or not.

**Phase 2 — stand up the delivery domain** (only if Phase 1 is insufficient).
Cloudflare zone for `media.misionessim.org`, then either the Worker (B) or the
bucket + custom domain (C). Blocked on Q2 and Q4.
*Exit:* one known PDF and one known image served correctly from
`media.misionessim.org` with a cache HIT on second request.

**Phase 3 — repoint.**
- `scripts/build-revista-pdf-rewrites.ts` — destination → `media.misionessim.org`
- `scripts/build-legacy-redirects.ts` — same for the 145 `/recursos/` rewrites
- `lib/contentful-image-loader.ts` — swap the host, keep the `?w=&fm=&q=` params
  (a Worker can pass them straight through to Contentful's Images API; R2 cannot
  and would need variants generated at sync time)
- Handle `downloads.ctfassets.net` as well as `assets.ctfassets.net` (§3b)
*Exit:* zero `ctfassets.net` hostnames in `out/` or `vercel.json`; full-site link
check passes on all 265 PDFs.

**Phase 4 — remove the manual step.** Wire rewrite generation (and, under C, the
sync) into a prebuild script so a redeploy is all anyone ever has to do. Blocked
on Q5.
*Exit:* adding an edition in Contentful and hitting redeploy publishes it, with
no one remembering a script.

## 7. Risks

- **Cache-poisoning a wrong PDF under an immutable header.** Mitigated by the
  content hash in every Contentful asset URL, but worth verifying before we set a
  1-year TTL.
- **Sync drift on re-upload (Option C only)** — see §5C. The single most likely
  way to ship a silent bug here.
- **`mi-movilicemos` reads the same space.** Nothing in this plan touches
  Contentful content, only delivery — but any change to asset handling should be
  checked against that site before it ships.
- **The 4 `downloads.ctfassets.net` rewrites** are easy to miss in a
  find-and-replace and would 404 silently.
- **No CI.** Every phase here is verified by hand today. That's a standing risk
  independent of this work.

---

## 8. Questions for David

1. **What does the Contentful dashboard say now?** Specifically: which plan did
   you move to, what is its asset-bandwidth allowance, and what did we burn
   between launch and the block? This decides whether Phase 1 is the whole
   project or just the opening move. Everything else is guesswork without it.

2. **Do you already have a Cloudflare account with `misionessim.org` in it, or
   is DNS entirely at the registrar / Vercel?** Options B and C both need a
   Cloudflare zone for `media.misionessim.org`. If DNS is somewhere else this is
   a bigger step than it sounds and Phase 2 needs its own plan.

3. **Is "the site keeps working if Contentful is down or blocked" a goal, or just
   a nice-to-have?** This is the one question that separates B from C. If a repeat
   of last week's outage taking the site's images down is unacceptable, C is worth
   its extra complexity. If not, B is much less to build and maintain.

4. **Who pays and who owns the Cloudflare account?** R2 free tier covers our
   ~1.7 GB, and Workers free tier *probably* covers our traffic, but "probably"
   plus a crawler spike is how we got here. Is a $5/mo Workers plan fine, or does
   this need to stay strictly free?

5. **How does a deploy get triggered today — do you click Redeploy in Vercel, or
   is it push-to-main?** And is there any appetite for a Contentful webhook that
   redeploys automatically on publish? Right now a new edition needs someone to
   remember `yarn build:revista-rewrites` *and* a redeploy, which is a live bug
   waiting to happen regardless of anything else in this plan.

6. **How often do PDFs actually get re-uploaded after first publish** — corrected
   files, replaced scans? If it's essentially never, Option C's hash-tracking
   complexity is less scary. If it happens a few times a year, that code has to be
   right.

7. **Should `/recursos/` PDFs move too, or only the revistas?** They're 145 of
   the 265 files and mostly legacy Drupal-era documents. Moving both is barely
   more work than moving one, but if the resources section is being reworked
   anyway it might be worth waiting.

8. **Anything upcoming that changes the traffic picture** — a mailing to the
   whole list, a campaign, a new edition launch? Worth knowing before we decide
   Phase 1 is sufficient based on a quiet week.
