"use client";

import { animate, useInView } from "motion/react";
import { useEffect, useRef } from "react";

const pad = (n: number) => String(Math.round(n)).padStart(2, "0");

/**
 * Counts from 00 to `value` the first time it is seen. It resets to 00 just
 * before entering the viewport, so the swap is never visible. Screen readers
 * and no-JS visitors always get the real number.
 */
export function CountUp({ value, className }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const approaching = useInView(ref, { once: true, margin: "0px 0px 20% 0px" });
  const visible = useInView(ref, { once: true, amount: 0.9 });
  const motionOk = useRef(false);

  useEffect(() => {
    if (!approaching || !ref.current) return;
    motionOk.current = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (motionOk.current) ref.current.textContent = pad(0);
  }, [approaching]);

  useEffect(() => {
    const el = ref.current;
    if (!visible || !el || !motionOk.current) return;
    const controls = animate(0, value, {
      duration: 1.4,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => {
        el.textContent = pad(latest);
      },
    });
    return () => controls.stop();
  }, [visible, value]);

  return (
    <span className={className}>
      <span ref={ref} aria-hidden="true">
        {pad(value)}
      </span>
      <span className="sr-only">{value}</span>
    </span>
  );
}
