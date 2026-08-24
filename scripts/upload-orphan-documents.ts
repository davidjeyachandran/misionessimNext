/**
 * Upload the legacy documents that were never migrated, so their WordPress
 * URLs have somewhere to point after the shutdown.
 *
 * `build-media-redirect-map.ts` joins `/wp-content/uploads/` paths to
 * Contentful assets by filename. A handful of documents exist only on
 * WordPress, so the join finds nothing and they are reported as
 * `unresolved-doc` — a hard 404 the day the old site goes away. This uploads
 * them under their original filenames, which is all the join needs; re-run
 * `yarn build:media-map && yarn build:legacy-redirects` afterwards and the
 * rules appear on their own.
 *
 * Two classes of file are deliberately NOT uploaded:
 *  - WordPress re-upload twins (`foo.pdf` / `foo-1.pdf`). `normalizeFileName`
 *    already strips the suffix, so one asset answers both URLs. Detected by
 *    content hash rather than by name, so a genuinely different `-1` file
 *    would still be uploaded.
 *  - Documents the new site already serves first-party from `public/`.
 *    Copying those into Contentful would put the same bytes on two URLs;
 *    they belong in data/media-manual-destinations.json instead.
 *
 * Source files are fetched from the live site, so this only works while
 * WordPress is still up.
 *
 * Usage:
 *   dry run:  node --env-file=.env.local node_modules/.bin/tsx scripts/upload-orphan-documents.ts
 *   execute:  ... --live --environment=master
 */
export {}; // only dynamic imports below — force module scope so `main` doesn't collide across scripts

const SITE = "https://misionessim.org";

