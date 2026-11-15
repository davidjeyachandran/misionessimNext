/**
 * Write the 301s for near-duplicate blog posts (data/duplicate-posts.json,
 * `redirects`) into vercel.json.
 *
 * Ownership: the sources listed in the data file are the rules this script
 * owns. Re-running removes any existing rule for those sources and prepends
 * fresh ones, so it is idempotent. Other rules are left alone, except that any
 * whose destination is a redirected post (e.g. an old `/blog/<other-month>/
 * <slug>/` alias) is re-pointed at the final target, so no chain forms. Remove an
 * entry from the data file and its rule must be deleted from vercel.json by
 * hand (the script cannot tell a retired entry from a hand-written rule).
 *
 * Usage: yarn build:duplicate-redirects
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

interface Entry {
  slug: string;
  path: string;
  keep: string;
}

const VERCEL_JSON = path.join(process.cwd(), "vercel.json");
const DATA = path.join(process.cwd(), "data", "duplicate-posts.json");

async function main() {
  const data = JSON.parse(await readFile(DATA, "utf8")) as { redirects: Entry[] };
  const vercel = JSON.parse(await readFile(VERCEL_JSON, "utf8")) as {
    redirects: { source: string; destination: string; permanent: boolean }[];
  };

  const owned = new Map(data.redirects.map((e) => [e.path, e.keep]));
  const rules = [...owned].map(([source, destination]) => ({
    source,
    destination,
    permanent: true,
  }));

  let repointed = 0;
  const kept = vercel.redirects
    .filter((r) => !owned.has(r.source))
    .map((r) => {
      const target = owned.get(r.destination);
      if (!target) return r;
      repointed += 1;
      return { ...r, destination: target };
    });
  vercel.redirects = [...rules, ...kept];
  await writeFile(VERCEL_JSON, `${JSON.stringify(vercel, null, 2)}\n`);
  console.log(`vercel.json: ${rules.length} duplicate-post redirects (${kept.length} other rules, ${repointed} re-pointed to avoid chains)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
