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

import { fileURLToPath } from 'node:url';
import path from 'node:path';

/** Derived artefacts live outside the repo history — see .gitignore. */
const WORK = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../export/vamos-118');


const HEADLINE_MIN_HEIGHT = 22;   // body runs 16.4, headlines 26-42
const RUNNING_HEADER_Y = 55;      // page furniture at the top of every page
const PAGE_HEIGHT = 841.89;

const xml = readFileSync(path.join(WORK, 'all.xml'), 'utf8');
const pageChunks = xml.split('<page ').slice(1);

const pages = pageChunks.map((chunk, i) => {
  const blocks = [...chunk.matchAll(/<block [^>]*>([\s\S]*?)<\/block>/g)]
    .map(([, inner]) => {
      const words = [...inner.matchAll(
        /<word xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="([\d.]+)">([\s\S]*?)<\/word>/g,
      )].map(m => ({ x: +m[1], y: +m[2], xEnd: +m[3], h: +m[4] - +m[2], t: decode(m[5]) }));
      if (!words.length) return null;
      // Paragraphs are marked by a first-line indent, so keep each line's
      // left edge and reflow wrapped lines back into real paragraphs.
      const rawLines = [...inner.matchAll(/<line xMin="([\d.]+)"[^>]*>([\s\S]*?)<\/line>/g)].map(m => ({
        x: +m[1],
        text: [...m[2].matchAll(/<word [^>]*>([\s\S]*?)<\/word>/g)].map(w => decode(w[1])).join(' '),
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
      const lines = paras;
      return {
        height: words.reduce((s, w) => s + w.h, 0) / words.length,
        x: Math.min(...words.map(w => w.x)),
        xEnd: Math.max(...words.map(w => w.xEnd)),
        y: Math.min(...words.map(w => w.y)),
        words: words.length,
        text: lines.join('\n'),
      };
    })
    .filter(Boolean)
    .filter(b => b.y > RUNNING_HEADER_Y && b.y < PAGE_HEIGHT - 20);

  return { page: i + 1, blocks };
});

function decode(s) {
  return s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"').replace(/&apos;/g, "'");
}

writeFileSync(path.join(WORK, 'blocks.json'), JSON.stringify(pages, null, 2));

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
