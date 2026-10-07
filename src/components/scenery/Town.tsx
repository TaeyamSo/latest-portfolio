import { cn } from "@/lib/cn";
import { Palette, palette } from "@/lib/palette";

import { mulberry32 } from "./ridges";
import { TownCues } from "./TownCues";

/*
 * Noon, under the services: a small town. It's drawn in the landscape's
 * 1440 × 240 strip like the other scenes, but in a box of exactly that shape
 * which covers the strip (cropped at the sides on narrow screens, so the
 * middle — the office, the clock tower, the shop and the billboard — matters
 * most). That way the life laid over the drawing lines up with it at every
 * size: people strolling by, a cyclist, chimney smoke, the clock's hands, the
 * bell and its pigeons, and the awnings.
 * Everything that moves is its own small element, moved only with transform
 * and opacity (globals.css, "The town at noon").
 *
 * At night (the night theme) the same street in blue, its windows lighting up
 * one by one as the services arrive, the lamps glowing, the clock face lit.
 */
const W = 1440;
const H = 240;
/** Where the buildings stand; the pavement runs in front of them, the road below. */
const GROUND = 208;

const pct = (value: number, of: number) => `${+((value / of) * 100).toFixed(3)}%`;
const px = (x: number) => pct(x, W);
const py = (y: number) => pct(y, H);

type Vars = React.CSSProperties & Record<`--${string}`, string | number>;
type Box = readonly [x: number, y: number, w: number, h: number];

/**
 * Mid-tones a step darker than the noon sky; ink for the people and the signs.
 * The second colour is the night's: slate blues under the moon, dark glass,
 * and the people as silhouettes.
 */
const PAINT = palette("town", {
  far: ["#f39a46", "#2b3770"],
  wallA: ["#e6782a", "#2f3a6b"],
  wallB: ["#ee8b3a", "#35417a"],
  wallC: ["#dc6a26", "#29336a"],
  wallD: ["#e98042", "#323d74"],
  wallE: ["#ec9a4c", "#3a4682"],
  stone: ["#e07228", "#2c3770"],
  roof: ["#b84d1a", "#1b2250"],
  roofDark: ["#9c3f16", "#151b42"],
  trim: ["#c25a20", "#232c5e"],
  frame: ["#f9c27a", "#56649e"],
  glass: ["#9a4015", "#151a3a"],
  door: ["#8a3412", "#141a3a"],
  shade: ["#5a2410", "#0e1330"],
  tree: ["#b84a14", "#1a2252"],
  trunk: ["#9a3a12", "#141a3e"],
  pavement: ["#ec8d42", "#283265"],
  kerb: ["#b9531e", "#1d254f"],
  road: ["#d2662a", "#1a1f3c"],
  dash: ["#ffd27a", "#7f8cc0"],
  ink: ["#3b1409", "#0a0e22"],
  paper: ["#fffaf4", "#fff0c4"],
  poster: ["#f6dcc0", "#f3e3c6"],
  smoke: ["#fff1d0", "#8f9cc9"],
  flame: ["#fd5d16", "#c8451a"],
  gold: ["#ffb629", "#e0a63a"],
  lamp: ["#f9c27a", "#ffe6a8"],
});
const C = PAINT.C;

/** Windows and lamps when they're lit (the night theme). */
const LIT = "#ffcf6e";

/* --- Drawing helpers -------------------------------------------------- */

/** A pitched roof from x0 to x1 (eaves at `eave`, ridge at `peak`). */
function Gable({ x0, x1, eave, peak, fill }: { x0: number; x1: number; eave: number; peak: number; fill: string }) {
  return <path d={`M${x0},${eave}L${(x0 + x1) / 2},${peak}L${x1},${eave}Z`} fill={fill} />;
}

/**
 * A window: a light frame around dark glass. At night about two in three are
 * lit — the same ones every time — each coming on at its own moment.
 */
function Win({ x, y, w = 12, h = 16 }: { x: number; y: number; w?: number; h?: number }) {
  const n = (x * 37 + y * 101) % 23;
  return (
    <>
      <rect x={x - 1.5} y={y - 1.5} width={w + 3} height={h + 3} fill={C.frame} />
      <rect x={x} y={y} width={w} height={h} fill={C.glass} />
      {n % 3 !== 0 && <rect className="night-light" x={x} y={y} width={w} height={h} fill={LIT} style={{ "--i": n % 14 } as Vars} />}
    </>
  );
}

