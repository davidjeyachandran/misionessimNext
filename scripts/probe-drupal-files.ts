/**
 * Inventory the Drupal-era `/sites/default/files/` space on the live
 * WordPress site, before it is decommissioned.
 *
 * Why this is separate from build-media-redirect-map.ts: that script crawls
 * the WordPress media API, which knows only about `/wp-content/uploads/`.
 * The site that preceded WordPress was Drupal, and WordPress still answers
 * for its file tree with per-file 301s
 * (`/sites/default/files/magazinepdf/<file>` -> `/wp-content/uploads/2024/11/<file>`).
 * Those rules live in the WordPress install and die with it, yet 8 published
 * blog bodies still link into that space — so without our own rules, articles
 * on the new site would carry broken links to their own magazine PDFs.
 *
 * The space cannot be enumerated: there is no index, and a nonexistent name
 * 404s rather than listing siblings. So this probes, using the filenames we
 * already know from the media map — every Drupal file that survived into
 * WordPress carries the same filename there. A Drupal file that never made
 * the jump is unknowable, and would have nothing to point at anyway.
 *
 * Output `data/drupal-file-map.json` is a **frozen crawl**: irreplaceable
 * once the site is off, in the same way as data/legacy-revista-aliases.json.
 * Re-running after shutdown would produce an empty map — don't.
 *
 * Usage: node --env-file=.env.local node_modules/.bin/tsx scripts/probe-drupal-files.ts
 */
export {}; // only dynamic imports below — force module scope so `main` doesn't collide across scripts

const SITE = "https://misionessim.org";
const PREFIXES = [
  "/sites/default/files/magazinepdf/",
  "/sites/default/files/magazinefiles/",
];
const CONCURRENCY = 12;

interface MediaEntry {
  fileName: string;
  bucket: string;
}

interface DrupalHit {
  /** The Drupal path that answers on the live site. */
  path: string;
  /** Where WordPress sends it — always a /wp-content/uploads/ path. */
  wpPath: string;
}

async function probe(path: string): Promise<DrupalHit | null> {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(`${SITE}${path}`, {
        method: "HEAD",
        redirect: "manual",
      });
      if (res.status === 404) return null;
      if (res.status === 301 || res.status === 302) {
        const location = res.headers.get("location");
        if (!location) return null;
        const wpPath = new URL(location, SITE).pathname;
        return wpPath.startsWith("/wp-content/uploads/") ? { path, wpPath } : null;
      }
      // A 200 means the file is served in place; it has no wp-content twin.
      if (res.status === 200) return { path, wpPath: "" };
      return null;
    } catch {
      if (attempt === 2) return null;
    }
  }
  return null;
}

async function mapWithConcurrency<T, R>(
  items: readonly T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (true) {
        const i = next++;
        if (i >= items.length) return;
        results[i] = await fn(items[i]);
      }
    }),
  );
  return results;
}

async function main() {
  const { readFile, writeFile } = await import("node:fs/promises");
  const pathMod = await import("node:path");
  const MEDIA_MAP = pathMod.join(process.cwd(), "data", "media-redirect-map.json");
  const OUT = pathMod.join(process.cwd(), "data", "drupal-file-map.json");

  const media = JSON.parse(await readFile(MEDIA_MAP, "utf8")) as {
    entries: MediaEntry[];
  };
  const names = [
    ...new Set(
      media.entries
        .filter((e) => e.bucket !== "image" && e.bucket !== "junk")
        .map((e) => e.fileName),
    ),
  ].sort();

  const candidates = PREFIXES.flatMap((prefix) =>
    names.map((name) => `${prefix}${encodeURIComponent(name)}`),
  );
  console.log(
    `Probing ${candidates.length} URLs (${names.length} filenames x ${PREFIXES.length} prefixes)...`,
  );

  let done = 0;
  const results = await mapWithConcurrency(candidates, CONCURRENCY, async (c) => {
    const hit = await probe(c);
    if (++done % 100 === 0) console.log(`  ${done}/${candidates.length}`);
    return hit;
  });

  const hits = results.filter((r): r is DrupalHit => r !== null);
  hits.sort((a, b) => a.path.localeCompare(b.path));

  const byPrefix: Record<string, number> = {};
  for (const prefix of PREFIXES) {
    byPrefix[prefix] = hits.filter((h) => h.path.startsWith(prefix)).length;
  }

  await writeFile(
    OUT,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        source: SITE,
        note:
          "Frozen crawl of the Drupal-era file space. Probed, not enumerated — "
          + "the space has no index. Cannot be regenerated after WordPress shutdown.",
        probed: candidates.length,
        total: hits.length,
        byPrefix,
        entries: hits,
      },
      null,
      2,
    ) + "\n",
  );

  console.log(`\n${hits.length} live Drupal paths found:`);
  for (const [prefix, count] of Object.entries(byPrefix)) {
    console.log(`  ${count.toString().padStart(4)}  ${prefix}`);
  }
  console.log(`\nWrote ${OUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
