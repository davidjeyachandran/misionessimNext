/**
 * Recovered transcriptions: articles the text layer could not deliver
 * cleanly, read from page images instead (see recover.mjs).
 *
 * One file per article at `scripts/vamos/recovered/<key>/<slug>.txt`, where
 * slug is the article's title in the issue file. Format: a first line
 * `# <title as published>`, then one paragraph per line.
 *
 * A vision transcription can misread or invent, so every file is checked
 * against the PDF's own text layer before it is used: the words are all
 * there, only in the wrong order, so nearly every transcribed word must be
 * found among the words of the article's pages. `build-plan.mjs` refuses a
 * file that fails; `check-recovered.mjs` prints the same verdicts.
 */
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export const RECOVERED = path.join(path.dirname(fileURLToPath(import.meta.url)), 'recovered');

/** Share of transcribed words that must appear on the article's pages. */
const MIN_FOUND = 0.97;

export const slugify = t => t
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .toLowerCase().replace(/[^a-z0-9\s-]/g, ' ')
  .trim().replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 90);

export function parse(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const title = lines[0]?.startsWith('# ') ? lines.shift().slice(2).trim() : null;
  return { title, body: lines.join('\n') };
}

// Hyphenated breaks are rejoined in the transcription but not in the layer,
// so both sides compare on letters only, with a break's halves also offered
// joined.
const tokens = s => s.toLowerCase().normalize('NFC').match(/\p{L}+|\d+/gu) ?? [];

function layerWords(work, pages) {
  const xml = readFileSync(path.join(work, 'all.xml'), 'utf8').split('<page ').slice(1);
  const bag = new Map();
  for (const p of pages) {
    const words = [...(xml[p - 1] ?? '').matchAll(/<word [^>]*>([\s\S]*?)<\/word>/g)].map(m => m[1]);
    const add = t => bag.set(t, (bag.get(t) ?? 0) + 1);
    words.flatMap(tokens).forEach(add);
    for (let i = 0; i + 1 < words.length; i++) {
      if (/\p{L}-$/u.test(words[i])) tokens(words[i].slice(0, -1) + words[i + 1]).forEach(add);
    }
  }
  return bag;
}

export function check(work, pages, body) {
  const bag = layerWords(work, pages);
  const words = tokens(body);
  const missing = [];
  for (const w of words) {
    const n = bag.get(w) ?? 0;
    if (n > 0) bag.set(w, n - 1);
    else missing.push(w);
  }
  const found = words.length ? 1 - missing.length / words.length : 0;
  return { words: words.length, found, ok: words.length > 0 && found >= MIN_FOUND, missing };
}

/** The transcription for an article, with its check result, or null. */
export function recovered(key, work, title, pages) {
  const file = path.join(RECOVERED, key, `${slugify(title)}.txt`);
  if (!existsSync(file)) return null;
  const r = parse(readFileSync(file, 'utf8'));
  return { ...r, file, ...check(work, pages, r.body) };
}
