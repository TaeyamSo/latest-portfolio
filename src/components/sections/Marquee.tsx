"use client";

import {
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  wrap,
} from "motion/react";
import { useRef } from "react";

import { SunGlyph } from "@/components/sun/SunGlyph";
import { SunLit } from "@/components/sun/SunLit";
import { marquee as words } from "@/content/site";
import { cn } from "@/lib/cn";
import { useReducedMotionSafe } from "@/lib/use-media-query";

// Each copy needs an even count so the caps/serif alternation continues cleanly
// across copies and both copies stay identical (seamless loop).
const sequence = words.length % 2 ? [...words, ...words] : words;

/** Black band of what Tayam does. Drifts on its own, speeds up (and flips) with scroll. */
export function Marquee() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "20% 0px" });
  const still = useReducedMotionSafe();
  const x = useMotionValue(0);
  const direction = useRef(-1);
  const { scrollY } = useScroll();
  const velocity = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 });
  const boost = useTransform(velocity, [-1500, 0, 1500], [-5, 0, 5], { clamp: false });
  const translate = useTransform(x, (v) => `${wrap(-50, 0, v)}%`);

  useAnimationFrame((_, delta) => {
    if (still || !inView) return;
    const b = boost.get();
    if (b < 0) direction.current = 1;
    else if (b > 0) direction.current = -1;
    const move = direction.current * 1.6 * (delta / 1000) * (1 + Math.abs(b));
    x.set(x.get() + move);
  });

  return (
    <div
      ref={ref}
      data-cursor-tone="light"
      className="relative z-10 -mx-[4vw] -rotate-[1.5deg] overflow-hidden bg-ink py-5 text-amber select-none lg:py-7"
    >
      <p className="sr-only">What I do: {words.join(", ")}</p>
      <motion.div aria-hidden="true" style={{ x: translate }} className="flex w-max">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0 items-center">
            {sequence.map((word, i) => (
              <span key={`${word}-${i}`} className="flex items-center text-[clamp(3rem,8.5vw,8.5rem)] leading-none">
                <span
                  className={cn(
                    "px-[0.35em]",
                    i % 2 === 0 ? "font-black tracking-[-0.01em] uppercase" : "serif-accent",
                  )}
                >
                  {word}
                </span>
                <SunGlyph id={`marquee-${copy}-${i}`} className="size-[clamp(2rem,4.5vw,4.5rem)]" />
              </span>
            ))}
          </div>
        ))}
      </motion.div>
      <SunLit />
    </div>
  );
}
