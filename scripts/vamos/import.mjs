/**
 * Create one issue's blogPost entries in Contentful.
 *
 * Dry run by default; pass --live to write. Idempotent: an existing entry
 * with the same slug is left alone rather than duplicated, so a partial
 * failure can simply be re-run.
 *
 * Entries are created as drafts. Pass --publish to publish them too — the
 * default is deliberately the reversible one, since an editor reviewing 25
 * machine-extracted articles is cheaper before publication than after.
 * Hero assets are always published: Contentful refuses to publish an entry
 * whose linked asset is still a draft, so leaving them unpublished would
 * just move the work to whoever presses publish.
 *
 * Pass --refresh to also rewrite the body and description of recovered posts
 * (page-image transcriptions, see recover.mjs) that already exist, when the
 * transcription has since changed. Only drafts are touched: once an editor
 * has published a post, it is theirs.
 *
 * The revista entry itself is never modified apart from appending these
 * posts — and any of this edition's posts an interrupted earlier run created
 * but never linked — to its `blogPosts` list. The site does not read that
 * list: an edition's articles are the posts whose own `revista` field points
 * at it (lib/content/edition-navigation.ts), so a post appears in exactly one
 * edition. The list is kept in step for editors working in Contentful.
 */
import { readFileSync } from 'node:fs';
import { basename } from 'node:path';

import { WORK as DIR, REVISTA_ID, KEY } from './issue.mjs';

const SPACE = 'i46buyptg48q';
const ENV = 'master';
const TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN;
const LIVE = process.argv.includes('--live');
const PUBLISH = process.argv.includes('--publish');
const REFRESH = process.argv.includes('--refresh');

if (!TOKEN) { console.error('Missing CONTENTFUL_MANAGEMENT_TOKEN'); process.exit(1); }

const API = `https://api.contentful.com/spaces/${SPACE}/environments/${ENV}`;
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function cma(path, { method = 'GET', body, headers = {}, raw } = {}) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const res = await fetch(path.startsWith('http') ? path : API + path, {
      method,
      headers: { Authorization: `Bearer ${TOKEN}`, ...headers },
      body: raw ?? (body ? JSON.stringify(body) : undefined),
    });
    if (res.status === 429) { await sleep(1500 * (attempt + 1)); continue; }
    const text = await res.text();
    if (!res.ok) throw new Error(`${res.status} ${path}\n${text.slice(0, 400)}`);
    return text ? JSON.parse(text) : null;
  }
  throw new Error(`rate limited: ${path}`);
}

const CT = { 'Content-Type': 'application/vnd.contentful.management.v1+json' };
const mime = f => (f.endsWith('.png') ? 'image/png' : 'image/jpeg');

async function uploadAsset(file, title) {
  const bytes = readFileSync(file);
  const up = await cma(`https://upload.contentful.com/spaces/${SPACE}/uploads`, {
    method: 'POST', raw: bytes,
    headers: { 'Content-Type': 'application/octet-stream' },
  });
  const asset = await cma('/assets', {
    method: 'POST', headers: CT,
    body: { fields: {
      title: { 'en-US': title },
      file: { 'en-US': {
        fileName: basename(file), contentType: mime(file),
        uploadFrom: { sys: { type: 'Link', linkType: 'Upload', id: up.sys.id } },
      } },
    } },
  });
  const id = asset.sys.id;
  await cma(`/assets/${id}/files/en-US/process`, {
    method: 'PUT', headers: { 'X-Contentful-Version': String(asset.sys.version) },
  });
  for (let i = 0; i < 20; i++) {
    await sleep(1000);
    const a = await cma(`/assets/${id}`);
    if (a.fields?.file?.['en-US']?.url) {
      await cma(`/assets/${id}/published`, {
        method: 'PUT', headers: { 'X-Contentful-Version': String(a.sys.version) },
      });
      return id;
    }
  }
  throw new Error(`asset ${id} never finished processing`);
}

// ── existing slugs, so a re-run never duplicates ───────────────────────────
const existing = new Map();
/** Slugs whose existing entry already points at this edition. */
const ours = new Set();
for (let skip = 0; ; skip += 1000) {
  const page = await cma(`/entries?content_type=blogPost&limit=1000&skip=${skip}&select=sys.id,fields.slug,fields.revista`);
  for (const e of page.items) {
    const slug = e.fields?.slug?.['en-US'];
    if (!slug) continue;
    existing.set(slug, e.sys.id);
    if (e.fields.revista?.['en-US']?.sys?.id === REVISTA_ID) ours.add(slug);
  }
  if (skip + page.items.length >= page.total) break;
}
console.log(`${existing.size} blogPost slugs already in ${ENV}`);

