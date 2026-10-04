"use client";

import { useLenis } from "lenis/react";
import { useLayoutEffect } from "react";

import { useScrollTo } from "@/lib/use-scroll-to";
import { workCardId, workReturn } from "@/lib/work-return";

/**
 * Where the home page opens when you arrive from another page: at the section
 * in the URL (`/#contact`), or back on the card of the case study you were
 * reading — before the first paint, so a returning card can morph into place.
 */
export function HomeLanding() {
  const lenis = useLenis();
  const scrollTo = useScrollTo();

  useLayoutEffect(() => {
    const slug = workReturn.slug;
    workReturn.slug = null;

    if (window.location.hash.length > 1) {
      scrollTo(window.location.hash, { immediate: true });
      return;
    }

    const card = slug ? document.getElementById(workCardId(slug)) : null;
    const deck = card?.parentElement;
    if (!card || !deck) return;
    // Cards are sticky, so measure where this one rests: the deck's top plus the cards before it.
    let top = deck.getBoundingClientRect().top + window.scrollY;
    for (const sibling of Array.from(deck.children)) {
      if (sibling === card) break;
      top += (sibling as HTMLElement).offsetHeight;
    }
    if (getComputedStyle(card).position !== "sticky") top -= 88; // clear the header on phones
    if (lenis) lenis.scrollTo(top, { immediate: true, force: true });
    else window.scrollTo({ top, behavior: "instant" });
    // Only on arrival: later re-renders (e.g. Lenis becoming ready) must not move the page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
