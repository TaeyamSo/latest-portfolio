import type { MetadataRoute } from "next";

import { profile } from "@/content/site";
import { basePath } from "@/lib/base-path";

// Prerendered at build time (a static export needs routes to say so).
export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${profile.fullName} — ${profile.role}`,
    short_name: profile.fullName,
    start_url: `${basePath}/`,
    scope: `${basePath}/`,
    display: "standalone",
    background_color: "#fd5d16",
    theme_color: "#fd5d16",
    icons: [
      { src: `${basePath}/icon.svg`, sizes: "any", type: "image/svg+xml" },
      { src: `${basePath}/apple-icon`, sizes: "180x180", type: "image/png" },
    ],
  };
}
