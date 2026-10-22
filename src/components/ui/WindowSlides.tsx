"use client";

import Image, { type StaticImageData } from "next/image";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type RefObject } from "react";

import { cn } from "@/lib/cn";
import { useReducedMotionSafe } from "@/lib/use-media-query";

/** One thing a shop window shows: a still and, optionally, the same screen moving. */
export type SlideData = { image: StaticImageData; motion?: StaticImageData; alt: string; seconds?: number };

/**
 * Whether the store this element stands in is the one the street is resting
 * on: the chapter controller marks it `data-active` while the Work chapter has
 * arrived (providers/Chapters.tsx). False without chapters (reduced motion) and
 * on the server, so windows show their still until a visitor really is there.
 */
export function useStoreActive(ref: RefObject<HTMLElement | null>) {
  const subscribe = useCallback(
    (notify: () => void) => {
      const shop = ref.current?.closest<HTMLElement>(".shop");
      const chapter = ref.current?.closest<HTMLElement>("[data-chapter]");
      if (!shop || !chapter) return () => {};
      const observer = new MutationObserver(notify);
      observer.observe(shop, { attributes: true, attributeFilter: ["data-active"] });
      observer.observe(chapter, { attributes: true, attributeFilter: ["data-arrived"] });
      return () => observer.disconnect();
    },
    [ref],
  );
  const read = () => {
    const shop = ref.current?.closest<HTMLElement>(".shop");
    const chapter = ref.current?.closest<HTMLElement>("[data-chapter]");
    return Boolean(
      shop && chapter && document.documentElement.classList.contains("chapters") && shop.hasAttribute("data-active") && chapter.hasAttribute("data-arrived"),
    );
  };
  return useSyncExternalStore(subscribe, read, () => false);
}

/** Fetch a moving image ahead of the moment it's shown, so it starts playing at once (it's cached by then). */
function warm(motion?: StaticImageData) {
  if (!motion) return;
  const image = new window.Image();
  image.src = motion.src;
}

/**
 * The picture behind a shop's glass: the first still, and — while the visitor
 * is at that store — a slow show of the others (each fading into the next,
 * the moving ones played from their first frame, one after the other). Away
 * from the store, or with reduced motion, it is just the first still. Fills
 * its (relative, sized) parent; the parent is what carries the case page's
 * view-transition name, so this stays inside it.
 */
export function WindowSlides({ slides, sizes }: { slides: SlideData[]; sizes: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const active = useStoreActive(ref);
  const reduced = useReducedMotionSafe();
  const [index, setIndex] = useState(0);
  const [wasActive, setWasActive] = useState(false);
  const run = active && !reduced && slides.length > 1;

  // Each visit starts again at the first screen.
  if (wasActive !== active) {
    setWasActive(active);
    if (!active) setIndex(0);
  }

  useEffect(() => {
    if (!run) return;
    warm(slides[(index + 1) % slides.length].motion);
    const timer = window.setTimeout(() => setIndex((now) => (now + 1) % slides.length), (slides[index].seconds ?? 4) * 1000);
    return () => window.clearTimeout(timer);
  }, [run, index, slides]);

  return (
    <div ref={ref} className="absolute inset-0 transition-transform duration-[1200ms] ease-expo group-hover:scale-[1.04]">
      {slides.map((slide, i) => {
        const shown = i === index;
        return (
          <div key={slide.alt} aria-hidden={!shown} className={cn("absolute inset-0 transition-opacity duration-700 ease-out", shown ? "opacity-100" : "opacity-0")}>
            {shown && run && slide.motion ? (
              // Moving: the file itself (the optimiser would flatten it to one frame).
              <Image src={slide.motion} alt={slide.alt} fill unoptimized sizes={sizes} className="object-cover object-top" />
            ) : (
              <Image src={slide.image} alt={slide.alt} fill sizes={sizes} className="object-cover object-top" />
            )}
          </div>
        );
      })}
    </div>
  );
}
