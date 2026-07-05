import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fully static site: `next build` emits `out/` for any static host
  // (Cloudflare Pages). No server runtime, so content changes require a
  // rebuild + redeploy — acceptable here (content changes ~every 2 months).
  output: "export",
  trailingSlash: true,
  reactStrictMode: true,
  images: {
    // The default image optimizer is a server feature and can't run in a
    // static export. Emit plain <img> tags; the source images
    // (Contentful/YouTube) and local /public assets are already right-sized.
    unoptimized: true,
  },
  // NOTE: redirects()/rewrites()/headers() are NOT supported by `output:
  // 'export'` (they need a server). The legacy redirects now live in
  // `public/_redirects`, which Cloudflare Pages reads. Keep the two in sync.
};

export default nextConfig;
