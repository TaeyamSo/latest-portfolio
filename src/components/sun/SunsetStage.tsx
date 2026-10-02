"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

import { EVENING } from "./geometry";
import { SunGlyph } from "./SunGlyph";

/** Where the sky meets the water, as a percentage of the stage height. */
const HORIZON = "56%";
const { sea: SEA, gold: GOLD } = EVENING;

/**
 * The page ends at sunset: the same sun in its evening palette, sinking into
 * the horizon as you reach the bottom, mirrored on shimmering water. Centred
 * on small screens, right of centre on large ones — where the WebGL sun sets.
 *
 * This is the CSS/SVG version. When the WebGL sun is running it draws the
 * sky, the sun and the sea itself, and only the horizon mark is used.
 */
export function SunsetStage() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const sink = useTransform(scrollYProgress, [0, 1], ["-14%", "18%"]);
  const rise = useTransform(scrollYProgress, [0, 1], ["14%", "-18%"]);
  const glow = useTransform(scrollYProgress, [0, 1], [1, 0.7]);

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

        {/* Sky: the sun, clipped at the horizon */}
        <div className="absolute inset-x-0 top-0 overflow-hidden" style={{ height: HORIZON }}>
          <motion.div
            style={{ y: sink }}
            className="absolute top-full left-(--sunset-x) aspect-square w-[min(78vw,40rem)] -translate-1/2"
          >
            <SunGlyph id="sunset-sun" tone="sunset" spin className="size-full" />
          </motion.div>
        </div>

        {/* Water: a mirrored reflection broken into drifting stripes */}
        <div className="absolute inset-x-0 bottom-0 overflow-hidden" style={{ top: HORIZON, background: SEA }}>
          <motion.div
            style={{ y: rise }}
            className="absolute top-0 left-(--sunset-x) aspect-square w-[min(78vw,40rem)] -translate-1/2 -scale-y-100 opacity-50"
          >
            <SunGlyph id="sunset-reflection" tone="sunset" spin className="size-full" />
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
    </div>
  );
}
