/**
 * Score every hero candidate so cut-outs, blank frames and flat graphics
 * lose to real photographs.
 *
 *   saturation  — a blank/greyscale frame scores ~0; photos score 0.15+
 *   lumSpread   — a subject cut out onto stark white or black has an
 *                 unusually wide luminance spread; real photos sit lower
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

import { fileURLToPath } from 'node:url';
import path from 'node:path';

/** Derived artefacts live outside the repo history — see .gitignore. */
const WORK = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../export/vamos-118');


const HTML = path.join(WORK, 'html');
const MIN_SATURATION = 0.06;   // below this it is greyscale furniture
const FLAT_LUM = 0.30;         // above this it is likely a cut-out

const measure = src => {
  const out = execFileSync('magick',
    [`${HTML}/${src}`, '-colorspace', 'sRGB', '-resize', '64x64!', '-colorspace', 'HSL',
     '-format', '%[fx:mean.g] %[fx:standard_deviation.b]', 'info:'],
    { encoding: 'utf8' });
  const [sat, lum] = out.trim().split(/\s+/).map(Number);
  return { sat, lum };
};

const rows = JSON.parse(readFileSync(path.join(WORK, 'with-images.json'), 'utf8'));
const xml = readFileSync(`${HTML}/doc.xml`, 'utf8');

const byPage = new Map();
xml.split('<page ').slice(1).forEach((p, i) => {
  byPage.set(i + 1, [...p.matchAll(/<image top="(-?\d+)" left="(-?\d+)" width="(\d+)" height="(\d+)" src="([^"]+)"/g)]
    .map(m => ({ top: +m[1], left: +m[2], w: +m[3], h: +m[4], src: m[5] }))
    .filter(im => im.w * im.h >= 20000)
    .filter(im => Math.max(im.w / im.h, im.h / im.w) <= 2.5)
    .filter(im => !(im.w > 850 && im.h > 1200)));
});

/**
 * Where the automatic pick is a logo or a cut-out on a stark background,
 * the image is named outright. Keyed by article title.
 */
const OVERRIDE = {
  'Un llamado macedónico para Latinoamérica': 'doc-2_4.jpg',   // the issue cover, not the SIM logo
  'El llamado macedonio sigue llamando':      'doc-4_4.jpg',   // photo, not the cut-out figure
};

/** Logos and wordmarks: small, extremely saturated, very few tones. */
const isLogo = (im, m) => im.w * im.h < 40000 && m.sat > 0.40 && m.lum > 0.35;

const cache = new Map();
const metrics = src => {
  if (!cache.has(src)) { try { cache.set(src, measure(src)); } catch { cache.set(src, { sat: 0, lum: 1 }); } }
  return cache.get(src);
};

const used = new Set();
for (const r of rows) {
  const cands = (byPage.get(r.page) ?? [])
    .filter(im => !used.has(im.src))
    .filter(im => im.left + im.w > r.x0 - 120 && im.left < r.x1 + 120)
    .map(im => {
      const m = metrics(im.src);
      const area = Math.min(1, (im.w * im.h) / 160000);
      const score = area * 0.5 + m.sat - Math.max(0, m.lum - FLAT_LUM) * 2;
      return { ...im, ...m, score };
    })
    .filter(im => im.sat >= MIN_SATURATION)
    .sort((a, b) => b.score - a.score);

  const forced = OVERRIDE[r.title];
  if (forced) {
    const f = (byPage.get(r.page) ?? []).find(im => im.src === forced);
    r.image = f ? { ...f, ...metrics(f.src), score: 99 } : cands[0] ?? null;
  } else {
    r.image = cands.filter(im => !isLogo(im, im))[0] ?? null;
  }
  if (r.image) used.add(r.image.src);
}

writeFileSync(path.join(WORK, 'with-images.json'), JSON.stringify(rows, null, 2));

for (const r of rows) {
  const i = r.image
    ? `${String(r.image.w).padStart(3)}x${String(r.image.h).padEnd(3)} sat=${r.image.sat.toFixed(2)} ${r.image.src}`
    : '❌ NO IMAGE';
  console.log(`p${String(r.page).padStart(2)} ${String(r.words).padStart(4)}w ${r.title.slice(0, 42).padEnd(43)} ${i}`);
}
const none = rows.filter(r => !r.image);
console.log(`\n${rows.length} articles · ${rows.length - none.length} with a photo · ${none.length} WITHOUT`);
