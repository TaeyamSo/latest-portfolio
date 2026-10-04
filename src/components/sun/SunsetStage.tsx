"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

import { Cloud } from "@/components/scenery/Cloud";
import { cn } from "@/lib/cn";

import { bloomCss } from "./disc";
import { EVENING } from "./geometry";
import { SunDisc, bloomInset } from "./SunDisc";

/** Where the sky meets the water, as a percentage of the stage height. */
const HORIZON = "56%";
const { sea: SEA, gold: GOLD } = EVENING;
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
 */
export function SunsetStage() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const sink = useTransform(scrollYProgress, [0, 1], ["-14%", "18%"]);
  const rise = useTransform(scrollYProgress, [0, 1], ["14%", "-18%"]);
  const glow = useTransform(scrollYProgress, [0, 1], [1, 0.7]);
  const drift = useTransform(scrollYProgress, [0, 1], ["translate3d(0px, -6svh, 0px)", "translate3d(0px, 0svh, 0px)"]);

  return (
    <div ref={ref} aria-hidden="true" className="relative h-[52svh] min-h-[20rem] [--sunset-x:50%] lg:[--sunset-x:75%]">
      <div data-horizon className="absolute inset-x-0" style={{ top: HORIZON }} />

      <div className="sunset-fallback absolute inset-0">
        {/* Warm light pooling on the horizon */}
        <motion.div
          style={{
            opacity: glow,
            top: HORIZON,
            background:
              "radial-gradient(ellipse 48% 50% at var(--sunset-x) 50%, rgb(255 112 36 / 0.5), rgb(179 48 12 / 0.22) 45%, transparent 72%)",
          }}
          className="absolute inset-x-0 h-[70%] -translate-y-1/2"
        />

        {/* The sun's glow: tall enough not to be cut off above, clipped only at the
            horizon, and behind the footer's copy. */}
        <div className="absolute inset-x-0 -z-10 h-[300%] overflow-hidden" style={{ bottom: `calc(100% - ${HORIZON})` }}>
          <motion.div style={{ y: sink }} className={cn("absolute bottom-0 left-(--sunset-x) -translate-x-1/2 translate-y-1/2", SUN_BOX)}>
            <span className="absolute" style={{ inset: bloomInset("sunset"), background: bloomCss("dusk") }} />
          </motion.div>
        </div>

        {/* Sky: the sun, clipped at the horizon */}
        <div className="absolute inset-x-0 top-0 overflow-hidden" style={{ height: HORIZON }}>
          <motion.div style={{ y: sink }} className={cn("absolute top-full left-(--sunset-x) -translate-1/2", SUN_BOX)}>
            <SunDisc id="sunset-sun" tone="sunset" bloom={false} className="size-full" />
          </motion.div>
        </div>

        {/* Water: a mirrored reflection broken into drifting stripes */}
        <div className="absolute inset-x-0 bottom-0 overflow-hidden" style={{ top: HORIZON, background: SEA }}>
          <motion.div
            style={{ y: rise }}
            className={cn("absolute top-0 left-(--sunset-x) -translate-1/2 -scale-y-100 opacity-50", SUN_BOX)}
          >
            <SunDisc id="sunset-reflection" tone="sunset" bloom={false} className="size-full" />
          </motion.div>
          <div
            className="water-stripes absolute inset-x-0 -top-[18px] bottom-0"
            style={{ backgroundImage: `repeating-linear-gradient(to bottom, transparent 0 5px, ${SEA} 5px 9px)` }}
          />
          <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, transparent, ${SEA}99 40%, ${SEA})` }} />
        </div>

        <div
          className="absolute inset-x-0 h-px"
          style={{ top: HORIZON, background: `linear-gradient(to right, transparent, ${GOLD} var(--sunset-x), transparent)` }}
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
    </div>
  );
}
