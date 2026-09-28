"use client";

import { motion } from "motion/react";

import { cn } from "@/lib/cn";

import { EASE_EXPO, Reveal, RevealWords } from "./Reveal";

type Props = {
  id: string;
  index: string;
  label: string;
  title: string;
  className?: string;
  /** Hover colour for the title + dashes (the original turned them white). */
  hoverClassName?: string;
};

const dash = {
  hidden: { scaleX: 0 },
  shown: (delay: number) => ({ scaleX: 1, transition: { duration: 1, ease: EASE_EXPO, delay } }),
};

export function SectionHeading({
  id,
  index,
  label,
  title,
  className,
  hoverClassName = "group-hover/heading:text-paper",
}: Props) {
  return (
    <div className={cn("group/heading w-fit", className)}>
      <Reveal>
        <p className="meta mb-6 flex items-center gap-3">
          <span>({index})</span>
          <span aria-hidden="true" className="h-px w-10 bg-current" />
          <span>{label}</span>
        </p>
      </Reveal>
      <h2
        id={id}
        className={cn("text-title font-extrabold uppercase transition-colors duration-300", hoverClassName)}
      >
        <RevealWords text={title} />
      </h2>
      <motion.span
        aria-hidden="true"
        className={cn("mt-7 flex w-fit flex-col gap-[0.85rem] transition-colors duration-300", hoverClassName)}
        initial="hidden"
        whileInView="shown"
        viewport={{ once: true, amount: 1 }}
      >
        <motion.span variants={dash} custom={0.25} className="block h-1 w-[6.25rem] origin-left rounded-full bg-current" />
        <motion.span variants={dash} custom={0.38} className="ml-[3.45rem] block h-1 w-[6.25rem] origin-left rounded-full bg-current" />
      </motion.span>
    </div>
  );
}
