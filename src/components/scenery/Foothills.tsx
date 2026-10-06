import { cn } from "@/lib/cn";

import { FoothillsCues } from "./FoothillsCues";
import { ridgePath, type RidgeSpec } from "./ridges";

/*
 * Morning, by the about: the foothills below the mountains the day rose from.
 * Drawn like the town, the highway and the coast in a box of the strip's
 * 1440 : 240 shape that covers it, so the life over the drawing lines up at
 * every size; on phones the middle shows — the windmill and the stream.
 * About's wooden signposts stand in front, and a hot-air balloon floats in
 * the sky beside the portrait (both in About.tsx).
 *
 * A farm on the near slope (a house whose chimney smokes, a barn, a fence, hay
 * bales) with a windmill beside it, and a stream winding down the valley.
 * When the about arrives the windmill starts turning and the chimney smokes.
 * Point at the windmill and it spins faster (FoothillsCues).
 */
const W = 1440;
const H = 240;
const pct = (value: number, of: number) => `${+((value / of) * 100).toFixed(3)}%`;
const px = (x: number) => pct(x, W);
const py = (y: number) => pct(y, H);

type Vars = React.CSSProperties & Record<`--${string}`, string | number>;
type Anchors = RidgeSpec["anchors"];

const FAR: Anchors = [[0, 0.46], [0.2, 0.36], [0.45, 0.5], [0.7, 0.33], [0.9, 0.42], [1, 0.38]];
const NEAR: Anchors = [[0, 0.74], [0.25, 0.64], [0.5, 0.76], [0.75, 0.6], [1, 0.7]];

/** The ground's height (strip units) at x (strip units) along anchors. */
function groundAt(anchors: Anchors, x: number) {
  const t = x / W;
  for (let i = 1; i < anchors.length; i++) {
    const [x1, y1] = anchors[i];
    const [x0, y0] = anchors[i - 1];
    if (t <= x1) return (y0 + ((y1 - y0) * (t - x0)) / (x1 - x0 || 1)) * H;
  }
  return anchors[anchors.length - 1][1] * H;
}

const C = {
  far: "#e0661f",
  near: "#cf5a1c",
  haze: "#ffd9a6",
  trunk: "#9a3a12",
  tree: "#b84a14",
  wall: "#efb06a",
  roof: "#9c3f16",
  barn: "#a8441a",
  wood: "#8a3412",
  hay: "#f2b45e",
  stream: "#f2a65a",
  ink: "#3b1409",
  paper: "#fffaf4",
  flame: "#fd5d16",
  gold: "#ffb629",
} as const;

/** Where things stand. */
const MILL = { x: 470, y: groundAt(NEAR, 470) };
const TREES = [70, 150, 830, 900, 1160, 1230, 1340];

function Ridge({ anchors, points, amp, seed, fill }: { anchors: Anchors; points: number; amp: number; seed: number; fill: string }) {
  return (
    <g transform={`scale(${W / 1000} ${H / 1000})`}>
      <path d={ridgePath({ anchors, points, amp, seed }).d} fill={fill} />
    </g>
  );
}

