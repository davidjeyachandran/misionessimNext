import type { ContentfulClient } from "./client";
import { fetchAllEntries, fetchAllRevistas, fetchPostBySlug } from "./queries";
import {
  readPostFingerprints,
  removePost,
  writeCollections,
  writePost,
} from "./snapshot";

export interface SyncOptions {
  client: ContentfulClient;
  dir: string;
  /** Re-download every post, not just the ones that changed. */
  full?: boolean;
  /** Post downloads in flight at once. */
  concurrency?: number;
  now?: () => Date;
  log?: (message: string) => void;
}

export interface SyncResult {
  posts: number;
  fetched: number;
  unchanged: number;
  removed: number;
  revistas: number;
  /** Slugs the catalogue lists but the post query could not find. */
  missing: string[];
}

// Runs `worker` over `items` with at most `limit` in flight, and stops handing
// out new items after the first failure — a failed sync must not keep spending
// quota on the rest of the list.
async function pool<T>(
  items: T[],
  limit: number,
  worker: (item: T) => Promise<void>,
): Promise<void> {
  let next = 0;
  let failed = false;
  const lane = async () => {
    while (!failed && next < items.length) {
      const item = items[next++];
      try {
        await worker(item);
      } catch (error) {
        failed = true;
        throw error;
      }
    }
  };
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, lane),
  );
}

// Brings `dir` in line with Contentful. The catalogue and revista listings are
// always re-read (~20 calls); a post's body is only downloaded when its
// catalogue row differs from the one it was last fetched for, so a routine sync
// after a few edits costs a few dozen calls rather than ~900. An interrupted
// sync resumes where it stopped: posts already written match their row.
export async function syncSnapshot({
  client,
  dir,
  full = false,
  concurrency = 4,
  now = () => new Date(),
  log = () => {},
}: SyncOptions): Promise<SyncResult> {
  const catalogue = await fetchAllEntries(client);
  const revistas = await fetchAllRevistas(client);
  log(`Catalogue: ${catalogue.length} posts, ${revistas.length} editions`);

  // First row wins on a duplicated slug, matching the single-slug lookup.
  const wanted = new Map<string, string>();
  for (const row of catalogue) {
    if (row.slug && !wanted.has(row.slug)) wanted.set(row.slug, JSON.stringify(row));
  }

  const existing = readPostFingerprints(dir);
  const stale = [...wanted].filter(
    ([slug, fingerprint]) => full || existing.get(slug) !== fingerprint,
  );
  log(`Downloading ${stale.length} of ${wanted.size} posts`);

  const missing: string[] = [];
  let done = 0;
  await pool(stale, concurrency, async ([slug, fingerprint]) => {
    const post = await fetchPostBySlug(client, slug);
    if (post) {
      writePost(dir, slug, fingerprint, post);
    } else {
      missing.push(slug);
      removePost(dir, slug);
    }
    done += 1;
    if (done % 50 === 0) log(`  ${done}/${stale.length}`);
  });

  let removed = 0;
  for (const slug of existing.keys()) {
    if (!wanted.has(slug)) {
      removePost(dir, slug);
      removed += 1;
    }
  }

  writeCollections(dir, {
    catalogue,
    revistas,
    meta: {
      syncedAt: now().toISOString(),
      posts: wanted.size - missing.length,
      revistas: revistas.length,
    },
  });

  return {
    posts: wanted.size - missing.length,
    fetched: stale.length - missing.length,
    unchanged: wanted.size - stale.length,
    removed,
    revistas: revistas.length,
    missing,
  };
}
