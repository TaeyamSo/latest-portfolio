"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

import { SunGlyph } from "./SunGlyph";

/** Where the sky meets the water, as a percentage of the stage height. */
const HORIZON = "56%";
const SEA = "#0a0403";

/**
 * The page ends at sunset: the same sun in its evening palette, sinking into
 * the horizon as you reach the bottom, mirrored on shimmering water.
 * Everything that moves is a transform or opacity, so it stays on the GPU.
 */
export function SunsetStage() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const sink = useTransform(scrollYProgress, [0, 1], ["-14%", "18%"]);
  const rise = useTransform(scrollYProgress, [0, 1], ["14%", "-18%"]);
  const glow = useTransform(scrollYProgress, [0, 1], [1, 0.7]);

  return (
    <div ref={ref} aria-hidden="true" className="relative h-[52svh] min-h-[20rem]">
      {/* Warm light pooling on the horizon */}
      <motion.div
        style={{ opacity: glow, top: HORIZON }}
        className="absolute inset-x-0 h-[70%] -translate-y-1/2 bg-[radial-gradient(ellipse_48%_50%_at_50%_50%,rgb(255_112_36/0.5),rgb(179_48_12/0.22)_45%,transparent_72%)]"
      />

      {/* Sky: the sun, clipped at the horizon */}
      <div className="absolute inset-x-0 top-0 overflow-hidden" style={{ height: HORIZON }}>
        <motion.div style={{ y: sink }} className="absolute top-full left-1/2 aspect-square w-[min(78vw,40rem)] -translate-1/2">
          <SunGlyph id="sunset-sun" tone="sunset" spin className="size-full" />
        </motion.div>
      </div>

      {/* Water: a mirrored reflection broken into drifting stripes */}
      <div className="absolute inset-x-0 bottom-0 overflow-hidden" style={{ top: HORIZON, background: SEA }}>
        <motion.div
          style={{ y: rise }}
          className="absolute top-0 left-1/2 aspect-square w-[min(78vw,40rem)] -translate-1/2 -scale-y-100 opacity-50"
        >
          <SunGlyph id="sunset-reflection" tone="sunset" spin className="size-full" />
        </motion.div>
        <div
          className="water-stripes absolute inset-x-0 -top-[18px] bottom-0"
          style={{ backgroundImage: `repeating-linear-gradient(to bottom, transparent 0 5px, ${SEA} 5px 9px)` }}
        />
        <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, transparent, ${SEA}99 40%, ${SEA})` }} />
      </div>

      <div className="absolute inset-x-0 h-px bg-linear-to-r from-transparent via-gold to-transparent" style={{ top: HORIZON }} />
    </div>
  );
}
