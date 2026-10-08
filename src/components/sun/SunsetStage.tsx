"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

import { Cloud } from "@/components/scenery/Cloud";
import { cn } from "@/lib/cn";

import { MOONSET } from "./day";
import { bloomCss } from "./disc";
import { EVENING } from "./geometry";
import { MoonDisc, SunDisc, bloomInset, moonBloomInset } from "./SunDisc";

type Vars = React.CSSProperties & Record<`--${string}`, string | number>;

/** The far town's windows on the coast: x, y and whether it's one of the client sites (brighter). */
const TOWN: readonly (readonly [number, number, boolean])[] = [
  [18, 30.5, false], [31, 29, true], [44, 30, false], [57, 30.5, false], [70, 31, true], [86, 32, false],
  [101, 30.5, false], [114, 29.5, true], [128, 30, false], [143, 30.5, false], [158, 30, true], [176, 31.5, false],
  [194, 32.5, false], [212, 33, false], [251, 32, false], [276, 33.5, false],
];

/** Where the sky meets the water, as a percentage of the stage height. */
const HORIZON = "56%";
const { gold: GOLD } = EVENING;
/** The sea: the evening's by day, the night's in the night theme (globals.css). */
const SEA = "var(--footer-sea)";
const seaFade = (percent: number) => `color-mix(in srgb, ${SEA} ${percent}%, transparent)`;
const SUN_BOX = "aspect-square w-[min(78vw,40rem)]";

/** Clouds dark against the setting sun, its light catching their undersides. */
const DUSK_CLOUDS = [
  // A low bank resting across the lower-left of the sun's cap…
  { id: "dusk-bank", shape: "bank", aspect: "aspect-[100/26]", above: "0.5svh", className: "left-[8%] w-[40%] lg:left-[53%] lg:w-[22%]" },
  // …and a thin wisp drifting above it.
  { id: "dusk-wisp", shape: "wisp", aspect: "aspect-[100/14]", above: "13svh", className: "left-[40%] w-[50%] lg:left-[67%] lg:w-[26%]" },
] as const;

/**
 * The page ends at sunset: the sun in its evening colours sinks into the
 * horizon as you reach the bottom, mirrored on shimmering water, with streaks
 * of cloud lit from below. Centred on small screens, right of centre on large
 * ones — where the WebGL sun sets.
 *
 * The sun, sea and sky here are the CSS/SVG version: when the WebGL sun runs
 * it draws those itself, and only the horizon mark and the clouds are used.
 * In the night theme the CSS version is the setting crescent moon instead, in
 * silver light.
 */
