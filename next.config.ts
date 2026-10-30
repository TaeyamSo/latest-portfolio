import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

/**
 * Two ways to build. The ordinary one (`pnpm build`, then `pnpm start`) is a
 * Next server build. The other is a static export for GitHub Pages
 * (`pnpm build:pages`, scripts/build-pages.mjs): it sets STATIC_EXPORT=1 and
 * NEXT_PUBLIC_BASE_PATH (the sub-folder the site is served from), and writes
 * plain HTML, CSS and JS into `out/`.
 */
const exporting = process.env.STATIC_EXPORT === "1";

const nextConfig = (phase: string): NextConfig => ({
  // The dev server and the production build each have their own folder. On Windows the dev
  // server (and editors and antivirus watching the project) keep their folder open, so a build
  // that had to clear it failed with EBUSY; this way `dev` and `build` never touch the same one.
  // (An export is the odd one out: Next always does its working-folder build in `.next` and
  // writes only the finished site to the folder named here, `out`.)
  distDir: exporting ? "out" : phase === PHASE_DEVELOPMENT_SERVER ? ".next-dev" : ".next-build",
  poweredByHeader: false,
  ...(exporting && {
    output: "export" as const,
    // Each page becomes `…/index.html`, which GitHub Pages serves for `…/` and which keeps deep links working.
    trailingSlash: true,
    basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? "",
  }),
  images: {
    // An export has no server to resize images on; the files are already optimised WebP anyway.
    unoptimized: exporting,
    // The sources are already WebP (see scripts/optimize-images.mjs), so WebP is what the
    // optimiser makes: AVIF is a little smaller but several times slower to encode, and
    // every image variant is encoded the first time somebody asks for it.
    formats: ["image/webp"],
    // Encoded variants are kept for a month (the files only change with a deploy).
    minimumCacheTTL: 60 * 60 * 24 * 31,
  },
});

export default nextConfig;
