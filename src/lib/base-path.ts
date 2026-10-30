/**
 * The sub-folder the site is served from, with a leading slash and no trailing
 * one ("/latest-portfolio" on GitHub Pages), or "" when it is served from the
 * root. Set at build time (NEXT_PUBLIC_BASE_PATH, see next.config.ts). Next
 * prefixes its own links and assets with it; use this for paths written by hand.
 */
export const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