const archPath = (x: number, w: number, top: number) => `M${x},${GROUND}V${top + w / 2}A${w / 2},${w / 2} 0 0 1 ${x + w},${top + w / 2}V${GROUND}Z`;

/** A front door on the ground line, with its frame, a step and a brass knob. */
function Door({ x, w = 18, h = 32, arch }: { x: number; w?: number; h?: number; arch?: boolean }) {
  const top = GROUND - h;
  return (
    <>
      {arch ? (
        <>
          <path d={archPath(x - 2, w + 4, top - 2)} fill={C.trim} />
          <path d={archPath(x, w, top)} fill={C.door} />
        </>
      ) : (
        <>
          <rect x={x - 2} y={top - 2} width={w + 4} height={h + 2} fill={C.trim} />
          <rect x={x} y={top} width={w} height={h} fill={C.door} />
        </>
      )}
      <circle cx={x + w * 0.78} cy={top + h * 0.58} r="1.1" fill={C.gold} />
      <rect x={x - 4} y={GROUND} width={w + 8} height="3" fill={C.trim} />
    </>
  );
}

function Tree({ x, top = 168, size = 1 }: { x: number; top?: number; size?: number }) {
  return (
    <>
      <rect x={x - 2} y={top + 8} width="4" height={GROUND + 2 - top - 8} fill={C.trunk} />
      <circle cx={x - 9 * size} cy={top + 8} r={9 * size} fill={C.tree} />
      <circle cx={x + 10 * size} cy={top + 7} r={10 * size} fill={C.roofDark} />
      <circle cx={x} cy={top} r={14 * size} fill={C.tree} />
    </>
  );
}

function Lamp({ x }: { x: number }) {
  return (
    <>
      {/* Its light at night: a warm pool around the head. */}
      <circle className="night-light" cx={x} cy="167" r="16" fill={LIT} style={{ "--glow": 0.12, "--i": 2 } as Vars} />
      <circle className="night-light" cx={x} cy="167" r="7" fill={LIT} style={{ "--glow": 0.3, "--i": 2 } as Vars} />
      <rect x={x - 1} y="170" width="2" height="46" fill={C.shade} />
      <path d={`M${x - 4},170h8l-1.5,-5h-5Z`} fill={C.shade} />
      <rect x={x - 2.2} y="165.6" width="4.4" height="3.4" fill={C.lamp} />
    </>
  );
}

/** The billboard's poster: a little landing page. */
function Poster() {
  return (
    <>
      <rect x="922" y="110" width="104" height="34" fill={C.poster} />
      <rect x="922" y="110" width="104" height="5" fill={C.flame} />
      <rect x="928" y="120" width="48" height="5" fill={C.ink} />
      <rect x="928" y="128" width="34" height="5" fill={C.ink} />
      <rect x="928" y="137" width="20" height="5" rx="2.5" fill={C.flame} />
      <rect x="986" y="118" width="34" height="22" fill={C.gold} />
    </>
  );
}

/* --- The town ---------------------------------------------------------- */

/** Hazy rooftops behind the street, showing between and above the buildings. */
function FarRoofs() {
  const random = mulberry32(71);
  const d: string[] = [];
  for (let x = -10; x < W + 10; ) {
    const w = 34 + random() * 46;
    const top = 122 + random() * 30;
    d.push(
      random() > 0.5
        ? `M${x},${GROUND}V${top}H${x + w}V${GROUND}Z`
        : `M${x},${GROUND}V${top + 10}L${x + w / 2},${top}L${x + w},${top + 10}V${GROUND}Z`,
    );
    x += w + random() * 6;
  }
  return <path d={d.join("")} fill={C.far} />;
}

