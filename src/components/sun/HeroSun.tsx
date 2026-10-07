"use client";

import { useRef } from "react";

import { FLARE_EVENT } from "./journey";
import { MoonDisc, SunDisc } from "./SunDisc";
import { useTheme } from "@/lib/theme";

const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

/**
 * The hero sun — a glowing disc that paints instantly as SVG + CSS. Once the
 * page is idle the WebGL sun (SunJourney) takes over from exactly this spot:
 * the bloom steps aside at once (the canvas draws the same one underneath)
 * and the disc fades out over it. Click it for a solar flare. In the night
 * theme it's the full moon (MoonDisc), and a click makes it shimmer.
 */
export function HeroSun() {
  const sunRef = useRef<HTMLSpanElement>(null);
  const night = useTheme() === "night";

  const flare = () => {
    if (document.documentElement.classList.contains("sun-webgl")) {
      window.dispatchEvent(new Event(FLARE_EVENT));
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const [bloom, disc] = Array.from(sunRef.current?.children ?? []);
    disc?.animate([{ scale: "1" }, { scale: "1.05" }, { scale: "1" }], { duration: 900, easing: EASE });
    bloom?.animate([{ scale: "1", opacity: 1 }, { scale: "1.3", opacity: 1 }, { scale: "1", opacity: 1 }], {
      duration: 900,
      easing: EASE,
    });
  };

  return (
    <div className="absolute inset-0">
      <SunDisc
        ref={sunRef}
        id="hero-sun"
        tone="noon"
        className="day-only absolute inset-0 size-full"
        discClassName="hero-sun-disc transition-opacity duration-1000"
        bloomClassName="hero-sun-bloom"
      />
      <MoonDisc
        id="hero-moon"
        className="night-only absolute inset-0 size-full"
        discClassName="hero-sun-disc transition-opacity duration-1000"
        bloomClassName="hero-sun-bloom"
      />
      <button
        type="button"
        onClick={flare}
        aria-label={night ? "Make the moon shimmer" : "Make the sun flare"}
        className="pointer-events-auto absolute inset-[20%] cursor-pointer rounded-full focus-visible:outline-offset-8"
      />
    </div>
  );
}
