/**
 * Returns the first-party path used to serve a Revista PDF through Vercel.
 * Contentful already provides an ASCII-safe filename in its asset URL.
 */
export function revistaPdfPath(
  revistaSlug: string,
  assetUrl: string | null | undefined,
): string | null {
  if (!assetUrl) return null;
  const absoluteUrl = assetUrl.startsWith("//") ? `https:${assetUrl}` : assetUrl;
  const fileName = new URL(absoluteUrl).pathname.split("/").pop();
  if (!fileName) return null;
  return `/revistavamos/${revistaSlug}/${fileName}`;
}
