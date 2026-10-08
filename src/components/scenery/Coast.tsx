import { Palette, palette } from "@/lib/palette";

import { CoastCues } from "./CoastCues";
import { VehicleSprite } from "./vehicles";

/*
 * Golden hour, by the journey: the coast the highway was heading for. Drawn
 * like the town and the highway (Town.tsx, Highway.tsx) in a box of the
 * strip's 1440 : 240 shape that covers it, so the life over the drawing lines
 * up at every size; on phones the middle shows — the car at the lookout and
 * the lighthouse.
 *
 * The road from the process ends at a lookout on the cliff, where the car with
 * the surfboard is parked; the lighthouse (not lit yet — the footer lights it
 * at sunset) stands by its keeper's cottage, above the sea. When the journey
 * arrives the sun's path on the water opens up, a sailboat glides in and the
 * gulls come; the sun's path shimmers, the gulls circle. Point at a gull and
 * it flies off; point at the sailboat and it rocks (CoastCues).
 *
 * At night (the night theme) the coast is blue under the moon: its path on
 * the water is silver, the cottage window is lit, and the lighthouse is on —
 * its lantern glowing, its beam sweeping out over the sea.
 */
const W = 1440;
const H = 240;
const pct = (value: number, of: number) => `${+((value / of) * 100).toFixed(3)}%`;
const px = (x: number) => pct(x, W);
const py = (y: number) => pct(y, H);

type Vars = React.CSSProperties & Record<`--${string}`, string | number>;

/** The cliff top (the road and the lighthouse stand on it) and the sea's horizon. */
const TOP = 122;
const HORIZON = 150;

const PAINT = palette("coast", {
  sea: ["#d0521a", "#1a2458"],
  glitter: ["#ffd27a", "#dfe6ff"],
  cliff: ["#c9561e", "#1c2455"],
  rock: ["#b34a18", "#151b45"],
  asphalt: ["#5d3526", "#14182e"],
  dash: ["#ffd84a", "#aab3d8"],
  ink: ["#3b1409", "#0a0e22"],
  paper: ["#fffaf4", "#c9d0ec"],
  red: ["#b3300c", "#7a2a3c"],
  wall: ["#e6782a", "#2f3a6b"],
  roof: ["#9c3f16", "#151b42"],
  sail: ["#ffe6c4", "#aeb8de"],
  gull: ["#3b1409", "#c9d0ec"],
});
const C = PAINT.C;

/** The lighthouse's lamp and the cottage window, lit (the night theme). */
const LIT = "#ffcf6e";

function Land() {
  return (
    <>
      {/* The sea, out to the horizon. */}
      <rect x="640" y={HORIZON} width={W - 640} height={H - HORIZON} fill={C.sea} />
      <rect x="640" y={HORIZON - 1} width={W - 640} height="2.5" fill={C.glitter} opacity="0.85" />

      {/* The cliffs: the top the road runs along, the face down to the sea. */}
      <path d={`M0,240 V${TOP} L220,${TOP - 3} L460,${TOP + 1} L660,${TOP - 2} L700,${TOP + 4} L728,156 L752,200 L760,240 Z`} fill={C.cliff} />
      <path d="M0,240 V176 L240,170 L480,178 L640,186 L700,198 L728,240 Z" fill={C.rock} />
      <path d={`M0,${TOP} L220,${TOP - 3} L460,${TOP + 1} L660,${TOP - 2} L700,${TOP + 4}`} fill="none" stroke={C.glitter} strokeOpacity="0.45" strokeWidth="1.2" />
      {[
        [734, 196, 9],
        [758, 202, 6],
      ].map(([x, y, r]) => (
        <path key={x} d={`M${x - r},${y + 6} Q${x - r},${y - r * 0.6} ${x},${y - r * 0.7} Q${x + r},${y - r * 0.5} ${x + r},${y + 6} Z`} fill={C.rock} />
      ))}

      {/* The highway's end: the road comes in from the left and stops at a lookout with a railing. */}
      <rect x="0" y={TOP - 7} width="410" height="7" fill={C.asphalt} />
      <path d={`M0,${TOP - 3.5}H400`} stroke={C.dash} strokeWidth="1.2" strokeDasharray="10 8" />
      <path d={`M412,${TOP - 13}H478 M414,${TOP - 13}V${TOP} M436,${TOP - 13}V${TOP} M456,${TOP - 13}V${TOP} M476,${TOP - 13}V${TOP}`} stroke={C.paper} strokeWidth="1.6" />

      {/* The keeper's cottage and the lighthouse — not lit yet. */}
      <rect x="524" y={TOP - 20} width="50" height="20" fill={C.wall} />
      <path d={`M518,${TOP - 20} L549,${TOP - 34} L580,${TOP - 20} Z`} fill={C.roof} />
      <rect x="533" y={TOP - 14} width="9" height="8" fill={C.paper} opacity="0.9" />
      <rect className="night-light" x="533" y={TOP - 14} width="9" height="8" fill={LIT} style={{ "--i": 1 } as Vars} />
      <rect x="555" y={TOP - 13} width="9" height="13" fill={C.ink} />
      <path d={`M589,${TOP} L593,60 L607,60 L611,${TOP} Z`} fill={C.paper} />
      <path d="M590.4,104 L609.6,104 L610.4,114 L589.6,114 Z M591.8,82 L608.2,82 L609,92 L591,92 Z" fill={C.red} />
      <rect x="597.5" y="68" width="5" height="7" rx="2.5" fill={C.ink} />
      <rect x="596" y="96" width="8" height="5" fill={C.ink} />
      <rect x="587" y="57" width="26" height="3" fill={C.ink} />
      <path d="M588,57V51M593,57V51M600,57V51M607,57V51M612,57V51M587,51H613" stroke={C.ink} strokeWidth="1" />
      <rect x="592" y="44" width="16" height="13" fill={C.ink} />
      <path d="M589,44 L600,34 L611,44 Z" fill={C.ink} />

      {/* At night the lighthouse is on: its beam sweeps out over the sea, its lantern glows. */}
      <defs>
        <linearGradient id="coast-beam-fade" x1="600" y1="0" x2="1120" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ffe6a8" stopOpacity="0.5" />
          <stop offset="0.45" stopColor="#ffe6a8" stopOpacity="0.16" />
          <stop offset="1" stopColor="#ffe6a8" stopOpacity="0" />
        </linearGradient>
      </defs>
      <g className="night-light" style={{ "--i": 3 } as Vars}>
        <path className="coast-beam" d="M600,50 L1120,24 L1120,78 Z" fill="url(#coast-beam-fade)" />
      </g>
      <circle className="night-light" cx="600" cy="50" r="16" fill={LIT} style={{ "--i": 2, "--glow": 0.25 } as Vars} />
      <rect className="night-light" x="594" y="46" width="12" height="9" fill="#fff0c0" style={{ "--i": 2 } as Vars} />

    </>
  );
}

