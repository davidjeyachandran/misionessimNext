// Custom next/image loader (see next.config.ts). The static export can't run
// the Next image optimizer, but the Contentful Images API resizes/re-encodes
// on their CDN for free — so ask it for a WebP at the rendered width instead
// of the raw upload (some originals are 700KB+).
// https://www.contentful.com/developers/docs/references/images-api/

const CONTENTFUL_IMAGES = "https://images.ctfassets.net/";

// Hints that `hintedSrc` smuggles through `src`, because next/image hands a
// loader only `src`, `width` and `quality` — there is no channel for an
// asset's intrinsic size. Stripped before the URL reaches Contentful.
const CAP = "mw";
const ASPECT = "ar";

export interface ImageDimensions {
  width?: number | null;
  height?: number | null;
}

export type Aspect = readonly [number, number];

/**
 * The widest a crop to `aspect` can be before Contentful starts inventing
 * pixels.
 *
 * A plain `?w=` resize clamps at the original's width, but `fit=fill` does
 * not: asking a 1280x853 upload for 1920x1080 returns a genuine 1920x1080
 * file that is 37% *heavier* than the uncropped original. So the cap is what
 * keeps the crop a saving rather than a regression. Height matters as well as
 * width — a letterboxed original runs out of rows before it runs out of
 * columns.
 */
function uncroppedWidth([aw, ah]: Aspect, { width, height }: ImageDimensions): number | null {
  if (!width || !height) return null;
  return Math.min(width, Math.floor((height * aw) / ah));
}

/**
 * Tag a Contentful URL so the loader crops it to `aspect` on the CDN.
 *
 * Without this a hero is cropped by `object-cover`: the browser downloads
 * every row of the original and CSS discards the ones outside the box. These
 * hero images are WordPress-era uploads with no consistent shape — 768x1087
 * portraits sit in the same 16:9 slot as 1800x1200 landscapes — so that
 * discard is frequently most of the file.
 *
 * Falls back to the untouched URL when dimensions are missing, which only
 * costs the saving; `object-cover` still frames the image correctly.
 */
export function hintedSrc(src: string, aspect: Aspect, dimensions: ImageDimensions): string {
  if (!src.startsWith(CONTENTFUL_IMAGES)) return src;
  const cap = uncroppedWidth(aspect, dimensions);
  if (!cap) return src;
  return `${src}?${new URLSearchParams({ [CAP]: String(cap), [ASPECT]: aspect.join(":") })}`;
}

export default function contentfulImageLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  // Local /public assets have no resizing service; serve as-is. Because this
  // ignores `width`, render those with <Image unoptimized> — otherwise Next
  // warns ("loader ... does not implement width") and emits a srcset of
  // identical URLs.
  if (!src.startsWith(CONTENTFUL_IMAGES)) return src;

  const [base, hintString = ""] = src.split("?");
  const hints = new URLSearchParams(hintString);

  const cap = Number(hints.get(CAP));
  const w = cap > 0 ? Math.min(width, cap) : width;

  const params = new URLSearchParams({
    w: String(w),
    fm: "webp",
    q: String(quality ?? 70),
  });

  const aspect = hints.get(ASPECT)?.split(":").map(Number);
  if (aspect?.length === 2 && aspect.every((n) => n > 0)) {
    const [aw, ah] = aspect;
    params.set("h", String(Math.round((w * ah) / aw)));
    // Contentful's default focus for `fill` is the centre — the same framing
    // `object-cover` was already producing, so nothing moves visually.
    params.set("fit", "fill");
  }

  return `${base}?${params}`;
}