function Street() {
  return (
    <>
      <FarRoofs />

      {/* The bakery: its oven's chimney smokes. */}
      <rect x="100" y="96" width="13" height="28" fill={C.roofDark} />
      <rect x="14" y="128" width="120" height={GROUND - 128} fill={C.wallB} />
      <Gable x0={8} x1={140} eave={130} peak={102} fill={C.roof} />
      <rect x="24" y="151" width="62" height="3" rx="1.5" fill={C.door} />
      <Win x={29} y={166} w={52} h={26} />
      <Door x={94} w={20} h={32} />

      {/* A townhouse. */}
      <rect x="146" y="104" width="98" height={GROUND - 104} fill={C.wallC} />
      <Gable x0={140} x1={250} eave={106} peak={84} fill={C.roofDark} />
      {[160, 189, 218].map((x) => (
        <Win key={x} x={x} y={116} />
      ))}
      {[160, 218].map((x) => (
        <Win key={x} x={x} y={150} />
      ))}
      <Door x={186} w={18} h={30} arch />

      {/* The café. */}
      <rect x="254" y="140" width="122" height={GROUND - 140} fill={C.wallD} />
      <rect x="250" y="136" width="130" height="6" fill={C.trim} />
      <rect x="256" y="160" width="110" height="3" rx="1.5" fill={C.door} />
      <Win x={263} y={174} w={60} h={24} />
      <Door x={336} w={22} h={36} />

      {/* The office. */}
      <rect x="388" y="92" width="140" height={GROUND - 92} fill={C.wallA} />
      <rect x="383" y="86" width="150" height="7" fill={C.roof} />
      {[100, 124, 148].map((y) => [404, 432, 460, 488].map((x) => <Win key={`${x}-${y}`} x={x} y={y} w={20} h={16} />))}
      <rect x="443" y="177" width="30" height="31" fill={C.glass} />
      <rect className="night-light" x="443" y="177" width="30" height="31" fill={LIT} style={{ "--i": 5, "--glow": 0.8 } as Vars} />

      {/* A narrow house. */}
      <rect x="538" y="128" width="72" height={GROUND - 128} fill={C.wallB} />
      <Gable x0={532} x1={616} eave={130} peak={102} fill={C.roof} />
      {[550, 586].map((x) => (
        <Win key={x} x={x} y={142} w={10} h={14} />
      ))}
      <Door x={566} w={16} h={28} arch />

      {/* A little square before the clock tower: a tree, a bench, a lamp. */}
      <Tree x={634} top={176} />
      <path d="M648,196h20M648,200.5h20M650,200.5v7.5M666,200.5v7.5" stroke={C.door} strokeWidth="1.6" />
      <Lamp x={678} />

      {/* The clock tower: the bell rings at noon, the clock turns. */}
      <rect x="694" y="122" width="52" height="76" fill={C.stone} />
      <rect x="688" y="198" width="64" height="10" fill={C.trim} />
      <Door x={711} w={18} h={24} arch />
      <circle cx="720" cy={CLOCK} r="15.5" fill={C.trim} />
      <circle cx="720" cy={CLOCK} r="13.4" fill={C.paper} />
      <rect x="688" y="117" width="64" height="5" fill={C.roof} />
      <rect x="698" y="92" width="44" height="25" fill={C.stone} />
      <path d="M709,117V106A11,11 0 0 1 731,106V117Z" fill={C.shade} />
      <rect x="692" y="89" width="56" height="5" fill={C.roof} />
      <path d="M695,89L720,64L745,89Z" fill={C.roofDark} />

      {/* The shop. */}
      <rect x="762" y="116" width="138" height={GROUND - 116} fill={C.wallB} />
      <path d="M756,116L768,100H894L906,116Z" fill={C.roofDark} />
      {[778, 824, 870].map((x) => (
        <Win key={x} x={x} y={125} w={14} h={14} />
      ))}
      <rect x="766" y="162" width="130" height="3" rx="1.5" fill={C.door} />
      <Win x={772} y={174} w={80} h={26} />
      <Door x={862} w={26} h={40} />

      {/* A garage with a billboard on its roof. */}
      <rect x="912" y="160" width="122" height={GROUND - 160} fill={C.wallC} />
      <rect x="908" y="156" width="130" height="5" fill={C.roof} />
      <rect x="931" y="179" width="38" height="29" fill={C.trim} />
      <Win x={990} y={177} w={26} h={16} />
      <rect x="944" y="146" width="4" height="10" fill={C.door} />
      <rect x="1000" y="146" width="4" height="10" fill={C.door} />
      <rect x="918" y="106" width="112" height="42" fill={C.ink} />
      <Poster />

      {/* A townhouse whose chimney smokes. */}
      <rect x="1120" y="82" width="13" height="30" fill={C.roofDark} />
      <rect x="1046" y="106" width="104" height={GROUND - 106} fill={C.wallA} />
      <Gable x0={1040} x1={1156} eave={108} peak={86} fill={C.roof} />
      {[1062, 1092, 1122].map((x) => (
        <Win key={x} x={x} y={118} />
      ))}
      {[1062, 1122].map((x) => (
        <Win key={x} x={x} y={152} />
      ))}
      <Door x={1089} w={18} h={30} arch />

      {/* The florist. */}
      <rect x="1160" y="146" width="108" height={GROUND - 146} fill={C.wallE} />
      <rect x="1156" y="142" width="116" height="5" fill={C.trim} />
      <rect x="1168" y="163" width="74" height="3" rx="1.5" fill={C.door} />
      <Win x={1171} y={176} w={50} h={20} />
      <Door x={1232} w={20} h={34} />

      {/* A cottage, and a tree at the end of the street. */}
      <rect x="1278" y="140" width="122" height={GROUND - 140} fill={C.wallB} />
      <Gable x0={1270} x1={1408} eave={142} peak={112} fill={C.roofDark} />
      {[1296, 1368].map((x) => (
        <Win key={x} x={x} y={162} w={14} h={14} />
      ))}
      <Door x={1330} w={18} h={32} arch />
      <Tree x={1422} top={174} />

      {/* The pavement, the kerb and the road. */}
      <rect y={GROUND} width={W} height="16" fill={C.pavement} />
      <rect y="224" width={W} height="2.5" fill={C.kerb} />
      <rect y="226.5" width={W} height="13.5" fill={C.road} />
      <path d="M0,233.5H1440" stroke={C.dash} strokeWidth="1.6" strokeDasharray="16 14" opacity="0.7" />

      {/* On the pavement: lamps and the café's tables. */}
      {[249, 1040, 1273].map((x) => (
        <Lamp key={x} x={x} />
      ))}
      {TABLES.map(({ x, canopy }) => (
        <g key={x}>
          <rect x={x - 0.6} y="186" width="1.2" height="21" fill={C.ink} />
          <path d={`M${x - 13},191Q${x},181 ${x + 13},191Z`} fill={canopy} />
          <rect x={x - 9} y="205" width="18" height="2" fill={C.ink} />
          <rect x={x - 1} y="207" width="2" height="10" fill={C.ink} />
        </g>
      ))}
    </>
  );
}

