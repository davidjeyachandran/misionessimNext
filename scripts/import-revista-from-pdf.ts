/**
 * Create a Revista VAMOS edition from a PDF that is already a Contentful
 * asset, rendering the cover from the PDF's own first page.
 *
 * Why this exists alongside import-missing-revistas.ts: that script pulls both
 * the PDF and a cover JPEG from WordPress URLs recorded by hand. This handles
 * the case where WordPress never had an edition page at all — there is no
 * cover image anywhere, and the PDF is a scan with no text layer, so nothing
 * downstream can derive one. The first page IS the cover, so we render it.
 *
 * The rendered cover gets a real `description`: an empty one is what left 50
 * of the 119 edition pages with a PDF link that announced as nothing to screen
 * readers (fixed 2026-08-24 — don't reintroduce the cause).
 *
 * Requires poppler (`pdftoppm`, `pdfinfo`) on PATH — `brew install poppler`.
 *
 * Usage:
 *   dry run:
 *     node --env-file=.env.local node_modules/.bin/tsx scripts/import-revista-from-pdf.ts \
 *       --pdf-asset=<id> --slug=<slug> --title="<title>" --fecha=YYYY-MM
 *   execute: ... --live --environment=master
 *
 * Afterwards, in this order:
 *   yarn build:revista-rewrites   # the edition's first-party PDF path
 *   yarn build:media-map          # re-buckets the PDF vamos-pdf, not a plain doc
 *   yarn build:legacy-redirects
 */
export {}; // only dynamic imports below — force module scope so `main` doesn't collide across scripts

const COVER_WIDTH_PX = 768; // matches the larger of the two conventions in the space

interface Args {
  pdfAsset: string;
  slug: string;
  title: string;
  fecha: string;
  live: boolean;
  environmentId?: string;
}

function parseArgs(argv: string[]): Args {
  const get = (name: string) =>
    argv.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3);
  const pdfAsset = get("pdf-asset");
  const slug = get("slug");
  const title = get("title");
  const fecha = get("fecha");
  if (!pdfAsset || !slug || !title || !fecha) {
    throw new Error("--pdf-asset, --slug, --title and --fecha are all required.");
  }
  if (!/^\d{4}-\d{2}$/.test(fecha)) throw new Error("--fecha must be YYYY-MM.");
  if (slug !== slug.trim() || /[/%\s]/.test(slug)) {
    // The two malformed slugs repaired on 2026-08-24 got in exactly this way.
    throw new Error(`--slug must be URL-safe, got ${JSON.stringify(slug)}.`);
  }
  return {
    pdfAsset,
    slug,
    title,
    fecha,
    live: argv.includes("--live"),
    environmentId: argv.find((a) => a.startsWith("--environment="))?.split("=")[1],
  };
}

async function renderCover(pdfPath: string, outStem: string): Promise<string> {
  const { execFile } = await import("node:child_process");
  const { promisify } = await import("node:util");
  const run = promisify(execFile);

  const { stdout: info } = await run("pdfinfo", [pdfPath]);
  const size = /Page size:\s+([\d.]+) x ([\d.]+) pts/.exec(info);
  if (!size) throw new Error("pdfinfo did not report a page size");
  const widthPt = Number(size[1]);
  const dpi = Math.round((COVER_WIDTH_PX / (widthPt / 72)) * 100) / 100;

  await run("pdftoppm", [
    "-f", "1", "-l", "1",
    "-r", String(dpi),
    "-jpeg", "-jpegopt", "quality=88",
    pdfPath, outStem,
  ]);
  return `${outStem}-01.jpg`;
}

