"use client";

import { motion, stagger, type Variants } from "motion/react";
import { Fragment } from "react";

import { splitAccentWords } from "@/lib/accent";
import { cn } from "@/lib/cn";

export const EASE_EXPO = [0.16, 1, 0.3, 1] as const;

const offsets = {
  left: { x: -56, y: 0 },
  right: { x: 56, y: 0 },
  up: { x: 0, y: 36 },
} as const;

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  /** Direction the element travels in from — the original slid in from the left. */
  from?: keyof typeof offsets;
  as?: "div" | "li" | "p" | "ul" | "dl";
};

/** Fade + slide into place once, when scrolled into view. */
export function Reveal({ children, className, delay = 0, from = "left", as = "div" }: RevealProps) {
  const Tag = motion[as];
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, ...offsets[from] }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 1.1, ease: EASE_EXPO, delay }}
    >
      {children}
    </Tag>
  );
}

const wordParent: Variants = {
  hidden: {},
  shown: (delay: number) => ({ transition: { delayChildren: stagger(0.07, { startDelay: delay }) } }),
};

const wordChild: Variants = {
  hidden: { y: "112%", rotate: 4 },
  shown: { y: "0%", rotate: 0, transition: { duration: 1.05, ease: EASE_EXPO } },
};

type RevealWordsProps = {
  text: string;
  className?: string;
  delay?: number;
};

/**
 * Each word rises out of its own mask — used for the big section titles.
 * `*accent*` words are set in the serif italic; their masks get extra room for
 * descenders and the italic overhang (padding inside, cancelled by negative
 * margins outside, so line spacing and the hidden state are unaffected).
 */
export function RevealWords({ text, className, delay = 0 }: RevealWordsProps) {
  const words = splitAccentWords(text);
  return (
    <motion.span
      className={cn("inline", className)}
      variants={wordParent}
      custom={delay}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, amount: 0.6 }}
    >
      {words.map((pieces, i) => {
        const accent = pieces.some((piece) => piece.accent);
        return (
          <span key={i}>
            <span
              className={cn(
                "inline-block overflow-hidden align-bottom",
                accent ? "-mt-[0.14em] -mr-[0.22em] -mb-[0.24em] -ml-[0.12em] pb-[0.06em]" : "pb-[0.06em]",
              )}
            >
              <motion.span
                className={cn(
                  "inline-block origin-bottom-left",
                  accent && "pt-[0.14em] pr-[0.22em] pb-[0.24em] pl-[0.12em]",
                )}
                variants={wordChild}
              >
                {pieces.map((piece, j) =>
                  piece.accent ? (
                    <span key={j} className="serif-accent">
                      {piece.text}
                    </span>
                  ) : (
                    <Fragment key={j}>{piece.text}</Fragment>
                  ),
                )}
              </motion.span>
            </span>
            {i < words.length - 1 && " "}
          </span>
        );
      })}
    </motion.span>
  );
}
