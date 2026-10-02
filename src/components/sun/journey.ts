import { SUN } from "./geometry";

/** Fired by the hero sun's button; the WebGL sun answers with a solar flare. */
export const FLARE_EVENT = "sun:flare";

/** A sun on screen: centre and disc radius in viewport CSS px. */
export type Spot = { x: number; y: number; r: number };

/** `tone` runs from 0 (noon palette) to 1 (sunset palette). */
export type SunState = Spot & { tone: number };

/** Everything the path depends on, measured once per frame. */
export type JourneyLayout = {
  width: number;
  /** Small viewport height, so mobile toolbars don't nudge the sun. */
  height: number;
  scroll: number;
  /** ≥ 64rem: the hero sits side by side and the sun sets right of centre. */
  desktop: boolean;
  /** Where the hero sun is right now (it scrolls with the page). */
  hero: Spot | null;
  /** Scroll positions: the sun has left the hero / the footer starts / the page ends. */
  heroEnd: number;
  footerStart: number;
  footerEnd: number;
  /** The viewport y the horizon will have once the page is scrolled to the bottom. */
  horizon: number;
};

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

export const smooth = (from: number, to: number, v: number) => {
  const t = clamp01((v - from) / (to - from));
  return t * t * (3 - 2 * t);
};

const between = (a: Spot, b: Spot, t: number): Spot => ({ x: mix(a.x, b.x, t), y: mix(a.y, b.y, t), r: mix(a.r, b.r, t) });

/**
 * One sun for the whole page, from noon to sunset:
 * 1. it leaves the hero for the top-right of the sky,
 * 2. sinks a little and warms while you read,
 * 3. sets in the footer: it drifts down to where the horizon will end up, and
 *    the horizon rises to meet it. It only moves over and grows once the
 *    contact copy has scrolled past, so it never sits behind the heading on
 *    large screens.
 */
export function sunPath(l: JourneyLayout): SunState {
  const { width: w, height: h } = l;
  const high = l.desktop
    ? { x: 0.885 * w, y: 0.17 * h, r: Math.min(0.05 * w, 0.085 * h) }
    : { x: 0.84 * w, y: 0.12 * h, r: Math.min(0.1 * w, 0.06 * h) };
  const low = l.desktop
    ? { x: 0.84 * w, y: 0.3 * h, r: Math.min(0.068 * w, 0.12 * h) }
    : { x: 0.8 * w, y: 0.2 * h, r: Math.min(0.13 * w, 0.08 * h) };
  // Same size, position and final sink as the CSS sunset (SunsetStage).
  const box = Math.min(0.78 * w, 640);
  const set = { x: (l.desktop ? 0.75 : 0.5) * w, y: l.horizon + 0.18 * box, r: box / (2 * SUN.extent) };

  if (l.scroll < l.heroEnd) {
    return { ...between(l.hero ?? high, high, smooth(0, l.heroEnd, l.scroll)), tone: 0 };
  }
  if (l.scroll < l.footerStart) {
    const t = smooth(l.heroEnd, l.footerStart, l.scroll);
    return { ...between(high, low, t), tone: 0.55 * t };
  }
  const v = (l.scroll - l.footerStart) / (l.footerEnd - l.footerStart);
  const down = smooth(0, 1, v);
  const across = smooth(0.35, 1, v);
  return {
    x: mix(low.x, set.x, across),
    y: mix(low.y, set.y, down),
    r: mix(low.r, set.r, across),
    tone: mix(0.55, 1, down),
  };
}
