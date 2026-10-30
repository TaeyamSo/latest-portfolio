import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

import { sunSvg } from "@/components/sun/geometry";
import { profile } from "@/content/site";

export const alt = `${profile.fullName} — ${profile.role} portfolio`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Satori reads WOFF (not WOFF2), which @fontsource ships alongside.
const kanit = (weight: number) =>
  readFile(join(process.cwd(), `node_modules/@fontsource/kanit/files/kanit-latin-${weight}-normal.woff`));

const INK = "#0d0a08";

export default async function OpengraphImage() {
  const [extraBold, medium] = await Promise.all([kanit(800), kanit(500)]);
  const sun = `data:image/svg+xml;base64,${Buffer.from(sunSvg({ size: 440 })).toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "linear-gradient(90deg, #fd5d16, #fd8916 49%)",
          fontFamily: "Kanit",
          color: INK,
        }}
      >
        {/* ImageResponse renders with Satori, where next/image can't be used. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={sun} alt="" width={440} height={440} style={{ position: "absolute", left: 690, top: 95 }} />

        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 84px" }}>
          <div style={{ display: "flex", fontSize: 26, fontWeight: 500, letterSpacing: 8, textTransform: "uppercase" }}>
            Portfolio
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginTop: 18,
              fontSize: 148,
              fontWeight: 800,
              lineHeight: 0.9,
              letterSpacing: -2,
              textTransform: "uppercase",
            }}
          >
            <span>{profile.firstName}</span>
            <span>{profile.lastName}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", marginTop: 34 }}>
            <div style={{ width: 100, height: 5, borderRadius: 5, background: INK }} />
            <div style={{ width: 100, height: 5, borderRadius: 5, background: INK, marginTop: 13, marginLeft: 55 }} />
          </div>
          <div style={{ display: "flex", marginTop: 30, fontSize: 36, fontWeight: 500 }}>{profile.role}</div>
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
