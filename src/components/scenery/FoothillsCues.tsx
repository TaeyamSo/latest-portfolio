"use client";

import { useEffect, useRef } from "react";

import { CHAPTER_ARRIVE, CHAPTER_LEAVE, type ChapterArrive, type ChapterLeave } from "@/lib/chapters";

/**
 * Tells the foothills (Foothills.tsx) when the about is the chapter —
 * `data-open`: the windmill turns, the chimney smokes —
 * and lets you play with the windmill. The hills sit under the page, so the
 * pointer is checked against it (only on pointer events, only while the
 * hills are up): pointed at, its sails spin faster for a moment.
 */
export function FoothillsCues() {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const hills = ref.current?.closest<HTMLElement>("[data-scene]");
    if (!hills) return;
    const mill = hills.querySelector<SVGSVGElement>(".fh-mill");
    let last = 0;
    let over = false;

    const open = (on: boolean) => {
      hills.toggleAttribute("data-open", on);
      if (!on) over = false;
    };

    // Extra turns on top of the sails' own slow turn (composite: add), so nothing jumps.
    const spin = () => {
      const now = performance.now();
      if (!mill || now - last < 2200) return;
      last = now;
      mill.animate([{ rotate: "0deg" }, { rotate: "900deg" }], { duration: 2200, easing: "cubic-bezier(0.2, 0.7, 0.3, 1)", composite: "add" });
    };

    const onMill = (x: number, y: number) => {
      if (!mill || !hills.hasAttribute("data-open")) return false;
      const r = mill.getBoundingClientRect();
      return x >= r.left - 4 && x <= r.right + 4 && y >= r.top - 4 && y <= r.bottom + 4;
    };
    const onMove = (event: PointerEvent) => {
      const now = onMill(event.clientX, event.clientY);
      if (now && !over && event.pointerType === "mouse") spin();
      over = now;
    };
    const onDown = (event: PointerEvent) => {
      if (onMill(event.clientX, event.clientY)) spin();
    };

    const onArrive = (event: Event) => open((event as CustomEvent<ChapterArrive>).detail.id === "about");
    const onLeave = (event: Event) => {
      if ((event as CustomEvent<ChapterLeave>).detail.from === "about") open(false);
    };

    open(Boolean(document.getElementById("about")?.hasAttribute("data-arrived")));
    window.addEventListener(CHAPTER_ARRIVE, onArrive);
    window.addEventListener(CHAPTER_LEAVE, onLeave);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    return () => {
      window.removeEventListener(CHAPTER_ARRIVE, onArrive);
      window.removeEventListener(CHAPTER_LEAVE, onLeave);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
    };
  }, []);

  return <span ref={ref} hidden />;
}
