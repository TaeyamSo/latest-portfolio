"use client";

import { motion, useScroll, useTransform } from "motion/react";

/**
 * The day moves on as you scroll: noon at the top, golden hour by the projects,
 * then the footer takes over with dusk. Opacity only, on its own layer, so
 * Motion can hand it to the browser's scroll timeline (no per-frame JS).
 * The ranges are padded to 0 and 1 so the tint can never fade back out.
 */
export function DayCycle() {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.85, 1], [0, 0, 1, 1]);

  return (
    <motion.div
      aria-hidden="true"
      style={{ opacity }}
      className="pointer-events-none fixed inset-0 z-0 bg-[linear-gradient(90deg,#f24a12,#f7701a_49%)] will-change-[opacity]"
    />
  );
}
