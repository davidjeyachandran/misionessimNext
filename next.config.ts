import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fully static site: `next build` emits `out/`, deployed on Vercel.
  // No server runtime, so content changes require a rebuild + redeploy —
  // acceptable here (content changes ~every 2 months).
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
  // 'export'` (they need a server). All legacy redirects live in
  // `vercel.json`, which Vercel applies at the edge.
};

export default nextConfig;
