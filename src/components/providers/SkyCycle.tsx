"use client";

import { useMotionValueEvent, useScroll } from "motion/react";
import { useEffect, useRef } from "react";

import { NightSky } from "@/components/scenery/NightSky";
import { DAY, NIGHT, dayAt, measureStops } from "@/components/sun/day";

/** The same shape as the page's own background (body in globals.css). */
const gradient = ({ sky: [left, right] }: { sky: readonly [string, string] }) => `linear-gradient(90deg, ${left}, ${right} 49%)`;

/**
 * The sky through the day (sun/day.ts): sunrise orange in the hero, lighter
 * through the morning, brightest and most golden at noon, deepening again to
 * golden hour — then the footer's own sunset and night take over. Two fixed
 * layers: the hour you're in, and the next one fading in over it. While you
 * scroll only that opacity changes; a layer's gradient is swapped only when an
 * hour is passed.
 *
 * The night theme has the same two layers in its own colours (NIGHT), with its
 * stars, laid over the day's (`.sky-night`, shown by globals.css), so the
 * night is right from the first paint and switching costs nothing here.
 */
export function SkyCycle() {
  const base = useRef<HTMLDivElement>(null);
  const next = useRef<HTMLDivElement>(null);
  const nightBase = useRef<HTMLDivElement>(null);
  const nightNext = useRef<HTMLDivElement>(null);
  const stops = useRef<number[]>([]);
  const shown = useRef(-1);
  const { scrollY } = useScroll();

  const update = (y: number) => {
    if (!stops.current.length || !base.current || !next.current || !nightBase.current || !nightNext.current) return;
    const day = dayAt(y, stops.current);
    if (day.index !== shown.current) {
      shown.current = day.index;
      base.current.style.background = gradient(DAY[day.index]);
      next.current.style.background = gradient(DAY[day.next]);
      nightBase.current.style.background = gradient(NIGHT[day.index]);
      nightNext.current.style.background = gradient(NIGHT[day.next]);
    }
    const t = day.t.toFixed(3);
    next.current.style.opacity = t;
    nightNext.current.style.opacity = t;
  };

  useMotionValueEvent(scrollY, "change", update);

  useEffect(() => {
    const measure = () => {
      stops.current = measureStops();
      update(window.scrollY);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(document.body);
    return () => observer.disconnect();
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
      <div ref={base} className="absolute inset-0" style={{ background: gradient(DAY[0]) }} />
      <div ref={next} className="absolute inset-0 opacity-0 will-change-[opacity]" style={{ background: gradient(DAY[1]) }} />
      <div className="sky-night absolute inset-0">
        <div ref={nightBase} className="absolute inset-0" style={{ background: gradient(NIGHT[0]) }} />
        <div ref={nightNext} className="absolute inset-0 opacity-0 will-change-[opacity]" style={{ background: gradient(NIGHT[1]) }} />
        <NightSky />
      </div>
    </div>
  );
}