async function main() {
  const { readFile, writeFile, mkdtemp } = await import("node:fs/promises");
  const os = await import("node:os");
  const pathMod = await import("node:path");

  const args = parseArgs(process.argv.slice(2));
  const spaceId = process.env.CONTENTFUL_SPACE_ID;
  const managementToken = process.env.CONTENTFUL_MANAGEMENT_TOKEN;
  if (!spaceId || !managementToken) {
    throw new Error("CONTENTFUL_SPACE_ID and CONTENTFUL_MANAGEMENT_TOKEN must be set.");
  }
  if (args.live && !args.environmentId) {
    throw new Error("--environment=<id> is required with --live.");
  }
  const environmentId = args.environmentId ?? "master";

  const { createClient } = await import("contentful-management");
  const client = createClient({ accessToken: managementToken });
  const ctx = { spaceId, environmentId };

  const pdf = await client.asset.get({ ...ctx, assetId: args.pdfAsset });
  const file = pdf.fields.file?.["en-US"];
  if (!file?.url) throw new Error(`Asset ${args.pdfAsset} has no processed file.`);
  const pdfUrl = `https:${file.url}`;
  console.log(`PDF asset : ${args.pdfAsset}  ${file.fileName}`);

  // Refuse to create a second edition on a slug already in use. Stored slugs
  // in this space come in both "slug" and "/slug" shapes.
  const existing = await client.entry.getMany({
    ...ctx,
    query: { content_type: "revista", limit: 1000 },
  });
  const taken = new Set(
    existing.items.map((e) => String(e.fields?.slug?.["en-US"] ?? "").replace(/^\/+/, "")),
  );
  if (taken.has(args.slug)) throw new Error(`Slug "${args.slug}" is already in use.`);

  const tmp = await mkdtemp(pathMod.join(os.tmpdir(), "revista-"));
  const localPdf = pathMod.join(tmp, file.fileName ?? "edition.pdf");
  await writeFile(localPdf, Buffer.from(await (await fetch(pdfUrl)).arrayBuffer()));
  const coverPath = await renderCover(localPdf, pathMod.join(tmp, "cover"));
  const coverBytes = await readFile(coverPath);
  console.log(
    `Cover     : rendered page 1 -> ${(coverBytes.length / 1024).toFixed(0)} KB JPEG`,
  );

  const fecha = `${args.fecha}-01T00:00:00Z`;
  console.log(`Edition   : "${args.title}"  /revistavamos/${args.slug}/  ${fecha}`);

  if (!args.live) {
    console.log("\nDry run — nothing created. Pass --live --environment=<id> to execute.");
    console.log(`(cover kept at ${coverPath} for inspection)`);
    return;
  }

  const coverArrayBuffer = coverBytes.buffer.slice(
    coverBytes.byteOffset,
    coverBytes.byteOffset + coverBytes.byteLength,
  ) as ArrayBuffer;
  const coverAsset = await client.asset.createFromFiles(ctx, {
    fields: {
      title: { "en-US": `Portada: ${args.title}` },
      description: { "en-US": `Portada de la edición «${args.title}» de la Revista VAMOS.` },
      file: {
        "en-US": {
          contentType: "image/jpeg",
          fileName: `${args.slug}-portada.jpg`,
          file: coverArrayBuffer,
        },
      },
    },
  });
  const processedCover = await client.asset.processForAllLocales(ctx, coverAsset);
  await client.asset.publish({ ...ctx, assetId: processedCover.sys.id }, processedCover);
  console.log(`  cover asset -> ${processedCover.sys.id}`);

  const entry = await client.entry.create(
    { ...ctx, contentTypeId: "revista" },
    {
      fields: {
        title: { "en-US": args.title },
        slug: { "en-US": args.slug },
        fecha: { "en-US": fecha },
        revistaPDF: {
          "en-US": { sys: { type: "Link", linkType: "Asset", id: args.pdfAsset } },
        },
        coverImage: {
          "en-US": { sys: { type: "Link", linkType: "Asset", id: processedCover.sys.id } },
        },
      },
    },
  );
  await client.entry.publish({ ...ctx, entryId: entry.sys.id }, entry);
  console.log(`  revista entry -> ${entry.sys.id}`);

  console.log(
    "\nDone. Now run:\n"
      + "  yarn build:revista-rewrites && yarn build:media-map && yarn build:legacy-redirects",
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
