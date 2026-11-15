/**
 * Apply the search-snippet rewrites in `data/seo-meta-rewrites.json` to their
 * blogPost entries.
 *
 * Each row comes from Search Console: a post that already ranks on page 1 for
 * Latin American searches but gets few clicks, because its title or meta
 * description doesn't match what people search for. Only `title` and
 * `description` are touched. The page's <title>, H1, listing card and social
 * cards all read those two fields.
 *
 *   yarn seo:meta            dry run (default): shows old -> new per entry
 *   yarn seo:meta --live     write and publish
 *
 * Guards:
 *  - Each row records the `from` values it was written against. If someone has
 *    edited the entry in Contentful since, the row is skipped, not overwritten.
 *  - It publishes only entries that had no other unpublished changes, so it
 *    never pushes someone's half-finished draft live. Any other entry is left
 *    as a draft and reported.
 *
 * Re-runnable: an entry already at its `to` values is reported and skipped.
 * As with every content change, nothing reaches the live site until the next
 * production deploy.
 */
import { readFileSync } from "node:fs";
import { CT, cma } from "./lib/revista-drafts.mjs";

const LIVE = process.argv.includes("--live");
const rows = JSON.parse(readFileSync(new URL("../data/seo-meta-rewrites.json", import.meta.url)));
const L = "en-US";

console.log(`\n${rows.length} entries${LIVE ? "" : "  (dry run — pass --live to write)"}\n`);

const counts = { pending: 0, updated: 0, done: 0, drifted: 0, draftOnly: 0 };
for (const row of rows) {
  const entry = await cma(`/entries/${row.entryId}`);
  const current = {
    title: entry.fields.title?.[L] ?? null,
    description: entry.fields.description?.[L] ?? null,
  };
  const fields = Object.keys(row.to);

  if (fields.every((k) => current[k] === row.to[k])) {
    console.log(`  done     ${row.slug}`);
    counts.done++;
    continue;
  }
  const drifted = fields.filter((k) => current[k] !== row.from[k] && current[k] !== row.to[k]);
  if (drifted.length) {
    console.log(`  SKIP     ${row.slug} — ${drifted.join(", ")} changed in Contentful since this row was written`);
    counts.drifted++;
    continue;
  }

  console.log(`  ${LIVE ? "update" : "would   "} ${row.slug}`);
  for (const k of fields) {
    if (current[k] === row.to[k]) continue;
    console.log(`      ${k}:\n        - ${current[k]}\n        + ${row.to[k]}`);
  }
  if (!LIVE) {
    counts.pending++;
    continue;
  }

  // An entry with no pending edits has version === publishedVersion + 1.
  const clean = entry.sys.publishedVersion !== undefined && entry.sys.version === entry.sys.publishedVersion + 1;
  for (const k of fields) entry.fields[k] = { ...entry.fields[k], [L]: row.to[k] };
  const saved = await cma(`/entries/${row.entryId}`, {
    method: "PUT",
    headers: { ...CT, "X-Contentful-Version": String(entry.sys.version) },
    body: { fields: entry.fields },
  });
  if (clean) {
    await cma(`/entries/${row.entryId}/published`, {
      method: "PUT",
      headers: { ...CT, "X-Contentful-Version": String(saved.sys.version) },
    });
    counts.updated++;
  } else {
    console.log("      saved as draft only: the entry had other unpublished changes");
    counts.draftOnly++;
  }
}

console.log(
  LIVE
    ? `\n${counts.updated} published, ${counts.draftOnly} draft only, ${counts.done} already done, ${counts.drifted} skipped (edited since)\n`
    : `\n${counts.pending} would change, ${counts.done} already done, ${counts.drifted} skipped (edited since)\n`,
);
