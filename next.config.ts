import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Local dev uses .next-run to avoid stale locks; Vercel expects .next
  distDir: process.env.VERCEL ? ".next" : ".next-run",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.ytimg.com",
      },
    ],
  },
};

export default nextConfig;
