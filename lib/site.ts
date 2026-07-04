// Canonical production origin, used for metadataBase, canonical URLs, the
// sitemap and robots. Overridable via NEXT_PUBLIC_SITE_URL (e.g. Vercel
// preview deploys); defaults to the production domain.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://misionessim.org"
).replace(/\/$/, "");
