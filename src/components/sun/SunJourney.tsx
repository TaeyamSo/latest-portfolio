"use client";

import { useEffect, useRef, useState } from "react";

import { useMediaQuery } from "@/lib/use-media-query";

import { canUseWebGL, whenIdle } from "./webgl";

/** The hero intro is pure CSS and lands at ~2s; the WebGL sun takes over after it. */
const INTRO_MS = 2000;

/**
 * One sun for the whole page. Once the intro has played and the page is idle,
 * a fixed WebGL canvas takes over from the SVG suns: it sits exactly on the
 * hero sun, leaves it for the sky as you scroll, warms through the afternoon
 * and sets into the sea in the footer. Without WebGL, on data saver, with
 * reduced motion or forced colours, the SVG and CSS versions simply stay.
 * The renderer is its own small chunk, loaded only when it's needed.
 */
export function SunJourney() {
  const ref = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<"waiting" | "on" | "failed">("waiting");
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)", true);
  const forced = useMediaQuery("(forced-colors: active)", true);
  const allowed = !reduced && !forced;

  useEffect(() => {
    if (!allowed || status !== "waiting" || !canUseWebGL()) return;
    let cancelIdle: (() => void) | undefined;
    const timer = setTimeout(() => {
      cancelIdle = whenIdle(() => setStatus("on"));
    }, Math.max(0, INTRO_MS - performance.now()));
    return () => {
      clearTimeout(timer);
      cancelIdle?.();
    };
  }, [allowed, status]);

  useEffect(() => {
    const canvas = ref.current;
    if (!allowed || status !== "on" || !canvas) return;
    let stop: (() => void) | undefined;
    let cancelled = false;
    import("./journey-renderer")
      .then(({ startJourney }) => {
        if (!cancelled) stop = startJourney(canvas, () => setStatus("failed"));
      })
      .catch(() => setStatus("failed"));
    return () => {
      cancelled = true;
      stop?.();
    };
  }, [allowed, status]);

  if (!allowed || status !== "on") return null;
  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[2] h-lvh w-full"
    />
  );
}