/** The clock face's centre on the tower. */
const CLOCK = 142;
const TABLES = [
  { x: 281, canopy: C.flame },
  { x: 364, canopy: C.gold },
];

/* --- What moves ---------------------------------------------------------- */

/** A piece of the drawing lifted out to move on its own: an SVG over the box at [x, y, w, h], in strip units. */
function Patch({ box: [x, y, w, h], className, style, children }: { box: Box; className?: string; style?: Vars; children: React.ReactNode }) {
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

/** An awning that unrolls when the shops open (the services arrive). */
function Awning({ box, colors, i }: { box: Box; colors: readonly [string, string]; i: number }) {
  const [x, y, w, h] = box;
  const n = Math.round(w / 10);
  const s = w / n;
  return (
    <Patch box={box} className="town-awning" style={{ "--i": i }}>
      {Array.from({ length: n }, (_, k) => (
        <rect key={k} x={x + k * s} y={y} width={s} height={h} fill={colors[k % 2]} />
      ))}
    </Patch>
  );
}

/** Someone on foot (facing right): head, body and arms, with or without a dress or a bag. */
function Body({ dress, bag, bun, reach, width = "100%" }: { dress?: boolean; bag?: boolean; bun?: boolean; reach?: boolean; width?: string }) {
  return (
    <svg viewBox="0 0 10 22" className="town-bob relative block" style={{ width }} fill={C.ink}>
      <circle cx="5" cy="3" r="2.5" />
      {bun && <circle cx="2.7" cy="2.2" r="1.3" />}
      <path d={dress ? "M2.6,7.2Q5,5.4 7.4,7.2L8.6,15.4L1.4,15.4Z" : "M2.4,7.2Q5,5.4 7.6,7.2L7.2,14.4L2.8,14.4Z"} />
      <path d={reach ? "M2.6,7.6L1.8,13M7.4,7.6L8.6,12.2" : "M2.6,7.6L1.8,13M7.4,7.6L8.2,13"} stroke={C.ink} strokeWidth="1.3" strokeLinecap="round" />
      {bag && (
        <>
          <path d="M8.4,12.6v-0.8a1,1 0 0 1 2,0v0.8" fill="none" stroke={C.ink} strokeWidth="0.5" />
          <rect x="7.8" y="12.5" width="3.2" height="3.6" rx="0.4" fill={C.gold} />
        </>
      )}
    </svg>
  );
}

/** The legs, apart from the body so they can scissor as they walk. */
function Legs({ width = "100%" }: { width?: string }) {
  return (
    <svg viewBox="0 13 10 9" className="town-legs absolute bottom-0 left-0 block" style={{ width }}>
      <path d="M4.1,13.5L2.9,21.6M5.9,13.5L7.1,21.6" stroke={C.ink} strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

/** One walker on the box: `w` strip units wide, `at` strip units from the group's start. */
function Figure({ w, at = 0, flip, step, children }: { w: number; at?: number; flip?: boolean; step?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn("absolute bottom-0", flip && "-scale-x-100")}
      style={{ left: px(at), width: px(w), "--step": step } as Vars}
    >
      {children}
    </div>
  );
}

/** Someone standing still on the pavement (feet at `ground`). */
function Stand({ ground, children }: { ground: number; children: React.ReactNode }) {
  return (
    <div className="absolute left-0 h-0 w-full" style={{ bottom: py(H - ground) }}>
      {children}
    </div>
  );
}

/**
 * Someone crossing the town, slowly — they're far away. The wrapper spans the
 * box and slides across it (a full crossing takes `time` seconds); `start` is
 * how far along they are when the town comes up, `at` where they stand when
 * nothing moves (reduced motion).
 */
function Stroll({ dir, time, start, at, ground, children }: { dir: "left" | "right"; time: number; start: number; at: number; ground: number; children: React.ReactNode }) {
  return (
    <div
      data-dir={dir}
      className="town-walk absolute left-0 h-0 w-full"
      style={{ bottom: py(H - ground), "--walk": `${time}s`, "--delay": `${(-start * time).toFixed(1)}s`, "--at": `${at}%` } as Vars}
    >
      {children}
    </div>
  );
}

function Wheel({ cx }: { cx: number }) {
  return (
    <svg viewBox="-5.5 -5.5 11 11" className="town-wheel absolute block" style={{ left: pct(cx - 5.5, 30), top: pct(13 + 5, 29), width: pct(11, 30) }}>
      <circle r="4.8" fill="none" stroke={C.ink} strokeWidth="1.1" />
      <path d="M-4.8,0H4.8M0,-4.8V4.8M-3.4,-3.4L3.4,3.4M-3.4,3.4L3.4,-3.4" stroke={C.ink} strokeWidth="0.45" />
      <circle r="0.9" fill={C.ink} />
    </svg>
  );
}

/** A pigeon on the clock tower; it flies off (to fx, fy — % of its own size) when the bell rings. */
function Pigeon({ x, y, i, fx, fy, flip }: { x: number; y: number; i: number; fx: string; fy: string; flip?: boolean }) {
  return (
    <div className="town-pigeon-x absolute" style={{ left: px(x), top: py(y - 6), width: px(8), "--i": i, "--fx": fx, "--fy": fy } as Vars}>
      <div className="town-pigeon-y">
        <svg viewBox="0 0 8 6" className={cn("town-pigeon block w-full overflow-visible", flip && "-scale-x-100")}>
          <path
            className="town-pigeon-sit"
            d="M0.4,3.6L2,2.6Q3.4,1.4 5.6,2Q6.4,0.6 7.4,1.4Q7.8,2 7,2.6L6.6,3Q6,5.2 3.2,5Q1.6,4.8 0.4,3.6Z"
            fill={C.ink}
          />
          <path className="town-pigeon-fly" d="M0.4,3.4C1.6,1 3,1.2 4,2.8C5,1.2 6.4,1 7.6,3.4" fill="none" stroke={C.ink} strokeWidth="1" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}

/** Smoke from a chimney: puffs rise, grow and fade, one after another. */
function Smoke({ x, y }: { x: number; y: number }) {
  return (
    <>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="town-smoke absolute rounded-full"
          style={{ left: px(x - 5), top: py(y - 10), width: px(10), aspectRatio: 1, background: C.smoke, "--i": i } as Vars}
        />
      ))}
    </>
  );
}

