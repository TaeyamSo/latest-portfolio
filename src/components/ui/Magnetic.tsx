"use client";

import { motion, useSpring } from "motion/react";
import { useRef } from "react";

import { cn } from "@/lib/cn";

type Props = { children: React.ReactNode; className?: string; strength?: number };

const spring = { stiffness: 220, damping: 16, mass: 0.5 };

/** Pulls its child a little towards the cursor, then springs back. */
export function Magnetic({ children, className, strength = 0.28 }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const x = useSpring(0, spring);
  const y = useSpring(0, spring);

  function onPointerMove(event: React.PointerEvent) {
    if (event.pointerType !== "mouse" || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((event.clientX - (rect.left + rect.width / 2)) * strength);
    y.set((event.clientY - (rect.top + rect.height / 2)) * strength);
  }

  function reset() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.span
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerLeave={reset}
      style={{ x, y }}
      className={cn("inline-block", className)}
    >
      {children}
    </motion.span>
  );
}
