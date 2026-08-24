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

// The Drupal-era URL space (`/content/`, `/recurso/`, `/images/*_adjuntos/`,
// `/phocadownload/`) never reached WordPress's redirect table, so it 404ed for
// years before the rebuild. data/legacy-404s.json is a frozen Search Console
// export — the only enumeration of it that exists.
describe("Drupal-era rules", () => {
  const legacy = JSON.parse(
    readFileSync(path.join(process.cwd(), "data", "legacy-404s.json"), "utf8"),
  ) as { entries: Array<{ host: string; path: string }> };

  const rewriteSources = new Set(config.rewrites.map((r) => r.source));
  const sourceIndex = new Map(config.redirects.map((r, i) => [r.source, i]));

  const WILDCARDS = config.redirects.filter(
    (r) =>
      r.source.includes(":path*") &&
      ["/content/", "/recurso/", "/curso-vamos/", "/cursovamos/", "/ora-por-misiones/"].some(
        (prefix) => r.source.startsWith(prefix),
      ),
  );

  it("emits a wildcard per Drupal page prefix", () => {
    expect(WILDCARDS).toHaveLength(5);
  });

  it("orders every wildcard after the exact rules correcting it", () => {
    // Vercel takes the first match. `/content/:path*/` passes the slug straight
    // through to /revistavamos/, which is right for most editions and wrong for
    // the handful whose slug drifted — those exact rules must win.
    for (const wildcard of WILDCARDS) {
      const prefix = wildcard.source.slice(0, wildcard.source.indexOf(":"));
      const wildcardAt = sourceIndex.get(wildcard.source)!;
      const exact = config.redirects.filter(
        (r) => r.source.startsWith(prefix) && !r.source.includes(":"),
      );
      for (const rule of exact) {
        expect(sourceIndex.get(rule.source)!).toBeLessThan(wildcardAt);
      }
    }
  });

  it("serves every document destination through a rewrite", () => {
    // A /recursos/<file> destination is a first-party path with no file behind
    // it — only the companion rewrite proxies it to Contentful. Emitting the
    // redirect without the rewrite turns one 404 into two.
    const documents = config.redirects.filter(
      (r) => r.destination.startsWith("/recursos/") && r.destination !== "/recursos/",
    );

    expect(documents.length).toBeGreaterThan(100);
    for (const rule of documents) {
      expect(rewriteSources.has(rule.destination)).toBe(true);
    }
  });

  it("gives every source containing a space a percent-encoded twin", () => {
    // Old pages linked these files with literal spaces in the href. Vercel
    // matches the path as it arrives, and every real client sends %20.
    const spaced = config.redirects.filter((r) => r.source.includes(" "));

    expect(spaced.length).toBeGreaterThan(0);
    for (const rule of spaced) {
      const encoded = rule.source.split("/").map(encodeURIComponent).join("/");
      expect(sourceIndex.has(encoded)).toBe(true);
    }
  });

  it("covers every legacy document that still has an asset", () => {
    // Anything left uncovered must be a file no Contentful asset carries —
    // never one we simply forgot to map.
    const covered = (p: string) =>
      sourceIndex.has(p) || sourceIndex.has(p.endsWith("/") ? p : `${p}/`);
    const documents = legacy.entries.filter(
      (e) => e.host === "misionessim.org" && /\.(pdf|docx?|xlsx?|pptx?|ppsx|odt)$/i.test(e.path),
    );

    expect(documents.length).toBeGreaterThan(150);
    for (const entry of documents.filter((e) => covered(e.path))) {
      const rule = config.redirects[sourceIndex.get(entry.path)!];
      expect(rule.destination).not.toBe("/recursos/");
    }
  });
});