function StreetLife() {
  return (
    <>
      {/* The awnings, rolled up until the shops open. */}
      <Awning box={[24, 154, 62, 9]} colors={[C.flame, C.paper]} i={0} />
      <Awning box={[256, 163, 110, 9]} colors={[C.ink, C.paper]} i={1} />
      <Awning box={[766, 165, 130, 9]} colors={[C.gold, C.paper]} i={2} />
      <Awning box={[1168, 166, 74, 9]} colors={[C.flame, C.paper]} i={3} />

      {/* The clock (hands at noon, turning) and the bell. */}
      <Patch box={[705, CLOCK - 15, 30, 30]} className="town-hand" style={{ "--turn": "60s" }}>
        <path d={`M720,${CLOCK}V${CLOCK - 10.5}`} stroke={C.ink} strokeWidth="1.6" strokeLinecap="round" />
      </Patch>
      <Patch box={[705, CLOCK - 15, 30, 30]} className="town-hand" style={{ "--turn": "720s" }}>
        <path d={`M720,${CLOCK}V${CLOCK - 7.4}`} stroke={C.ink} strokeWidth="2.4" strokeLinecap="round" />
        <circle cx="720" cy={CLOCK} r="1.6" fill={C.ink} />
      </Patch>
      <Patch box={[709, 98, 22, 19]} className="town-bell">
        <path d="M716.5,99.5h7" stroke={C.ink} strokeWidth="1.5" />
        <path d="M714,113C714,106 716.5,102 720,102C723.5,102 726,106 726,113L728,115L712,115Z" fill={C.gold} />
        <path d="M713.2,111.6H726.8" stroke={C.roof} strokeWidth="1.1" />
        <circle cx="720" cy="116.4" r="1.3" fill={C.ink} />
      </Patch>
      {/* Sweeping outside the bakery. */}
      <Stand ground={214}>
        <Figure w={10} at={118}>
          <svg viewBox="0 0 10 22" className="relative block w-full" fill={C.ink}>
            <circle cx="5" cy="3" r="2.5" />
            <path d="M2.4,7.2Q5,5.4 7.6,7.2L7.2,14.4L2.8,14.4Z" />
            <path d="M2.6,7.6L1.8,13M4.2,14L3.6,21.6M5.8,14L6.6,21.6" stroke={C.ink} strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <svg viewBox="6 8 10 15" className="town-sweep absolute block" style={{ left: "60%", top: pct(8, 22), width: "100%" }}>
            <path d="M7.5,9L12.5,20" stroke={C.door} strokeWidth="1" />
            <path d="M7.4,8.6L9,9.6" stroke={C.ink} strokeWidth="1.3" strokeLinecap="round" />
            <path d="M10.5,20.5L15,19L15.8,22L11.2,22.6Z" fill={C.gold} />
          </svg>
        </Figure>
      </Stand>

      {/* People strolling by — slowly, they're far away — and a cyclist on the road. */}
      <Stroll dir="right" time={92} start={0.3} at={30} ground={217}>
        <Figure w={10} step="0.5s">
          <Legs />
          <Body />
        </Figure>
      </Stroll>
      <Stroll dir="left" time={104} start={0.36} at={62} ground={220.5}>
        <Figure w={10} flip step="0.52s">
          <Legs />
          <Body bag bun />
        </Figure>
      </Stroll>
      <Stroll dir="right" time={120} start={0.49} at={47} ground={219}>
        <Figure w={10} step="0.55s">
          <Legs />
          <Body dress bun />
        </Figure>
        <Figure w={7} at={12} step="0.34s">
          <svg viewBox="0 0 8 16" className="town-bob absolute block" style={{ left: "45%", bottom: "55%", width: "90%", "--step": "1.3s" } as Vars}>
            <path d="M4,7.4Q5.6,11 3,16" fill="none" stroke={C.ink} strokeWidth="0.4" />
            <circle cx="4" cy="4" r="3.4" fill={C.paper} />
          </svg>
          <Legs />
          <Body />
        </Figure>
      </Stroll>
      <Stroll dir="left" time={112} start={0.6} at={18} ground={216.5}>
        <Figure w={26} flip step="0.5s">
          <Legs width={pct(10, 26)} />
          <Body reach width={pct(10, 26)} />
          <svg viewBox="0 0 26 22" className="absolute inset-0 block size-full" fill={C.ink}>
            <path d="M8.6,12.4Q13,17.4 18.4,16.4" fill="none" stroke={C.ink} strokeWidth="0.5" />
            <ellipse cx="21" cy="17.6" rx="4.2" ry="2.1" />
            <circle cx="24.6" cy="15.6" r="1.8" />
            <path d="M25.6,16.2l1.6,0.6l-1.4,0.8Z M23.6,14.4l-0.6,-1.8l1.4,1Z" />
            <path d="M17,17Q15.6,14.6 16.4,13.8M18.2,19v3M19.6,19v3M22.4,19v3M23.8,19v3" fill="none" stroke={C.ink} strokeWidth="0.9" strokeLinecap="round" />
          </svg>
        </Figure>
      </Stroll>
      <Stroll dir="right" time={38} start={0.18} at={44} ground={236.5}>
        <Figure w={30}>
          <svg viewBox="0 -5 30 29" className="relative block w-full">
            <path d="M6,18.5L13.5,18.5L11.5,10Z M13.5,18.5L21,10 M11.5,10L21,10 M21,10L24,18.5 M21,10L21.6,7.6L23.6,7.2" fill="none" stroke={C.ink} strokeWidth="1.2" strokeLinejoin="round" />
            <path d="M10,9.6h3.4" stroke={C.ink} strokeWidth="1.5" strokeLinecap="round" />
            <path d="M12,8.6L16.6,1.8" stroke={C.ink} strokeWidth="3.2" strokeLinecap="round" />
            <circle cx="18.2" cy="-1.6" r="2.3" fill={C.ink} />
            <path d="M16.4,2.6L21.8,7.4M12,8.8L16.4,12.6L14.4,17.6" fill="none" stroke={C.ink} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <Wheel cx={6} />
          <Wheel cx={24} />
        </Figure>
      </Stroll>
    </>
  );
}

