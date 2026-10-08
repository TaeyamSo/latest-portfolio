import { cn } from "@/lib/cn";
import { Palette, palette } from "@/lib/palette";

/*
 * The cars, vans and trucks of the scenery, side-on (the highway's traffic,
 * the car parked at the coast's lookout). Each is drawn facing one way and
 * mirrored when it should face the other; the wheels are their own elements
 * so they can turn. At night (the night theme) their paint is cool and dim
 * under the moon and their headlights are on, a short beam ahead of them.
 */
const PAINT = palette("vehicle", {
  flame: ["#fd5d16", "#8a3a4a"],
  amber: ["#fd8916", "#3f6a8a"],
  ink: ["#3b1409", "#0a0e22"],
  paper: ["#fffaf4", "#aab3d8"],
  gold: ["#ffb629", "#a9b0c8"],
  box: ["#e6782a", "#4a5a8c"],
  red: ["#b3300c", "#6a2a3a"],
  tyre: ["#1c120d", "#07091a"],
  hub: ["#d8c1a8", "#5a6290"],
});
const V = PAINT.C;

const pct = (value: number, of: number) => `${+((value / of) * 100).toFixed(3)}%`;

/** A wheel — turning as the vehicle drives, if `turning`: (cx, cy) and radius in the sprite's own units. */
export function Wheel({ cx, cy, r, w, h, turning }: { cx: number; cy: number; r: number; w: number; h: number; turning?: boolean }) {
  return (
    <svg
      viewBox="-6 -6 12 12"
      className={cn("absolute block", turning && "town-wheel")}
      style={{ left: pct(cx - r, w), top: pct(cy - r, h), width: pct(2 * r, w) }}
    >
      <circle r="5.4" fill={V.tyre} />
      <circle r="2.4" fill={V.hub} />
      <path d="M-2.4,0H2.4M0,-2.4V2.4" stroke={V.tyre} strokeWidth="0.8" />
    </svg>
  );
}

export type Vehicle = {
  /** Width and height of the sprite, in strip units. */
  w: number;
  h: number;
  art: React.ReactNode;
  wheels: readonly (readonly [cx: number, cy: number, r: number])[];
  /** Which way the drawing faces; it's mirrored when it drives the other way. */
  faces: "left" | "right";
  /** Where its lights flash when it honks, in % of the sprite (as it drives). */
  lights: readonly [x: number, y: number];
  dust?: boolean;
};

export const VEHICLES = {
  car: {
    w: 60,
    h: 26,
    art: (
      <>
        <path d="M2,20 Q2,14 8,13 L16,12 L23,5 Q25,3 28,3 H40 Q44,3 46,6 L52,12 Q58,13 58,18 V21 H2 Z" fill={V.flame} />
        <path d="M21,12 L26,6 H32 V12 Z M35,6 H40 Q42,6 43,8 L47,12 H35 Z" fill={V.ink} />
        <rect x="2" y="16" width="56" height="2" fill={V.gold} />
      </>
    ),
    wheels: [
      [14, 21, 4.6],
      [46, 21, 4.6],
    ],
    faces: "left",
    lights: [94, 55],
  },
  surf: {
    w: 64,
    h: 30,
    art: (
      <>
        <path d="M6,7 Q30,1 60,6 Q34,9 6,7 Z" fill={V.paper} />
        <path d="M14,7 V9 M50,6.6 V9" stroke={V.ink} strokeWidth="1" />
        <path d="M2,24 Q2,18 8,17 L16,16 L23,9 Q25,7 28,7 H42 Q46,7 48,10 L54,16 Q62,17 62,22 V25 H2 Z" fill={V.amber} />
        <path d="M21,16 L26,10 H33 V16 Z M36,10 H42 Q44,10 45,12 L49,16 H36 Z" fill={V.ink} />
      </>
    ),
    wheels: [
      [15, 25, 4.6],
      [49, 25, 4.6],
    ],
    faces: "left",
    lights: [94, 62],
  },
  van: {
    w: 76,
    h: 34,
    art: (
      <>
        <path d="M2,30 V8 Q2,3 8,3 H52 L66,15 L72,17 Q74,18 74,21 V30 Z" fill={V.paper} />
        <path d="M54,6 L64,15 H54 Z" fill={V.ink} opacity="0.85" />
        <rect x="6" y="13" width="42" height="5" fill={V.amber} />
      </>
    ),
    wheels: [
      [16, 30, 5],
      [60, 30, 5],
    ],
    faces: "right",
    lights: [95, 60],
  },
  truck: {
    w: 100,
    h: 40,
    art: (
      <>
        <path d="M2,34 V16 Q2,10 8,10 H14 L18,4 H28 V34 Z" fill={V.gold} />
        <path d="M8,12 L16,6 H24 V14 H8 Z" fill={V.ink} opacity="0.8" />
        <rect x="30" y="2" width="68" height="32" fill={V.box} />
        <rect x="30" y="2" width="68" height="4" fill={V.red} />
      </>
    ),
    wheels: [
      [12, 35, 5],
      [44, 35, 5],
      [86, 35, 5],
    ],
    faces: "left",
    lights: [4, 55],
    dust: true,
  },
  red: {
    w: 56,
    h: 26,
    art: (
      <>
        <path d="M2,20 Q2,14 8,13 L16,12 L22,5 Q24,3 27,3 H40 Q44,3 46,7 L50,13 Q54,14 54,18 V21 H2 Z" fill={V.red} />
        <path d="M20,12 L25,6 H31 V12 Z M34,6 H40 Q42,6 43,8 L46,12 H34 Z" fill={V.ink} />
      </>
    ),
    wheels: [
      [13, 21, 4.5],
      [44, 21, 4.5],
    ],
    faces: "left",
    lights: [6, 55],
  },
} satisfies Record<string, Vehicle>;


/** A vehicle's picture — body, wheels and the lights it flashes — facing `facing`. Fills its box's width. */
export function VehicleSprite({ kind, facing, turning }: { kind: keyof typeof VEHICLES; facing: "left" | "right"; turning?: boolean }) {
  const vehicle: Vehicle = VEHICLES[kind];
  const [lx, ly] = vehicle.lights;
  return (
    <>
      <Palette of={PAINT} />
      <svg viewBox={`0 0 ${vehicle.w} ${vehicle.h}`} className={cn("block w-full overflow-visible", vehicle.faces !== facing && "-scale-x-100")}>
        {vehicle.art}
      </svg>
      {vehicle.wheels.map(([cx, cy, r]) => (
        <Wheel key={cx} cx={cx} cy={cy} r={r} w={vehicle.w} h={vehicle.h} turning={turning} />
      ))}
      <span className="hw-lights" style={{ left: `${lx}%`, top: `${ly}%` }} />
      {/* At night, the headlights' beam on the road ahead. */}
      <span className="hw-beam night-only" data-ahead={lx > 50 ? "right" : "left"} style={{ left: `${lx}%`, top: `${ly}%` }} />
    </>
  );
}
