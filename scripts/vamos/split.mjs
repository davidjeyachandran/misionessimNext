/**
 * Split the PDF text layer into articles at the manifest's anchors.
 *
 * Blocks are walked in reading order; a block whose text begins with an
 * anchor opens that article, and everything after it accumulates until the
 * next anchor. Anchors that fail to match are reported loudly — a silent
 * miss would merge two articles without any visible symptom.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { ARTICLES, SKIP_PAGES, LIVE } from './manifest.mjs';

import { fileURLToPath } from 'node:url';
import path from 'node:path';

/** Derived artefacts live outside the repo history — see .gitignore. */
const WORK = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../export/vamos-118');


const DIR = WORK;
// Leading quote marks vary (straight, curly) and must not defeat an anchor.
const norm = s => s.replace(/\s+/g, ' ').replace(/^["“”'‘’¡\s]+/, '').trim();

const isCredit = t => /^(pexels|unsplash|foto|photo)\s*[:.]/i.test(t);
const isChrome = t => /^(¡?Ahora nos toca a nosotros!?|EQUIPO VAMOS|Pasión latina por el mundo|En la portada)$/i.test(t.trim());

const pages = JSON.parse(readFileSync(`${DIR}/blocks.json`, 'utf8'));

// Reading order: bucket into columns using gaps derived per page.
const stream = [];
for (const { page, blocks } of pages) {
  if (SKIP_PAGES.has(page)) continue;
  const xs = [...new Set(blocks.map(b => Math.round(b.x)))].sort((a, z) => a - z);
  const edges = [];
  for (let i = 1; i < xs.length; i++) if (xs[i] - xs[i - 1] > 60) edges.push((xs[i] + xs[i - 1]) / 2);
  const col = b => edges.filter(e => b.x > e).length;
  const ordered = [...blocks].sort((a, b) => (col(a) - col(b)) || (a.y - b.y));
  for (const b of ordered) {
    const flat = norm(b.text);
    if (!flat || isCredit(flat) || isChrome(flat)) continue;
    stream.push({ page, text: b.text, flat });
  }
}

const found = new Map();
let current = null;
const out = [];

for (const blk of stream) {
  const hit = ARTICLES.find(a => !found.has(a.title) && blk.flat.startsWith(norm(a.anchor)));
  if (hit) {
    found.set(hit.title, blk.page);
    current = { title: hit.title, page: blk.page, parts: [] };
    out.push(current);
  }
  if (current) current.parts.push(blk.text);
}

for (const a of out) {
  a.body = a.parts.join('\n\n');
  a.words = a.body.split(/\s+/).filter(Boolean).length;
  delete a.parts;
}

const missing = ARTICLES.filter(a => !found.has(a.title));
if (missing.length) {
  console.log(`⚠️  ${missing.length} anchors did NOT match — these articles would be merged into their predecessor:`);
  for (const m of missing) console.log(`     ${m.title}\n       anchor: "${m.anchor}"`);
  console.log('');
}

writeFileSync(`${DIR}/split.json`, JSON.stringify(out, null, 2));

const KEEP = 150;
for (const a of out) {
  const v = LIVE.has(a.title) ? 'SKIP (live)' : a.words >= KEEP ? 'KEEP' : 'drop';
  console.log(`${v.padEnd(11)} p${String(a.page).padStart(2)} ${String(a.words).padStart(4)}w  ${a.title.slice(0, 64)}`);
}
const keep = out.filter(a => !LIVE.has(a.title) && a.words >= KEEP);
console.log(`\nmatched ${out.length}/${ARTICLES.length} · ${keep.length} to import · ${out.filter(a=>LIVE.has(a.title)).length} live · ${out.length - keep.length - out.filter(a=>LIVE.has(a.title)).length} below ${KEEP}w`);