/** What rises above the roofs: chimney smoke, and the pigeons that fly off at noon. */
function Sky() {
  return (
    <>
      <Smoke x={106.5} y={96} />
      <Smoke x={1126.5} y={82} />
      <Pigeon x={689} y={117} i={0} fx="-2300%" fy="-2300%" flip />
      <Pigeon x={743.5} y={117} i={1} fx="2700%" fy="-2100%" />
      <Pigeon x={570} y={103} i={2} fx="-3000%" fy="-1900%" flip />

    </>
  );
}

/**
 * The town scene. Its box keeps the strip's 1440 : 240 shape and covers it,
 * bottom-aligned and centred — the way the other scenes' `slice` crops — so
 * the drawing and the life over it share one set of coordinates. On wide,
 * short screens the box is taller than the strip and the street is trimmed
 * at the strip's top; the smoke and the pigeons are free to rise into the
 * sky. TownCues switches the noon moment on and off.
 */
export function Town() {
  return (
    <div data-scene="services" className="town absolute inset-0" style={{ transform: "translate3d(0, 105%, 0)", contentVisibility: "hidden" }}>
      <Palette of={PAINT} />
      <div className="absolute inset-0 overflow-hidden">
        <div className="town-box">
          <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="absolute inset-0 size-full overflow-visible">
            <Street />
          </svg>
          <StreetLife />
        </div>
      </div>
      <div className="town-box">
        <Sky />
      </div>
      <TownCues />
    </div>
  );
}
