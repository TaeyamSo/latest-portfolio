"use client";

import { useLayoutEffect } from "react";

import { featuredProjects } from "@/content/site";
import { goToChapter } from "@/lib/chapters";
import { useScrollTo } from "@/lib/use-scroll-to";
import { workCardId, workReturn } from "@/lib/work-return";

/**
 * Where the home page opens when you arrive from another page: at the chapter
 * in the URL (`/#contact`), or back on the high street at the shop of the case
 * study you were reading — before the first paint, so its shopfront can morph
 * back into place. Mounted after Chapters, so the chapters are ready.
 */
export function HomeLanding() {
  const scrollTo = useScrollTo();

  useLayoutEffect(() => {
    const slug = workReturn.slug;
    workReturn.slug = null;

    if (window.location.hash.length > 1) {
      scrollTo(window.location.hash, { immediate: true });
      return;
    }
    if (!slug) return;

    const step = Math.max(0, featuredProjects.findIndex((project) => project.slug === slug));
    if (goToChapter("work", { step, immediate: true })) return;

    // Without chapters (reduced motion): scroll to the street and along it to the shop.
    const street = document.getElementById("work");
    const shop = document.getElementById(workCardId(slug));
    if (!street) return;
    window.scrollTo({ top: street.getBoundingClientRect().top + window.scrollY, behavior: "instant" });
    const view = shop?.closest<HTMLElement>("[data-track-view]");
    if (shop && view) view.scrollLeft = shop.offsetLeft - (view.firstElementChild as HTMLElement).offsetLeft;
    // Only on arrival: later re-renders must not move the page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
