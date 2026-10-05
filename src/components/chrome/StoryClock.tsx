"use client";

import { useMotionValueEvent, useScroll } from "motion/react";
import { useEffect, useRef } from "react";

import { DAY, formatClock, measureStops, minutesAt } from "@/components/sun/day";
import { SunGlyph } from "@/components/sun/SunGlyph";
import { cn } from "@/lib/cn";

type Marks = { stops: number[]; footer: { start: number; end: number } };

/**
 * The time of day the page has reached: 06:30 at sunrise in the hero, noon
 * over the services, 17:45 at golden hour, 19:30 once the sun has set. Reads
 * the same timeline as the sky and the sun (sun/day.ts); the text is written
 * straight to the DOM in five-minute steps, so scrolling never re-renders.
 */
export function StoryClock({ className }: { className?: string }) {
  const time = useRef<HTMLSpanElement>(null);
  const marks = useRef<Marks | null>(null);
  const { scrollY } = useScroll();

  const update = (y: number) => {
    if (!marks.current || !time.current) return;
    const text = formatClock(minutesAt(y, marks.current.stops, marks.current.footer));
    if (time.current.textContent !== text) time.current.textContent = text;
  };

  useMotionValueEvent(scrollY, "change", update);

  useEffect(() => {
    const measure = () => {
      const end = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const footer = document.getElementById("contact");
      const start = footer ? Math.min(end - 1, footer.getBoundingClientRect().top + window.scrollY - window.innerHeight) : end - 1;
      marks.current = { stops: measureStops(), footer: { start, end } };
      update(window.scrollY);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(document.body);
    return () => observer.disconnect();
  }, []);

  return (
    <p className={cn("meta flex items-center gap-2 tabular-nums", className)} aria-hidden="true">
      <SunGlyph id="story-clock" className="size-3.5" />
      <span ref={time}>{formatClock(DAY[0].minutes)}</span>
    </p>
  );
}