const plan = JSON.parse(readFileSync(`${DIR}/plan.json`, 'utf8'));
// A slug that exists already is either ours from an earlier (perhaps
// interrupted) run — skipped, but still linked to the edition below — or a
// post of another edition, which is a real clash and needs a new slug.
const already = plan.filter(p => ours.has(p.slug));
const collisions = plan.filter(p => existing.has(p.slug) && !ours.has(p.slug));
if (already.length) console.log(`${already.length} already created for this edition: ${already.map(c => c.slug).join(', ')}`);
if (collisions.length) console.log(`⚠️  ${collisions.length} slugs belong to OTHER entries, will be skipped: ${collisions.map(c => c.slug).join(', ')}`);

const todo = plan.filter(p => !existing.has(p.slug));

if (REFRESH) {
  for (const p of plan.filter(q => q.recovered && existing.has(q.slug))) {
    const e = await cma(`/entries/${existing.get(p.slug)}`);
    const same = JSON.stringify(e.fields.body?.['en-US']) === JSON.stringify(p.body)
      && e.fields.description?.['en-US'] === p.description;
    if (same) continue;
    if (e.sys.publishedVersion) { console.log(`  refresh skipped, published: ${p.slug}`); continue; }
    if (!LIVE) { console.log(`  would refresh ${p.slug}`); continue; }
    e.fields.body = { 'en-US': p.body };
    e.fields.description = { 'en-US': p.description };
    await cma(`/entries/${e.sys.id}`, {
      method: 'PUT', headers: { ...CT, 'X-Contentful-Version': String(e.sys.version) },
      body: { fields: e.fields },
    });
    console.log(`  refreshed ${p.slug}`);
  }
}
console.log(`${KEY}: ${todo.length} to create as ${PUBLISH ? 'PUBLISHED' : 'drafts'}${LIVE ? '' : '  (dry run — pass --live to write)'}\n`);

if (!LIVE) {
  for (const p of todo) console.log(`  would create ${p.slug}  hero=${p.hero.kind}`);
  const rev = await cma(`/entries/${REVISTA_ID}`);
  const have = new Set((rev.fields.blogPosts?.['en-US'] ?? []).map(l => l.sys.id));
  const unlinked = already.filter(p => !have.has(existing.get(p.slug)));
  for (const p of unlinked) console.log(`  would link existing ${p.slug}`);
  process.exit(0);
}

const created = [];
for (const [i, p] of todo.entries()) {
  process.stdout.write(`[${i + 1}/${todo.length}] ${p.slug} … `);
  try {
    const assetId = p.hero.kind === 'existing-asset'
      ? p.hero.assetId
      : await uploadAsset(p.hero.file, p.title);

    const entry = await cma('/entries', {
      method: 'POST',
      headers: { ...CT, 'X-Contentful-Content-Type': 'blogPost' },
      body: { fields: {
        title: { 'en-US': p.title },
        slug: { 'en-US': p.slug },
        description: { 'en-US': p.description },
        body: { 'en-US': p.body },
        publishDate: { 'en-US': p.publishDate },
        heroImage: { 'en-US': { sys: { type: 'Link', linkType: 'Asset', id: assetId } } },
        revista: { 'en-US': { sys: { type: 'Link', linkType: 'Entry', id: REVISTA_ID } } },
      } },
    });
    if (PUBLISH) {
      await cma(`/entries/${entry.sys.id}/published`, {
        method: 'PUT', headers: { 'X-Contentful-Version': String(entry.sys.version) },
      });
    }
    created.push(entry.sys.id);
    console.log(PUBLISH ? 'ok' : 'ok (draft)');
  } catch (e) {
    console.log(`FAILED\n    ${e.message}`);
  }
}

// ── append to the edition's article list (deduped) ─────────────────────────
// Includes this edition's entries from earlier runs, so a run interrupted
// between creating entries and linking them is repaired by re-running.
const rev = await cma(`/entries/${REVISTA_ID}`);
const cur = rev.fields.blogPosts?.['en-US'] ?? [];
const have = new Set(cur.map(l => l.sys.id));
const toLink = [...already.map(p => existing.get(p.slug)), ...created].filter(id => !have.has(id));
if (toLink.length) {
  const merged = [...cur, ...toLink.map(id => ({ sys: { type: 'Link', linkType: 'Entry', id } }))];
  rev.fields.blogPosts = { 'en-US': merged };
  const updated = await cma(`/entries/${REVISTA_ID}`, {
    method: 'PUT', headers: { ...CT, 'X-Contentful-Version': String(rev.sys.version) },
    body: { fields: rev.fields },
  });
  await cma(`/entries/${REVISTA_ID}/published`, {
    method: 'PUT', headers: { 'X-Contentful-Version': String(updated.sys.version) },
  });
  console.log(`\nrevista blogPosts: ${cur.length} → ${merged.length}`);
}

console.log(`\ncreated ${created.length}/${todo.length} as ${PUBLISH ? 'published entries' : 'drafts'}`);
