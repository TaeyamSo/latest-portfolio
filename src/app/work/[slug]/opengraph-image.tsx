import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import sharp from "sharp";

import { sunSvg } from "@/components/sun/geometry";
import { caseStudies, profile } from "@/content/site";

export const alt = `Case study — ${profile.fullName}, ${profile.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Rendered at build time, like the pages (it reads fonts and screenshots from disk).
export const dynamicParams = false;

export function generateStaticParams() {
  return caseStudies.map((project) => ({ slug: project.slug }));
}

const INK = "#0d0a08";
const PAPER = "#fffaf4";

// Satori reads WOFF (not WOFF2), which @fontsource ships alongside.
const kanit = (weight: number) =>
  readFile(join(process.cwd(), `node_modules/@fontsource/kanit/files/kanit-latin-${weight}-normal.woff`));

/** The project's screenshot as a PNG data URI (Satori can't decode WebP). */
async function screenshot(file: string) {
  const png = await sharp(join(process.cwd(), "src/assets/projects", file)).resize({ width: 1000 }).png().toBuffer();
  return `data:image/png;base64,${png.toString("base64")}`;
}

/** A share card per case study: the name on the dark page, the site in its paper browser frame. */
export default async function CaseStudyImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = caseStudies.find((p) => p.slug === slug) ?? caseStudies[0];
  const [extraBold, medium, shot] = await Promise.all([
    kanit(800),
    kanit(500),
    screenshot(`${project.slug}.webp`),
  ]);
  const sun = `data:image/svg+xml;base64,${Buffer.from(sunSvg({ size: 64, tone: "sunset" })).toString("base64")}`;
  const ratio = project.image.height / project.image.width;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: INK,
          color: PAPER,
          fontFamily: "Kanit",
          overflow: "hidden",
        }}
      >
        {/* The site, tilted off the right edge */}
        <div
          style={{
            position: "absolute",
            left: 560,
            top: 150,
            width: 720,
            display: "flex",
            flexDirection: "column",
            background: PAPER,
            padding: 12,
            transform: "rotate(-4deg)",
          }}
        >
          <div style={{ display: "flex", gap: 8, paddingBottom: 10, paddingLeft: 4 }}>
            <div style={{ width: 12, height: 12, borderRadius: 6, background: "#fd5d16" }} />
            <div style={{ width: 12, height: 12, borderRadius: 6, background: "#fd8916" }} />
            <div style={{ width: 12, height: 12, borderRadius: 6, background: "#ffd84a" }} />
          </div>
          {/* ImageResponse renders with Satori, where next/image can't be used. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={shot} alt="" width={696} height={Math.round(696 * ratio)} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "64px 72px", width: 620 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 26, fontWeight: 500 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={sun} alt="" width={44} height={44} />
            {profile.fullName}
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: 22, fontWeight: 500, letterSpacing: 6, textTransform: "uppercase", color: "#ffd84a" }}>
              Case study
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 18,
                fontSize: project.name.length > 14 ? 76 : 96,
                fontWeight: 800,
                lineHeight: 0.92,
                letterSpacing: -1.5,
                textTransform: "uppercase",
              }}
            >
              {project.name}
            </div>
            <div style={{ display: "flex", marginTop: 24, fontSize: 30, fontWeight: 500, color: "rgba(255, 250, 244, 0.75)" }}>
              {project.category}
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Kanit", data: extraBold, weight: 800, style: "normal" },
        { name: "Kanit", data: medium, weight: 500, style: "normal" },
      ],
    },
  );
}
