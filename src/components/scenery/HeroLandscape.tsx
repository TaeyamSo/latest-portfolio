import { cn } from "@/lib/cn";
import { Palette, palette } from "@/lib/palette";

import { Cloud, type CloudPalette, type CloudShape } from "./Cloud";
import { SinkLayer } from "./HeroScroll";
import { DESKTOP_RIDGES, MOBILE_RIDGES, RIDGE_BOTTOM, ridgePath, type RidgeSpec } from "./ridges";

type Vars = React.CSSProperties & Record<`--${string}`, string>;

const pct = (n: number) => `${(n * 100).toFixed(2)}%`;

/**
 * Colours of the three ridges. Far and mid follow the sky's flame → amber
 * gradient (so ink text stays readable on them: ≥ 5.5:1 and ≥ 4.8:1), with a
 * lighter valley mist low down so each crest stands out against the haze
 * behind it. The near ridge darkens into the ink marquee band below. At night
 * (the second colour) they're moonlit blue silhouettes in a pale moon mist.
 */
const PAINT = palette("ridge", {
  far0: ["#ec5418", "#28326c"],
  far1: ["#f07c1c", "#323e7e"],
  farMist: ["#ffc48a", "#8a98d6"],
  mid0: ["#da5018", "#1b2356"],
  mid1: ["#de621c", "#232d66"],
  midMist: ["#ff9a5a", "#6475bd"],
  near0: ["#a32a0c", "#111735"],
  near1: ["#2a0d06", "#060816"],
});
const P = PAINT.C;

const LAYERS = {
  far: { sink: 85, rise: "4svh", fill: [P.far0, P.far1], mist: [P.farMist, 0.4] },
  mid: { sink: 70, rise: "7svh", fill: [P.mid0, P.mid1], mist: [P.midMist, 0.3] },
  near: { sink: 50, rise: "10svh", fill: [P.near0, P.near1], mist: null },
} as const;

type Depth = keyof typeof LAYERS;

function RidgeLayer({ id, depth, spec, className }: { id: string; depth: Depth; spec: RidgeSpec; className: string }) {
  const { d, top } = ridgePath(spec);
  const { sink, rise, fill, mist } = LAYERS[depth];
  const y0 = top * 1000;
  const y1 = RIDGE_BOTTOM * 1000;
  const near = depth === "near";
  return (
    <SinkLayer sink={sink} className={cn("absolute inset-x-0", className)} style={{ top: pct(top), height: pct(RIDGE_BOTTOM - top) }}>
      <div className="intro-ridge size-full" style={{ "--rise": rise } as Vars}>
        <Palette of={PAINT} />
        <svg viewBox={`0 ${y0.toFixed(1)} 1000 ${(y1 - y0).toFixed(1)}`} preserveAspectRatio="none" className="block size-full">
          <defs>
            <linearGradient
              id={`${id}-fill`}
              gradientUnits="userSpaceOnUse"
              x1="0"
              y1={near ? y0 : 0}
              x2={near ? 0 : 1000}
              y2={near ? y1 : 0}
            >
              <stop offset="0" stopColor={fill[0]} />
              <stop offset={near ? 1 : 0.49} stopColor={fill[1]} />
            </linearGradient>
            {mist && (
              <linearGradient id={`${id}-mist`} gradientUnits="userSpaceOnUse" x1="0" y1={y0} x2="0" y2={y1}>
                <stop offset="0.15" stopColor={mist[0]} stopOpacity="0" />
                <stop offset="1" stopColor={mist[0]} stopOpacity={mist[1]} />
              </linearGradient>
            )}
          </defs>
          <path d={d} fill={`url(#${id}-fill)`} />
          {mist && <path d={d} fill={`url(#${id}-mist)`} />}
        </svg>
      </div>
    </SinkLayer>
  );
}

/**
 * Mountains at the foot of the hero, far to near. As the hero scrolls away
 * they sink back (far ones most) and slip behind the marquee band — the sun
 * rises out of them. Desktop and phone ranges are both in the page; CSS shows
 * one, so nothing changes after hydration.
 */
export function HeroRidges() {
  const depths: Depth[] = ["far", "mid", "near"];
  return (
    <>
      {depths.map((depth) => (
        <RidgeLayer key={`d-${depth}`} id={`ridge-d-${depth}`} depth={depth} spec={DESKTOP_RIDGES[depth]} className="hidden lg:block" />
      ))}
      {depths.map((depth) => (
        <RidgeLayer key={`m-${depth}`} id={`ridge-m-${depth}`} depth={depth} spec={MOBILE_RIDGES[depth]} className="lg:hidden" />
      ))}
    </>
  );
}

type HeroCloud = {
  id: string;
  shape: CloudShape;
  /** Golden in front of the sun: darker than the disc, still lighter than the sky. */
  palette: CloudPalette;
  /** Position in the hero (left/top as % of the hero, width in vw). */
  left: string;
  top: string;
  width: string;
  aspect: string;
  delay: string;
  drift: string;
  driftTime: string;
  driftDelay: string;
  className: string;
};

const HERO_CLOUDS: HeroCloud[] = [
  // Desktop: a long streak across the lower part of the sun, a small puff above the name's right.
  { id: "hero-streak", shape: "streak", palette: "golden", left: "60%", top: "57%", width: "30vw", aspect: "aspect-[100/22]", delay: "700ms", drift: "2.5vw", driftTime: "80s", driftDelay: "-20s", className: "hidden lg:block" },
  { id: "hero-puff", shape: "puff", palette: "day", left: "50%", top: "15%", width: "12vw", aspect: "aspect-[100/40]", delay: "850ms", drift: "3vw", driftTime: "100s", driftDelay: "-55s", className: "hidden lg:block" },
  // Phones: the streak crosses the sun, the puff sits above the name.
  { id: "hero-streak-m", shape: "streak", palette: "golden", left: "45%", top: "25%", width: "60vw", aspect: "aspect-[100/22]", delay: "700ms", drift: "3vw", driftTime: "80s", driftDelay: "-20s", className: "lg:hidden" },
  { id: "hero-puff-m", shape: "puff", palette: "day", left: "8%", top: "35%", width: "30vw", aspect: "aspect-[100/40]", delay: "850ms", drift: "3vw", driftTime: "100s", driftDelay: "-55s", className: "lg:hidden" },
];

/** Clouds drifting across the hero sky — the streak passes in front of the sun. */
export function HeroClouds() {
  return (
    <>
      {HERO_CLOUDS.map((cloud) => (
        <SinkLayer
          key={cloud.id}
          sink={45}
          className={cn("absolute", cloud.className)}
          style={{ left: cloud.left, top: cloud.top, width: cloud.width }}
        >
          <div className="intro-cloud" style={{ "--delay": cloud.delay } as Vars}>
            <div
              className="cloud-drift"
              style={{ "--drift": cloud.drift, "--drift-time": cloud.driftTime, "--drift-delay": cloud.driftDelay } as Vars}
            >
              <div className="cloud-float" style={{ "--float": "0.4vw", "--float-time": "8s", "--float-delay": cloud.driftDelay } as Vars}>
                <Cloud id={cloud.id} shape={cloud.shape} palette={cloud.palette} light="top-right" className={cn("w-full", cloud.aspect)} />
              </div>
            </div>
          </div>
        </SinkLayer>
      ))}
    </>
  );
}
