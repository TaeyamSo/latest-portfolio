"use client";

import { useLayoutEffect, useRef } from "react";

import { goToChapter } from "@/lib/chapters";
import { useScrollTo } from "@/lib/use-scroll-to";
import { workCardId, workReturn, workStepOf } from "@/lib/work-return";

/**
 * Where the home page opens when you arrive from another page: at the chapter
 * in the URL (`/#contact`), or back on the Work chapter at the step of the case
 * study you were reading — before the first paint, so its card can morph back
 * into place. Mounted after Chapters, so the chapters are ready.
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

    if (window.location.hash.length > 1) {
      scrollTo(window.location.hash, { immediate: true });
      return;
    }
    if (!slug) return;

    const step = workStepOf(slug);
    if (goToChapter("work", { step, immediate: true })) return;

    // Without chapters (reduced motion): scroll to the Work chapter and to the project's step.
    const work = document.getElementById("work");
    const card = document.getElementById(workCardId(slug));
    if (!work) return;
    window.scrollTo({ top: work.getBoundingClientRect().top + window.scrollY, behavior: "instant" });
    const stacked = card ?? work.querySelector<HTMLElement>(`[data-step="${step}"]`);
    if (stacked) window.scrollTo({ top: stacked.getBoundingClientRect().top + window.scrollY, behavior: "instant" });
    // Only on arrival: later re-renders must not move the page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
