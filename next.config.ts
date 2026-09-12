import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Separate from locked .next while zombie next-dev processes hold files open
  distDir: ".next-run",
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
