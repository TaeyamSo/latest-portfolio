import { cn } from "@/lib/cn";

import { HighwayCues } from "./HighwayCues";
import { VEHICLES, VehicleSprite, type Vehicle } from "./vehicles";

/*
 * Late afternoon, under the process: the highway out of the city towards the
 * coast, seen side-on. Drawn like the town (Town.tsx) in a box of the strip's
 * 1440 : 240 shape that covers the strip, so the traffic, the birds on the
 * wire and the rest line up with the drawing at every size; on phones the
 * middle shows — the signs, a pole with its birds, both lanes.
 *
 * When the process arrives its centre line paints itself in. It lives on its
 * own: traffic both ways (one car taking a surfboard to the
 * coast), birds hopping on the wire and now and then flying off, a tumbleweed,
 * dust behind the truck. Point at a car and it honks (HighwayCues).
 */
const W = 1440;
const H = 240;
const pct = (value: number, of: number) => `${+((value / of) * 100).toFixed(3)}%`;
const px = (x: number) => pct(x, W);
const py = (y: number) => pct(y, H);

type Vars = React.CSSProperties & Record<`--${string}`, string | number>;

/** Where things stand: the far edge of the road, the centre line, the near edge. */
const ROAD_TOP = 194;
const CENTRE = 213;
const ROAD_BOTTOM = 232;

/** The telephone poles. */
const POLES = [170, 470, 770, 1070, 1370];
const WIRE_TOP = 104;
const WIRE_SAG = 18;

const C = {
  haze: "#ef9446",
  hills: "#e5813a",
  hillsNear: "#da7030",
  ground: "#d2662a",
  sea: "#c9561e",
  asphalt: "#5d3526",
  verge: "#c75a22",
  pole: "#7a3b17",
  wire: "#3b1409",
  rail: "#fffaf4",
  post: "#8a3412",
  ink: "#3b1409",
  paper: "#fffaf4",
  gold: "#ffb629",
  sunlight: "#ffd84a",
  flame: "#fd5d16",
} as const;

/** The wire's height between two poles (a gentle sag), at `t` (0–1) of the way across. */
const wireAt = (t: number) => WIRE_TOP + 2 * WIRE_SAG * t * (1 - t);

