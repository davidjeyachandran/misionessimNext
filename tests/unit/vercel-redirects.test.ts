import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { pathToRegexp } from "next/dist/compiled/path-to-regexp";

interface Redirect {
  source: string;
  destination: string;
  permanent: boolean;
}

const config = JSON.parse(
  readFileSync(path.join(process.cwd(), "vercel.json"), "utf8"),
) as { redirects: Redirect[]; rewrites: Array<{ source: string }> };

const IMAGE_CATCH_ALL = config.redirects.filter(
  (r) => r.source.startsWith("/wp-content/uploads/") && r.source.includes(":"),
);

// Every legacy image URL that still gets traffic is unenumerable — WordPress
// generates size variants (`-300x200`, `-scaled`) that appear in no API — so
// images are covered by one pattern rule instead of 531 exact ones.
describe("legacy image catch-all", () => {
  it("is a single rule", () => {
    expect(IMAGE_CATCH_ALL).toHaveLength(1);
  });

  it("is the last redirect in the array", () => {
    // Vercel takes the first matching redirect. Anywhere but last, this rule
    // would swallow all 300+ document redirects that share its prefix.
    expect(config.redirects.at(-1)).toBe(IMAGE_CATCH_ALL[0]);
  });

  it("is temporary, not permanent", () => {
    // A 301 would be cached forever by browsers and would invite crawlers to
    // consolidate every legacy image onto one banner. Neither is wanted for a
    // fallback whose mapping is "unknown image -> generic image".
    expect(IMAGE_CATCH_ALL[0].permanent).toBe(false);
  });

  it("points at an image, so third-party embeds keep rendering", () => {
    expect(IMAGE_CATCH_ALL[0].destination).toMatch(/\.(webp|jpe?g|png)$/);
  });

  const matches = (url: string) => pathToRegexp(IMAGE_CATCH_ALL[0].source).test(url);

  it("matches originals, WordPress size variants and uppercase extensions", () => {
    expect(matches("/wp-content/uploads/2017/07/8085-2.jpg")).toBe(true);
    expect(matches("/wp-content/uploads/2017/07/8085-2-300x200.jpg")).toBe(true);
    expect(matches("/wp-content/uploads/2021/03/foo-scaled.JPG")).toBe(true);
    expect(matches("/wp-content/uploads/2022/01/bar.png")).toBe(true);
  });

  it("never claims a document", () => {
    const documents = config.redirects
      .filter((r) => r.source.startsWith("/wp-content/uploads/") && !r.source.includes(":"))
      .map((r) => r.source);

    expect(documents.length).toBeGreaterThan(250);
    expect(documents.filter(matches)).toEqual([]);
  });
});

describe("redirect table integrity", () => {
  it("has no duplicate sources", () => {
    const sources = config.redirects.map((r) => r.source);
    expect(sources.length - new Set(sources).size).toBe(0);
  });

  it("has no chains — no destination is itself a redirect source", () => {
    const sources = new Set(config.redirects.map((r) => r.source));
    expect(config.redirects.filter((r) => sources.has(r.destination))).toEqual([]);
  });

  it("stays inside Vercel's 2,048 redirect limit", () => {
    expect(config.redirects.length).toBeLessThanOrEqual(2048);
  });

});

// `trailingSlash: true` normalises the request path *before* redirects are
// matched, and Vercel compiles sources with path-to-regexp's `strict` option,
// under which a slashless pattern does not match a slashed path. A rule
// written without the trailing slash therefore never fires: the request 308s
// to the slashed form and then falls through to a 404. This silently killed
// all 69 extension-less rules — the whole `/la-revista/*` space included —
// while every rule ending in a file extension kept working, because
// normalisation leaves those alone.
describe("trailing slashes match the normalised request path", () => {
  const EXTENSION = /\.[a-zA-Z0-9]{2,5}$/;
  const extensionless = config.redirects.filter(
    (r) => !EXTENSION.test(r.source.split("?")[0]) && !r.source.includes("("),
  );

  it("covers the extension-less rules", () => {
    expect(extensionless.length).toBeGreaterThan(60);
  });

  it("every extension-less source ends in a slash", () => {
    // `/la-revista` is the one deliberate exception: it is unreachable (the
    // normaliser rewrites it to `/la-revista/`, which has its own rule) and
    // adding the slash would duplicate that rule's source.
    const slashless = extensionless
      .map((r) => r.source)
      .filter((s) => !s.endsWith("/") && s !== "/la-revista");
    expect(slashless).toEqual([]);
  });

  it("matches the slashed path under Vercel's strict matching", () => {
    const cases: Array<[string, string]> = [
      ["/la-revista/:path*/", "/la-revista/el-llamado/"],
      ["/portfolio-category/:path*/", "/portfolio-category/discapacidad/"],
      ["/blog/author/:path*/", "/blog/author/juan/"],
    ];
    for (const [source, url] of cases) {
      expect(
        pathToRegexp(source, [], { strict: true } as never).test(url),
      ).toBe(true);
    }
  });
});
