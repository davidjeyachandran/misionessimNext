/**
 * Build the import plan for VAMOS Nº 118.
 *
 * Dry-run artefact only — writes plan.json and touches nothing remote.
 * Mirrors the shape scripts/import-cms.ts uses so the same review habits
 * apply: read the plan, then execute it.
 */
import { readFileSync, writeFileSync } from 'node:fs';

import {
  WORK as DIR, HTML, REVISTA_ID, COVER_ASSET_ID, COVER_HERO, NO_HERO_SKIP, DATE,
} from './issue.mjs';

const slugify = t => t
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .toLowerCase().replace(/[^a-z0-9\s-]/g, ' ')
  .trim().replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 90);

/**
 * `description` is required on blogPost. Taken from the article's own
 * opening sentence rather than an auto-excerpt — the WP-era imports used
 * truncated excerpts ending in "[…]", recorded as a defect in
 * docs/PROGRESS.md, and those are not reproduced here.
 */
function describe(body) {
  const first = body.split('\n').find(l => l.trim().length > 60) ?? body;
  const sentences = first.replace(/\s+/g, ' ').trim().split(/(?<=[.!?])\s+/);
  let out = '';
  for (const s of sentences) {
    if ((out + ' ' + s).trim().length > 160) break;
    out = (out + ' ' + s).trim();
  }
  return out || sentences[0].slice(0, 160);
}

/** Contentful RichText: one paragraph node per source paragraph. */
const toRichText = body => ({
  nodeType: 'document',
  data: {},
  content: body.split('\n').map(p => p.trim()).filter(Boolean).map(text => ({
    nodeType: 'paragraph',
    data: {},
    content: [{ nodeType: 'text', value: text, marks: [], data: {} }],
  })),
});

const rows = JSON.parse(readFileSync(`${DIR}/with-images.json`, 'utf8'));
const plan = [];

for (const r of rows) {
  if (NO_HERO_SKIP.has(r.title)) continue;
  const useCover = COVER_HERO.has(r.title);
  if (!r.image && !useCover) continue;

  plan.push({
    slug: slugify(r.title),
    title: r.title,
    description: describe(r.body),
    page: r.page,
    words: r.words,
    // All posts in an issue share its date; page order is kept in the
    // minute field so the feed reads in magazine order.
    publishDate: `${DATE}T00:${String(Math.min(59, r.page)).padStart(2, '0')}:00.000Z`,
    hero: useCover
      ? { kind: 'existing-asset', assetId: COVER_ASSET_ID }
      : { kind: 'upload', file: `${HTML}/${r.image.src}` },
    revistaId: REVISTA_ID,
    body: toRichText(r.body),
  });
}

writeFileSync(`${DIR}/plan.json`, JSON.stringify(plan, null, 2));

const dupes = plan.map(p => p.slug).filter((s, i, a) => a.indexOf(s) !== i);
console.log(`${plan.length} posts planned${dupes.length ? ` · ⚠️ duplicate slugs: ${dupes}` : ' · slugs unique'}`);
for (const p of plan) {
  console.log(`\n  ${p.slug}\n    ${p.title}\n    hero: ${p.hero.kind === 'upload' ? p.hero.file.split('/').pop() : 'ISSUE COVER'} · ${p.words}w · ${p.body.content.length} paras`);
  console.log(`    desc: ${p.description}`);
}
