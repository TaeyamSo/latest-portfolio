"use client";

import { motion, useMotionValue, useMotionValueEvent, useScroll, useTransform, type MotionValue } from "motion/react";
import { useEffect, useRef } from "react";

import { DAY, dayAt, measureStops, mix } from "@/components/sun/day";
import { cn } from "@/lib/cn";
import { useReducedMotionSafe } from "@/lib/use-media-query";

import { Cloud, type CloudShape } from "./Cloud";

type Vars = React.CSSProperties & Record<`--${string}`, string>;

type Drifting = {
  id: string;
  shape: CloudShape;
  /** Horizontal place (vw). */
  left: number;
  width: number;
  opacity: number;
  drift: string;
  driftTime: string;
  driftDelay: string;
  /** The gentle bob up and down: how far, and how long one way. */
  float: string;
  floatTime: string;
  className: string;
};

type SkyCloud = Drifting & {
  /** How far (svh) it travels up over the whole page: near clouds pass faster. */
  travel: number;
  /** When (page progress 0–1) its top reaches the bottom of the screen. */
  enter: number;
};

/** The noon cloud rests beside the sun when the services arrive (`top`), and drifts by at `rate` × the scroll. */
type NoonCloud = Drifting & { top: string; rate: number };

const ASPECT: Record<CloudShape, string> = {
  puff: "aspect-[100/40]",
  bank: "aspect-[100/40]",
  streak: "aspect-[100/22]",
  wisp: "aspect-[100/18]",
};

// Placement: a cloud sits at top = 100 + travel × enter (svh) and rises by
// `travel` over the page, so it's on screen from `enter` until about
// enter + (100 + its height) / travel. Every cloud has left by 0.9, so none
// can drift down to the sunset's horizon. One of the desktop clouds crosses the
// sun in the top-right corner on the way.
const CLOUDS: SkyCloud[] = [
  { id: "sky-2", shape: "streak", left: 4, width: 24, travel: 270, enter: 0.16, opacity: 0.8, drift: "2.5vw", driftTime: "110s", driftDelay: "-40s", float: "0.45vw", floatTime: "10s", className: "hidden lg:block" },
  { id: "sky-3", shape: "puff", left: 30, width: 34, travel: 450, enter: 0.36, opacity: 1, drift: "3.5vw", driftTime: "90s", driftDelay: "-70s", float: "0.7vw", floatTime: "7s", className: "hidden lg:block" },
  { id: "sky-4", shape: "streak", left: 66, width: 26, travel: 320, enter: 0.52, opacity: 0.85, drift: "2.5vw", driftTime: "100s", driftDelay: "-25s", float: "0.45vw", floatTime: "9s", className: "hidden lg:block" },
  { id: "sky-5", shape: "bank", left: 12, width: 32, travel: 450, enter: 0.62, opacity: 1, drift: "3vw", driftTime: "85s", driftDelay: "-55s", float: "0.6vw", floatTime: "8.5s", className: "hidden lg:block" },
  { id: "sky-m2", shape: "streak", left: 0, width: 55, travel: 270, enter: 0.3, opacity: 0.8, drift: "3vw", driftTime: "110s", driftDelay: "-40s", float: "0.9vw", floatTime: "10s", className: "lg:hidden" },
  { id: "sky-m3", shape: "puff", left: 35, width: 65, travel: 450, enter: 0.6, opacity: 1, drift: "4vw", driftTime: "90s", driftDelay: "-70s", float: "1.3vw", floatTime: "7s", className: "lg:hidden" },
];

// The cloud beside the noon sun (day.ts: x 60%, y 13svh on large screens, 8.5svh
// on phones). Rather than rising with the whole page it's tied to the services,
// so it's there whatever the page's length: it comes up with the morning, rests
// just right of the sun at noon (its left edge clear of the disc), and has gone
// by the afternoon.
const NOON_CLOUDS: NoonCloud[] = [
  { id: "noon", shape: "bank", left: 63.5, width: 34, top: "calc(13svh - 6.5vw)", rate: 0.57, opacity: 1, drift: "2vw", driftTime: "80s", driftDelay: "-10s", float: "0.6vw", floatTime: "8s", className: "hidden lg:block" },
  { id: "noon-m", shape: "bank", left: 68, width: 70, top: "calc(8.5svh - 13vw)", rate: 0.57, opacity: 1, drift: "3vw", driftTime: "80s", driftDelay: "-10s", float: "1.2vw", floatTime: "8s", className: "lg:hidden" },
];

/** Which day stop is noon (the services). */
const NOON = DAY.findIndex((stop) => stop.anchor?.id === "services");

