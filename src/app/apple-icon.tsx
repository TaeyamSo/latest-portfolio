import { ImageResponse } from "next/og";

import { sunSvg } from "@/components/sun/geometry";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  const sun = `data:image/svg+xml;base64,${Buffer.from(sunSvg({ size: 150 })).toString("base64")}`;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #fd5d16, #fd8916)",
        }}
      >
        {/* ImageResponse renders with Satori, where next/image can't be used. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={sun} alt="" width={150} height={150} />
      </div>
    ),
    size,
  );
}
