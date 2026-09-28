"use client";

import { ReactLenis } from "lenis/react";
import { MotionConfig } from "motion/react";

/**
 * Smooth, native-position scrolling (Lenis) + motion defaults.
 * Both honour `prefers-reduced-motion` automatically.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis
      root
      options={{ autoRaf: true, lerp: 0.09, stopInertiaOnNavigate: true }}
    >
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </ReactLenis>
  );
}
