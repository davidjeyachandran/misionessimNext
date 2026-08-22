/**
 * Phase 7b — inventory every `/wp-content/uploads/` URL on the live WordPress
 * site and resolve each one to a destination on the new Next.js site.
 *
 * Why this exists separately from `build-url-inventory.ts`: that script crawls
 * the Yoast sitemaps, which by design list only navigable pages. Uploaded
 * media (PDFs, images, Office docs) appears in NO sitemap, so those URLs were
 * invisible to the Phase 0 inventory — yet they carry real inbound links
 * (shared magazine PDFs above all). With WordPress being decommissioned,
 * anything not redirected here becomes a hard 404 at cutover.
 *
 * Resolution rules, in priority order:
 *   1. VAMOS magazine PDFs -> the edition, identified here as
 *      `/revistavamos/<slug>/`. The filename encodes theme + month + year
 *      (`judaismovamosago18.pdf`), which resolves to an edition by publication
 *      month. This map names the EDITION, not the final redirect target:
 *      build-legacy-redirects.ts turns it into that edition's first-party PDF
 *      path (`/revistavamos/<slug>/<file>.pdf`), so a URL that used to open a
 *      PDF still opens one. Either way the raw Contentful asset URL is never
 *      what the visitor sees, and link equity stays on our domain.
 *   2. Everything else -> the Contentful asset carrying the same filename.
 *      The import preserved filenames, so this is a mechanical join. WordPress
 *      re-upload suffixes (`-1`, `_0`) are normalised away, since those are
 *      duplicate uploads of a file that survived migration exactly once.
 *   3. Unresolved -> reported for a human decision, never silently dropped.
 *
 * Images are inventoried but NOT emitted as 1:1 redirects. WordPress serves
 * generated size variants (`-300x200.jpg`, `-scaled.jpg`) that exist as live
 * URLs but appear nowhere in the media API, so the image URL space cannot be
 * enumerated. Images need a pattern rule; see docs/media-redirect-review.md.
 *
 * Re-runnable: `yarn build:media-map`. Set WP_USER + WP_APP_PASSWORD to also
 * pull unattached/private media (~132 items the anonymous API omits).
 */
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SITE = "https://misionessim.org";
const JSON_OUT = path.join(process.cwd(), "data", "media-redirect-map.json");
const DOC_OUT = path.join(process.cwd(), "docs", "media-redirect-review.md");

const SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
const CDA_TOKEN = process.env.CONTENTFUL_ACCESS_TOKEN;

type Bucket =
  | "vamos-pdf" // -> /revistavamos/<slug>/
  | "contentful-asset" // -> assets.ctfassets.net/... (filename join)
  | "unresolved-doc" // PDF/Office doc with no destination yet — needs a call
  | "image" // pattern rule, never 1:1
  | "junk"; // DELETE-prefixed, logs, obvious debris

interface MediaEntry {
  path: string;
  fileName: string;
  mime: string;
  bucket: Bucket;
  destination?: string;
  /** How the destination was derived, for auditability. */
  via?: string;
}

/** WordPress mangles Spanish month names in several ways across 15 years of
 * uploads; accept both the 3-letter and full forms. */
const MONTHS: Record<string, number> = {
  ene: 1, enero: 1,
  feb: 2, febrero: 2,
  mar: 3, marzo: 3,
  abr: 4, abril: 4,
  may: 5, mayo: 5,
  jun: 6, junio: 6,
  jul: 7, julio: 7,
  ago: 8, agosto: 8,
  sep: 9, sept: 9, septiembre: 9,
  oct: 10, octubre: 10,
  nov: 11, noviembre: 11,
  dic: 12, diciembre: 12,
};

const MONTH_RE = new RegExp(
  `(${Object.keys(MONTHS).sort((a, b) => b.length - a.length).join("|")})\\.?(\\d{2,4})`,
  "i",
);

/** Collapse a filename to a comparison key: drop the extension, WordPress's
 * generated size variant, its duplicate-upload suffix, and all punctuation. */
export function normalizeFileName(name: string): string {
  return decodeURIComponent(name)
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/, "")
    .replace(/-\d+x\d+$/, "")
    .replace(/[-_]scaled$/, "")
    .replace(/[-_]\d{1,2}$/, "")
    .replace(/[^a-z0-9]/g, "");
}

/** Parse the month/year an old VAMOS filename encodes. Two-digit years are
 * 20xx — the magazine started in 2010, so there is no 19xx ambiguity. */
export function parseVamosDate(
  fileName: string,
): { year: number; month: number } | null {
  if (!/vamos/i.test(fileName)) return null;
  const m = MONTH_RE.exec(fileName);
  if (!m) {
    // A few early issues use a bare year: `vamosoct2010.pdf` is caught above,
    // but `vamos2011.pdf` style names carry no month and cannot be placed.
    return null;
  }
  let year = Number(m[2]);
  if (year < 100) year += 2000;
  return { year, month: MONTHS[m[1].toLowerCase()] };
}

