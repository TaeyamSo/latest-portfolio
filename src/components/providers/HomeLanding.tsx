"use client";

import { useLayoutEffect, useRef } from "react";

import { goToChapter } from "@/lib/chapters";
import { useScrollTo } from "@/lib/use-scroll-to";
import { workReturn } from "@/lib/work-return";

/**
 * Where the home page opens when you arrive from another page: at the chapter
 * in the URL (`/#contact`), or back on the high street at the shop of the case
 * study you were reading — before the first paint, so its shopfront can morph
 * back into place. Mounted after Chapters, so the chapters are ready.
 *
 * The case study wins over a bare or `#work` hash: that is only the street's
 * own mark in the history entry (browser Back), not somewhere the visitor asked
 * to go. Any other hash — `/#contact` from the header — is an explicit request.
 */
export function HomeLanding() {
  const scrollTo = useScrollTo();
  // React runs this effect twice in development. The first run lands (and the
  // chapters write `#work` into the URL), so a second run would read that hash
  // and jump to the chapter's first step instead of the project's.
  const landed = useRef(false);

  useLayoutEffect(() => {
    if (landed.current) return;
    landed.current = true;

    const slug = workReturn.slug;
    workReturn.slug = null;

    const hash = window.location.hash;
    if (hash.length > 1 && !(slug && hash === "#work")) {
      scrollTo(hash, { immediate: true });
      return;
    }
    if (!slug) return;

    // The project's store (the UAE sites share one) and which stop along the street it is.
    const shop = document.querySelector<HTMLElement>(`#work [data-projects~="${slug}"]`);
    const step = shop?.parentElement ? Array.from(shop.parentElement.children).indexOf(shop) : 0;
    if (goToChapter("work", { step, immediate: true })) return;

    // Without chapters (reduced motion): scroll to the street and along it to the shop.
    const street = document.getElementById("work");
    if (!street) return;
    window.scrollTo({ top: street.getBoundingClientRect().top + window.scrollY, behavior: "instant" });
    const view = shop?.closest<HTMLElement>("[data-track-view]");
    if (shop && view) view.scrollLeft = shop.offsetLeft - (view.firstElementChild as HTMLElement).offsetLeft;
    // Only on arrival: later re-renders must not move the page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
