"use client";

import { motion, useMotionValue, useMotionValueEvent, useScroll, useTransform, type MotionValue } from "motion/react";
import { useEffect, useRef } from "react";

import { cn } from "@/lib/cn";
import { useReducedMotionSafe } from "@/lib/use-media-query";

import { Cloud, type CloudShape } from "./Cloud";

type Vars = React.CSSProperties & Record<`--${string}`, string>;

type SkyCloud = {
  id: string;
  shape: CloudShape;
  /** Horizontal place (vw). */
  left: number;
  width: number;
  /** How far (svh) it travels up over the whole page: near clouds pass faster. */
  travel: number;
  /** When (page progress 0–1) its top reaches the bottom of the screen. */
  enter: number;
  opacity: number;
  drift: string;
  driftTime: string;
  driftDelay: string;
  className: string;
};

const ASPECT: Record<CloudShape, string> = {
  puff: "aspect-[100/40]",
  bank: "aspect-[100/40]",
  streak: "aspect-[100/22]",
  wisp: "aspect-[100/18]",
};

// Placement: a cloud sits at top = 100 + travel × enter (svh) and rises by
// `travel` over the page, so it's on screen from `enter` until about
// enter + (100 + its height) / travel. Every cloud has left by 0.9, so none
// can drift down to the sunset's horizon. Two of the desktop clouds (and one on
// phones) cross the sun in the top-right corner on the way.
const CLOUDS: SkyCloud[] = [
  { id: "sky-1", shape: "bank", left: 60, width: 34, travel: 450, enter: 0.06, opacity: 1, drift: "3vw", driftTime: "80s", driftDelay: "-10s", className: "hidden lg:block" },
  { id: "sky-2", shape: "streak", left: 4, width: 24, travel: 270, enter: 0.16, opacity: 0.8, drift: "2.5vw", driftTime: "110s", driftDelay: "-40s", className: "hidden lg:block" },
  { id: "sky-3", shape: "puff", left: 30, width: 34, travel: 450, enter: 0.36, opacity: 1, drift: "3.5vw", driftTime: "90s", driftDelay: "-70s", className: "hidden lg:block" },
  { id: "sky-4", shape: "streak", left: 66, width: 26, travel: 320, enter: 0.52, opacity: 0.85, drift: "2.5vw", driftTime: "100s", driftDelay: "-25s", className: "hidden lg:block" },
  { id: "sky-5", shape: "bank", left: 12, width: 32, travel: 450, enter: 0.62, opacity: 1, drift: "3vw", driftTime: "85s", driftDelay: "-55s", className: "hidden lg:block" },
  { id: "sky-m1", shape: "bank", left: 40, width: 65, travel: 450, enter: 0.07, opacity: 1, drift: "4vw", driftTime: "80s", driftDelay: "-10s", className: "lg:hidden" },
  { id: "sky-m2", shape: "streak", left: 0, width: 55, travel: 270, enter: 0.3, opacity: 0.8, drift: "3vw", driftTime: "110s", driftDelay: "-40s", className: "lg:hidden" },
  { id: "sky-m3", shape: "puff", left: 35, width: 65, travel: 450, enter: 0.6, opacity: 1, drift: "4vw", driftTime: "90s", driftDelay: "-70s", className: "lg:hidden" },
];

function SkyCloudItem({ cloud, progress, golden }: { cloud: SkyCloud; progress: MotionValue<number>; golden: MotionValue<number> }) {
  // A single transform from scroll progress, so Motion can hand it to the browser's scroll timeline.
  const transform = useTransform(progress, [0, 1], ["translate3d(0px, 0svh, 0px)", `translate3d(0px, ${-cloud.travel}svh, 0px)`]);
  return (
    <motion.div
      className={cn("absolute", cloud.className)}
      style={{ top: `${100 + cloud.travel * cloud.enter}svh`, left: `${cloud.left}vw`, width: `${cloud.width}vw`, transform }}
    >
      <div
        className="cloud-drift relative"
        style={{ "--drift": cloud.drift, "--drift-time": cloud.driftTime, "--drift-delay": cloud.driftDelay, opacity: cloud.opacity } as Vars}
      >
        <Cloud id={`${cloud.id}-day`} shape={cloud.shape} palette="day" className={cn("w-full", ASPECT[cloud.shape])} />
        <motion.div className="absolute inset-0" style={{ opacity: golden }}>
          <Cloud id={`${cloud.id}-golden`} shape={cloud.shape} palette="golden" className={cn("w-full", ASPECT[cloud.shape])} />
        </motion.div>
      </div>
    </motion.div>
  );
}

/**
 * Clouds drifting through the sky as you read: a fixed layer between the sun
 * (canvas) and the page, so they pass in front of the sun but behind the
 * words and the project cards. Nearer clouds move faster than far ones; they
 * warm from day to golden hour with the page and fade out as the evening
 * footer arrives (the sunset has its own). Off with reduced motion.
 */
export function CloudLayer() {
  const still = useReducedMotionSafe();
  const { scrollY, scrollYProgress } = useScroll();

  // The footer's first 40svh (data-cloud-fade): the clouds fade out while it
  // comes up the screen. Measured, and re-measured whenever the page resizes.
  const fade = useRef({ from: Infinity, to: Infinity });
  const opacity = useMotionValue(1);
  const update = (y: number) => {
    const { from, to } = fade.current;
    opacity.set(1 - Math.min(1, Math.max(0, (y - from) / (to - from))));
  };
  useMotionValueEvent(scrollY, "change", update);
  useEffect(() => {
    const measure = () => {
      const mark = document.querySelector<HTMLElement>("[data-cloud-fade]");
      if (!mark) return;
      const from = mark.getBoundingClientRect().top + window.scrollY - window.innerHeight;
      fade.current = { from, to: from + mark.offsetHeight };
      update(window.scrollY);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(document.body);
    return () => observer.disconnect();
    // `update` only reads refs and a motion value, so measuring once on mount is enough.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // Same curve as the page's golden-hour tint (DayCycle).
  const golden = useTransform(scrollYProgress, [0, 0.3, 0.85, 1], [0, 0, 1, 1]);

  if (still) return null;
  return (
    <motion.div
      aria-hidden="true"
      style={{ opacity }}
      className="scenery pointer-events-none fixed inset-0 z-[3] overflow-hidden"
    >
      {CLOUDS.map((cloud) => (
        <SkyCloudItem key={cloud.id} cloud={cloud} progress={scrollYProgress} golden={golden} />
      ))}
    </motion.div>
  );
}
