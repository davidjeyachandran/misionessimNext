// A memo that lives for the whole build, deliberately stronger than React's
// `cache()`.
//
// `cache()` is scoped to a single request, and in static generation *every page
// is its own request*. So a "cached" full-catalogue fetch ran once per page
// rather than once per build: with ~1,200 pages that came to ~3,000 GraphQL
// calls per build, which exhausted the Contentful API quota (121K against a
// 100K monthly limit) and blocked the space on 2026-08-25.
//
// Next's own fetch Data Cache can't stand in for this: it memoizes `GET` only,
// and the GraphQL client POSTs, so the `next: { tags }` option on that request
// is inert.
//
// Scope, precisely: this is per *worker process*. Next forks static generation
// across workers (see `experimental.staticGenerationMinPagesPerWorker`), so the
// real call count is this once per worker, not once per build.
//
// SAFE ONLY WHILE `output: "export"`. A static build is a short-lived process
// holding a fixed content snapshot, so a build-lifetime memo is simply correct.
// If this app ever gains a server runtime, the same memo would pin the
// catalogue for the lifetime of the server — go back to `cache()` at that
// point, or give this a TTL.
export function buildMemo<T>(fetcher: () => Promise<T>): () => Promise<T> {
  let inFlight: Promise<T> | null = null;

  return () => {
    if (!inFlight) {
      // Holding the promise (not the resolved value) collapses concurrent
      // callers into one request. Dropping it again on rejection means Next's
      // page-level retry (`experimental.staticGenerationRetryCount`) gets a
      // real second attempt instead of re-awaiting the same failure.
      inFlight = fetcher().catch((error: unknown) => {
        inFlight = null;
        throw error;
      });
    }
    return inFlight;
  };
}
