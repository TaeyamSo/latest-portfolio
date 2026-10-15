"use client";

import { useEffect, useRef } from "react";

import { CHAPTER_ARRIVE, CHAPTER_LEAVE, type ChapterArrive, type ChapterLeave } from "@/lib/chapters";

/** "380+" → the number and what's around it; null when there's no number to count. */
function parse(value: string) {
  const match = value.match(/^(\D*)(\d+)(.*)$/);
  return match ? { before: match[1], to: Number(match[2]), after: match[3] } : null;
}

const DURATION = 1400;
const easeOut = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

/**
 * A number that counts up from zero each time its chapter arrives (the
 * chapter controller's CHAPTER_ARRIVE), after `delay` ms — once the piece it
 * sits in has built in — and goes back to zero once the page has moved on.
 * The real value is in the HTML from the start (and stays for screen readers
 * and with reduced motion, where nothing counts).
 */
export function CountUp({ value, chapter, delay = 0 }: { value: string; chapter: string; delay?: number }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    const parts = parse(value);
    const root = document.documentElement;
    if (!el || !parts || !root.classList.contains("chapters")) return;
    let frame = 0;
    let timer = 0;
    const show = (n: number) => {
      el.textContent = `${parts.before}${n}${parts.after}`;
    };
    const stop = () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
    const count = () => {
      stop();
      show(0);
      timer = window.setTimeout(() => {
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / DURATION);
          show(Math.round(parts.to * easeOut(t)));
          if (t < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      }, delay);
    };

    const section = document.getElementById(chapter);
    if (section?.hasAttribute("data-arrived")) count();
    else show(0);

    const onArrive = (event: Event) => {
      if ((event as CustomEvent<ChapterArrive>).detail.id === chapter) count();
    };
    // Back to zero once the content has stepped aside, ready for the next visit.
    const onLeave = (event: Event) => {
      if ((event as CustomEvent<ChapterLeave>).detail.from !== chapter) return;
      stop();
      timer = window.setTimeout(() => show(0), 400);
    };
    window.addEventListener(CHAPTER_ARRIVE, onArrive);
    window.addEventListener(CHAPTER_LEAVE, onLeave);
    return () => {
      stop();
      show(parts.to);
      window.removeEventListener(CHAPTER_ARRIVE, onArrive);
      window.removeEventListener(CHAPTER_LEAVE, onLeave);
    };
  }, [value, chapter, delay]);

  return (
    <>
      <span ref={ref} aria-hidden="true" className="tabular-nums">
        {value}
      </span>
      <span className="sr-only">{value}</span>
    </>
  );
}
