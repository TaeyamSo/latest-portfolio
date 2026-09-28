"use client";

import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";

import { useReducedMotionSafe } from "@/lib/use-media-query";

type Props = { text: string; className?: string };

/**
 * Words light up one by one as the paragraph scrolls through the viewport.
 * Server/no-JS/reduced-motion render plain, fully legible text.
 */
export function ScrubText({ text, className }: Props) {
  const ref = useRef<HTMLParagraphElement>(null);
  const still = useReducedMotionSafe();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.9", "end 0.5"] });
  const words = text.split(" ");

  return (
    <p ref={ref} className={className}>
      {words.map((word, i) => (
        <Word
          key={`${word}-${i}`}
          progress={scrollYProgress}
          range={[i / words.length, (i + 1) / words.length]}
          still={still}
        >
          {word}
          {i < words.length - 1 && " "}
        </Word>
      ))}
    </p>
  );
}

function Word({
  children,
  progress,
  range,
  still,
}: {
  children: React.ReactNode;
  progress: MotionValue<number>;
  range: [number, number];
  still: boolean;
}) {
  const opacity = useTransform(progress, range, [0.16, 1]);
  return <motion.span style={still ? undefined : { opacity }}>{children}</motion.span>;
}
