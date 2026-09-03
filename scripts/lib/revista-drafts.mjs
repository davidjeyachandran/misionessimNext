/**
 * Shared CMA access for the progressive publication of VAMOS drafts.
 *
 * `scripts/vamos/import.mjs` creates each issue's articles as drafts so an
 * editor can review 25 machine-extracted posts before they are public. This
 * module is the other end of that: it finds what is still waiting and gives
 * the publish script a single edition's worth of it.
 *
 * Drafts are entries with no `sys.publishedAt`. Archived entries also lack
 * one — `scripts/archive-duplicate-posts.ts` leaves 38 of them — so every
 * query filters archived out. An archived duplicate must never be revived
 * by a publish run.
 */
const SPACE = "i46buyptg48q";
const ENV = "master";

const API = `https://api.contentful.com/spaces/${SPACE}/environments/${ENV}`;
const CT = { "Content-Type": "application/vnd.contentful.management.v1+json" };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export function token() {
  const t = process.env.CONTENTFUL_MANAGEMENT_TOKEN;
  if (!t) {
    console.error("Missing CONTENTFUL_MANAGEMENT_TOKEN (run via yarn, which loads .env.local)");
    process.exit(1);
  }
  return t;
}

export async function cma(path, { method = "GET", body, headers = {} } = {}) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const res = await fetch(path.startsWith("http") ? path : API + path, {
      method,
      headers: { Authorization: `Bearer ${token()}`, ...headers },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (res.status === 429) {
      await sleep(1500 * (attempt + 1));
      continue;
    }
    const text = await res.text();
    if (!res.ok) throw new Error(`${res.status} ${method} ${path}\n${text.slice(0, 400)}`);
    return text ? JSON.parse(text) : null;
  }
  throw new Error(`rate limited: ${path}`);
}

export { CT, sleep };

/** Every page of a CMA collection query. */
export async function all(query) {
  const out = [];
  for (let skip = 0; ; skip += 200) {
    const page = await cma(`${query}&limit=200&skip=${skip}`);
    out.push(...page.items);
    if (skip + 200 >= page.total) return out;
  }
}

const f = (entry, name) => entry.fields?.[name]?.["en-US"];

export const slugOf = (entry) => f(entry, "slug");
export const titleOf = (entry) => f(entry, "title");
export const dateOf = (entry) => f(entry, "fecha") ?? f(entry, "publishDate") ?? "";
export const revistaIdOf = (post) => f(post, "revista")?.sys?.id ?? null;
export const heroIdOf = (post) => f(post, "heroImage")?.sys?.id ?? null;

export const draftPosts = () =>
  all(
    "/entries?content_type=blogPost&sys.publishedAt%5Bexists%5D=false&sys.archivedAt%5Bexists%5D=false",
  );

export const publishedPosts = () =>
  all("/entries?content_type=blogPost&sys.publishedAt%5Bexists%5D=true");

export const revistas = () => all("/entries?content_type=revista");

/**
 * Editions holding at least one draft, newest first.
 *
 * Posts with no `revista` link land under a synthetic `(sin revista)` row
 * rather than being dropped, so nothing waiting to be published is invisible
 * in the report.
 */
export function groupDraftsByRevista(drafts, editions, published = []) {
  const byId = new Map(editions.map((r) => [r.sys.id, r]));
  const publishedCount = new Map();
  for (const post of published) {
    const id = revistaIdOf(post) ?? "(none)";
    publishedCount.set(id, (publishedCount.get(id) ?? 0) + 1);
  }

  const groups = new Map();
  for (const post of drafts) {
    const id = revistaIdOf(post) ?? "(none)";
    if (!groups.has(id)) groups.set(id, []);
    groups.get(id).push(post);
  }

  return [...groups]
    .map(([id, posts]) => {
      const edition = byId.get(id);
      posts.sort((a, b) => String(dateOf(a)).localeCompare(String(dateOf(b))));
      return {
        id,
        slug: edition ? slugOf(edition) : "(sin revista)",
        title: edition ? titleOf(edition).trim() : "— posts with no revista link —",
        fecha: edition ? String(dateOf(edition)).slice(0, 7) : "",
        drafts: posts,
        published: publishedCount.get(id) ?? 0,
      };
    })
    .sort((a, b) => b.fecha.localeCompare(a.fecha));
}

/**
 * Resolve an edition by slug. Older revistas carry a leading "/" in their
 * slug (`/fondos-misioneros-2022`), so both forms are accepted, as in
 * `scripts/connect-posts-to-revistas.ts`.
 */
export function findRevista(editions, wanted) {
  const want = wanted.replace(/^\//, "");
  return (
    editions.find((r) => slugOf(r)?.replace(/^\//, "") === want) ??
    editions.find((r) => slugOf(r) === wanted) ??
    null
  );
}

export function arg(name) {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : null;
}
