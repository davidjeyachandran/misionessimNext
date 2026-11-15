import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  duplicatePosts,
  isExcludedFromSitemap,
  isNoindexedPost,
} from "../../lib/content/duplicate-posts";

const all = [...duplicatePosts.noindex, ...duplicatePosts.redirects];
const POST_PATH = /^\/blog\/\d{4}-\d{2}\/[^/]+\/$/;

describe("data/duplicate-posts.json", () => {
  it("has well-formed post paths whose slug matches the path", () => {
    for (const e of all) {
      expect(e.path).toMatch(POST_PATH);
      expect(e.keep).toMatch(POST_PATH);
      expect(e.path.split("/").at(-2)).toBe(e.slug);
    }
  });

  it("lists each post once", () => {
    const slugs = all.map((e) => e.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("never points at a post that is itself noindexed or redirected", () => {
    // A kept post must stay indexable, and a redirect chain (A -> B -> C)
    // wastes crawl budget and can drop link equity.
    const dropped = new Set(all.map((e) => e.path));
    for (const e of all) expect(dropped.has(e.keep)).toBe(false);
  });

  it("never lets a post redirect to itself", () => {
    for (const e of all) expect(e.keep).not.toBe(e.path);
  });

  it("has a matching 301 in vercel.json for every redirect", () => {
    const vercel = JSON.parse(
      readFileSync(path.join(process.cwd(), "vercel.json"), "utf8"),
    ) as { redirects: { source: string; destination: string; permanent: boolean }[] };
    for (const e of duplicatePosts.redirects) {
      const rule = vercel.redirects.find((r) => r.source === e.path);
      expect(rule, `missing redirect for ${e.path}`).toBeDefined();
      expect(rule?.destination).toBe(e.keep);
      expect(rule?.permanent).toBe(true);
    }
  });

  it("has no vercel.json redirect for a noindexed post (it must stay reachable)", () => {
    const vercel = JSON.parse(
      readFileSync(path.join(process.cwd(), "vercel.json"), "utf8"),
    ) as { redirects: { source: string }[] };
    const sources = new Set(vercel.redirects.map((r) => r.source));
    for (const e of duplicatePosts.noindex) expect(sources.has(e.path)).toBe(false);
  });
});

describe("duplicate-post helpers", () => {
  it("noindexes only the noindex list", () => {
    for (const e of duplicatePosts.noindex) expect(isNoindexedPost(e.slug)).toBe(true);
    for (const e of duplicatePosts.redirects) expect(isNoindexedPost(e.slug)).toBe(false);
    expect(isNoindexedPost("a-post-that-is-not-listed")).toBe(false);
  });

  it("leaves both lists out of the sitemap, and nothing else", () => {
    for (const e of all) expect(isExcludedFromSitemap(e.slug)).toBe(true);
    for (const e of all) expect(isExcludedFromSitemap(e.keep.split("/").at(-2)!)).toBe(false);
  });
});
