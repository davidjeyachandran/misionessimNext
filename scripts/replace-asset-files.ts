/**
 * Replace the file on existing Contentful assets (e.g. with a compressed PDF),
 * keeping the asset id so every entry linking to it stays linked.
 *
 * Why: Vercel's CDN won't cache responses over 10 MB, so oversized PDFs
 * proxied from Contentful are fetched from Contentful on every download and
 * eat the asset-bandwidth quota. Compress them, then swap the file in place.
 *
 *   dry run: node --env-file=.env.local node_modules/.bin/tsx scripts/replace-asset-files.ts <assetId>=<file.pdf> ...
 *   live:    ... --live
 *
 * The asset URL's hash changes on re-upload, so afterwards run
 * `yarn build:revista-rewrites` (revista PDFs) and/or update the matching
 * `/recursos/` rewrite in vercel.json, then deploy.
 */
import { readFile } from "node:fs/promises";
import path from "node:path";

async function main() {
  const args = process.argv.slice(2);
  const live = args.includes("--live");
  const pairs = args
    .filter((a) => !a.startsWith("--"))
    .map((a) => {
      const i = a.indexOf("=");
      if (i < 1) throw new Error(`Expected <assetId>=<file>, got "${a}"`);
      return { assetId: a.slice(0, i), file: a.slice(i + 1) };
    });
  if (!pairs.length) throw new Error("Nothing to do: pass <assetId>=<file> pairs.");

  const spaceId = process.env.CONTENTFUL_SPACE_ID;
  const accessToken = process.env.CONTENTFUL_MANAGEMENT_TOKEN;
  if (!spaceId || !accessToken) {
    throw new Error("CONTENTFUL_SPACE_ID and CONTENTFUL_MANAGEMENT_TOKEN must be set.");
  }

  const { createClient } = await import("contentful-management");
  const client = createClient({ accessToken });
  const ctx = { spaceId, environmentId: "master" };

  for (const { assetId, file } of pairs) {
    const bytes = await readFile(file);
    const asset = await client.asset.get({ ...ctx, assetId });
    const locales = Object.keys(asset.fields.file ?? {});
    if (!locales.length) throw new Error(`${assetId} has no file field`);
    const current = asset.fields.file[locales[0]];
    const oldSize = (current.details as { size?: number } | undefined)?.size;
    console.log(
      `${assetId} ${current.fileName}: ${oldSize ?? "?"} -> ${bytes.length} bytes (${locales.join(", ")})`,
    );
    if (path.basename(file) !== current.fileName) {
      throw new Error(`${file} does not match the asset's file name ${current.fileName}`);
    }
    if (!live) continue;

    const upload = await client.upload.create(
      { spaceId, environmentId: "master" },
      { file: bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer },
    );
    for (const locale of locales) {
      const f = asset.fields.file[locale];
      asset.fields.file[locale] = {
        fileName: f.fileName,
        contentType: f.contentType,
        uploadFrom: { sys: { type: "Link", linkType: "Upload", id: upload.sys.id } },
      } as never;
    }
    const updated = await client.asset.update({ ...ctx, assetId }, asset);
    const processed = await client.asset.processForAllLocales(ctx, updated);
    const published = await client.asset.publish({ ...ctx, assetId }, processed);
    console.log(`  published -> ${published.fields.file[locales[0]].url}`);
  }
  if (!live) console.log("\nDry run — nothing changed. Pass --live to replace.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
