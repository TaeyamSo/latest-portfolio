"use client";

import { useRef } from "react";

import { FLARE_EVENT } from "./journey";
import { SunGlyph } from "./SunGlyph";

/**
 * The hero sun. Paints instantly as SVG; once the page is idle the WebGL sun
 * (SunJourney) takes over from exactly this spot and the glyph fades out.
 * Click it for a solar flare.
 */
export function HeroSun() {
  const glyphRef = useRef<HTMLSpanElement>(null);

  const flare = () => {
    if (document.documentElement.classList.contains("sun-webgl")) {
      window.dispatchEvent(new Event(FLARE_EVENT));
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    glyphRef.current?.animate(
      [{ transform: "scale(1)" }, { transform: "scale(1.08) rotate(18deg)" }, { transform: "scale(1)" }],
      { duration: 900, easing: "cubic-bezier(0.16, 1, 0.3, 1)" },
    );
  };

  return (
    <div className="intro-sun absolute inset-0">
      <SunGlyph
        ref={glyphRef}
        id="hero-sun"
        spin
        className="hero-sun-glyph absolute inset-0 size-full transition-opacity duration-1000"
      />
      <button
        type="button"
        onClick={flare}
        aria-label="Make the sun flare"
        data-cursor="Flare"
        className="pointer-events-auto absolute inset-[20%] cursor-pointer rounded-full focus-visible:outline-offset-8"
      />
    </div>
  );
}