function Land() {
  return (
    <>
      {/* The city's last towers, fading into the haze behind (the work is behind us). */}
      <path
        d="M0,186 V96 H22 V80 H48 V104 H70 V62 H96 V112 H120 V90 H146 V128 H168 V150 H196 V186 Z"
        fill={C.haze}
        opacity="0.75"
      />
      {/* The sea ahead, and the lighthouse waiting on its point (the journey is ahead). */}
      <path d="M1210,186 V172 Q1300,168 1440,166 V186 Z" fill={C.sea} />
      <path d="M1250,172 h46 M1320,170 h60 M1390,168 h40" stroke={C.sunlight} strokeWidth="1.6" opacity="0.6" />
      <path d="M1330,172 L1332,136 L1340,136 L1342,172 Z" fill={C.paper} />
      <path d="M1331,152 h10 M1331.5,144 h9" stroke="#b3300c" strokeWidth="3" />
      <path d="M1328,136 L1336,128 L1344,136 Z" fill={C.ink} />

      {/* Low desert hills, and the land up to the road. */}
      <path
        d="M196,186 Q300,150 420,168 T700,160 Q820,150 920,170 T1210,172 V186 Z"
        fill={C.hills}
      />
      <path d="M0,194 V182 Q240,174 520,180 T1100,178 Q1300,176 1440,182 V194 Z" fill={C.hillsNear} />
      <rect y="186" width={W} height={ROAD_TOP - 186} fill={C.ground} />

      {/* A few desert trees, rocks and dry tufts beyond the road. */}
      {[420, 1000].map((x) => (
        <g key={x}>
          <path
            d={`M${x},190 V160 Q${x},152 ${x - 7},148 L${x - 9},138 M${x},168 Q${x + 6},160 ${x + 11},157 L${x + 12},146`}
            fill="none"
            stroke={C.pole}
            strokeWidth="3.4"
            strokeLinecap="round"
          />
          <ellipse cx={x - 9} cy={136} rx={5} ry={6} fill="#8f4a1c" />
          <ellipse cx={x + 12} cy={144} rx={5} ry={6} fill="#8f4a1c" />
        </g>
      ))}
      {[250, 690, 1150].map((x) => (
        <path key={x} d={`M${x},192 Q${x + 4},182 ${x + 10},186 Q${x + 16},181 ${x + 20},192 Z`} fill="#b8693a" />
      ))}
      {[90, 560, 860, 1290].map((x) => (
        <path
          key={x}
          d={`M${x},193 q2,-7 1,-11 M${x + 4},193 q1,-8 4,-12 M${x + 8},193 q1,-6 6,-8`}
          fill="none"
          stroke="#b97a2c"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      ))}

      {/* A low guardrail along the far side. */}
      <path d={`M0,187.5 H${W}`} stroke={C.rail} strokeWidth="2" opacity="0.85" />
      <path d={Array.from({ length: 49 }, (_, i) => `M${i * 30 + 6},187 V194`).join("")} stroke={C.post} strokeWidth="2.4" />

      {/* Telephone poles and their sagging wires. */}
      {POLES.map((x) => (
        <g key={x}>
          <rect x={x - 2} y={WIRE_TOP - 6} width="4" height={ROAD_TOP - WIRE_TOP + 6} fill={C.pole} />
          <rect x={x - 12} y={WIRE_TOP - 4} width="24" height="3" fill={C.pole} />
        </g>
      ))}
      <path
        d={[-130, ...POLES, 1670]
          .map((x, i, all) =>
            i < all.length - 1 ? `M${x},${WIRE_TOP}Q${(x + all[i + 1]) / 2},${WIRE_TOP + 2 * WIRE_SAG} ${all[i + 1]},${WIRE_TOP}` : "",
          )
          .join("")}
        fill="none"
        stroke={C.wire}
        strokeWidth="1"
        opacity="0.6"
      />

      {/* The way to the coast, and the speed limit. */}
      <rect x="518" y="152" width="3" height="40" fill={C.post} />
      <rect x="488" y="132" width="64" height="22" rx="2" fill={C.ink} />
      <text
        x="520"
        y="146.6"
        fontSize="8"
        fontWeight="700"
        letterSpacing="0.6"
        textAnchor="middle"
        fill={C.paper}
        style={{ fontFamily: "var(--font-mono)" }}
      >
        COAST →
      </text>
      <rect x="1143.5" y="160" width="3" height="32" fill={C.post} />
      <circle cx="1145" cy="154" r="10" fill={C.paper} stroke={C.flame} strokeWidth="2.6" />
      <text x="1145" y="157.6" fontSize="9" fontWeight="800" textAnchor="middle" fill={C.ink}>
        60
      </text>

      {/* The road: asphalt, white edges; its centre line is drawn over it (it paints in). */}
      <rect y={ROAD_TOP} width={W} height={ROAD_BOTTOM - ROAD_TOP} fill={C.asphalt} />
      <rect y={ROAD_TOP + 1.5} width={W} height="1.6" fill={C.paper} opacity="0.85" />
      <rect y={ROAD_BOTTOM - 3} width={W} height="1.6" fill={C.paper} opacity="0.85" />
      <rect y={ROAD_BOTTOM} width={W} height={H - ROAD_BOTTOM} fill={C.verge} />
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

type Lane = "near" | "far";

/**
 * One vehicle on its lane. The wrapper spans the box and slides across it
 * (`town-walk`, one crossing in `time` seconds); `start` is how far along it is
 * when the road comes up, `at` where it stands when nothing moves.
 */
function Drive({ kind, lane, time, start, at }: { kind: keyof typeof VEHICLES; lane: Lane; time: number; start: number; at: number }) {
  const vehicle: Vehicle = VEHICLES[kind];
  const far = lane === "far";
  const scale = far ? 0.78 : 1;
  const ground = far ? CENTRE - 3 : ROAD_BOTTOM - 4.5;
  return (
    <div
      data-dir={far ? "left" : "right"}
      className="town-walk absolute left-0 h-0 w-full"
      style={{ bottom: py(H - ground), "--walk": `${time}s`, "--delay": `${(-start * time).toFixed(1)}s`, "--at": `${at}%` } as Vars}
    >
      <div className="hw-car absolute bottom-0 left-0" style={{ width: px(vehicle.w * scale) }}>
        <div className="hw-car-body town-bob relative" style={{ "--step": "0.38s" } as Vars}>
          <VehicleSprite kind={kind} facing={far ? "left" : "right"} turning />
        </div>
        {vehicle.dust &&
          [0, 1, 2].map((i) => <span key={i} className="hw-dust" style={{ "--i": i } as Vars} />)}
      </div>
    </div>
  );
}

/** A bird on the wire: it hops now and then, and once in a while flies off and comes back. */
function Bird({ x, i }: { x: number; i: number }) {
  const t = (x - POLES[2]) / (POLES[3] - POLES[2]);
  const y = wireAt(t);
  return (
    <div className="hw-bird absolute" style={{ left: px(x - 4), top: py(y - 6.2), width: px(8), "--i": i } as Vars}>
      <svg viewBox="0 0 8 6" className="hw-bird-sit block w-full">
        <path d="M0.4,3.6L2,2.6Q3.4,1.4 5.6,2Q6.4,0.6 7.4,1.4Q7.8,2 7,2.6L6.6,3Q6,5.2 3.2,5Q1.6,4.8 0.4,3.6Z" fill={C.ink} />
      </svg>
      <svg viewBox="0 0 8 6" className="hw-bird-fly absolute inset-0 block w-full overflow-visible">
        <path d="M0.4,3.4C1.6,1 3,1.2 4,2.8C5,1.2 6.4,1 7.6,3.4" fill="none" stroke={C.ink} strokeWidth="1" strokeLinecap="round" />
      </svg>
    </div>
  );
}

function Life() {
  return (
    <>
      {/* The centre line, painting itself in when the process arrives. */}
      <Patch box={[0, CENTRE - 1, W, 2]} className="hw-dashes">
        <path d={`M0,${CENTRE}H${W}`} stroke={C.sunlight} strokeWidth="2" strokeDasharray="20 16" />
      </Patch>

      {/* The traffic: into the city's past on the far lane, on towards the coast on the near one. */}
      <Drive kind="truck" lane="far" time={30} start={0.2} at={62} />
      <Drive kind="red" lane="far" time={21} start={0.72} at={24} />
      <Drive kind="car" lane="near" time={16} start={0.35} at={40} />
      <Drive kind="van" lane="near" time={23} start={0.9} at={78} />
      <Drive kind="surf" lane="near" time={19} start={0.62} at={12} />

      {/* Now and then a tumbleweed rolls along the verge. */}
      <div className="hw-tumble absolute left-0 h-0 w-full" style={{ bottom: py(H - 238) }}>
        <svg viewBox="0 0 40 40" className="hw-tumble-roll absolute bottom-0 left-0 block" style={{ width: px(10) }}>
          <circle cx="20" cy="20" r="17" fill="none" stroke="#b97a2c" strokeWidth="2.4" />
          <path d="M6,14 Q20,28 34,12 M8,28 Q20,8 32,30 M20,3 Q12,20 22,37 M4,22 Q22,18 36,24" fill="none" stroke="#b97a2c" strokeWidth="2" />
        </svg>
      </div>
    </>
  );
}

/**
 * The highway scene, mounted by Landscape.tsx in the process's place. Like the
 * town: the drawing and the road's life share one box, clipped to the strip;
 * the birds have a box of their own so they can fly up into the sky.
 */
export function Highway() {
  return (
    <div data-scene="process" className="highway absolute inset-0" style={{ transform: "translate3d(0, 105%, 0)", contentVisibility: "hidden" }}>
      <div className="absolute inset-0 overflow-hidden">
        <div className="town-box">
          <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="absolute inset-0 size-full overflow-visible">
            <Land />
          </svg>
          <Life />
        </div>
      </div>
      <div className="town-box">
        {[810, 836, 905, 978].map((x, i) => (
          <Bird key={x} x={x} i={i} />
        ))}
      </div>
      <HighwayCues />
    </div>
  );
}
