import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

const nextConfig = (phase: string): NextConfig => ({
  // The dev server and the production build each have their own folder. On Windows the dev
  // server (and editors and antivirus watching the project) keep `.next` open, so a build
  // that had to clear it failed with EBUSY; this way `build` and `dev` never touch the same one.
  distDir: phase === PHASE_DEVELOPMENT_SERVER ? ".next" : ".next-build",
  poweredByHeader: false,
  images: {
    // The sources are already WebP (see scripts/optimize-images.mjs), so WebP is what the
    // optimiser makes: AVIF is a little smaller but several times slower to encode, and
    // every image variant is encoded the first time somebody asks for it.
    formats: ["image/webp"],
    // Encoded variants are kept for a month (the files only change with a deploy).
    minimumCacheTTL: 60 * 60 * 24 * 31,
  },
});

export default nextConfig;
