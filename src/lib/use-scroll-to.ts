import { useLenis } from "lenis/react";
import { useCallback } from "react";

type Options = {
  event?: React.MouseEvent;
  /** Jump there without the smooth scroll (e.g. arriving from another page). */
  immediate?: boolean;
};

/**
 * Smooth in-page navigation for `<a href="#id">` links. Links still work
 * without JS; with JS we scroll via Lenis and move keyboard focus to the target.
 * A section can land on an inner `[data-scroll-anchor]` instead of its top, and
 * an anchor can sit lower with `data-scroll-offset` (fraction of the viewport).
 */
export function useScrollTo() {
  const lenis = useLenis();

  return useCallback(
    (hash: string, eventOrOptions?: React.MouseEvent | Options) => {
      const { event, immediate = false } =
        eventOrOptions && "nativeEvent" in eventOrOptions ? { event: eventOrOptions } : (eventOrOptions ?? {});
      const section = document.getElementById(hash.replace(/^#/, ""));
      if (!section) return;
      event?.preventDefault();
      const target = section.querySelector<HTMLElement>("[data-scroll-anchor]") ?? section;
      const offset = -Number(target.dataset.scrollOffset ?? 0) * window.innerHeight;

      if (lenis) {
        lenis.start();
        lenis.scrollTo(target, { duration: 1.6, offset, immediate, force: immediate });
      } else {
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const top = target.getBoundingClientRect().top + window.scrollY + offset;
        window.scrollTo({ top, behavior: reduced || immediate ? "instant" : "smooth" });
      }

      if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    },
    [lenis],
  );
}
