/**
 * Refresh the local Contentful snapshot that builds read from.
 *
 *   yarn sync:contentful            only posts that changed (~20 API calls + 1 per changed post)
 *   yarn sync:contentful --full     re-download every post (~900 calls)
 *
 * Run it after publishing in Contentful and before building/deploying. Builds
 * make no Contentful calls while `content-snapshot/` exists; set
 * CONTENTFUL_SOURCE=live to bypass it.
 */
import { createContentfulClient } from "../lib/contentful/client";
import { DEFAULT_SNAPSHOT_DIR } from "../lib/contentful/snapshot";
import { syncSnapshot } from "../lib/contentful/sync";

const client = createContentfulClient({
  spaceId: process.env.CONTENTFUL_SPACE_ID ?? "",
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN ?? "",
});

const result = await syncSnapshot({
  client,
  dir: DEFAULT_SNAPSHOT_DIR,
  full: process.argv.includes("--full"),
  log: (message) => console.log(message),
});

console.log(
  `Synced: ${result.posts} posts (${result.fetched} downloaded, ${result.unchanged} unchanged, ${result.removed} removed), ${result.revistas} editions.`,
);
if (result.missing.length) {
  console.warn(
    `Not found by the post query, left out: ${result.missing.join(", ")}`,
  );
}
