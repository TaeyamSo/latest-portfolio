import type { MetadataRoute } from "next";

import { profile } from "@/content/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${profile.fullName} — ${profile.role}`,
    short_name: profile.fullName,
    start_url: "/",
    display: "standalone",
    background_color: "#fd5d16",
    theme_color: "#fd5d16",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
