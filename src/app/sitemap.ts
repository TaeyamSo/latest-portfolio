import type { MetadataRoute } from "next";

import { caseStudies, caseStudyPath } from "@/content/site";
import { siteUrl } from "@/lib/site-url";

// Prerendered at build time (a static export needs routes to say so).
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteUrl, lastModified: new Date(), changeFrequency: "monthly", priority: 1 },
    ...caseStudies.map((project) => ({
      url: `${siteUrl}${caseStudyPath(project.slug)}`,
      lastModified: new Date(),
      changeFrequency: "yearly" as const,
      priority: 0.8,
    })),
  ];
}
