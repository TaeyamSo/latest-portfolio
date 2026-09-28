"use client";

import { useEffect, useRef } from "react";

/**
 * The fixed concentric heat rings from the original site. They drift a few
 * pixels against the cursor for depth (fine pointers only).
 */
export function PointerParallax() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;

    let frame = 0;
    let x = 0;
    let y = 0;
    const onMove = (event: PointerEvent) => {
      x = (event.clientX / window.innerWidth) * 2 - 1;
      y = (event.clientY / window.innerHeight) * 2 - 1;
      frame ||= requestAnimationFrame(() => {
        frame = 0;
        el.style.transform = `translate3d(${(x * -14).toFixed(2)}px, ${(y * -14).toFixed(2)}px, 0)`;
      });
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  return <div ref={ref} className="rings" aria-hidden="true" />;
}
