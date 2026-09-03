/**
 * Publish one VAMOS edition's draft articles.
 *
 * The counterpart to `scripts/vamos/import.mjs`, which creates every article
 * as a draft. Reviewing 25 machine-extracted posts is cheaper before
 * publication than after, so the editions go live one at a time, on whatever
 * cadence suits — see `yarn drafts:list` for what is still waiting.
 *
 *   yarn drafts:publish --revista=<slug>            dry run (default)
 *   yarn drafts:publish --revista=<slug> --live     publish
 *   yarn drafts:publish --revista=<slug> --live --limit=10   first 10 only
 *
 * Idempotent: already-published posts are not in the draft query, so a run
 * that fails halfway can simply be repeated. Archived entries are excluded —
 * they lack a `publishedAt` too, and the duplicates archived by
 * `scripts/archive-duplicate-posts.ts` must stay buried.
 *
 * Two things this deliberately does NOT do:
 *  - touch `revista.blogPosts`. The importer already appended every draft to
 *    its edition, and `getRevistaBySlug` in lib/contentful.ts drops links it
 *    cannot resolve, so publishing a post is what makes it appear.
 *  - re-order or re-date anything. What publishes is exactly what was
 *    imported and reviewed.
 *
 * Deploys: the Contentful webhook fires a Vercel deploy hook per publish, and
 * those hooks are capped at 60 triggers/hour. Vercel collapses superseded
 * builds, so one edition is fine, but after publishing check that the final
 * state actually deployed before starting a second edition in the same hour.
 */
import {
  CT,
  all,
  arg,
  cma,
  dateOf,
  draftPosts,
  findRevista,
  heroIdOf,
  revistaIdOf,
  revistas,
  slugOf,
  titleOf,
} from "./lib/revista-drafts.mjs";

const wanted = arg("revista");
const LIVE = process.argv.includes("--live");
const limit = Number(arg("limit") ?? Infinity);

if (!wanted) {
  console.error(
    "Usage: yarn drafts:publish --revista=<slug> [--live] [--limit=N]\n" +
      "Run yarn drafts:list to see the editions with unpublished posts.",
  );
  process.exit(1);
}

const editions = await revistas();
const edition = findRevista(editions, wanted);
if (!edition) {
  console.error(`No revista with slug "${wanted}". Run yarn drafts:list to see the editions.`);
  process.exit(1);
}

const drafts = (await draftPosts())
  .filter((post) => revistaIdOf(post) === edition.sys.id)
  .sort((a, b) => String(dateOf(a)).localeCompare(String(dateOf(b))))
  .slice(0, limit);

console.log(
  `\n${titleOf(edition).trim()}  ·  ${slugOf(edition)}\n` +
    `${drafts.length} post(s) to publish${LIVE ? "" : "  (dry run — pass --live to write)"}\n`,
);

if (!drafts.length) {
  console.log("Nothing to do — this edition is fully published.\n");
  process.exit(0);
}

if (!LIVE) {
  for (const post of drafts) {
    console.log(`  would publish  ${String(dateOf(post)).slice(0, 10)}  ${slugOf(post)}`);
  }
  console.log(`\nRe-run with --live to publish these ${drafts.length}.\n`);
  process.exit(0);
}

/**
 * Contentful refuses to publish an entry whose linked asset is still a draft.
 * The importer publishes hero assets as it uploads them, so this is a guard
 * against hand-edited entries rather than the normal path.
 */
const unpublishedAssets = new Set(
  (await all("/assets?sys.publishedAt%5Bexists%5D=false")).map((a) => a.sys.id),
);

let ok = 0;
const failures = [];
for (const [i, post] of drafts.entries()) {
  const slug = slugOf(post);
  process.stdout.write(`[${i + 1}/${drafts.length}] ${slug} … `);
  try {
    const hero = heroIdOf(post);
    if (hero && unpublishedAssets.has(hero)) {
      const asset = await cma(`/assets/${hero}`);
      await cma(`/assets/${hero}/published`, {
        method: "PUT",
        headers: { "X-Contentful-Version": String(asset.sys.version) },
      });
      unpublishedAssets.delete(hero);
      process.stdout.write("(hero published) ");
    }
    await cma(`/entries/${post.sys.id}/published`, {
      method: "PUT",
      headers: { ...CT, "X-Contentful-Version": String(post.sys.version) },
    });
    ok++;
    console.log("ok");
  } catch (error) {
    failures.push({ slug, message: error.message });
    console.log(`FAILED\n    ${error.message}`);
  }
}

console.log(`\npublished ${ok}/${drafts.length}`);
if (failures.length) {
  console.log(`${failures.length} failed — re-run the same command to retry just those.`);
}
console.log(
  `\nCheck the edition: https://misionessim.org/revistavamos/${slugOf(edition).replace(/^\//, "")}/` +
    "\nConfirm the Vercel deploy finished before publishing another edition this hour.\n",
);