export function SunsetStage() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const sink = useTransform(scrollYProgress, [0, 1], ["-14%", "18%"]);
  const rise = useTransform(scrollYProgress, [0, 1], ["14%", "-18%"]);
  const glow = useTransform(scrollYProgress, [0, 1], [1, 0.7]);
  const drift = useTransform(scrollYProgress, [0, 1], ["translate3d(0px, -6svh, 0px)", "translate3d(0px, 0svh, 0px)"]);

  return (
    <div ref={ref} aria-hidden="true" className="relative h-[46svh] min-h-[18rem] [--sunset-x:50%] lg:[--sunset-x:75%]">
      <div data-horizon className="absolute inset-x-0" style={{ top: HORIZON }} />

      <div className="sunset-fallback absolute inset-0">
        {/* Warm light pooling on the horizon (by night, the moon's silver) */}
        <motion.div
          style={{
            opacity: glow,
            top: HORIZON,
            background:
              "radial-gradient(ellipse 48% 50% at var(--sunset-x) 50%, rgb(255 112 36 / 0.5), rgb(179 48 12 / 0.22) 45%, transparent 72%)",
          }}
          className="day-only absolute inset-x-0 h-[70%] -translate-y-1/2"
        />
        <motion.div
          style={{
            opacity: glow,
            top: HORIZON,
            background:
              "radial-gradient(ellipse 40% 45% at var(--sunset-x) 50%, rgb(158 173 242 / 0.22), rgb(52 61 128 / 0.14) 45%, transparent 72%)",
          }}
          className="night-only absolute inset-x-0 h-[70%] -translate-y-1/2"
        />

        {/* The sun's glow: tall enough not to be cut off above, clipped only at the
            horizon, and behind the footer's copy. */}
        <div className="absolute inset-x-0 -z-10 h-[300%] overflow-hidden" style={{ bottom: `calc(100% - ${HORIZON})` }}>
          <motion.div style={{ y: sink }} className={cn("absolute bottom-0 left-(--sunset-x) -translate-x-1/2 translate-y-1/2", SUN_BOX)}>
            <span className="day-only absolute" style={{ inset: bloomInset("sunset"), background: bloomCss("dusk") }} />
            <span className="night-only absolute" style={{ inset: moonBloomInset, background: bloomCss("moon") }} />
          </motion.div>
        </div>

        {/* Sky: the sun, clipped at the horizon */}
        <div className="absolute inset-x-0 top-0 overflow-hidden" style={{ height: HORIZON }}>
          <motion.div style={{ y: sink }} className={cn("absolute top-full left-(--sunset-x) -translate-1/2", SUN_BOX)}>
            <SunDisc id="sunset-sun" tone="sunset" bloom={false} className="day-only size-full" />
            <MoonDisc id="sunset-moon" phase={MOONSET.phase} bloom={false} className="night-only size-full" />
          </motion.div>
        </div>

        {/* Water: a mirrored reflection broken into drifting stripes */}
        <div className="absolute inset-x-0 bottom-0 overflow-hidden" style={{ top: HORIZON, background: SEA }}>
          <motion.div
            style={{ y: rise }}
            className={cn("absolute top-0 left-(--sunset-x) -translate-1/2 -scale-y-100 opacity-50", SUN_BOX)}
          >
            <SunDisc id="sunset-reflection" tone="sunset" bloom={false} className="day-only size-full" />
            <MoonDisc id="sunset-moon-reflection" phase={MOONSET.phase} bloom={false} className="night-only size-full" />
          </motion.div>
          <div
            className="water-stripes absolute inset-x-0 -top-[18px] bottom-0"
            style={{ backgroundImage: `repeating-linear-gradient(to bottom, transparent 0 5px, ${SEA} 5px 9px)` }}
          />
          <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, transparent, ${seaFade(60)} 40%, ${SEA})` }} />
        </div>

        <div
          className="absolute inset-x-0 h-px"
          style={{ top: HORIZON, background: `linear-gradient(to right, transparent, var(--footer-horizon, ${GOLD}) var(--sunset-x), transparent)` }}
        />
      </div>

      {/* Clouds over the setting sun — in both versions. Their box ends at the
          horizon, so they can never drift down over the sea. */}
      <div className="scenery pointer-events-none absolute inset-x-0 h-[160%] overflow-hidden" style={{ bottom: `calc(100% - ${HORIZON})` }}>
        <motion.div style={{ transform: drift }} className="absolute inset-0">
          {DUSK_CLOUDS.map((cloud) => (
            <div key={cloud.id} className={cn("absolute", cloud.className)} style={{ bottom: cloud.above }}>
              <Cloud id={cloud.id} shape={cloud.shape} palette="dusk" light="below" className={cn("w-full", cloud.aspect)} />
            </div>
          ))}
        </motion.div>
      </div>

      {/* The far coast the day has travelled to, low on the horizon left of the
          sun, with the journey's lighthouse — in both versions. */}
      <svg
        viewBox="0 0 400 40"
        preserveAspectRatio="xMinYMax meet"
        aria-hidden="true"
        className="scenery pointer-events-none absolute left-0 w-[24%] lg:w-[40%]"
        style={{ bottom: `calc(100% - ${HORIZON})` }}
      >
        <path d="M0,40 L0,29 L40,26 L90,30 L150,27 L210,31 L262,29 L300,34 L330,38 L342,40 Z" fill="#070302" />
        <path d="M226.5,30 L228,15 L233,15 L234.5,30 Z M227,9 h7 v6 h-7 Z M226,9 L230.5,5 L235,9 Z" fill="#070302" />
        {/* The last light catching the crest. */}
        <path d="M0,29 L40,26 L90,30 L150,27 L210,31 L262,29 L300,34 L330,38 L342,40" fill="none" stroke="var(--footer-rim, #b3300c)" strokeOpacity="0.55" strokeWidth="1" />
        {/* After sunset the lighthouse lights up and the town's lights come on one by one
            (the four brighter ones for the client sites, see globals.css .town-light). */}
        <path className="lighthouse-beam town-light" style={{ "--glow": 0.18 } as Vars} d="M229,12 L120,3 L120,21 Z" fill="#ffd27a" />
        <circle className="town-light" style={{ "--i": 0 } as Vars} cx="230.5" cy="12" r="2.1" fill="#fff0c0" />
        {TOWN.map(([x, y, big], i) => (
          <circle
            key={x}
            className="town-light"
            style={{ "--i": 1 + i, "--glow": big ? 1 : 0.75 } as Vars}
            cx={x}
            cy={y}
            r={big ? 1.5 : 0.9}
            fill={big ? "#ffe39a" : "#ffc864"}
          />
        ))}
      </svg>
    </div>
  );
}
