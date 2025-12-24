import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  // 🚨 ESSENTIAL for Puppeteer on Serverless
  serverExternalPackages: ['puppeteer-core', '@sparticuz/chromium-min'],
};

export default nextConfig;