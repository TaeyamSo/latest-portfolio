import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/site-url";

// Prerendered at build time (a static export needs routes to say so).
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
