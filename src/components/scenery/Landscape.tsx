import { Palette, palette } from "@/lib/palette";

import { LandscapeMotion } from "./LandscapeMotion";
import { mulberry32 } from "./ridges";
import { Coast } from "./Coast";
import { Foothills } from "./Foothills";
import { Highway } from "./Highway";
import { Town } from "./Town";

/*
 * The landscape the day travels through, from the mountains to the sea. Each
 * scene is drawn in a 1440 × 240 strip (ground at the bottom) and is cropped
 * from the sides on narrow screens, so the middle of every scene matters most.
 * Colours are mid-tones a step darker than the sky above them, so ink copy that
 * scrolls over the strip stays readable (≥ 4.5:1 on everything large).
 */
const W = 1440;
const H = 240;

/** The city by day, and by night (the night theme): blue towers, lit windows. */
const CITY = palette("city", {
  back: ["#e8822e", "#232d63"],
  front: ["#d2662a", "#1a2152"],
  window: ["#c25a22", "#ffcf6e"],
});
const LIT = "#ffcf6e";

/**
 * Afternoon, behind the work: a city skyline — the businesses the work is for.
 * At night many more windows are lit, and red lights blink on the antennas.
 */
function City() {
  const random = mulberry32(83);
  const blocks = (seed: number, min: number, max: number, color: string, windows: boolean, glow = 0.5) => {
    const r = mulberry32(seed);
    // The front row's day windows come from the same draws as its shapes; the
    // back row's (night-only) windows from their own, so the day stays as it was.
    const lights = windows ? r : mulberry32(seed + 1000);
    const out: React.ReactNode[] = [];
    for (let x = -10, i = 0; x < W + 10; i++) {
      const w = 44 + r() * 70;
      const low = x < 560 ? 0.7 : 1; // lower under the copy on the left
      const h = (min + r() * (max - min)) * low;
      out.push(
        <g key={i}>
          <rect x={x} y={H - h} width={w} height={h} fill={color} />
          {Array.from({ length: Math.floor((h - 16) / 18) }, (_, row) =>
            Array.from({ length: Math.floor((w - 12) / 14) }, (_, col) => {
              const v = lights();
              const at = { x: x + 8 + col * 14, y: H - h + 10 + row * 18, width: 6, height: 8 };
              if (windows && v > 0.82) return <rect key={`${row}-${col}`} {...at} fill={CITY.C.window} />;
              // Only at night: the rest of the lit windows, some dimmer.
              if (v > glow) return <rect key={`${row}-${col}`} {...at} className="night-only" fill={LIT} opacity={v > 0.7 ? 0.9 : 0.55} />;
              return null;
            }),
          )}
        </g>,
      );
      x += w + 2;
    }
    return out;
  };
  const antennas = [0.68, 0.83].map((x) => x * W + random() * 20);
  return (
    <>
      {blocks(89, 70, 190, CITY.C.back, false, 0.8)}
      {antennas.map((x, i) => (
        <g key={x}>
          <path d={`M${x},${H - 150} v-36`} stroke={CITY.C.back} strokeWidth="3" />
          <circle className="antenna-blink night-only" cx={x} cy={H - 187} r="2.6" fill="#ff5a4a" style={{ "--i": i } as React.CSSProperties} />
        </g>
      ))}
      {blocks(97, 30, 118, CITY.C.front, true)}
    </>
  );
}

/**
 * Which section each scene belongs to (and so when it rises and sinks). The
 * foothills, the town, the highway and the coast draw their own boxes, with
 * life over them (`Own`).
 */
const SCENES: { section: string; Scene?: () => React.ReactNode; Own?: () => React.ReactNode }[] = [
  { section: "about", Own: Foothills },
  { section: "services", Own: Town },
  { section: "work", Scene: City },
  { section: "process", Own: Highway },
  { section: "journey", Own: Coast },
];

/**
 * A fixed strip along the bottom of the screen, between the clouds and the
 * page: as each section arrives its scene rises and the last one sinks away —
 * the hero's mountains, then foothills, a town, the city, the highway and
 * the coast, until the footer's sea takes over. The copy scrolls over it; the work
 * cards cover it. Drawn on the server; LandscapeMotion only moves it. Only the
 * sides are clipped, so the town's smoke and pigeons, the birds on the
 * highway's wire and the coast's gulls can rise into the sky.
 */
export function Landscape() {
  return (
    <div
      aria-hidden="true"
      className="scenery pointer-events-none fixed inset-x-0 bottom-0 z-[4] h-(--strip) overflow-x-clip"
    >
      <Palette of={CITY} />
      {SCENES.map(({ section, Scene, Own }) =>
        Own ? (
          <Own key={section} />
        ) : Scene ? (
          <svg
            key={section}
            data-scene={section}
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio="xMidYMax slice"
            className="absolute inset-0 size-full"
            style={{ transform: "translate3d(0, 105%, 0)", display: "none" }}
          >
            <Scene />
          </svg>
        ) : null,
      )}
      <LandscapeMotion />
    </div>
  );
}