function isJunk(fileName: string): boolean {
  return (
    /^DELETE-/i.test(fileName) ||
    /^log_file_/i.test(fileName) ||
    /\.txt$/i.test(fileName)
  );
}

async function fetchWpMedia(): Promise<
  Array<{ source_url: string; mime_type: string }>
> {
  const headers: Record<string, string> = {
    "user-agent": "misionessim-migration-bot/1.0",
  };
  const user = process.env.WP_USER;
  const pass = process.env.WP_APP_PASSWORD;
  if (user && pass) {
    headers.Authorization =
      "Basic " + Buffer.from(`${user}:${pass}`).toString("base64");
    console.log("Using authenticated WP requests (includes unattached media).");
  } else {
    console.log(
      "No WP_USER/WP_APP_PASSWORD set — unattached/private media will be missing.",
    );
  }

  const all: Array<{ source_url: string; mime_type: string }> = [];
  for (let page = 1; page <= 30; page++) {
    const res = await fetch(
      `${SITE}/wp-json/wp/v2/media?per_page=100&page=${page}&_fields=source_url,mime_type`,
      { headers },
    );
    if (!res.ok) break;
    const batch = (await res.json()) as Array<{
      source_url: string;
      mime_type: string;
    }>;
    if (!batch.length) break;
    all.push(...batch);
  }
  return all;
}

async function fetchContentfulAssets(): Promise<Map<string, string>> {
  if (!SPACE_ID || !CDA_TOKEN) {
    throw new Error(
      "CONTENTFUL_SPACE_ID and CONTENTFUL_ACCESS_TOKEN must be set " +
        "(run via `yarn build:media-map`, which loads .env.local).",
    );
  }
  const byName = new Map<string, string>();
  for (let skip = 0; ; skip += 1000) {
    const res = await fetch(
      `https://cdn.contentful.com/spaces/${SPACE_ID}/environments/master/assets?limit=1000&skip=${skip}`,
      { headers: { Authorization: `Bearer ${CDA_TOKEN}` } },
    );
    if (!res.ok) throw new Error(`Contentful assets: ${res.status}`);
    const json = (await res.json()) as {
      total: number;
      items: Array<{ fields?: { file?: { fileName?: string; url?: string } } }>;
    };
    for (const item of json.items) {
      const file = item.fields?.file;
      if (!file?.fileName || !file.url) continue;
      const key = normalizeFileName(file.fileName);
      // First write wins: assets are returned newest-first, and where a file
      // was re-uploaded we want the surviving canonical one.
      if (!byName.has(key)) byName.set(key, `https:${file.url}`);
    }
    if (skip + 1000 >= json.total) break;
  }
  return byName;
}

async function fetchRevistas(): Promise<
  Map<string, { slug: string; title: string }>
> {
  const query = `{
    revistaCollection(order: fecha_DESC, limit: 200) {
      items { slug title fecha }
    }
  }`;
  const res = await fetch(
    `https://graphql.contentful.com/content/v1/spaces/${SPACE_ID}/environments/master`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${CDA_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    },
  );
  const json = (await res.json()) as {
    data: {
      revistaCollection: {
        items: Array<{ slug: string; title: string; fecha: string }>;
      };
    };
  };
  const byMonth = new Map<string, { slug: string; title: string }>();
  for (const r of json.data.revistaCollection.items) {
    if (!r.fecha) continue;
    const d = new Date(r.fecha);
    // Mirrors normalizeRevistaSlug() in lib/contentful.ts: the CMS slug may
    // carry a leading slash from the Drupal-era import.
    const slug = r.slug.replace(/^\/+/, "").replace(/\/+$/, "");
    byMonth.set(`${d.getUTCFullYear()}-${d.getUTCMonth() + 1}`, {
      slug,
      title: r.title,
    });
  }
  return byMonth;
}

