"use client";

import { motion, useMotionTemplate, useMotionValue, useSpring } from "motion/react";
import { useRef } from "react";

import { cn } from "@/lib/cn";

type Props = {
  children: React.ReactNode;
  className?: string;
  /** Maximum rotation in degrees. */
  max?: number;
  /** Add a soft light reflection that follows the cursor. */
  sheen?: boolean;
};

const spring = { stiffness: 160, damping: 18, mass: 0.6 };

/** 3D tilt towards the cursor (mouse only; touch and keyboard are untouched). */
export function Tilt({ children, className, max = 7, sheen = false }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const rotateX = useSpring(0, spring);
  const rotateY = useSpring(0, spring);
  const mx = useMotionValue(50);
  const my = useMotionValue(50);
  const light = useMotionTemplate`radial-gradient(circle at ${mx}% ${my}%, rgb(255 255 255 / 0.28), transparent 55%)`;

  function onPointerMove(event: React.PointerEvent) {
    if (event.pointerType !== "mouse" || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    rotateY.set((px - 0.5) * max * 2);
    rotateX.set((0.5 - py) * max * 2);
    mx.set(px * 100);
    my.set(py * 100);
  }

  function onPointerLeave() {
    rotateX.set(0);
    rotateY.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      style={{ rotateX, rotateY, transformPerspective: 1100 }}
      className={cn("relative", sheen && "group/tilt", className)}
    >
      {children}
      {sheen && (
        <motion.span
          aria-hidden="true"
          style={{ backgroundImage: light }}
          className="pointer-events-none absolute inset-0 opacity-0 mix-blend-overlay transition-opacity duration-500 group-hover/tilt:opacity-100"
        />
      )}
    </motion.div>
  );
}