function CloudBody({ cloud, golden }: { cloud: Drifting; golden: MotionValue<number> }) {
  return (
    <div
      className="cloud-drift"
      style={{ "--drift": cloud.drift, "--drift-time": cloud.driftTime, "--drift-delay": cloud.driftDelay, opacity: cloud.opacity } as Vars}
    >
      <div
        className="cloud-float relative"
        style={{ "--float": cloud.float, "--float-time": cloud.floatTime, "--float-delay": cloud.driftDelay } as Vars}
      >
        <Cloud id={`${cloud.id}-day`} shape={cloud.shape} palette="day" className={cn("w-full", ASPECT[cloud.shape])} />
        <motion.div className="absolute inset-0 will-change-[opacity]" style={{ opacity: golden }}>
          <Cloud id={`${cloud.id}-golden`} shape={cloud.shape} palette="golden" className={cn("w-full", ASPECT[cloud.shape])} />
        </motion.div>
      </div>
    </div>
  );
}

function SkyCloudItem({ cloud, progress, golden }: { cloud: SkyCloud; progress: MotionValue<number>; golden: MotionValue<number> }) {
  // A single transform from scroll progress, so Motion can hand it to the browser's scroll timeline.
  const transform = useTransform(progress, [0, 1], ["translate3d(0px, 0svh, 0px)", `translate3d(0px, ${-cloud.travel}svh, 0px)`]);
  return (
    <motion.div
      className={cn("absolute", cloud.className)}
      style={{ top: `${100 + cloud.travel * cloud.enter}svh`, left: `${cloud.left}vw`, width: `${cloud.width}vw`, transform }}
    >
      <CloudBody cloud={cloud} golden={golden} />
    </motion.div>
  );
}

/** `fromNoon`: how far (px) the page still is above the services' resting place. */
function NoonCloudItem({ cloud, fromNoon, golden }: { cloud: NoonCloud; fromNoon: MotionValue<number>; golden: MotionValue<number> }) {
  const transform = useTransform(fromNoon, (v) => `translate3d(0px, ${(v * cloud.rate).toFixed(1)}px, 0px)`);
  return (
    <motion.div className={cn("absolute", cloud.className)} style={{ top: cloud.top, left: `${cloud.left}vw`, width: `${cloud.width}vw`, transform }}>
      <CloudBody cloud={cloud} golden={golden} />
    </motion.div>
  );
}

/**
 * Clouds drifting through the sky as you read: a fixed layer between the sun
 * (canvas) and the page, so they pass in front of the sun but behind the
 * words and the project cards. Nearer clouds move faster than far ones, and
 * each bobs gently as it drifts; their colour follows the hour (sun/day.ts) —
 * cream at noon, warmer towards morning and afternoon, golden by golden hour —
 * and they fade out as the evening footer arrives (the sunset has its own).
 *
 * At noon one cloud rests beside the sun, whatever the page's length.
 * Off with reduced motion.
 */
export function CloudLayer() {
  const still = useReducedMotionSafe();
  const { scrollY, scrollYProgress } = useScroll();

  // The footer's first 40svh (data-cloud-fade): the clouds fade out while it
  // comes up the screen. Measured, and re-measured whenever the page resizes.
  const fade = useRef({ from: Infinity, to: Infinity });
  const stops = useRef<number[]>([]);
  const opacity = useMotionValue(1);
  const golden = useMotionValue(0);
  const fromNoon = useMotionValue(1e5); // far below until measured
  const update = (y: number) => {
    const { from, to } = fade.current;
    opacity.set(1 - Math.min(1, Math.max(0, (y - from) / (to - from))));
    if (stops.current.length) {
      const day = dayAt(y, stops.current);
      golden.set(mix(DAY[day.index].clouds, DAY[day.next].clouds, day.t));
      fromNoon.set(stops.current[NOON] - y);
    }
  };
  useMotionValueEvent(scrollY, "change", update);
  useEffect(() => {
    const measure = () => {
      stops.current = measureStops();
      const mark = document.querySelector<HTMLElement>("[data-cloud-fade]");
      if (mark) {
        const from = mark.getBoundingClientRect().top + window.scrollY - window.innerHeight;
        fade.current = { from, to: from + mark.offsetHeight };
      }
      update(window.scrollY);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(document.body);
    return () => observer.disconnect();
    // `update` only reads refs and a motion value, so measuring once on mount is enough.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        {NOON_CLOUDS.map((cloud) => (
          <NoonCloudItem key={cloud.id} cloud={cloud} fromNoon={fromNoon} golden={golden} />
        ))}
      </motion.div>
  );
}
