/**
 * Which VAMOS editions still have unpublished articles.
 *
 * The PDF import (`scripts/vamos/import.mjs`) deliberately creates drafts, so
 * an edition arrives in Contentful complete but invisible. This is the standing
 * worklist for publishing them one edition at a time:
 *
 *   yarn drafts:list                       every edition with drafts
 *   yarn drafts:list --revista=<slug>      the individual posts of one edition
 *
 * Then publish an edition with `yarn drafts:publish --revista=<slug> --live`.
 */
import {
  arg,
  dateOf,
  draftPosts,
  findRevista,
  groupDraftsByRevista,
  publishedPosts,
  revistas,
  slugOf,
  titleOf,
} from "./lib/revista-drafts.mjs";

const only = arg("revista");

const [drafts, published, editions] = await Promise.all([
  draftPosts(),
  publishedPosts(),
  revistas(),
]);
const groups = groupDraftsByRevista(drafts, editions, published);

if (only) {
  const edition = findRevista(editions, only);
  const group = groups.find((g) => g.id === edition?.sys.id);
  if (!edition) {
    console.error(`No revista with slug "${only}". Run yarn drafts:list to see the editions.`);
    process.exit(1);
  }
  console.log(`\n${titleOf(edition).trim()}  ·  ${slugOf(edition)}  ·  ${String(dateOf(edition)).slice(0, 7)}`);
  if (!group) {
    console.log("\nNo unpublished posts — this edition is fully published.\n");
    process.exit(0);
  }
  console.log(`${group.drafts.length} unpublished, ${group.published} already live\n`);
  for (const post of group.drafts) {
    console.log(
      `  ${String(dateOf(post)).slice(0, 10)}  ${slugOf(post)}\n      ${titleOf(post)}`,
    );
  }
  console.log(`\nPublish them:  yarn drafts:publish --revista=${slugOf(edition)} --live\n`);
  process.exit(0);
}

const total = groups.reduce((n, g) => n + g.drafts.length, 0);
console.log(`\n${total} unpublished blogPost entries across ${groups.length} editions\n`);
console.table(
  groups.map((g) => ({
    fecha: g.fecha,
    revista: g.slug,
    title: g.title,
    unpublished: g.drafts.length,
    live: g.published,
  })),
);
console.log(
  "\nInspect one:  yarn drafts:list --revista=<slug>" +
    "\nPublish one:  yarn drafts:publish --revista=<slug> --live\n",
);
