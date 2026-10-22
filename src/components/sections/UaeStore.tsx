"use client";

import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, ViewTransition, type ReactNode } from "react";

import { RollText } from "@/components/ui/RollText";
import { useStoreActive } from "@/components/ui/WindowSlides";
import { cn } from "@/lib/cn";
import { SIGN, type Vars } from "@/lib/street";
import { useReducedMotionSafe } from "@/lib/use-media-query";
import { workReturn } from "@/lib/work-return";

/** One UAE client site, as the store shows it. */
export type UaeSlide = {
  slug: string;
  name: string;
  /** The short name on its hanging tab. */
  label: string;
  category: string;
  role?: string;
  image: StaticImageData;
  alt: string;
  /** Its case study page, when it has one. */
  href: string | null;
  /** Its live site, when it loads. */
  live: string | null;
};

const CYCLE_MS = 4200;

/**
 * One store for all the UAE client sites: an arcade with an arched board
 * carrying its name, a row of hanging tabs — one per site —
 * and a display window that shows the sites in turn, with the
 * board beside it saying what the one in the window is and what Tayam did.
 * Tabs jump to a site; the show runs only while the street rests here, and
 * stops while the pointer or focus is on the store (or with reduced motion).
 * Each site still opens its own case study: the page's backdrop grows out of
 * the window and its screenshot flies from it, so every slide keeps its own
 * fixed transition names (a name that followed the slide shown would clash).
 * Coming back from a case study the window starts on the site you were
 * reading. `roof` is whatever stands on the roof (birds); `children` what
 * stands beside the store (the lamp, a planter).
 */
