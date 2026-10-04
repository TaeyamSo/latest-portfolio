"use client";

import { useInView } from "motion/react";
import { useRef } from "react";

import { cn } from "@/lib/cn";

/**
 * A line of copy set on ink bands, one per wrapped line, like a poster
 * caption — so it stays crisp over the sun and the clouds. When it scrolls
 * into view the bands sweep in from the left, then the words appear on them
 * (`.ink-label` in globals.css).
 */
export function InkLabel({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const shown = useInView(ref, { once: true, amount: 0.6 });
  return (
    <p className={cn("leading-[1.6]", className)}>
      <span ref={ref} data-shown={shown || undefined} data-cursor-tone="light" className="ink-label">
        {text}
      </span>
    </p>
  );
}
