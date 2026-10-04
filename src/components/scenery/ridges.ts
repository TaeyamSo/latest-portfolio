/**
 * Mountain ridges for the hero, as flat faceted silhouettes (the poster style
 * of the brand sun). Generated from a few anchor points plus seeded jitter, so
 * the result is identical on every render (rendered on the server only).
 *
 * Coordinates: x and y are fractions of the hero (0–1, y down); paths are
 * drawn in a 1000-unit space and close a little below the hero, behind the
 * marquee band.
 */

type Anchor = readonly [x: number, y: number];

export type RidgeSpec = {
  anchors: readonly Anchor[];
  /** Points across the width. */
  points: number;
  /** How far each point may stray up or down (fraction of the hero height). */
  amp: number;
  seed: number;
  /** Lowest allowed crest (highest y) at x — keeps text and the scroll cue clear. */
  floor?: (x: number) => number;
};

export type Ridge = { d: string; top: number };

export const RIDGE_BOTTOM = 1.08;

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function along(anchors: readonly Anchor[], x: number) {
  for (let i = 1; i < anchors.length; i++) {
    const [x1, y1] = anchors[i];
    const [x0, y0] = anchors[i - 1];
    if (x <= x1) return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0 || 1);
  }
  return anchors[anchors.length - 1][1];
}

/** A faceted ridge line: the anchors, with every point nudged up or down a little. */
export function ridgePath({ anchors, points, amp, seed, floor }: RidgeSpec): Ridge {
  const random = mulberry32(seed);
  const crest: [number, number][] = [];
  for (let i = 0; i <= points; i++) {
    const edge = i === 0 || i === points;
    const x = Math.min(1, Math.max(0, i / points + (edge ? 0 : (random() * 2 - 1) * 0.006)));
    let y = along(anchors, x) + (random() * 2 - 1) * amp;
    if (floor) y = Math.max(y, floor(x));
    crest.push([x, y]);
  }
  const top = Math.min(...crest.map(([, y]) => y)) - 0.01;
  const u = (n: number) => (n * 1000).toFixed(1);
  const d = `M0,${u(RIDGE_BOTTOM)} ${crest.map(([x, y]) => `L${u(x)},${u(y)}`).join(" ")} L1000,${u(RIDGE_BOTTOM)} Z`;
  return { d, top };
}

const between = (x: number, from: number, to: number) => x >= from && x <= to;

// Desktop: the sun (disc ≈ x .61–.89, y .28–.72) sits in the dip between the
// two far peaks; everything stays below y .58 around the "portfolio" word.
const keepWordClear = (x: number) => (between(x, 0.55, 0.78) ? 0.58 : 0);

export const DESKTOP_RIDGES = {
  far: {
    anchors: [[0, 0.8], [0.3, 0.76], [0.57, 0.6], [0.74, 0.69], [0.93, 0.56], [1, 0.6]],
    points: 22,
    amp: 0.007,
    seed: 11,
    floor: keepWordClear,
  },
  mid: {
    anchors: [[0, 0.87], [0.35, 0.86], [0.66, 0.74], [0.8, 0.79], [0.97, 0.7], [1, 0.72]],
    points: 26,
    amp: 0.009,
    seed: 23,
    floor: keepWordClear,
  },
  near: {
    anchors: [[0, 0.975], [0.3, 0.965], [0.5, 0.93], [0.7, 0.88], [0.85, 0.86], [1, 0.83]],
    points: 30,
    amp: 0.012,
    seed: 37,
    floor: (x: number) => Math.max(keepWordClear(x), between(x, 0.08, 0.28) ? 0.965 : 0), // under the scroll cue
  },
} satisfies Record<string, RidgeSpec>;

// Phones: the sun sits top right (disc ≈ y .09–.37); the far summit cuts across
// its lower edge, and the left stays low under the text and the scroll cue.
export const MOBILE_RIDGES = {
  far: {
    anchors: [[0, 0.74], [0.25, 0.68], [0.5, 0.55], [0.7, 0.42], [0.92, 0.33], [1, 0.35]],
    points: 16,
    amp: 0.007,
    seed: 41,
  },
  mid: {
    anchors: [[0, 0.86], [0.3, 0.84], [0.55, 0.8], [0.8, 0.72], [1, 0.66]],
    points: 18,
    amp: 0.009,
    seed: 53,
  },
  near: {
    anchors: [[0, 0.985], [0.45, 0.975], [0.65, 0.93], [0.85, 0.89], [1, 0.86]],
    points: 20,
    amp: 0.011,
    seed: 67,
    floor: (x: number) => (x < 0.5 ? 0.975 : 0),
  },
} satisfies Record<string, RidgeSpec>;