/** A gull, circling: the wrapper glides, the inner part flies off when pointed at (CoastCues). */
function Gull({ x, y, i }: { x: number; y: number; i: number }) {
  return (
    <div className="coast-gull-path absolute" style={{ left: px(x), top: py(y), width: px(13), "--i": i } as Vars}>
      <div className="coast-gull-loop">
        <div className="coast-gull">
          <svg viewBox="0 0 13 6" className="coast-gull-wings block w-full overflow-visible">
            <path d="M0.5,4 C2.5,0.8 4.6,1 6.5,3.6 C8.4,1 10.5,0.8 12.5,4" fill="none" stroke={C.gull} strokeWidth="1.1" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Life() {
  return (
    <>
      {/* The sun's path on the water: it opens up when the journey arrives, then shimmers. */}
      <div className="coast-glitter absolute inset-0">
        {Array.from({ length: 6 }, (_, i) => {
          const y = 160 + i * 13;
          const w = 110 - i * 15;
          return (
            <span
              key={y}
              className="coast-shimmer absolute rounded-full"
              style={{ left: px(1238 - w / 2), top: py(y), width: px(w), height: py(4), background: C.glitter, "--o": 0.85 - i * 0.11, "--i": i } as Vars}
            />
          );
        })}
      </div>

      {/* The car with the surfboard made it: parked at the lookout, facing the sea. */}
      <div className="absolute" style={{ left: px(332), bottom: py(H - TOP + 7), width: px(64) }}>
        <div className="relative">
          <VehicleSprite kind="surf" facing="right" />
        </div>
      </div>

      {/* A sailboat drifting along the horizon. */}
      <div className="coast-sail-in absolute left-0 h-0 w-full" style={{ bottom: py(H - HORIZON - 3) }}>
        <div className="coast-sail-drift absolute bottom-0 left-0 h-0 w-full">
          <div className="coast-sail absolute bottom-0 left-0" style={{ width: px(26) }}>
            <svg viewBox="0 0 26 30" className="coast-sail-rock block w-full overflow-visible">
              <path d="M13,2 V22 L4,22 Z" fill={C.paper} />
              <path d="M14,6 V22 L22,22 Z" fill={C.sail} />
              <path d="M13,1V23" stroke={C.ink} strokeWidth="1" />
              <path d="M1,23 H25 L21,29 H5 Z" fill={C.ink} />
            </svg>
          </div>
        </div>
      </div>
    </>
  );
}

/**
 * The coast scene, mounted by Landscape.tsx in the journey's place. Like the
 * town and the highway: the drawing and its life share one box, clipped to
 * the strip; the gulls have a box of their own so they can fly up and away.
 */
export function Coast() {
  return (
    <div data-scene="journey" className="coast absolute inset-0" style={{ transform: "translate3d(0, 105%, 0)", contentVisibility: "hidden" }}>
      <Palette of={PAINT} />
      <div className="absolute inset-0 overflow-hidden">
        <div className="town-box">
          <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="absolute inset-0 size-full overflow-visible">
            <Land />
          </svg>
          <Life />
        </div>
      </div>
      <div className="coast-gulls town-box">
        <Gull x={930} y={92} i={0} />
        <Gull x={1080} y={70} i={1} />
        <Gull x={1190} y={104} i={2} />
      </div>
      <CoastCues />
    </div>
  );
}
