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

// The WordPress .htaccess carried the Drupal-era redirect table verbatim. It is
// captured in data/drupal-htaccess-redirects.json because it dies with the
// install, and because it is the authoritative version of what
// data/drupal-file-map.json could only measure by probing — the probe guessed
// Drupal filenames from their WordPress twins, so it missed every rule where
// the two names differ.
describe("captured WordPress .htaccess rules", () => {
  const htaccess = JSON.parse(
    readFileSync(
      path.join(process.cwd(), "data", "drupal-htaccess-redirects.json"),
      "utf8",
    ),
  ) as {
    files: Array<{ path: string; wpPath: string }>;
    pages: Array<{ path: string; destination: string }>;
  };

  const bySource = new Map(config.redirects.map((r) => [r.source, r]));
  const rewriteSources = new Set(config.rewrites.map((r) => r.source));

  it("honours every file rule", () => {
    const missing = htaccess.files.filter((r) => !bySource.has(r.path));
    expect(missing).toEqual([]);
    expect(htaccess.files.length).toBeGreaterThan(50);
  });

  it("resolves each one in a single hop, not by chaining through WordPress", () => {
    // WordPress answered these with a 301 into /wp-content/uploads/, which is
    // itself a redirect. Re-emitting that pair would leave a chain whose second
    // hop dies with the install, so each rule must land on its final home.
    for (const rule of htaccess.files) {
      const destination = bySource.get(rule.path)?.destination;
      expect(destination, rule.path).toBeDefined();
      expect(destination, rule.path).not.toMatch(/^\/wp-content\//);
      expect(rewriteSources.has(destination!), `${rule.path} -> ${destination}`).toBe(true);
    }
  });

  it("agrees with the revista slug aliases on every page rule", () => {
    // These three are expressed as aliases in legacy-revista-aliases.json. The
    // captured rules are kept as an independent check on that transcription.
    for (const rule of htaccess.pages) {
      const source = rule.path.replace(/\/?$/, "/");
      const redirect = bySource.get(source);
      expect(redirect, source).toBeDefined();
      const slug = rule.destination.replace(/^\/la-revista\/|\/$/g, "");
      expect(redirect!.destination, source).toBe(`/revistavamos/${slug}/`);
    }
  });
});

// WordPress published a comment feed beside every post, edition and term, and
// Google indexed the lot. They are not merely useless: before these rules,
// `/la-revista/<slug>/feed/` fell into the `/la-revista/:path*` wildcard and
// 308ed to `/revistavamos/<slug>/feed/`, a 404 — a permanent redirect into a
// dead end, which Search Console reports as an error and Google re-crawls for
// years. Stripping `feed/` lands the visitor on the article the feed belonged
// to, the only real equivalent a static site has.
describe("WordPress feed URLs", () => {
  const sourceIndex = new Map(config.redirects.map((r, i) => [r.source, i]));

  /** Vercel takes the first matching rule and substitutes its params. */
  const resolve = (url: string): string | undefined => {
    for (const rule of config.redirects) {
      const keys: Array<{ name: string | number }> = [];
      const match = pathToRegexp(rule.source, keys as never, {
        strict: true,
      } as never).exec(url);
      if (!match) continue;
      let destination = rule.destination;
      keys.forEach((key, i) => {
        destination = destination.replace(`:${key.name}*`, match[i + 1] ?? "");
        destination = destination.replace(`:${key.name}`, match[i + 1] ?? "");
      });
      return destination;
    }
    return undefined;
  };

  // The 15 feed URLs Search Console listed on 2026-08-24, verbatim.
  const INDEXED = [
    "/la-revista/traduccion-biblica/feed/",
    "/la-revista/mentoria/feed/",
    "/la-revista/latinos-en-adaptacion/feed/",
    "/la-revista/obstaculos-y-perseverancia/feed/",
    "/la-revista/africa/feed/",
    "/la-revista/biocupacionales/feed/",
    "/la-revista/movilizacion/feed/",
    "/blog/2024-07/no-eres-un-empleado-de-dios/feed/",
    "/blog/2021-06/cocinando-para-su-gloria/feed/",
    "/blog/2020-11/los-traductores-tienen-muchos-roles/feed/",
    "/blog/2020-10/voluntario-con-paga/feed/",
    "/blog/2020-10/voluntatest/feed/",
    "/blog/2024-06/todo-cristiano-forma-parte/feed/",
    "/blog/2023-03/salir-del-campo-y-en-busca-de-un-nuevo-hogar/feed/",
    "/blog/2024-05/camino-de-generosidad/feed/",
  ];

  it("strips the feed segment off every indexed URL", () => {
    for (const url of INDEXED) {
      const destination = resolve(url);
      expect(destination, url).toBeDefined();
      expect(destination, url).not.toMatch(/\/feed\//);
    }
  });

  it("resolves each one in a single hop", () => {
    // The whole point of the change: a 308 whose destination is itself a
    // redirect is barely better than the 404 it replaced. The exact twins are
    // generated from the redirect table so they inherit its FINAL destination
    // rather than chaining through the parent's own rule.
    for (const url of INDEXED) {
      const destination = resolve(url)!;
      expect(resolve(destination), `${url} -> ${destination}`).toBeUndefined();
    }
  });

  it("keeps drifted slugs off the passthrough wildcard", () => {
    // `/la-revista/movilizacion/` is a slug that drifted in the CMS. Its feed
    // must follow it to `mobilizacion`, not pass the stale slug through.
    expect(resolve("/la-revista/movilizacion/feed/")).toBe(
      resolve("/la-revista/movilizacion/"),
    );
    expect(resolve("/la-revista/traduccion-biblica/feed/")).toBe(
      resolve("/la-revista/traduccion-biblica/"),
    );
  });

  it("orders every feed wildcard before the rule it corrects", () => {
    // `/la-revista/:path*/` would swallow `/la-revista/x/feed/` and send it to
    // `/revistavamos/x/feed/`, and `/blog/author/:path*/` would leave an author
    // feed chaining through its own archive rule. Vercel takes the first match,
    // so both feed wildcards have to come first.
    const pairs: Array<[string, string]> = [
      ["/la-revista/:path*/feed/", "/la-revista/:path*/"],
      ["/blog/author/:path*/feed/", "/blog/author/:path*/"],
      ["/blog/author/:path*/feed/", "/blog/:path*/feed/"],
    ];
    for (const [feed, general] of pairs) {
      expect(sourceIndex.get(feed), feed).toBeDefined();
      expect(sourceIndex.get(general), general).toBeDefined();
      expect(sourceIndex.get(feed)!).toBeLessThan(sourceIndex.get(general)!);
    }
  });

  it("covers the section fronts and the /feed/<type> variants", () => {
    // `:path*` matching zero segments would build `/blog//`, so the fronts need
    // exact rules. WordPress also served `/feed/atom/` and `/feed/rss2/`.
    expect(resolve("/feed/")).toBe("/blog/");
    expect(resolve("/comments/feed/")).toBe("/blog/");
    expect(resolve("/blog/feed/")).toBe("/blog/");
    expect(resolve("/blog/2021-06/cocinando-para-su-gloria/feed/atom/")).toBe(
      "/blog/2021-06/cocinando-para-su-gloria/",
    );
    expect(resolve("/blog/category/iglesia/feed/")).toBe("/blog/category/iglesia/");
    expect(resolve("/blog/author/juan/feed/")).toBe("/blog/");
  });
});
