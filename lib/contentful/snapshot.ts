import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";

// A snapshot is a local copy of everything the site reads from Contentful:
//
//   content-snapshot/meta.json       when it was taken, and how much it holds
//   content-snapshot/catalogue.json  every blogPost row (the listing query)
//   content-snapshot/revistas.json   every revista
//   content-snapshot/posts/<slug>.json  one full post each, body included
//
// Builds read it instead of calling the API, so a build costs zero quota.
// `yarn sync:contentful` refreshes it.

export const DEFAULT_SNAPSHOT_DIR = path.join(process.cwd(), "content-snapshot");

export interface SnapshotMeta {
  syncedAt: string;
  posts: number;
  revistas: number;
}

// The fingerprint is the catalogue row the post was fetched for. When the row
// changes (republished, re-linked to another edition) the post is stale.
interface PostFile<T> {
  fingerprint: string;
  post: T;
}

const postsDir = (dir: string) => path.join(dir, "posts");
const postFile = (dir: string, slug: string) =>
  path.join(postsDir(dir), `${encodeURIComponent(slug)}.json`);

function readJson<T>(file: string): T {
  return JSON.parse(readFileSync(file, "utf8")) as T;
}

// Write-then-rename, so an interrupted sync never leaves a half-written file.
function writeJson(file: string, value: unknown): void {
  mkdirSync(path.dirname(file), { recursive: true });
  const temp = `${file}.tmp`;
  writeFileSync(temp, JSON.stringify(value, null, 1));
  renameSync(temp, file);
}

export function snapshotExists(dir: string): boolean {
  return existsSync(path.join(dir, "meta.json"));
}

export function readMeta(dir: string): SnapshotMeta {
  return readJson<SnapshotMeta>(path.join(dir, "meta.json"));
}

export function readCatalogue<T>(dir: string): T[] {
  return readJson<T[]>(path.join(dir, "catalogue.json"));
}

export function readRevistas<T>(dir: string): T[] {
  return readJson<T[]>(path.join(dir, "revistas.json"));
}

export function readPost<T>(dir: string, slug: string): T | null {
  const file = postFile(dir, slug);
  return existsSync(file) ? readJson<PostFile<T>>(file).post : null;
}

// slug -> fingerprint, for every post file currently on disk.
export function readPostFingerprints(dir: string): Map<string, string> {
  const fingerprints = new Map<string, string>();
  if (!existsSync(postsDir(dir))) return fingerprints;
  for (const name of readdirSync(postsDir(dir))) {
    if (!name.endsWith(".json")) continue;
    const slug = decodeURIComponent(name.slice(0, -".json".length));
    fingerprints.set(slug, readJson<PostFile<unknown>>(path.join(postsDir(dir), name)).fingerprint);
  }
  return fingerprints;
}

export function writePost(
  dir: string,
  slug: string,
  fingerprint: string,
  post: unknown,
): void {
  writeJson(postFile(dir, slug), { fingerprint, post });
}

export function removePost(dir: string, slug: string): void {
  rmSync(postFile(dir, slug), { force: true });
}

export function writeCollections(
  dir: string,
  { catalogue, revistas, meta }: { catalogue: unknown[]; revistas: unknown[]; meta: SnapshotMeta },
): void {
  writeJson(path.join(dir, "catalogue.json"), catalogue);
  writeJson(path.join(dir, "revistas.json"), revistas);
  // Last, so `snapshotExists` only turns true once everything else is in place.
  writeJson(path.join(dir, "meta.json"), meta);
}