async function main() {
  console.log("Fetching WordPress media library ...");
  const media = await fetchWpMedia();
  console.log(`  -> ${media.length} media items`);

  console.log("Fetching Contentful assets ...");
  const assetsByName = await fetchContentfulAssets();
  console.log(`  -> ${assetsByName.size} assets`);

  console.log("Fetching revista editions ...");
  const revistasByMonth = await fetchRevistas();
  console.log(`  -> ${revistasByMonth.size} editions`);

  const entries: MediaEntry[] = [];

  for (const item of media) {
    const urlPath = new URL(item.source_url).pathname;
    const fileName = decodeURIComponent(urlPath.split("/").pop() ?? "");
    const base: Omit<MediaEntry, "bucket"> = {
      path: urlPath,
      fileName,
      mime: item.mime_type,
    };

    if (isJunk(fileName)) {
      entries.push({ ...base, bucket: "junk" });
      continue;
    }

    if (item.mime_type.startsWith("image/")) {
      entries.push({ ...base, bucket: "image" });
      continue;
    }

    // Rule 1 — VAMOS issue PDFs resolve to the edition page.
    const vamos = parseVamosDate(fileName);
    if (vamos) {
      const hit = revistasByMonth.get(`${vamos.year}-${vamos.month}`);
      if (hit) {
        entries.push({
          ...base,
          bucket: "vamos-pdf",
          destination: `/revistavamos/${hit.slug}/`,
          via: `month ${vamos.year}-${String(vamos.month).padStart(2, "0")} -> "${hit.title}"`,
        });
        continue;
      }
    }

    // Rule 2 — filename join onto the migrated Contentful asset.
    const asset = assetsByName.get(normalizeFileName(fileName));
    if (asset) {
      entries.push({
        ...base,
        bucket: "contentful-asset",
        destination: asset,
        via: "filename join",
      });
      continue;
    }

    entries.push({ ...base, bucket: "unresolved-doc" });
  }

  entries.sort((a, b) => a.path.localeCompare(b.path));

  const counts = entries.reduce<Record<string, number>>((acc, e) => {
    acc[e.bucket] = (acc[e.bucket] ?? 0) + 1;
    return acc;
  }, {});

  await mkdir(path.dirname(JSON_OUT), { recursive: true });
  await writeFile(
    JSON_OUT,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        source: SITE,
        authenticated: Boolean(process.env.WP_USER),
        total: entries.length,
        counts,
        entries,
      },
      null,
      2,
    ),
  );

  await writeFile(DOC_OUT, renderReview(entries, counts));

  console.log(`\nWrote ${entries.length} entries to ${JSON_OUT}`);
  console.log(`Review doc: ${DOC_OUT}`);
  console.log("Counts:", counts);
}

function renderReview(
  entries: MediaEntry[],
  counts: Record<string, number>,
): string {
  const by = (b: Bucket) => entries.filter((e) => e.bucket === b);
  const lines: string[] = [];

  lines.push(`# Media redirect review — /wp-content/uploads/`);
  lines.push("");
  lines.push(`Generated ${new Date().toISOString().slice(0, 10)} by \`yarn build:media-map\`.`);
  lines.push("");
  lines.push(
    "WordPress is being decommissioned, so every URL below 404s at cutover " +
      "unless it is redirected. Review the **unresolved** section — those are " +
      "the ones needing a decision.",
  );
  lines.push("");
  lines.push("| Bucket | Count | Handling |");
  lines.push("|---|---:|---|");
  lines.push(`| VAMOS issue PDFs | ${counts["vamos-pdf"] ?? 0} | 1:1 → \`/revistavamos/<slug>/\` |`);
  lines.push(`| Matched to Contentful asset | ${counts["contentful-asset"] ?? 0} | 1:1 → asset URL |`);
  lines.push(`| **Unresolved docs** | ${counts["unresolved-doc"] ?? 0} | **needs a decision** |`);
  lines.push(`| Images | ${counts["image"] ?? 0} | pattern rule (cannot enumerate) |`);
  lines.push(`| Junk | ${counts["junk"] ?? 0} | let 404 |`);
  lines.push("");

  lines.push("## Unresolved — decide these");
  lines.push("");
  lines.push(
    "No VAMOS date and no Contentful asset with a matching filename. Each " +
      "needs either an upload to Contentful, or a sensible page destination " +
      "(likely `/recursos/`).",
  );
  lines.push("");
  lines.push("| URL | Type |");
  lines.push("|---|---|");
  for (const e of by("unresolved-doc")) {
    lines.push(`| \`${e.path}\` | ${e.mime.split("/").pop()} |`);
  }
  lines.push("");

  lines.push("## VAMOS issue PDFs → edition pages");
  lines.push("");
  lines.push("| URL | → | Derived via |");
  lines.push("|---|---|---|");
  for (const e of by("vamos-pdf")) {
    lines.push(`| \`${e.path}\` | \`${e.destination}\` | ${e.via} |`);
  }
  lines.push("");

  lines.push("## Matched to a Contentful asset");
  lines.push("");
  lines.push("| URL | → |");
  lines.push("|---|---|");
  for (const e of by("contentful-asset")) {
    lines.push(`| \`${e.path}\` | \`${e.destination}\` |`);
  }
  lines.push("");

  lines.push("## Junk — no redirect");
  lines.push("");
  for (const e of by("junk")) lines.push(`- \`${e.path}\``);
  lines.push("");

  return lines.join("\n");
}

// Guard against running on import — the unit test imports normalizeFileName
// and parseVamosDate, and must not trigger a live crawl as a side effect.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
