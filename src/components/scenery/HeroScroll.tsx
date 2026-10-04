"use client";

import { motion, useMotionValue, useScroll, useTransform, type MotionValue } from "motion/react";
import { createContext, useContext, useRef } from "react";

import { useReducedMotionSafe } from "@/lib/use-media-query";

const HeroProgress = createContext<MotionValue<number> | null>(null);

/**
 * How far the hero has scrolled away: 0 at the top of the page, 1 once one
 * screen has gone by. Measured on a 100svh sentinel (not the hero itself, which
 * can be taller than the screen), so Motion can hand the scenery's movement to
 * the browser's scroll timeline. Renders no wrapper, so the hero's layout is
 * untouched.
 */
export function HeroScroll({ children }: { children: React.ReactNode }) {
  const sentinel = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: sentinel, offset: ["start start", "end start"] });
  return (
    <>
      <div ref={sentinel} aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-svh" />
      <HeroProgress.Provider value={scrollYProgress}>{children}</HeroProgress.Provider>
    </>
  );
}

type SinkProps = {
  /** How far (svh) the layer sinks back while the hero scrolls away: the more, the further away it feels. */
  sink: number;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
};

/**
 * A layer of the hero's scenery that sinks back as you scroll, so it rises
 * more slowly than the page — far ridges barely move, near ones follow. Still
 * with reduced motion.
 */
export function SinkLayer({ sink, className, style, children }: SinkProps) {
  const resting = useMotionValue(0);
  const progress = useContext(HeroProgress) ?? resting;
  const still = useReducedMotionSafe();
  const transform = useTransform(progress, [0, 1], ["translate3d(0px, 0svh, 0px)", `translate3d(0px, ${sink}svh, 0px)`]);
  return (
    <motion.div aria-hidden="true" className={className} style={still ? style : { ...style, transform }}>
      {children}
    </motion.div>
  );
}
