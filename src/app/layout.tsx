import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Kanit } from "next/font/google";

import { PointerParallax } from "@/components/providers/PointerParallax";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { profile } from "@/content/site";
import { siteUrl } from "@/lib/site-url";

import "lenis/dist/lenis.css";
import "./globals.css";

// The 2025 site asked for Kanit but never loaded it, so visitors saw Arial.
const kanit = Kanit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "800", "900"],
  variable: "--font-kanit",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
  preload: false,
});

const title = `${profile.fullName} — ${profile.role}`;
const description =
  "Tayam Soubuh is a front-end developer crafting fast, user-centric websites for real clients with React, Vue and Nuxt.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: title, template: `%s — ${profile.fullName}` },
  description,
  applicationName: profile.fullName,
  authors: [{ name: profile.fullName, url: profile.socials[0].href }],
  creator: profile.fullName,
  keywords: ["Tayam Soubuh", "front-end developer", "portfolio", "React", "Vue", "Nuxt", "web developer"],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: profile.fullName,
    title,
    description,
    locale: "en_US",
  },
  twitter: { card: "summary_large_image", title, description },
};

export const viewport: Viewport = {
  themeColor: "#fd5d16",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${kanit.variable} ${mono.variable}`}>
      <body>
        <a
          href="#main"
          className="meta fixed top-3 left-3 z-[100] -translate-y-24 bg-ink px-4 py-3 text-paper transition-transform focus-visible:translate-y-0"
        >
          Skip to content
        </a>
        <PointerParallax />
        <SmoothScroll>{children}</SmoothScroll>
        <div className="grain" aria-hidden="true" />
      </body>
    </html>
  );
}
