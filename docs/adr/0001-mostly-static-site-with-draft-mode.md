# Mostly-static site with Draft Mode instead of a pure static export

We dropped `output: "export"` so editors can preview unpublished Contentful content through Next.js Draft Mode. Published pages are still prerendered at build time with no revalidation, so visitors get static HTML and trigger no Contentful calls. Only requests carrying the draft cookie render on request, through the Contentful Preview API.

## Considered Options

- **Separate preview deployment** (keep the live site as a static export, add a server-rendered preview site): rejected because a second build pipeline would double build-time GraphQL traffic. Build traffic caused the 2026-08-25 `SpaceUsageLimitsExceeded` outage (see `docs/plan-contentful-usage.md`).
- **Contentful's in-app preview only**: rejected because editors couldn't see drafts in the real site layout, and there would be no path from the website to the entry.

## Consequences

- The site now has a server runtime on Vercel, which the old `next.config.ts` comment ruled out.
- Unknown URLs must not render on demand for normal visitors, or random paths would spend Contentful API calls.
- This makes it possible to publish without a full rebuild later, but manual deploys remain the policy for now.
