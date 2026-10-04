import type { MetadataRoute } from "next";

import { caseStudies, caseStudyPath } from "@/content/site";
import { siteUrl } from "@/lib/site-url";

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