const CONTENT_TYPES: Record<string, string> = {
  ".pdf": "application/pdf",
  ".doc": "application/msword",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

/**
 * Titles for the files whose names are jammed-together or opaque. Taken from
 * the document's own first page, not invented — an asset title is what a
 * person sees in the CMS, and "Engnewsmar14" tells them nothing.
 */
const TITLES: Record<string, string> = {
  "13leccionessobremisiones.pdf":
    "Cuenta de su gloria entre las naciones — trece estudios bíblicos sobre misiones mundiales",
  "engnewsmar14.pdf": "English in Lima — marzo 2014",
  // No text layer (scanned); titled from the edition it is.
  "persecucionvamosmayo14.pdf": "VAMOS — Persecución (mayo 2014)",
  "GuiadeOracion-ORA1002-SIM_compressed-1.pdf": "Guía de oración ORA 10/02",
  "aprender_vs_estudiar.pdf": "Aprender vs. estudiar",
  "christian_words.pdf": "Christian words — denominaciones cristianas",
  "my_weekly_language_schedule.pdf": "My weekly language goal",
  "cuando_simplemente_dicen_no.pdf": "Cuando simplemente dicen no",
  "hacer_tiendas_y_el_llamado_apostolico.docx": "Hacer tiendas y el llamado apostólico",
  "mi_profesion_para_la_honra_de_dios.doc": "Mi profesión para la honra de Dios",
  "separacion_entre_lo_sagrado_y_lo_secular.docx": "Separación entre lo sagrado y lo secular",
  "trabajando_tu_llamado_a_las_naciones_-_completo.pdf":
    "Trabajando tu llamado a las naciones (completo)",
  "fortalezas_y_debilidades_de_las_misiones_iberoamericanas.pdf":
    "Fortalezas y debilidades de las misiones iberoamericanas",
};

/** "trabajando_tu_llamado_a_las_naciones_-_completo.pdf" -> readable title. */
function humanize(fileName: string): string {
  const mapped = TITLES[fileName];
  if (mapped) return mapped;
  const stem = fileName.replace(/\.[^.]+$/, "");
  const words = stem
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

async function main() {
  const { readFile } = await import("node:fs/promises");
  const { createHash } = await import("node:crypto");
  const pathMod = await import("node:path");

  const args = process.argv.slice(2);
  const live = args.includes("--live");
  const environmentId = args.find((a) => a.startsWith("--environment="))?.split("=")[1];

  const spaceId = process.env.CONTENTFUL_SPACE_ID;
  const managementToken = process.env.CONTENTFUL_MANAGEMENT_TOKEN;
  if (!spaceId || !managementToken) {
    throw new Error("CONTENTFUL_SPACE_ID and CONTENTFUL_MANAGEMENT_TOKEN must be set.");
  }
  if (live && !environmentId) throw new Error("--environment=<id> is required with --live.");

  // The orphans are exactly the unresolved docs no redirect rule covers.
  const media = JSON.parse(
    await readFile(pathMod.join(process.cwd(), "data", "media-redirect-map.json"), "utf8"),
  ) as { entries: Array<{ path: string; fileName: string; bucket: string }> };
  const config = JSON.parse(
    await readFile(pathMod.join(process.cwd(), "vercel.json"), "utf8"),
  ) as { redirects: Array<{ source: string }> };
  const covered = new Set(config.redirects.map((r) => r.source));
  const orphans = media.entries.filter(
    (e) => e.bucket === "unresolved-doc" && !covered.has(e.path),
  );

  console.log(`${orphans.length} documents have no destination.\n`);

  // Hash everything first: that is what identifies both the re-upload twins
  // and the files public/ already serves.
  const publicDir = pathMod.join(process.cwd(), "public");
  const publicHashes = new Map<string, string>();
  const { readdir, stat } = await import("node:fs/promises");
  const walk = async (dir: string): Promise<void> => {
    for (const name of await readdir(dir)) {
      const full = pathMod.join(dir, name);
      if ((await stat(full)).isDirectory()) await walk(full);
      else if (/\.(pdf|docx?|)$/i.test(name)) {
        publicHashes.set(
          createHash("sha256").update(await readFile(full)).digest("hex"),
          "/" + pathMod.relative(publicDir, full),
        );
      }
    }
  };
  await walk(publicDir);

  interface Candidate {
    path: string;
    fileName: string;
    bytes: Buffer;
    hash: string;
  }
  const downloaded: Candidate[] = [];
  for (const entry of orphans) {
    const res = await fetch(`${SITE}${entry.path}`, {
      headers: { "user-agent": "misionessim-migration-bot/1.0" },
    });
    if (!res.ok) {
      console.log(`  SKIP ${entry.fileName} — live site returned ${res.status}`);
      continue;
    }
    const bytes = Buffer.from(await res.arrayBuffer());
    downloaded.push({
      path: entry.path,
      fileName: entry.fileName,
      bytes,
      hash: createHash("sha256").update(bytes).digest("hex"),
    });
  }

  // Among byte-identical twins keep the unsuffixed name: the asset's filename
  // becomes the public /recursos/<file> URL, and `foo.pdf` beats `foo-1.pdf`.
  const canonicalFirst = [...downloaded].sort((a, b) =>
    a.fileName.length - b.fileName.length || a.fileName.localeCompare(b.fileName),
  );
  const seen = new Map<string, string>();
  const upload: Candidate[] = [];
  const skipped: string[] = [];
  for (const c of canonicalFirst) {
    const alreadyPublic = publicHashes.get(c.hash);
    if (alreadyPublic) {
      skipped.push(`${c.fileName} — identical to ${alreadyPublic}, already served first-party`);
      continue;
    }
    const twin = seen.get(c.hash);
    if (twin) {
      skipped.push(`${c.fileName} — byte-identical re-upload of ${twin}`);
      continue;
    }
    seen.set(c.hash, c.fileName);
    upload.push(c);
  }

  console.log(`Will upload ${upload.length}:`);
  for (const c of upload) {
    console.log(`  ${c.fileName}  (${(c.bytes.length / 1024).toFixed(0)} KB)  "${humanize(c.fileName)}"`);
  }
  if (skipped.length) {
    console.log(`\nNot uploading ${skipped.length}:`);
    for (const s of skipped) console.log(`  ${s}`);
  }

  if (!live) {
    console.log("\nDry run — nothing uploaded. Pass --live --environment=<id> to execute.");
    return;
  }

  const { createClient } = await import("contentful-management");
  const client = createClient({ accessToken: managementToken });
  const ctx = { spaceId, environmentId: environmentId as string };

  console.log(`\n--live: uploading ${upload.length} assets to "${environmentId}"...`);
  for (const c of upload) {
    const ext = pathMod.extname(c.fileName).toLowerCase();
    const contentType = CONTENT_TYPES[ext];
    if (!contentType) throw new Error(`No content type mapped for ${c.fileName}`);
    const file = c.bytes.buffer.slice(
      c.bytes.byteOffset,
      c.bytes.byteOffset + c.bytes.byteLength,
    ) as ArrayBuffer;

    const asset = await client.asset.createFromFiles(ctx, {
      fields: {
        title: { "en-US": humanize(c.fileName) },
        description: { "en-US": "" },
        file: { "en-US": { contentType, fileName: c.fileName, file } },
      },
    });
    const processed = await client.asset.processForAllLocales(ctx, asset);
    await client.asset.publish({ ...ctx, assetId: processed.sys.id }, processed);
    console.log(`  uploaded ${c.fileName} -> ${processed.sys.id}`);
  }
  console.log("\nDone. Now run: yarn build:media-map && yarn build:legacy-redirects");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
