"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/cn";

import { SunGlyph } from "./SunGlyph";
import { canUseWebGL, whenIdle } from "./webgl";

const NoonCanvas = dynamic(() => import("./NoonCanvas"), { ssr: false });

/**
 * The hero sun. Paints instantly as SVG, then — once the page is idle —
 * upgrades to the WebGL version and cross-fades. Click it for a solar flare.
 */
export function HeroSun() {
  const [enabled, setEnabled] = useState(false);
  const [ready, setReady] = useState(false);
  const flareRef = useRef(0);
  const glyphRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!canUseWebGL()) return;
    return whenIdle(() => setEnabled(true));
  }, []);

  const onReady = useCallback(() => setReady(true), []);

  const flare = () => {
    flareRef.current = 1;
    if (ready || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
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
        className={cn("absolute inset-0 size-full transition-opacity duration-1000", ready && "opacity-0")}
      />
      {enabled && (
        <NoonCanvas
          onReady={onReady}
          flareRef={flareRef}
          className={cn(
            "absolute -inset-[18%] transition-opacity duration-1000",
            ready ? "opacity-100" : "opacity-0",
          )}
        />
      )}
      <button
        type="button"
        onClick={flare}
        aria-label="Make the sun flare"
        className="pointer-events-auto absolute inset-[20%] cursor-pointer rounded-full focus-visible:outline-offset-8"
      />
    </div>
  );
}
