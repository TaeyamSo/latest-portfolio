import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    // AVIF first (smallest), WebP as the fallback.
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
