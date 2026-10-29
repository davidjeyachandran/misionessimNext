/**
 * Build the import plan for VAMOS Nº 118.
 *
 * Dry-run artefact only — writes plan.json and touches nothing remote.
 * Mirrors the shape scripts/import-cms.ts uses so the same review habits
 * apply: read the plan, then execute it.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

import {
  KEY, WORK as DIR, HTML, REVISTA_ID, COVER_ASSET_ID, COVER_HERO, NO_HERO_SKIP, DROP_ARTICLES, DATE,
} from './issue.mjs';
import { recovered, slugify } from './recovered.mjs';

/**
 * `description` is required on blogPost. Taken from the article's own
 * opening sentence rather than an auto-excerpt — the WP-era imports used
 * truncated excerpts ending in "[…]", recorded as a defect in
 * docs/PROGRESS.md, and those are not reproduced here.
 */
function describe(body) {
  const first = paragraphs(body).find(l => l.length > 60) ?? body;
  // A middle initial is not the end of a sentence — «Al misionero
  // antropólogo Charles H. Kraft se le preguntó…» must not be cut to
  // «Al misionero antropólogo Charles H.»
  const sentences = first.replace(/\s+/g, ' ').trim().split(/(?<!\s[A-ZÁÉÍÓÚÑ]\.)(?<=[.!?])\s+/);
  let out = '';
  for (const s of sentences) {
    if ((out + ' ' + s).trim().length > 160) break;
    out = (out + ' ' + s).trim();
  }
  // A numbered list splits into sentences at every enumerator, so the
  // budget can end on a bare «2.» — «…ora por quienes aún no conocen a
  // Cristo. 2.» Drop a trailing one rather than ship it in the meta.
  return (out || sentences[0].slice(0, 160)).replace(/\s+\d{1,2}\.$/, '');
}

/**
 * A justified opening line can leave one or two words stranded on their own
 * line, which the indent reflow then reads as a paragraph («¡Qué» /
 * «emocionantes son las conferencias misioneras!»). The same break happens
 * a frame at a time, where a definition's opening clause is set in its own
 * frame («La Ventana 10/40 comprende una vasta» / «región de países en
 * donde…») — images.mjs already exempts those openers from the short-frame
 * rule for the same reason. A sentence carrying on into the next paragraph
 * cannot be a paragraph of its own.
 */
const RUN_ON_MAX_WORDS = 8;

/**
 * The word count catches a stranded opener, but not the commoner break:
 * prose set to wrap around a picture changes indent at the wrap, and the
 * reflow reads that as a new paragraph mid-sentence («…agradecen la
 * presencia de» / «profesionales que se presentan como cristianos»). Sep
 * 2026 alone had 28 of them. So a paragraph that ends without terminal
 * punctuation is a run-on too, whatever its length: a real paragraph ends
 * on . ! ? : ; … or a closing quote, and the one after it starts capitalised.
 */
const ENDS_A_PARAGRAPH = /[.!?:;…»”"')\]]$/;

/**
 * The 2010–2013 e-zines repeat the editorial masthead on every page. When
 * the frame after it starts lowercase, images.mjs keeps it as a run-on
 * opener, so it lands inside the article; no issue's furniture regex can
 * reach it there.
 */
const MASTHEAD = /^(Equipo Editorial\b.*|Directora: Cristina Conti|VAMOS, SIM)$/;

function paragraphs(body) {
  const out = [];
  for (const p of body.split('\n').map(t => t.trim()).filter(t => t && !MASTHEAD.test(t))) {
    const prev = out[out.length - 1];
    const runsOn = prev
      && /^[a-záéíóúñü]/.test(p)
      && (prev.split(/\s+/).length <= RUN_ON_MAX_WORDS || !ENDS_A_PARAGRAPH.test(prev));
    if (runsOn) {
      // The break can fall inside a hyphenated word («cada per-» / «sona»).
      out[out.length - 1] = /\p{L}-$/u.test(prev) ? prev.slice(0, -1) + p : `${prev} ${p}`;
    } else out.push(p);
  }
  return out;
}

/** Contentful RichText: one paragraph node per source paragraph. */
const toRichText = body => ({
  nodeType: 'document',
  data: {},
  content: paragraphs(body).map(text => ({
    nodeType: 'paragraph',
    data: {},
    content: [{ nodeType: 'text', value: text, marks: [], data: {} }],
  })),
});

const rows = JSON.parse(readFileSync(`${DIR}/with-images.json`, 'utf8'));
const plan = [];

/**
 * A dropped article comes back when recover.mjs listed it and its page-image
 * transcription passes the text-layer check; it then replaces the spliced
 * extraction wholesale. Without a recover-list.json this is a no-op.
 */
const recoverList = existsSync(`${DIR}/recover-list.json`)
  ? JSON.parse(readFileSync(`${DIR}/recover-list.json`, 'utf8'))
  : [];
const refused = [];
const MIN_WORDS = 150;

for (const row of rows) {
  if (NO_HERO_SKIP.has(row.title)) continue;
  let r = row;
  if (DROP_ARTICLES.has(row.title)) {
    const item = recoverList.find(a => a.title === row.title);
    const rec = item && recovered(KEY, DIR, row.title, item.pages);
    if (!rec) continue;
    if (!rec.ok) { refused.push(`${row.title} (${(rec.found * 100).toFixed(1)}% found)`); continue; }
    // The floor images.mjs applies was measured on the spliced text, which
    // carried the sidebars' words too; the clean transcription must clear it
    // on its own.
    if (rec.words < MIN_WORDS) continue;
    r = { ...row, title: rec.title ?? row.title, body: rec.body, words: rec.words, recovered: true };
  }
  const useCover = COVER_HERO.has(row.title);
  if (!r.image && !useCover) continue;

  plan.push({
    slug: slugify(r.title),
    title: r.title,
    description: describe(r.body),
    page: r.page,
    words: r.words,
    ...(r.recovered ? { recovered: true } : {}),
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
console.log(`${plan.length} posts planned${dupes.length ? ` · ⚠️ duplicate slugs: ${dupes}` : ' · slugs unique'}`
  + ` · ${plan.filter(p => p.recovered).length} recovered from page images`);
if (refused.length) {
  console.log(`⚠️  ${refused.length} transcription(s) refused by the text-layer check — fix and re-run:`);
  for (const t of refused) console.log(`     ${t}`);
}
for (const p of plan) {
  console.log(`\n  ${p.slug}\n    ${p.title}\n    hero: ${p.hero.kind === 'upload' ? p.hero.file.split('/').pop() : 'ISSUE COVER'} · ${p.words}w · ${p.body.content.length} paras`);
  console.log(`    desc: ${p.description}`);
}
