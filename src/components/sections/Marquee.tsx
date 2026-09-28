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
import { skills } from "@/content/site";
import { cn } from "@/lib/cn";
import { useReducedMotionSafe } from "@/lib/use-media-query";

const words = ["Front-End", ...skills.map((skill) => skill.name)];

/** Black band of skills. Drifts on its own, speeds up (and flips) with scroll. */
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
      className="relative z-10 -mx-[4vw] -rotate-[1.5deg] overflow-hidden bg-ink py-5 text-amber select-none lg:py-7"
    >
      <p className="sr-only">Skills: {words.join(", ")}</p>
      <motion.div aria-hidden="true" style={{ x: translate }} className="flex w-max">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0 items-center">
            {words.map((word, i) => (
              <span key={word} className="flex items-center">
                <span
                  className={cn(
                    "px-[0.35em] text-[clamp(3rem,8.5vw,8.5rem)] leading-none font-black tracking-[-0.01em] uppercase",
                    i % 2 === 1 && "text-outline",
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
    </div>
  );
}
