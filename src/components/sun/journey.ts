import { DAY, dayAt, mix, smooth, type DayStop } from "./day";
import { SUN } from "./geometry";

export { smooth };

/** Fired by the hero sun's button; the WebGL sun answers with a solar flare. */
export const FLARE_EVENT = "sun:flare";

/** A sun on screen: centre and disc radius in viewport CSS px. */
export type Spot = { x: number; y: number; r: number };

/** `tone` runs from −1 (high noon) through 0 (the hero's sun) to 1 (sunset). */
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
  /** Scroll positions of the day's stops (day.ts measureStops). */
  stops: readonly number[];
  /** Scroll positions: the footer starts / the page ends. */
  footerStart: number;
  footerEnd: number;
  /** The viewport y the horizon will have once the page is scrolled to the bottom. */
  horizon: number;
};

const between = (a: Spot, b: Spot, t: number): Spot => ({ x: mix(a.x, b.x, t), y: mix(a.y, b.y, t), r: mix(a.r, b.r, t) });

/**
 * One sun for the whole page, through one day (day.ts):
 * 1. it rises out of the hero's mountains and climbs into the sky,
 * 2. stands highest — small and nearly white — over the services at noon,
 * 3. comes down on the right through the afternoon, bigger and deeper gold
 *    by golden hour, always clear of the copy on the left,
 * 4. sets in the footer: it drifts down to where the horizon will end up, and
 *    the horizon rises to meet it. It only moves over and grows once the
 *    contact copy has scrolled past, so it never sits behind the heading on
 *    large screens.
 */
export function sunPath(l: JourneyLayout): SunState {
  const { width: w, height: h } = l;
  const place = (stop: DayStop): Spot => {
    const p = stop.sun ? (l.desktop ? stop.sun.desktop : stop.sun.mobile) : null;
    return p ? { x: p.x * w, y: p.y * h, r: Math.min(p.r[0] * w, p.r[1] * h) } : (l.hero ?? place(DAY[1]));
  };
  const last = DAY[DAY.length - 1];
  const evening = place(last);
  // Same size, position and final sink as the CSS sunset (SunsetStage).
  const box = Math.min(0.78 * w, 640);
  const set = { x: (l.desktop ? 0.75 : 0.5) * w, y: l.horizon + 0.18 * box, r: box / (2 * SUN.extent) };

  if (l.scroll < l.footerStart) {
    const { index, next, t } = dayAt(l.scroll, l.stops);
    return { ...between(place(DAY[index]), place(DAY[next]), t), tone: mix(DAY[index].tone, DAY[next].tone, t) };
  }
  const v = (l.scroll - l.footerStart) / (l.footerEnd - l.footerStart);
  const down = smooth(0, 1, v);
  const across = smooth(0.35, 1, v);
  return {
    x: mix(evening.x, set.x, across),
    y: mix(evening.y, set.y, down),
    r: mix(evening.r, set.r, across),
    tone: mix(last.tone, 1, down),
  };
}
