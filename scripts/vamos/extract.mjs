/**
 * Deterministic VAMOS extractor.
 *
 * The magazine is an InDesign export, so `pdftotext -bbox-layout` already
 * resolves each text frame into a <block> with correct internal reading
 * order. That removes the need for the vision pass sim-blog's
 * import-vamos-pdf.mjs uses — headlines are simply blocks whose mean word
 * height is well above body size, and column order falls out of xMin.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { WORK, KEY } from './issue.mjs';

const HEADLINE_MIN_HEIGHT = 22;   // body runs 16.4, headlines 26-42
const RUNNING_HEADER_Y = 55;      // page furniture at the top of every page

const xml = readFileSync(path.join(WORK, 'all.xml'), 'utf8');
const pageChunks = xml.split('<page ').slice(1);
/** Trim depends on the trim size, so read it rather than assume A4. */
const PAGE_HEIGHT = +(/height="([\d.]+)"/.exec(pageChunks[0])?.[1] ?? 841.89);

/**
 * A <block> is one text frame, but pdftotext will happily emit a frame that
 * spans two typeset columns. It shreds the prose two different ways at
 * once: some lines alternate left column / right column, and some single
 * <line>s carry the words of both columns run together. Read in order, a
 * sentence from one column continues into the other.
 *
 * Both are the same underlying fact — one frame, two columns — so both are
 * fixed the same way, below the line: bin the frame's words by x, look for
 * a band no word crosses, and if one exists, deal the words into a frame
 * per column and rebuild the lines from their y positions.
 */
/**
 * A gutter can be tight — 7pt in some of these layouts, barely wider than
 * the word spacing of justified text — so width alone cannot carry the
 * decision. What does carry it is that a real column holds a real share of
 * the frame: both guards have to pass before a frame is cut.
 */
const GUTTER_MIN = 5;         // pt — an uncovered band this wide or wider
const MIN_COLUMN_LINES = 4;   // fewer than this is a caption, not a column
const MIN_COLUMN_SHARE = 0.2; // of the frame's words, so an indent cannot pass
const LINE_TOL = 3;           // pt — words this close in y are one line

/** Bands of x that no word of the frame covers. */
function guttersOf(words) {
  const lo = Math.floor(Math.min(...words.map(w => w.x)));
  const hi = Math.ceil(Math.max(...words.map(w => w.xEnd)));
  const covered = new Uint8Array(hi - lo + 1);
  for (const w of words) {
    for (let i = Math.floor(w.x) - lo; i <= Math.ceil(w.xEnd) - lo; i++) covered[i] = 1;
  }
  const gutters = [];
  let run = 0;
  for (let i = 0; i <= covered.length; i++) {
    if (covered[i]) {
      if (run >= GUTTER_MIN) gutters.push(lo + i - run / 2);
      run = 0;
    } else run++;
  }
  return gutters;
}

/** Words sharing a y, left to right — the line as it was actually set. */
function linesOf(words) {
  const rows = [];
  for (const w of [...words].sort((a, b) => a.y - b.y || a.x - b.x)) {
    const last = rows[rows.length - 1];
    if (last && Math.abs(w.y - last.y) <= LINE_TOL) last.words.push(w);
    else rows.push({ y: w.y, words: [w] });
  }
  for (const r of rows) r.words.sort((a, b) => a.x - b.x);
  return rows;
}

function columnsOf(words) {
  const gutters = guttersOf(words);
  if (!gutters.length) return null;
  const groups = gutters.map(() => []).concat([[]]);
  for (const w of words) groups[gutters.filter(g => w.x > g).length].push(w);
  const kept = groups.filter(g => g.length >= words.length * MIN_COLUMN_SHARE);
  if (kept.length < 2 || kept.length !== groups.filter(g => g.length).length) return null;
  const cols = kept.map(linesOf);
  return cols.every(c => c.length >= MIN_COLUMN_LINES) ? cols : null;
}

/** Turn one frame's lines into the shape the rest of the pipeline reads. */
function frame(lines) {
  const words = lines.flatMap(l => l.words);
  if (!words.length) return null;
  // Paragraphs are marked by a first-line indent, so keep each line's
  // left edge and reflow wrapped lines back into real paragraphs.
  const rawLines = lines.map(l => ({
    x: Math.min(...l.words.map(w => w.x)),
    text: l.words.map(w => w.t).join(' '),
  }));
  // The indent rule only holds for left-aligned text. Centred and
  // ragged frames give every line a different left edge, which would
  // turn each line into its own paragraph, so those are joined whole.
  const tally = new Map();
  for (const l of rawLines) {
    const k = Math.round(l.x);
    tally.set(k, (tally.get(k) ?? 0) + 1);
  }
  const [modalX, modalCount] = [...tally.entries()].sort((a, b) => b[1] - a[1])[0];
  const leftAligned = modalCount / rawLines.length >= 0.6;

  let paras;
  if (!leftAligned) {
    paras = [rawLines.map(l => l.text).join(' ')];
  } else {
    paras = [];
    for (const l of rawLines) {
      if (!paras.length || l.x > modalX + 4) paras.push(l.text);
      else paras[paras.length - 1] += ' ' + l.text;
    }
  }
  return {
    height: words.reduce((s, w) => s + w.h, 0) / words.length,
    x: Math.min(...words.map(w => w.x)),
    xEnd: Math.max(...words.map(w => w.xEnd)),
    y: Math.min(...words.map(w => w.y)),
    words: words.length,
    text: paras.join('\n'),
  };
}

let split = 0;
const pages = pageChunks.map((chunk, i) => {
  const blocks = [...chunk.matchAll(/<block [^>]*>([\s\S]*?)<\/block>/g)]
    .flatMap(([, inner]) => {
      const words = [...inner.matchAll(
        /<word xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="([\d.]+)">([\s\S]*?)<\/word>/g,
      )].map(w => ({ x: +w[1], y: +w[2], xEnd: +w[3], h: +w[4] - +w[2], t: decode(w[5]) }));
      if (!words.length) return [];

      const cols = columnsOf(words);
      if (!cols) return [frame(linesOf(words))];
      split++;
      return cols.map(frame);
    })
    .filter(Boolean)
    .filter(b => b.y > RUNNING_HEADER_Y && b.y < PAGE_HEIGHT - 20);

  return { page: i + 1, blocks };
});

/**
 * The bullet in these layouts is a symbol-font glyph that lands in the text
 * layer as U+0086, a C1 control character: invisible everywhere downstream,
 * so a bulleted list imports as run-together prose and an anchor written on
 * its first item never matches. Other C1s carry no meaning and go.
 */
function decode(s) {
  return s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"').replace(/&apos;/g, "'")
          .replace(/\u0086/g, '\u2022').replace(/[\u0080-\u009f]/g, '');
}

writeFileSync(path.join(WORK, 'blocks.json'), JSON.stringify(pages, null, 2));

console.log(`${KEY}: ${pages.length} pages, trim height ${PAGE_HEIGHT}, ${split} multi-column frames regrouped`);

// Report: every candidate headline, in page order.
for (const { page, blocks } of pages) {
  const heads = blocks.filter(b => b.height >= HEADLINE_MIN_HEIGHT);
  const bodyWords = blocks.filter(b => b.height < HEADLINE_MIN_HEIGHT)
                          .reduce((s, b) => s + b.words, 0);
  if (!heads.length && !bodyWords) continue;
  console.log(`\n── p${page}  (${bodyWords} body words)`);
  for (const h of heads) {
    console.log(`   [${h.height.toFixed(0)}pt x=${Math.round(h.x)}] ${h.text.replace(/\n/g, ' ')}`);
  }
}
