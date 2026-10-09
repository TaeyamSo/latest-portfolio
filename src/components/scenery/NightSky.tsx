"use client";

import { useEffect, useRef } from "react";

import { useTheme } from "@/lib/theme";

import { NightStars } from "./NightStars";

/**
 * The night sky's stars (the night theme), on SkyCycle's night layers: a still
 * field that twinkles in three groups (each group's opacity breathes, so the
 * compositor does the work), a few bright stars with a soft glint, and now and
 * then a shooting star. Only at night, only while the tab is visible, never
 * with reduced motion.
 */
export function NightSky() {
  const shooting = useRef<HTMLSpanElement>(null);
  const night = useTheme() === "night";

  useEffect(() => {
    const star = shooting.current;
    if (!night || !star || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let timer = 0;
    const next = () => {
      timer = window.setTimeout(shoot, 8000 + Math.random() * 10000);
    };
    const shoot = () => {
      if (document.visibilityState === "visible") {
        star.style.left = `${(15 + Math.random() * 70).toFixed(1)}%`;
        star.style.top = `${(4 + Math.random() * 26).toFixed(1)}%`;
        star.getAnimations().forEach((animation) => animation.cancel());
        star.animate(
          [
            { transform: "rotate(-24deg) translateX(0) scaleX(0.2)", opacity: 0 },
            { transform: "rotate(-24deg) translateX(-6vmax) scaleX(1)", opacity: 1, offset: 0.25 },
            { transform: "rotate(-24deg) translateX(-26vmax) scaleX(0.6)", opacity: 0 },
          ],
          { duration: 1100, easing: "cubic-bezier(0.3, 0, 0.6, 1)" },
        );
      }
      next();
    };
    timer = window.setTimeout(shoot, 2500);
    return () => window.clearTimeout(timer);
  }, [night]);

  return (
    <div className="night-only absolute inset-0 overflow-hidden">
      <NightStars />
      <span ref={shooting} className="shooting-star absolute opacity-0" />
    </div>
  );
}
