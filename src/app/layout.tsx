import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Kanit } from "next/font/google";
import localFont from "next/font/local";

import { Cursor } from "@/components/chrome/Cursor";
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

// The accent voice: Fraunces Italic, a soft, slightly wonky serif set against
// Kanit's weight. Self-hosted as a static instance pinned to SOFT 100, WONK 1,
// display optical size, weight 400 — 21 KB instead of the 146 KB variable font
// next/font/google would ship (its `axes` option forces the full ranges).
const fraunces = localFont({
  src: "../assets/fonts/fraunces-italic-display.woff2",
  style: "italic",
  weight: "400",
  variable: "--font-fraunces",
  display: "swap",
  adjustFontFallback: "Times New Roman",
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
    <html lang="en" className={`${kanit.variable} ${mono.variable} ${fraunces.variable}`}>
      <body>
        <a
          href="#main"
          className="meta fixed top-3 left-3 z-[100] -translate-y-24 bg-ink px-4 py-3 text-paper transition-transform focus-visible:translate-y-0"
        >
          Skip to content
        </a>
        <PointerParallax />
        <SmoothScroll>{children}</SmoothScroll>
        <div className="grain [view-transition-name:grain]" aria-hidden="true" />
        <Cursor />
      </body>
    </html>
  );
}
