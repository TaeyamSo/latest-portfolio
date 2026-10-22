"use client";

import { useEffect, useRef } from "react";

/** "380+" → the number and what's around it; null when there's no number to count. */
function parse(value: string) {
  const match = value.match(/^(\D*)(\d+)(.*)$/);
  return match ? { before: match[1], to: Number(match[2]), after: match[3] } : null;
}

const DURATION = 1600;
const easeOut = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

/**
 * A number that counts up from zero the first time it scrolls into view (the
 * case pages' "By the numbers"), after `delay` ms so a row can ripple. The real
 * value is in the HTML from the start, and stays for screen readers and with
 * reduced motion, where nothing counts.
 */
export function CountInView({ value, delay = 0 }: { value: string; delay?: number }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    const parts = parse(value);
    if (!el || !parts || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    let timer = 0;
    const show = (n: number) => {
      el.textContent = `${parts.before}${n}${parts.after}`;
    };
    show(0);
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        timer = window.setTimeout(() => {
          const start = performance.now();
          const tick = (now: number) => {
            const t = Math.min(1, (now - start) / DURATION);
            show(Math.round(parts.to * easeOut(t)));
            if (t < 1) frame = requestAnimationFrame(tick);
          };
          frame = requestAnimationFrame(tick);
        }, delay);
      },
      { threshold: 0.6 },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
      show(parts.to);
    };
  }, [value, delay]);

  return (
    <>
      <span ref={ref} aria-hidden="true" className="tabular-nums">
        {value}
      </span>
      <span className="sr-only">{value}</span>
    </>
  );
}
