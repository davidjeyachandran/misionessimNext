// Social-card and structured-data images.
//
// `next/image` routes through the custom loader (see next.config.ts), but
// `og:image`, `twitter:image` and JSON-LD are plain strings in the document
// head — nothing rewrites them. So every article and edition page was
// advertising the raw Contentful upload, some of which are 700KB+ and several
// thousand pixels wide, to every crawler and chat client that unfurls a link.
//
// 1200px is the width Facebook, X and LinkedIn all render large cards at.
const SOCIAL_WIDTH = 1200;

// JPEG rather than the WebP the on-page loader asks for. Card images are
// decoded by other companies' crawlers, and WebP support across them is still
// uneven (LinkedIn in particular). The saving here comes from the resize, not
// the codec, so there is nothing to gain by taking the risk.
const SOCIAL_FORMAT = "fm=jpg&fl=progressive&q=80";

const CONTENTFUL_IMAGES = "https://images.ctfassets.net/";

export interface SourceImage {
  url: string;
  width?: number | null;
  height?: number | null;
}

export interface SocialImage {
  url: string;
  width?: number;
  height?: number;
}

/**
 * Cap a Contentful image at social-card size. Non-Contentful sources (local
 * /public assets) pass through untouched — there is no resizing service for
 * them.
 */
export function socialImage(source: SourceImage | null | undefined): SocialImage | null {
  if (!source?.url) return null;
  if (!source.url.startsWith(CONTENTFUL_IMAGES)) {
    return {
      url: source.url,
      ...(source.width ? { width: source.width } : {}),
      ...(source.height ? { height: source.height } : {}),
    };
  }

  const url = `${source.url}?w=${SOCIAL_WIDTH}&${SOCIAL_FORMAT}`;

  // The Images API scales proportionally and does not upscale, so an original
  // narrower than 1200 comes back at its own size. Report the dimensions that
  // will actually be served, or none at all — a wrong width is worse than a
  // missing one, since crawlers use it to reserve layout.
  const { width, height } = source;
  if (!width || !height) return { url };

  const outWidth = Math.min(width, SOCIAL_WIDTH);
  return {
    url,
    width: outWidth,
    height: Math.round((height * outWidth) / width),
  };
}
