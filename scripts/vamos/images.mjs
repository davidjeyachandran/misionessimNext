/**
 * Match a hero image to each article.
 *
 * Article regions come from the bounding box of their text blocks; image
 * positions come from `pdftohtml -xml`. An image is a hero candidate when
 * it sits on the article's page and overlaps its horizontal band. Banners
 * and rules (very wide and short) and logos (small) are not candidates.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { ARTICLES, SKIP_PAGES, LIVE } from './manifest.mjs';

import { fileURLToPath } from 'node:url';
import path from 'node:path';

/** Derived artefacts live outside the repo history — see .gitignore. */
const WORK = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../export/vamos-118');


const SCALE = 892 / 595.276;          // pdftohtml px per PDF point
const MIN_AREA = 20000;               // px² — below this it's a logo or icon
const MAX_ASPECT = 3.2;               // wider than this is a banner or rule
const KEEP_WORDS = 150;

const norm = s => s.replace(/\s+/g, ' ').replace(/^["“”'‘’¡\s]+/, '').trim();
const isCredit = t => /^(pexels|unsplash|foto|photo)\s*[:.]/i.test(t);
const isChrome = t => /^(¡?Ahora nos toca a nosotros!?|EQUIPO VAMOS|Pasión latina por el mundo|En la portada)$/i.test(t.trim());

/**
 * Masthead, footer strap, contact panels and social handles sit in their
 * own frames and would otherwise be appended to whichever article shares
 * their page. Contact lines are dropped wholesale; short frames survive
 * only when they read as a byline, which carries real attribution.
 */
const CONTACT = /(sim\.org|www\.|https?:|@|\/SIM|movilicemos\.org|cursos\.)/i;
const MASTHEAD = /^(Directora:|Director:|SIRVE CON NOSOTROS|Escríbenos|Cruzando barreras|VAMOS es una|Es la Iglesia quien envía|Jessica Bastidas|Evelyn Subuyuj|Luigi Sarmiento|Geraldyne Velasquez|Con una obediencia sencilla)/i;
const BYLINE = /^[A-ZÁÉÍÓÚÑ][\wáéíóúñ.]*(\s+[A-ZÁÉÍÓÚÑ][\wáéíóúñ.]*)?,\s/;
const MIN_BLOCK_WORDS = 12;

const isFurniture = (t, words) => {
  if (MASTHEAD.test(t)) return true;
  // A contact line is furniture only when it IS the frame. Body text that
  // merely cites an address or URL stays — dropping the whole block on a
  // single link cost three articles their entire text.
  if (words < MIN_BLOCK_WORDS && CONTACT.test(t)) return true;
  if (words >= MIN_BLOCK_WORDS) return false;
  return !BYLINE.test(t);           // short frames: keep bylines, drop the rest
};

// ── rebuild the split, this time keeping block geometry ────────────────────
const pages = JSON.parse(readFileSync(path.join(WORK, 'blocks.json'), 'utf8'));
const stream = [];
for (const { page, blocks } of pages) {
  if (SKIP_PAGES.has(page)) continue;
  const xs = [...new Set(blocks.map(b => Math.round(b.x)))].sort((a, z) => a - z);
  const edges = [];
  for (let i = 1; i < xs.length; i++) if (xs[i] - xs[i - 1] > 60) edges.push((xs[i] + xs[i - 1]) / 2);
  const col = b => edges.filter(e => b.x > e).length;
  for (const b of [...blocks].sort((a, b) => (col(a) - col(b)) || (a.y - b.y))) {
    const flat = norm(b.text);
    if (!flat || isCredit(flat) || isChrome(flat)) continue;
    stream.push({ page, block: b, text: b.text, flat, furniture: isFurniture(flat, b.words) });
  }
}

const seen = new Set();
const arts = [];
let cur = null;
for (const s of stream) {
  const hit = ARTICLES.find(a => !seen.has(a.title) && s.flat.startsWith(norm(a.anchor)));
  if (hit) { seen.add(hit.title); cur = { title: hit.title, page: s.page, blocks: [] }; arts.push(cur); }
  if (cur && !s.furniture) cur.blocks.push(s.block);
}
for (const a of arts) {
  a.body = a.blocks.map(b => b.text).join('\n\n');
  a.words = a.body.split(/\s+/).filter(Boolean).length;
  a.x0 = Math.min(...a.blocks.map(b => b.x)) * SCALE;
  a.x1 = Math.max(...a.blocks.map(b => b.xEnd)) * SCALE;
  delete a.blocks;
}

// ── image inventory ────────────────────────────────────────────────────────
const xml = readFileSync('html/doc.xml', 'utf8');
const byPage = new Map();
xml.split('<page ').slice(1).forEach((p, i) => {
  const imgs = [...p.matchAll(/<image top="(-?\d+)" left="(-?\d+)" width="(\d+)" height="(\d+)" src="([^"]+)"/g)]
    .map(m => ({ top: +m[1], left: +m[2], w: +m[3], h: +m[4], src: m[5] }))
    .filter(im => im.w * im.h >= MIN_AREA)
    .filter(im => Math.max(im.w / im.h, im.h / im.w) <= MAX_ASPECT)
    .filter(im => !(im.w > 850 && im.h > 1200));       // full-page backgrounds
  byPage.set(i + 1, imgs);
});

// ── match ──────────────────────────────────────────────────────────────────
const used = new Set();
const rows = [];
for (const a of arts) {
  if (LIVE.has(a.title) || a.words < KEEP_WORDS) continue;
  const cands = (byPage.get(a.page) ?? [])
    .filter(im => !used.has(im.src))
    .filter(im => im.left + im.w > a.x0 - 120 && im.left < a.x1 + 120)
    .sort((p, q) => q.w * q.h - p.w * p.h);
  const pick = cands[0] ?? null;
  if (pick) used.add(pick.src);
  rows.push({ ...a, image: pick });
}

writeFileSync(path.join(WORK, 'with-images.json'), JSON.stringify(rows, null, 2));

const none = rows.filter(r => !r.image);
for (const r of rows) {
  const i = r.image ? `${r.image.w}x${r.image.h} ${r.image.src}` : '❌ NO IMAGE';
  console.log(`p${String(r.page).padStart(2)} ${String(r.words).padStart(4)}w  ${r.title.slice(0, 44).padEnd(45)} ${i}`);
}
console.log(`\n${rows.length} articles · ${rows.length - none.length} with an image · ${none.length} WITHOUT`);
