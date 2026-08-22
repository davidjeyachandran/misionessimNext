/**
 * Resolve which issue a pipeline step is running against.
 *
 * Every step takes `--issue=<key>` and loads `issues/<key>.mjs`, which
 * carries the two things that cannot be derived from the PDF: the article
 * boundaries (see any issue file's header) and the Contentful ids of the
 * edition these posts belong to. Derived artefacts go to
 * `export/vamos-<key>/`, which is gitignored.
 */
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

const arg = process.argv.find(a => a.startsWith('--issue='));
if (!arg) {
  console.error('missing --issue=<key>   (e.g. --issue=lucha-espiritual)');
  process.exit(1);
}
export const KEY = arg.slice('--issue='.length);

const issue = (await import(`./issues/${KEY}.mjs`)).default;

/** Derived artefacts live outside the repo history — see .gitignore. */
export const WORK = path.join(ROOT, 'export', `vamos-${KEY}`);
export const HTML = path.join(WORK, 'html');

export const SKIP_PAGES = issue.skipPages ?? new Set();
/**
 * Pages read row by row instead of column by column. The default order —
 * whole left column, then whole right — is right for a page of parallel
 * columns and wrong for a page where a two-column article sits above a
 * second article set in one column: the spread's right half then lands
 * inside the article below it. Declared per page because the two layouts
 * are indistinguishable from geometry alone.
 */
export const ROW_PAGES = issue.rowPages ?? new Set();
/**
 * Articles anchored only to keep their text out of the preceding article,
 * then dropped — the page's layout defeats the text layer for that frame.
 * The per-frame counterpart of `skipPages`.
 */
export const DROP_ARTICLES = issue.dropArticles ?? new Set();
export const LIVE = issue.live ?? new Set();
export const ARTICLES = issue.articles;
export const COVER_HERO = issue.coverHero ?? new Set();
export const NO_HERO_SKIP = issue.noHeroSkip ?? new Set();
export const HERO_OVERRIDE = issue.heroOverride ?? {};
export const REVISTA_ID = issue.revistaId;
export const COVER_ASSET_ID = issue.coverAssetId;
export const DATE = issue.date;
export const EXTRA_FURNITURE = issue.furniture ?? null;

export default issue;