export function UaeStore({
  id,
  projects,
  order,
  title,
  tagline,
  slides,
  className,
  roof,
  children,
}: {
  id: string;
  /** The slugs of the projects in the window (so a return from a case study finds this store). */
  projects: string[];
  order: number;
  title: string;
  tagline: string;
  slides: UaeSlide[];
  className?: string;
  roof?: ReactNode;
  children?: ReactNode;
}) {
  const articleRef = useRef<HTMLElement>(null);
  const active = useStoreActive(articleRef);
  const reduced = useReducedMotionSafe();
  // Back from a case study: the site you were reading is the one in the window.
  const [index, setIndex] = useState(() => Math.max(0, slides.findIndex((slide) => slide.slug === workReturn.slug)));
  const [paused, setPaused] = useState(false);
  const run = active && !reduced && !paused;
  const current = slides[index];
  const ratio = slides[0].image;

  useEffect(() => {
    if (!run) return;
    const timer = window.setTimeout(() => setIndex((now) => (now + 1) % slides.length), CYCLE_MS);
    return () => window.clearTimeout(timer);
  }, [run, index, slides.length]);

  return (
    <li id={id} data-projects={projects.join(" ")} data-step="" data-build="" style={{ "--b": 2 + order, "--trim": "var(--shops-trimU)" } as Vars} className={cn("shop group relative", className)}>
      <article
        ref={articleRef}
        aria-labelledby="shop-uae"
        data-day-ink=""
        className="relative text-paper"
        onPointerEnter={() => setPaused(true)}
        onPointerLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
      >
        {roof}

        {/* The arched board with the store's name. */}
        <div
          className="border-x-[3px] border-t-[3px] border-(--trim) bg-(--shops-archU) px-[10%] pt-[clamp(1.2rem,4svh,2.4rem)] pb-[clamp(0.35rem,1svh,0.6rem)] text-center"
          style={{ borderRadius: "50% 50% 0 0 / 100% 100% 0 0" }}
        >
          <h3 id="shop-uae" className={SIGN}>
            {title}
          </h3>
          <p className="mt-0.5 text-[clamp(0.7rem,0.95vw,0.95rem)] leading-snug text-paper/85 short:hidden">{tagline}</p>
        </div>

        {/* One hanging tab per site, from a rail. */}
        <div className="relative bg-(--shops-wallU) px-[5%] pt-[clamp(0.45rem,1.3svh,0.75rem)]">
          <div aria-hidden="true" className="absolute inset-x-[5%] top-[clamp(0.45rem,1.3svh,0.75rem)] border-t-2 border-(--trim)/70" />
          <div role="group" aria-label="Show a site" className="relative flex flex-wrap justify-center gap-[clamp(0.3rem,1.2vw,0.9rem)] pt-[0.6rem]">
            {slides.map((slide, i) => (
              <button
                key={slide.slug}
                type="button"
                aria-pressed={i === index}
                onClick={() => setIndex(i)}
                className={cn(
                  "meta relative rounded-b-md border-2 border-(--trim) px-[clamp(0.4rem,0.9vw,0.8rem)] py-1 text-[clamp(0.52rem,0.64vw,0.68rem)] transition duration-300 ease-expo before:absolute before:-top-[0.6rem] before:left-1/2 before:h-[0.6rem] before:w-px before:bg-(--trim) hover:translate-y-0.5",
                  i === index ? "translate-y-0.5 bg-(--trim) text-ink" : "bg-(--shops-archU) text-(--trim)",
                )}
              >
                {slide.label}
              </button>
            ))}
          </div>
        </div>

        {/* The ground floor: the display window, and beside it the board. */}
        <div className="bg-(--shops-wallU) px-[5%] pt-[clamp(0.6rem,1.8svh,1.1rem)] pb-[5%] lg:grid lg:grid-cols-[1fr_36%] lg:items-start lg:gap-x-[4%] short:grid short:grid-cols-[1fr_36%] short:items-start short:gap-x-[4%]">
          <div className="relative overflow-hidden border-[3px] border-(--trim)">
            <div className="relative bg-night transition-transform duration-[1200ms] ease-expo group-hover:scale-[1.04]" style={{ aspectRatio: `${ratio.width} / ${ratio.height}` }}>
              {slides.map((slide, i) => {
                const shown = i === index;
                const picture = (
                  <Image
                    src={slide.image}
                    alt={slide.alt}
                    fill
                    sizes="(min-width: 768px) 30vw, 84vw"
                    className="object-cover object-top"
                  />
                );
                return (
                  // Each site's slide carries its own (fixed) names: its case page's backdrop grows out of the
                  // window and its screenshot flies from it — names that followed the slide shown would clash.
                  <ViewTransition key={slide.slug} name={`case-${slide.slug}`} share="case-close" default="none">
                    <div aria-hidden={!shown} className={cn("absolute inset-0 transition-opacity duration-700 ease-out", shown ? "opacity-100" : "pointer-events-none opacity-0")}>
                      <ViewTransition name={`shot-${slide.slug}`} share="case-shot" default="none">
                        <div className="absolute inset-0">
                          {slide.href ? (
                            // The window opens the case study for pointer users; keyboard users get the link on the board.
                            <Link href={slide.href} transitionTypes={["case-open"]} tabIndex={-1} aria-hidden="true" className="relative block size-full">
                              {picture}
                            </Link>
                          ) : (
                            picture
                          )}
                        </div>
                      </ViewTransition>
                    </div>
                  </ViewTransition>
                );
              })}
              <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-linear-to-br from-white/18 via-transparent to-transparent" />
            </div>
          </div>

          <div key={current.slug} className="street-board-in mt-[clamp(0.55rem,1.6svh,0.95rem)] lg:mt-0 short:mt-0">
            <p className="text-[clamp(1rem,1.4vw,1.4rem)] leading-tight font-extrabold text-(--trim)">{current.name}</p>
            <p className="mt-1 text-[clamp(0.85rem,1.05vw,1.05rem)] leading-snug font-semibold text-paper short:hidden">{current.category}</p>
            {current.role && <p className="meta mt-1 text-[0.62rem] leading-snug text-paper/70 short:hidden">{current.role}</p>}
            <div className="mt-[clamp(0.55rem,1.6svh,0.9rem)] flex flex-wrap items-center gap-2">
              {current.href && (
                <Link
                  href={current.href}
                  transitionTypes={["case-open"]}
                  className="group/roll inline-flex items-center gap-2 rounded-full bg-(--trim) px-4 py-1.5 text-[0.85rem] font-medium text-ink transition-colors hover:bg-paper"
                >
                  <RollText>Read the case study</RollText>
                  <span aria-hidden="true">→</span>
                  <span className="sr-only">: {current.name}</span>
                </Link>
              )}
              {current.live && (
                <a
                  href={current.live}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/roll inline-flex items-center gap-2 rounded-full border border-(--trim)/70 px-4 py-1.5 text-[0.85rem] font-medium text-(--trim) transition-colors hover:bg-(--trim) hover:text-ink"
                >
                  <RollText>Visit site</RollText>
                  <span aria-hidden="true">↗</span>
                  <span className="sr-only">: {current.name} (opens in a new tab)</span>
                </a>
              )}
            </div>
            <div aria-hidden="true" className="mt-[clamp(0.5rem,1.4svh,0.8rem)] flex gap-1.5 short:hidden">
              {slides.map((slide, i) => (
                <span key={slide.slug} className={cn("h-1.5 rounded-full bg-(--trim) transition-all duration-500 ease-expo", i === index ? "w-5" : "w-1.5 opacity-40")} />
              ))}
            </div>
          </div>
        </div>
      </article>
      {children}
    </li>
  );
}