function Land() {
  const farm = groundAt(NEAR, 260);
  return (
    <>
      <defs>
        <linearGradient id="foothills-haze" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0.3" stopColor={C.haze} stopOpacity="0" />
          <stop offset="0.75" stopColor={C.haze} stopOpacity="0.35" />
        </linearGradient>
      </defs>

      {/* The far ridge. */}
      <Ridge anchors={FAR} points={18} amp={0.02} seed={61} fill={C.far} />

      {/* The stream, winding down from the far valley. */}
      <path d="M640,122 Q660,140 690,150 Q722,162 716,178 Q708,196 742,212 Q770,226 760,240 L772,240 Q784,226 754,210 Q722,194 730,178 Q738,160 702,148 Q672,138 652,122 Z" fill={C.stream} />

      <rect width={W} height={H} fill="url(#foothills-haze)" />

      {/* The near hills, with the windmill's body on them (the sails turn on their own). */}
      <Ridge anchors={NEAR} points={20} amp={0.015} seed={67} fill={C.near} />
      <path d={`M${MILL.x - 9},${MILL.y + 4} L${MILL.x - 6},${MILL.y - 36} L${MILL.x + 6},${MILL.y - 36} L${MILL.x + 9},${MILL.y + 4} Z`} fill={C.wall} />
      <path d={`M${MILL.x - 9},${MILL.y - 35} L${MILL.x},${MILL.y - 46} L${MILL.x + 9},${MILL.y - 35} Z`} fill={C.roof} />
      <rect x={MILL.x - 2.5} y={MILL.y - 8} width="5" height="11" fill={C.wood} />
      <rect x={MILL.x - 2} y={MILL.y - 26} width="4" height="5" fill={C.wood} />
      {/* The stream again where it crosses the near hills. */}
      <path d="M716,180 Q706,196 740,212 Q768,226 758,240 L772,240 Q786,226 756,210 Q726,196 732,180 Z" fill={C.stream} />

      {/* The farm: a house (its chimney smokes), a barn, a fence, hay bales. */}
      <rect x="244" y={farm - 34} width="7" height="12" fill={C.roof} />
      <rect x="206" y={farm - 22} width="50" height="24" fill={C.wall} />
      <path d={`M200,${farm - 21} L231,${farm - 38} L262,${farm - 21} Z`} fill={C.roof} />
      <rect x="226" y={farm - 12} width="9" height="14" fill={C.wood} />
      {[212, 242].map((x) => (
        <rect key={x} x={x} y={farm - 16} width="8" height="7" fill={C.paper} opacity="0.85" />
      ))}
      <rect x="270" y={farm - 26} width="44" height="28" fill={C.barn} />
      <path d={`M266,${farm - 25} L274,${farm - 36} L306,${farm - 36} L318,${farm - 25} Z`} fill={C.roof} />
      <rect x="282" y={farm - 14} width="18" height="16" fill={C.paper} opacity="0.9" />
      <path d={`M282,${farm - 14} L300,${farm + 2} M300,${farm - 14} L282,${farm + 2}`} stroke={C.barn} strokeWidth="1.4" />
      <path
        d={`M324,${farm - 6} H420 M324,${farm - 1} H420 ${Array.from({ length: 7 }, (_, i) => `M${326 + i * 15},${farm - 9}V${farm + 2}`).join("")}`}
        fill="none"
        stroke={C.wood}
        strokeWidth="1.6"
      />
      {[348, 368, 392].map((x) => (
        <g key={x}>
          <circle cx={x} cy={farm - 3} r="5.5" fill={C.hay} />
          <circle cx={x} cy={farm - 3} r="2.4" fill="none" stroke={C.wood} strokeOpacity="0.4" />
        </g>
      ))}

      {/* A few round trees. */}
      {TREES.map((x) => {
        const ground = groundAt(NEAR, x);
        return (
          <g key={x}>
            <rect x={x - 2.5} y={ground - 18} width="5" height="24" fill={C.trunk} />
            <circle cx={x} cy={ground - 24} r="13" fill={C.tree} />
          </g>
        );
      })}
    </>
  );
}

/** A piece of the drawing lifted out to move on its own, at [x, y, w, h] in strip units. */
function Patch({ box: [x, y, w, h], className, style, children }: { box: readonly [number, number, number, number]; className?: string; style?: Vars; children: React.ReactNode }) {
  return (
    <svg
      viewBox={`${x} ${y} ${w} ${h}`}
      preserveAspectRatio="none"
      className={cn("absolute overflow-visible", className)}
      style={{ left: px(x), top: py(y), width: px(w), height: py(h), ...style }}
    >
      {children}
    </svg>
  );
}

function Life() {
  const farm = groundAt(NEAR, 260);
  return (
    <>
      {/* The windmill's sails, turning about the centre of their box. */}
      <Patch box={[MILL.x - 22, MILL.y - 54, 44, 44]} className="fh-mill">
        {[0, 90, 180, 270].map((a) => (
          <g key={a} transform={`rotate(${a} ${MILL.x} ${MILL.y - 32})`}>
            <rect x={MILL.x - 1} y={MILL.y - 53} width="2" height="21" fill={C.wood} />
            <rect x={MILL.x + 1} y={MILL.y - 52} width="6" height="15" fill={C.paper} opacity="0.92" />
          </g>
        ))}
        <circle cx={MILL.x} cy={MILL.y - 32} r="2.2" fill={C.ink} />
      </Patch>

      {/* Smoke from the farmhouse chimney. */}
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="fh-smoke town-smoke absolute rounded-full"
          style={{ left: px(247.5 - 5), top: py(farm - 46), width: px(10), aspectRatio: 1, background: "#fff1d0", "--i": i } as Vars}
        />
      ))}
    </>
  );
}

/**
 * The foothills scene, mounted by Landscape.tsx in the about's place. Like the
 * town, the highway and the coast: the drawing and its life share one box,
 * clipped to the strip; the chimney's smoke rises above it.
 */
export function Foothills() {
  return (
    <div data-scene="about" className="foothills absolute inset-0" style={{ transform: "translate3d(0, 105%, 0)", contentVisibility: "hidden" }}>
      <div className="absolute inset-0 overflow-hidden">
        <div className="town-box">
          <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="absolute inset-0 size-full overflow-visible">
            <Land />
          </svg>
          <Life />
        </div>
      </div>
      <FoothillsCues />
    </div>
  );
}
