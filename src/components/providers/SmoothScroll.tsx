"use client";

import { ReactLenis, useLenis } from "lenis/react";
import { MotionConfig } from "motion/react";
import { useEffect } from "react";

/**
 * Smooth, native-position scrolling (Lenis) + motion defaults.
 * Both honour `prefers-reduced-motion` automatically.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis root options={{ autoRaf: false, lerp: 0.09, stopInertiaOnNavigate: true }}>
      <LenisFrames />
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </ReactLenis>
  );
}

/**
 * Lenis's frames, only while it is moving the page — a wheel's smooth scroll or
 * a glide — instead of a frame loop that never stops. A loop that runs every
 * frame, even an empty one, makes the browser bring every running CSS
 * animation's style up to date on every frame (the scenery has dozens), which
 * is most of what the page cost while it sat still; touch scrolling is native
 * and never needs one.
 */
function LenisFrames() {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;
    let frame = 0;
    // Lenis's clock runs only while it is awake, so the first frame back doesn't count the time asleep.
    let clock = 1;
    let last = 0;
    const tick = (now: number) => {
      frame = 0;
      clock += last ? now - last : 0;
      last = now;
      lenis.raf(clock);
      if (lenis.isScrolling === "smooth") frame = requestAnimationFrame(tick);
      else last = 0;
    };
    // Lenis marks <html> `lenis-smooth` the moment it starts moving the page —
    // a wheel or trackpad gesture, or a glide asked for in code.
    const wake = () => {
      if (!frame && lenis.isScrolling === "smooth") frame = requestAnimationFrame(tick);
    };
    const observer = new MutationObserver(wake);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    wake();
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [lenis]);

  return null;
}
