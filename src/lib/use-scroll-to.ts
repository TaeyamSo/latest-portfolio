import { useLenis } from "lenis/react";
import { useCallback } from "react";

import { goToChapter } from "./chapters";

type Options = {
  event?: React.MouseEvent;
  /** Jump there without the smooth scroll (e.g. arriving from another page). */
  immediate?: boolean;
};

/**
 * In-page navigation for `<a href="#id">` links. Links still work without JS.
 * On the home page with chapters running, it glides to that chapter (which
 * then builds in and takes keyboard focus); otherwise it scrolls via Lenis and
 * moves keyboard focus to the target.
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

      if (goToChapter(section.id, { immediate, focus: !immediate })) return;

      if (lenis) {
        lenis.start();
        lenis.scrollTo(section, { duration: 1.6, immediate, force: immediate });
      } else {
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const top = section.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top, behavior: reduced || immediate ? "instant" : "smooth" });
      }

      if (!section.hasAttribute("tabindex")) section.setAttribute("tabindex", "-1");
      section.focus({ preventScroll: true });
    },
    [lenis],
  );
}
