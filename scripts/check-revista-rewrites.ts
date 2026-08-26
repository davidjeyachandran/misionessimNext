/**
 * Build guard: fail the build if vercel.json's revista PDF rewrites are stale.
 *
 * The bug this closes: publishing an edition in Contentful is only half a
 * publish. Someone also has to run `yarn build:revista-rewrites` and commit the
 * regenerated vercel.json, because the Contentful asset URL embeds an opaque id
 * and content hash that can't be derived from the slug. Miss that step and the
 * new PDF 404s at its first-party URL — silently, with nothing to catch it.
 *
 * Why a check rather than generating vercel.json during the build: Vercel reads
 * vercel.json as static deployment configuration, so a build that rewrites the
 * file on disk has no reliable effect on routing. Regenerating here would look
 * like it worked and change nothing. Failing the build is honest — the deploy
 * is visibly broken instead of invisibly incomplete.
 *
 * Runs as `prebuild`, so it fires on every `yarn build`, local and on Vercel.
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  computeRevistaRewrites,
  REVISTA_PDF_PREFIX,
  type Rewrite,
} from "./build-revista-pdf-rewrites";

// Locally the tokens live in .env.local; on Vercel they come from the project's
// environment. Missing file is fine — the fetch below reports a clearer error.
try {
  process.loadEnvFile(path.join(process.cwd(), ".env.local"));
} catch {
  // no .env.local; rely on the ambient environment
}

const key = (r: Rewrite) => `${r.source} -> ${r.destination}`;

async function main() {
  const expected = await computeRevistaRewrites();

  const config = JSON.parse(
    await readFile(path.join(process.cwd(), "vercel.json"), "utf8"),
  ) as { rewrites?: Rewrite[] };
  const actual = (config.rewrites ?? []).filter((r) =>
    r.source.startsWith(REVISTA_PDF_PREFIX),
  );

  const actualKeys = new Set(actual.map(key));
  const expectedKeys = new Set(expected.map(key));
  const missing = expected.filter((r) => !actualKeys.has(key(r)));
  const stale = actual.filter((r) => !expectedKeys.has(key(r)));

  if (missing.length === 0 && stale.length === 0) {
    console.log(`✓ vercel.json revista rewrites up to date (${actual.length})`);
    return;
  }

  console.error("\n✗ vercel.json revista PDF rewrites are out of date.\n");
  // A re-uploaded PDF changes its content hash, so it shows up as one missing
  // and one stale rule for the same source — worth seeing both lists.
  for (const r of missing) console.error(`  missing: ${key(r)}`);
  for (const r of stale) console.error(`  stale:   ${key(r)}`);
  console.error(
    "\nAn edition was published (or its PDF re-uploaded) without regenerating" +
      "\nthe rewrites, so that PDF would 404 at its misionessim.org URL.\n" +
      "\nFix, from a checkout with Contentful credentials:\n" +
      "  yarn build:revista-rewrites\n" +
      "  git commit -am 'chore: regenerate revista PDF rewrites' && git push\n",
  );
  process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
