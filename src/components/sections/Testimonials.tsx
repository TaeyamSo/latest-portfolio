"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

import { EASE_EXPO } from "@/components/ui/Reveal";
import { MockBadge } from "@/components/ui/MockBadge";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Testimonial } from "@/content/site";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Clients speak in the serif, Tayam in Kanit. One large quote at a time with a
 * manual pager (no auto-rotation, so nothing moves on its own).
 */
export function Testimonials({ items }: { items: Testimonial[] }) {
  const [index, setIndex] = useState(0);
  const item = items[index];
  const go = (step: number) => setIndex((current) => (current + step + items.length) % items.length);

  return (
    <section aria-labelledby="testimonials-title" className="shell relative py-[clamp(7rem,16vh,12rem)]">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <SectionHeading id="testimonials-title" label="Testimonials" title="Kind *words*" />
        {item.mock && <MockBadge className="mb-3" />}
      </div>

      <div
        role="group"
        aria-roledescription="carousel"
        aria-label="Client testimonials"
        className="relative mt-14 grid gap-10 lg:mt-20 lg:grid-cols-12"
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -top-[0.3em] -left-[0.05em] font-serif text-[clamp(10rem,22vw,20rem)] leading-none text-ink/10 italic"
        >
          “
        </span>

        <div aria-live="polite" className="relative min-h-[16rem] lg:col-span-10 lg:col-start-2 lg:min-h-[19rem]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.figure
              key={index}
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${items.length}`}
              initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -16, filter: "blur(6px)" }}
              transition={{ duration: 0.7, ease: EASE_EXPO }}
            >
              <blockquote className="serif-accent max-w-[26ch] text-[clamp(1.9rem,3.6vw,3.6rem)] leading-[1.12]">
                {item.quote}
              </blockquote>
              <figcaption className="mt-8 flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <span className="text-lg font-semibold">{item.name}</span>
                <span className="meta text-ink/85">{item.role}</span>
              </figcaption>
            </motion.figure>
          </AnimatePresence>
        </div>

        {items.length > 1 && (
          <div className="flex items-center gap-6 lg:col-span-10 lg:col-start-2">
            <p className="meta tabular-nums" aria-hidden="true">
              {pad(index + 1)} <span className="opacity-60">/ {pad(items.length)}</span>
            </p>
            <div className="flex gap-2">
              {[
                { label: "Previous testimonial", step: -1, arrow: "←" },
                { label: "Next testimonial", step: 1, arrow: "→" },
              ].map((button) => (
                <button
                  key={button.label}
                  type="button"
                  onClick={() => go(button.step)}
                  aria-label={button.label}
                  className="grid size-11 place-items-center rounded-full border-2 border-ink text-lg transition-colors duration-300 hover:bg-ink hover:text-paper"
                >
                  <span aria-hidden="true">{button.arrow}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
