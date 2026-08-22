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
