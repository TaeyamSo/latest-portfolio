/**
 * The hero sun: a glowing disc (the faceted sunburst in geometry.ts stays the
 * brand mark). The SVG/CSS sun and the WebGL shader both read these numbers,
 * so the two are the same sun by construction.
 *
 * Disc colours run from the centre (d = 0) to the rim (d = 1) — brightest in
 * the middle, like a real sun (limb darkening). The bloom is light around the
 * disc. One rule shapes all of it: moving outwards, brightness may only fall —
 * the light just outside the rim is never brighter than the rim, then fades —
 * so the sun never wears a dark ring. That's why the daytime rim is a light
 * gold: a deep orange rim only works against the dark sunset sky.
 */

export type DiscTone = "noon" | "sunset";

/** Distances (in disc radii) the colour stops sit at. */
export const DISC_STOPS = [0, 0.3, 0.55, 0.75, 0.9, 1] as const;

export const DISC: Record<DiscTone, readonly string[]> = {
  noon: ["#fffef6", "#fff7d6", "#ffe9a0", "#ffd36a", "#ffc052", "#ffb84c"],
  sunset: ["#ffe2a0", "#ffc46e", "#ffa04a", "#ff8236", "#f4672a", "#ea5222"],
};

/** By day the sun stays bright; it only turns red once the dark sky is behind it. */
export const DAY_TONE_MAX = 0.2;

type Mood = { color: string; end: number; alpha: (d: number) => number };

const fade = (from: number, to: number, d: number) => {
  const t = Math.min(1, Math.max(0, (d - from) / (to - from)));
  return 1 - t * t * (3 - 2 * t);
};

/** Light around the disc: by day over the orange page, at dusk over the dark sky. */
export const BLOOM: Record<"day" | "dusk", Mood> = {
  day: {
    color: "#ffe2a6",
    end: 2.8,
    alpha: (d) => (0.16 * Math.exp(-(d - 1) / 0.32) + 0.1 * Math.exp(-(d - 1) / 1.0)) * fade(2.2, 2.8, d),
  },
  dusk: {
    color: "#ff7a36",
    end: 3.4,
    alpha: (d) => (0.24 * Math.exp(-(d - 1) / 0.45) + 0.18 * Math.exp(-(d - 1) / 1.4)) * fade(2.6, 3.4, d),
  },
};

/** The bloom sampled into 12 stops (packed near the disc, where it changes fastest). */
export function bloomStops(mood: keyof typeof BLOOM) {
  const { end, alpha } = BLOOM[mood];
  return Array.from({ length: 12 }, (_, i) => {
    const d = 1 + Math.pow(i / 11, 1.6) * (end - 1);
    return { d, alpha: i === 11 ? 0 : alpha(d) };
  });
}

const rgb = (hex: string) => hex.replace("#", "").match(/.{2}/g)!.map((c) => parseInt(c, 16));

/**
 * The bloom as a CSS gradient for a box `end` disc radii across from the
 * centre (CSS blends translucent stops premultiplied, like the shader).
 */
export function bloomCss(mood: keyof typeof BLOOM) {
  const { color, end } = BLOOM[mood];
  const [r, g, b] = rgb(color);
  const stops = bloomStops(mood);
  const at = (d: number) => `${((d / end) * 100).toFixed(2)}%`;
  return `radial-gradient(circle closest-side, ${[
    `rgb(${r} ${g} ${b} / ${stops[0].alpha.toFixed(3)}) 0%`,
    ...stops.map((s) => `rgb(${r} ${g} ${b} / ${s.alpha.toFixed(3)}) ${at(s.d)}`),
  ].join(", ")})`;
}

// --- Development check: no dark ring over any sky the sun meets. -------------

const linear = (c: number) => {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};
const luminance = ([r, g, b]: number[]) => 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
const over = (top: number[], alpha: number, base: number[]) => top.map((c, i) => c * alpha + base[i] * (1 - alpha));

if (process.env.NODE_ENV !== "production") {
  const checks: [DiscTone, keyof typeof BLOOM, string[]][] = [
    ["noon", "day", ["#fd8916", "#fd5d16", "#f24a12", "#f7701a"]],
    ["sunset", "dusk", ["#b3300c", "#3b1409", "#120705"]],
  ];
  for (const [tone, mood, skies] of checks) {
    const rim = luminance(rgb(DISC[tone][DISC[tone].length - 1]));
    const stops = bloomStops(mood);
    for (const sky of skies) {
      const lit = stops.map((s) => luminance(over(rgb(BLOOM[mood].color), s.alpha, rgb(sky))));
      const falling = lit.every((l, i) => i === 0 || l <= lit[i - 1] + 1e-6);
      if (lit[0] > rim || !falling) console.warn(`[sun] ${tone} bloom would read as a dark ring over ${sky}`);
    }
  }
}
