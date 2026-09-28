/**
 * Absolute site origin for metadata, sitemap and OG images.
 * Set NEXT_PUBLIC_SITE_URL once a custom domain exists; on Vercel the
 * production URL is picked up automatically.
 */
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");
