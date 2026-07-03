import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: true,
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.ctfassets.net", // Contentful assets
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com", // YouTube thumbnails
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
