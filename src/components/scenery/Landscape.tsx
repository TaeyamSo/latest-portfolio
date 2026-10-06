import { LandscapeMotion } from "./LandscapeMotion";
import { mulberry32, ridgePath, type RidgeSpec } from "./ridges";
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

type Anchors = RidgeSpec["anchors"];

/** A faceted poster ridge across the strip (ridges.ts draws in a 1000-unit space). */
function Ridge({ anchors, points, amp, seed, fill }: { anchors: Anchors; points: number; amp: number; seed: number; fill: string }) {
  return (
    <g transform={`scale(${W / 1000} ${H / 1000})`}>
      <path d={ridgePath({ anchors, points, amp, seed }).d} fill={fill} />
    </g>
  );
}

/** The anchors' height at x (0–1), in strip units. */
function heightAt(anchors: Anchors, x: number) {
  for (let i = 1; i < anchors.length; i++) {
    const [x1, y1] = anchors[i];
    const [x0, y0] = anchors[i - 1];
    if (x <= x1) return (y0 + ((y1 - y0) * (x - x0)) / (x1 - x0 || 1)) * H;
  }
  return anchors[anchors.length - 1][1] * H;
}

/** Morning, by the about: rolling foothills, a few round trees, haze in the valley. */
function Foothills() {
  const near: Anchors = [[0, 0.74], [0.25, 0.64], [0.5, 0.76], [0.75, 0.6], [1, 0.7]];
  const trees = [0.07, 0.12, 0.57, 0.62, 0.8, 0.85, 0.93];
  return (
    <>
      <defs>
        <linearGradient id="foothills-haze" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0.3" stopColor="#ffd9a6" stopOpacity="0" />
          <stop offset="0.75" stopColor="#ffd9a6" stopOpacity="0.35" />
        </linearGradient>
      </defs>
      <Ridge anchors={[[0, 0.46], [0.2, 0.36], [0.45, 0.5], [0.7, 0.33], [0.9, 0.42], [1, 0.38]]} points={18} amp={0.02} seed={61} fill="#e0661f" />
      <rect width={W} height={H} fill="url(#foothills-haze)" />
      <Ridge anchors={near} points={20} amp={0.015} seed={67} fill="#cf5a1c" />
      {trees.map((x) => {
        const cx = x * W;
        const ground = heightAt(near, x);
        return (
          <g key={x}>
            <rect x={cx - 2.5} y={ground - 18} width="5" height="24" fill="#9a3a12" />
            <circle cx={cx} cy={ground - 24} r="13" fill="#b84a14" />
          </g>
        );
      })}
    </>
  );
}

/** Afternoon, behind the work: a city skyline — the businesses the work is for. */
function City() {
  const random = mulberry32(83);
  const blocks = (seed: number, min: number, max: number, color: string, windows: boolean) => {
    const r = mulberry32(seed);
    const out: React.ReactNode[] = [];
    for (let x = -10, i = 0; x < W + 10; i++) {
      const w = 44 + r() * 70;
      const low = x < 560 ? 0.7 : 1; // lower under the copy on the left
      const h = (min + r() * (max - min)) * low;
      out.push(
        <g key={i}>
          <rect x={x} y={H - h} width={w} height={h} fill={color} />
          {windows &&
            Array.from({ length: Math.floor((h - 16) / 18) }, (_, row) =>
              Array.from({ length: Math.floor((w - 12) / 14) }, (_, col) =>
                r() > 0.82 ? <rect key={`${row}-${col}`} x={x + 8 + col * 14} y={H - h + 10 + row * 18} width="6" height="8" fill="#c25a22" /> : null,
              ),
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
      {blocks(89, 70, 190, "#e8822e", false)}
      {antennas.map((x) => (
        <path key={x} d={`M${x},${H - 150} v-36`} stroke="#e8822e" strokeWidth="3" />
      ))}
      {blocks(97, 30, 118, "#d2662a", true)}
    </>
  );
}

/** Late afternoon, under the process: the road out of the city, the first strip of sea ahead. */
function Road() {
  return (
    <>
      <rect x="1000" y="118" width={W - 1000} height="30" fill="#e5762c" />
      <rect x="1000" y="117" width={W - 1000} height="2" fill="#ffd27a" opacity="0.7" />
      <Ridge anchors={[[0, 0.6], [0.35, 0.52], [0.6, 0.6], [0.72, 0.63], [1, 0.61]]} points={18} amp={0.012} seed={101} fill="#d9631f" />
      <path d="M220,240 C520,200 860,172 1040,150 L1064,150 C900,178 640,214 470,240 Z" fill="#b9531e" />
      <path d="M345,240 C600,207 880,176 1052,150" fill="none" stroke="#ffd84a" strokeWidth="3" strokeDasharray="14 12" opacity="0.85" />
    </>
  );
}

/** Golden hour, by the journey: cliffs with a small lighthouse (not lit yet), the sea catching the sun. */
function Coast() {
  const glitter = Array.from({ length: 6 }, (_, i) => ({ y: 160 + i * 13, w: 110 - i * 15, o: 0.85 - i * 0.11 }));
  return (
    <>
      <rect y="150" width={W} height={H - 150} fill="#d0521a" />
      <rect y="149" width={W} height="2.5" fill="#ffd27a" opacity="0.85" />
      {glitter.map(({ y, w, o }) => (
        <rect key={y} x={1238 - w / 2} y={y} width={w} height="4" rx="2" fill="#ffd27a" opacity={o} />
      ))}
      <path d="M0,240 L0,96 L120,88 L240,100 L380,84 L520,98 L640,92 L720,108 L760,140 L790,190 L800,240 Z" fill="#c9561e" />
      <path d="M0,240 L0,172 L180,162 L360,178 L560,190 L700,202 L740,240 Z" fill="#b34a18" />
      <g>
        <path d="M589,95 L593,31 L607,31 L611,95 Z" fill="#fffaf4" />
        <path d="M590.5,74 L609.5,74 L610.3,84 L589.7,84 Z M592,52 L608,52 L608.7,62 L591.3,62 Z" fill="#b3300c" />
        <rect x="590" y="18" width="20" height="14" fill="#3b1409" />
        <path d="M587,18 L600,7 L613,18 Z" fill="#3b1409" />
      </g>
    </>
  );
}

/** Which section each scene belongs to (and so when it rises and sinks). */
const SCENES = [
  { section: "about", Scene: Foothills },
  { section: "services", Scene: null }, // the town draws its own box, with life over it (Town.tsx)
  { section: "work", Scene: City },
  { section: "process", Scene: Road },
  { section: "journey", Scene: Coast },
] as const;

/**
 * A fixed strip along the bottom of the screen, between the clouds and the
 * page: as each section arrives its scene rises and the last one sinks away —
 * the hero's mountains, then foothills, a town, the city, the road and the
 * coast, until the footer's sea takes over. The copy scrolls over it; the work
 * cards cover it. Drawn on the server; LandscapeMotion only moves it. Only the
 * sides are clipped, so the town's smoke and pigeons can rise into the sky.
 */
export function Landscape() {
  return (
    <div
      aria-hidden="true"
      className="scenery pointer-events-none fixed inset-x-0 bottom-0 z-[4] h-(--strip) overflow-x-clip [--strip:clamp(12svh,16.7vw,26svh)]"
    >
      {SCENES.map(({ section, Scene }) =>
        Scene ? (
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
        ) : (
          <Town key={section} />
        ),
      )}
      <LandscapeMotion />
    </div>
  );
}
