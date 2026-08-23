// Schema.org JSON-LD for search engines and AI crawlers.
//
// Parity note: the WordPress site emitted a Yoast `@graph` on every post
// (Article, WebPage, BreadcrumbList, WebSite, Organization, Person). We emit
// the same entities minus two:
//   - `Person` — no blogPost in the Contentful space carries an `author`
//     value (verified: `author_exists: true` returns 0 of 901), so the
//     Organization is the honest author. Add a Person here the day authorship
//     lands in the CMS.
//   - `WebSite.potentialAction` — Yoast advertises a SearchAction pointing at
//     `?s=`. This site has no search endpoint, so claiming one would send
//     Google to a 404.
//
// Emitted as two separate <script> blocks (site-wide in the layout, per-page
// in the route). Consumers merge every JSON-LD block on a page before
// resolving `@id`, so the cross-references below still join up.
import { SITE_URL } from "./site";

const ORGANIZATION_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;

const ORGANIZATION_NAME = "SIM Latinoamérica";

/** Absolute URL for a site-relative path, as schema.org requires. */
function abs(pathOrUrl: string): string {
  if (/^https?:\/\//.test(pathOrUrl)) return pathOrUrl;
  return `${SITE_URL}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
}

type JsonLdValue = string | number | boolean | null | JsonLdObject | JsonLdValue[];
interface JsonLdObject {
  [key: string]: JsonLdValue | undefined;
}

/**
 * Props for a JSON-LD <script>. `dangerouslySetInnerHTML` is the documented
 * Next.js approach (see node_modules/next/dist/docs/01-app/02-guides/json-ld.md);
 * escaping `<` closes the XSS hole that a raw `</script>` in CMS text would open.
 */
export function jsonLdProps(graph: JsonLdObject[]): { __html: string } {
  return {
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@graph": graph,
    }).replace(/</g, "\\u003c"),
  };
}

/** Organization + WebSite. Rendered once, in the root layout. */
export function siteGraph(): JsonLdObject[] {
  return [
    {
      "@type": "Organization",
      "@id": ORGANIZATION_ID,
      name: ORGANIZATION_NAME,
      url: `${SITE_URL}/`,
      logo: {
        "@type": "ImageObject",
        "@id": `${SITE_URL}/#logo`,
        url: abs("/home/SIM-Logotipo.png"),
        contentUrl: abs("/home/SIM-Logotipo.png"),
        width: 293,
        height: 48,
        caption: ORGANIZATION_NAME,
      },
      image: { "@id": `${SITE_URL}/#logo` },
      sameAs: [
        "https://www.facebook.com/SIMLatinoamerica/",
        "https://www.instagram.com/simlatinoamerica",
        "https://www.youtube.com/user/VamosSIM",
        "https://open.spotify.com/show/0vftsfjR9UP5tD2PG6jb5P",
      ],
    },
    {
      "@type": "WebSite",
      "@id": WEBSITE_ID,
      url: `${SITE_URL}/`,
      name: ORGANIZATION_NAME,
      description:
        "SIM es una comunidad de creyentes comprometidos a servir a Dios y a las personas en Latinoamérica y el mundo.",
      publisher: { "@id": ORGANIZATION_ID },
      inLanguage: "es",
    },
  ];
}

export interface BreadcrumbStep {
  name: string;
  /** Site-relative path, e.g. `/blog/`. Omitted on the final crumb. */
  path?: string;
}

export function breadcrumbGraph(pagePath: string, steps: BreadcrumbStep[]): JsonLdObject {
  return {
    "@type": "BreadcrumbList",
    "@id": `${abs(pagePath)}#breadcrumb`,
    itemListElement: steps.map((step, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: step.name,
      ...(step.path ? { item: abs(step.path) } : {}),
    })),
  };
}

export interface ArticleInput {
  /** Site-relative canonical path, e.g. `/blog/2025-06/slug/`. */
  path: string;
  headline: string;
  description?: string | null;
  image?: { url: string; width?: number | null; height?: number | null } | null;
  datePublished?: string | null;
  dateModified?: string | null;
  categories?: string[] | null;
  tags?: string[] | null;
}

export function articleGraph(article: ArticleInput): JsonLdObject {
  const url = abs(article.path);
  return {
    "@type": "Article",
    "@id": `${url}#article`,
    isPartOf: { "@id": WEBSITE_ID },
    mainEntityOfPage: url,
    url,
    headline: article.headline,
    ...(article.description ? { description: article.description } : {}),
    ...(article.image?.url
      ? {
          image: {
            "@type": "ImageObject",
            url: article.image.url,
            contentUrl: article.image.url,
            ...(article.image.width ? { width: article.image.width } : {}),
            ...(article.image.height ? { height: article.image.height } : {}),
          },
          thumbnailUrl: article.image.url,
        }
      : {}),
    ...(article.datePublished ? { datePublished: article.datePublished } : {}),
    ...(() => {
      const modified = article.dateModified ?? article.datePublished;
      return modified ? { dateModified: modified } : {};
    })(),
    author: { "@id": ORGANIZATION_ID },
    publisher: { "@id": ORGANIZATION_ID },
    ...(article.categories?.length ? { articleSection: article.categories } : {}),
    ...(article.tags?.length ? { keywords: article.tags } : {}),
    inLanguage: "es",
  };
}
