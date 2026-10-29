/**
 * Prepare dropped articles for recovery from page images.
 *
 * Articles named in `dropArticles` were left out because the text layer
 * splices their pull quotes, captions and sidebars into the prose. A page
 * image does not have that problem: read as a picture, a sidebar is plainly
 * a sidebar. This step renders each dropped article's pages to PNG and
 * writes `recover-list.json`, the worklist a transcriber (a vision model)
 * reads from. The transcription itself goes to
 * `scripts/vamos/recovered/<key>/<slug>.txt` — committed, since it is
 * source, not a derived artefact — and is checked against the text layer
 * (recovered.mjs) before `build-plan.mjs` will use it.
 *
 * Run after `score.mjs`; only articles that cleared the word floor and have
 * a hero (or are in `coverHero`) are listed, since nothing else can be a post.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

import { KEY, WORK, DROP_ARTICLES, COVER_HERO } from './issue.mjs';
import { RECOVERED, slugify, recovered } from './recovered.mjs';

const split = JSON.parse(readFileSync(path.join(WORK, 'split.json'), 'utf8'));
const rows = JSON.parse(readFileSync(path.join(WORK, 'with-images.json'), 'utf8'));
const PAGES = path.join(WORK, 'pages');
mkdirSync(PAGES, { recursive: true });

/**
 * An article runs from its own page to the page the next article starts on,
 * and always onto the page after its own: a continuation can sit there even
 * when another article starts first on the same page («Ayudando al misionero
 * a reintegrarse» runs onto p2 after p1's sidebar opens), and the extraction
 * cannot say so because it files that text under the neighbour. The
 * transcriber, reading the images, decides what belongs. Two pages beyond
 * the start is the cap.
 */
const LAST_PAGE = JSON.parse(readFileSync(path.join(WORK, 'blocks.json'), 'utf8')).length;
function pagesOf(title) {
  const i = split.findIndex(a => a.title === title);
  const from = split[i].page;
  const to = Math.min(Math.max(split[i + 1]?.page ?? from, from + 1), from + 2, LAST_PAGE);
  return Array.from({ length: to - from + 1 }, (_, k) => from + k);
}

function render(page) {
  const out = path.join(PAGES, `p-${page}`);
  if (!existsSync(`${out}.png`)) {
    execFileSync('pdftoppm', ['-png', '-r', '150', '-singlefile', '-f', String(page), '-l', String(page),
      path.join(WORK, 'issue.pdf'), out]);
  }
  return `${out}.png`;
}

const list = rows
  .filter(r => DROP_ARTICLES.has(r.title) && (r.image || COVER_HERO.has(r.title)))
  .map(r => {
    const slug = slugify(r.title);
    const pages = pagesOf(r.title);
    const rec = recovered(KEY, WORK, r.title, pages);
    return {
      title: r.title,
      slug,
      pages,
      images: pages.map(render),
      file: path.join(RECOVERED, KEY, `${slug}.txt`),
      status: !rec ? 'todo' : rec.ok ? 'ok' : 'FAIL',
      found: rec ? +rec.found.toFixed(3) : null,
      missing: rec && !rec.ok ? rec.missing.slice(0, 30) : undefined,
      // The spliced extraction: which words belong to the article, in the
      // wrong order. A transcriber uses it to find the article on the page.
      extracted: r.body,
    };
  });

writeFileSync(path.join(WORK, 'recover-list.json'), JSON.stringify(list, null, 2));
for (const a of list) {
  const f = a.found == null ? '' : `  ${(a.found * 100).toFixed(1)}% found`;
  console.log(`${a.status.padEnd(4)}  p${a.pages.join(',')}  ${a.slug}${f}`);
  if (a.missing) console.log(`        not on the page: ${a.missing.join(' ')}`);
}
const n = s => list.filter(a => a.status === s).length;
console.log(`\n${KEY}: ${list.length} dropped · ${n('ok')} recovered · ${n('FAIL')} failing check · ${n('todo')} to transcribe`);
