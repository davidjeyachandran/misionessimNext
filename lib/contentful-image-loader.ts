// Custom next/image loader (see next.config.ts). The static export can't run
// the Next image optimizer, but the Contentful Images API resizes/re-encodes
// on their CDN for free — so ask it for a WebP at the rendered width instead
// of the raw upload (some originals are 700KB+).
// https://www.contentful.com/developers/docs/references/images-api/
export default function contentfulImageLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  if (src.startsWith("https://images.ctfassets.net/")) {
    return `${src}?w=${width}&fm=webp&q=${quality ?? 70}`;
  }
  // Local /public assets have no resizing service; serve as-is.
  return src;
}
