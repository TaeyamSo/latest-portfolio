import { DAY_TONE_MAX, wouldRing } from "./disc";

/** Where the sun stands, as fractions of the viewport; its radius is the smaller of [× width, × height]. */
type Place = { x: number; y: number; r: readonly [number, number] };

export type DayStop = {
  name: string;
  /** The story clock here, in minutes after midnight. */
  minutes: number;
  /** Reached when this chapter rests: its top (plus `at` × its height) at the top of the screen. The first stop is the top of the page. */
  anchor?: { id: string; at: number };
  /** The sky: a horizontal gradient, deeper on the left, lighter towards the sun on the right. */
  sky: readonly [left: string, right: string];
  /** Where the sun stands. The first stop has none: the sun sits in the hero's own stage. */
  sun?: { desktop: Place; mobile: Place };
  /** The disc: −1 whitest (high noon), 0 the hero's sun, up to DAY_TONE_MAX at golden hour. */
  tone: number;
  /** How golden the page's clouds are: 0 cream (noon) to 1 golden (golden hour). */
  clouds: number;
};

/**
 * The page is one day. Each part of the story is an hour: sunrise in the hero,
 * morning by the about, noon over the services, afternoon through the work and
 * the process, golden hour by the journey — then the footer's sunset and night.
 * The sky stays in one warm family and its brightness follows the sun's height:
 * deepest at sunrise, brightest and most golden at noon, deep again by evening.
 * The sun keeps to the right, away from the copy, and its height tells the time.
 *
 * The sky (SkyCycle), the sun (journey.ts) and the side nav's clock all read
 * this one timeline, so they can never disagree.
 */
export const DAY: readonly DayStop[] = [
  { name: "sunrise", minutes: 6 * 60 + 30, sky: ["#fd5d16", "#fd8916"], tone: 0, clouds: 0.55 },
  {
    name: "morning",
    minutes: 8 * 60 + 30,
    anchor: { id: "about", at: 0 },
    sky: ["#fe6f1c", "#ffa03a"],
    sun: { desktop: { x: 0.885, y: 0.17, r: [0.05, 0.085] }, mobile: { x: 0.84, y: 0.12, r: [0.1, 0.06] } },
    tone: -0.45,
    clouds: 0.25,
  },
  {
    name: "noon",
    minutes: 12 * 60,
    anchor: { id: "services", at: 0 },
    sky: ["#ffa233", "#ffbe55"],
    sun: { desktop: { x: 0.6, y: 0.13, r: [0.042, 0.075] }, mobile: { x: 0.6, y: 0.085, r: [0.09, 0.055] } },
    tone: -1,
    clouds: 0,
  },
  {
    name: "afternoon",
    minutes: 14 * 60,
    anchor: { id: "work", at: 0 },
    sky: ["#ff8f26", "#ffb04a"],
    sun: { desktop: { x: 0.74, y: 0.15, r: [0.046, 0.08] }, mobile: { x: 0.74, y: 0.09, r: [0.095, 0.058] } },
    tone: -0.65,
    clouds: 0.3,
  },
  {
    name: "late afternoon",
    minutes: 16 * 60,
    anchor: { id: "process", at: 0 },
    sky: ["#fd8418", "#ffa13a"],
    sun: { desktop: { x: 0.84, y: 0.24, r: [0.054, 0.09] }, mobile: { x: 0.82, y: 0.12, r: [0.11, 0.065] } },
    tone: -0.3,
    clouds: 0.65,
  },
  {
    name: "golden hour",
    minutes: 17 * 60 + 45,
    anchor: { id: "journey", at: 0 },
    sky: ["#f25a17", "#f97a22"],
    sun: { desktop: { x: 0.86, y: 0.34, r: [0.068, 0.12] }, mobile: { x: 0.8, y: 0.2, r: [0.13, 0.08] } },
    tone: 0.12,
    clouds: 1,
  },
];

/** The clock when the sun has set and the page has reached the bottom. */
export const NIGHTFALL = 19 * 60 + 30;

export const smooth = (from: number, to: number, v: number) => {
  const t = Math.min(1, Math.max(0, (v - from) / (to - from)));
  return t * t * (3 - 2 * t);
};

export const mix = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * The scroll position (px) of each stop: where its chapter rests, its top at
 * the top of the screen — so a chapter at rest shows exactly its hour, and each
 * glide between chapters is an hour passing. Always increasing, so a missing
 * section can't run time backwards.
 */
export function measureStops(): number[] {
  let last = 0;
  return DAY.map(({ anchor }) => {
    if (!anchor) return 0;
    const el = document.getElementById(anchor.id);
    const at = el ? el.getBoundingClientRect().top + window.scrollY + anchor.at * el.offsetHeight : last;
    last = Math.max(last + 1, at);
    return last;
  });
}

/**
 * Where in the day a scroll position is: the stop reached, and how far it is
 * towards the next (eased, so each hour lingers on its section and the change
 * happens in between). Past the last stop the day holds until the footer.
 */
export function dayAt(scroll: number, stops: readonly number[]) {
  let index = 0;
  while (index < stops.length - 1 && scroll >= stops[index + 1]) index++;
  if (index === stops.length - 1) return { index, next: index, t: 0 };
  return { index, next: index + 1, t: smooth(stops[index], stops[index + 1], scroll) };
}

/** The story clock, in minutes: through the stops, then on to nightfall across the footer. */
export function minutesAt(scroll: number, stops: readonly number[], footer: { start: number; end: number }) {
  if (scroll >= footer.start) {
    return mix(DAY[DAY.length - 1].minutes, NIGHTFALL, smooth(footer.start, footer.end, scroll));
  }
  const { index, next, t } = dayAt(scroll, stops);
  return mix(DAY[index].minutes, DAY[next].minutes, t);
}

/** "08:30", to the nearest five minutes. */
export const formatClock = (minutes: number) => {
  const m = Math.round(minutes / 5) * 5;
  return `${String(Math.floor(m / 60) % 24).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
};

/** `a` → `b` at t, as "#rrggbb". */
export function mixHex(a: string, b: string, t: number) {
  const [x, y] = [a, b].map((hex) => hex.replace("#", "").match(/.{2}/g)!.map((c) => parseInt(c, 16)));
  return `#${x.map((v, i) => Math.round(mix(v, y[i], t)).toString(16).padStart(2, "0")).join("")}`;
}

// Development check: no stop, nor the blend between two, may give the sun a dark
// ring (it stands right of centre, where the sky is at its lightest).
if (process.env.NODE_ENV !== "production") {
  if (DAY.some((stop) => stop.tone > DAY_TONE_MAX)) console.warn("[day] a daytime tone is past DAY_TONE_MAX");
  for (let i = 0; i < DAY.length - 1; i++) {
    for (const t of [0, 0.25, 0.5, 0.75, 1]) {
      const sky = mixHex(DAY[i].sky[1], DAY[i + 1].sky[1], t);
      const tone = mix(DAY[i].tone, DAY[i + 1].tone, t);
      if (wouldRing(sky, tone)) console.warn(`[day] the sun would wear a dark ring between ${DAY[i].name} and ${DAY[i + 1].name} (${sky})`);
    }
  }
}
