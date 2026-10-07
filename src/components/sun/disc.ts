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

/**
 * The sun at its highest (tone −1): nearly white with a pale gold rim. The
 * travelling sun leans this way as it climbs, so its rim stays brighter than
 * the lighter midday sky.
 */
export const ZENITH: readonly string[] = ["#ffffff", "#fffdf0", "#fff4cc", "#ffe6a0", "#ffd985", "#ffd27a"];

/**
 * The moon (the night theme): silver-white, a touch warmer in the middle and
 * cooler at the rim, drawn the same way as the sun — a glowing disc in a soft
 * bloom — but still: no simmer, just its seas, and the phase's shadow.
 */
export const MOON: readonly string[] = ["#ffffff", "#fbfaf4", "#f3f2ea", "#e7e8e6", "#dadfe8", "#cfd6e6"];

/** By day the sun stays bright; it only turns red once the dark sky is behind it. */
export const DAY_TONE_MAX = 0.2;

/**
 * A wide, faint glow around the travelling sun (alpha by distance in disc
 * radii), so the brightest part of the sky is always where the sun is. It
 * falls steadily and stays lighter than the sky, like the bloom.
 */
export const GLOW = { at: 0.08, reach: 3, end: 11 } as const;
export const glowAlpha = (d: number) => (d >= GLOW.end ? 0 : GLOW.at * Math.exp(-(Math.max(d, 1) - 1) / GLOW.reach));

type Mood = { color: string; end: number; alpha: (d: number) => number };

const fade = (from: number, to: number, d: number) => {
  const t = Math.min(1, Math.max(0, (d - from) / (to - from)));
  return 1 - t * t * (3 - 2 * t);
};

/** Light around the disc: by day over the orange page, at dusk over the dark sky, and the moon's cool light at night. */
export const BLOOM: Record<"day" | "dusk" | "moon", Mood> = {
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
  moon: {
    color: "#cfd8ff",
    end: 2.6,
    alpha: (d) => (0.2 * Math.exp(-(d - 1) / 0.3) + 0.12 * Math.exp(-(d - 1) / 1.1)) * fade(2, 2.6, d),
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

/** The moon's wide glow: moonlight over the night sky. */
export const MOON_GLOW = "#9fb2ff";

/**
 * The wide glow as a CSS gradient for a box GLOW.end disc radii across from the
 * centre. It sits under the WebGL sun as its own layer, so the shader only has
 * to draw near the disc.
 */
export function glowCss(color = BLOOM.day.color) {
  const [r, g, b] = rgb(color);
  const stops = Array.from({ length: 10 }, (_, i) => {
    const d = 1 + (i / 9) * (GLOW.end - 1);
    return `rgb(${r} ${g} ${b} / ${glowAlpha(d).toFixed(3)}) ${((d / GLOW.end) * 100).toFixed(2)}%`;
  });
  return `radial-gradient(circle closest-side, rgb(${r} ${g} ${b} / ${GLOW.at}) 0%, ${stops.join(", ")})`;
}

// --- Development check: no dark ring over any sky the sun meets. -------------

const linear = (c: number) => {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};
const luminance = ([r, g, b]: number[]) => 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
const over = (top: number[], alpha: number, base: number[]) => top.map((c, i) => c * alpha + base[i] * (1 - alpha));

/** The disc's rim at a tone: −1 zenith, 0 noon, 1 sunset. */
const rimAt = (tone: number) => {
  const to = rgb((tone < 0 ? ZENITH : DISC.sunset).at(-1)!);
  return rgb(DISC.noon.at(-1)!).map((c, i) => c + (to[i] - c) * Math.abs(tone));
};

/**
 * True if, over this sky, the light just outside the rim (bloom, plus the
 * glow by day) would be brighter than the rim or wouldn't fall off steadily —
 * which reads as a dark ring. Development checks only.
 */
export function wouldRing(sky: string, tone: number, mood: keyof typeof BLOOM = "day") {
  const lit = bloomStops(mood).map((s) =>
    luminance(over(rgb(BLOOM[mood].color), Math.min(1, s.alpha + (mood === "day" ? glowAlpha(s.d) : 0)), rgb(sky))),
  );
  const falling = lit.every((l, i) => i === 0 || l <= lit[i - 1] + 1e-6);
  return lit[0] > luminance(rimAt(tone)) || !falling;
}

// By day the sky comes from the day's timeline (checked in day.ts); here, the footer's dusk.
if (process.env.NODE_ENV !== "production") {
  for (const sky of ["#b3300c", "#3b1409", "#120705"]) {
    if (wouldRing(sky, 1, "dusk")) console.warn(`[sun] the sunset bloom would read as a dark ring over ${sky}`);
  }
}
