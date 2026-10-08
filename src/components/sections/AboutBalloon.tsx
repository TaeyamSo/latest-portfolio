"use client";

import { useEffect, useRef } from "react";

const MAX = 56; // px the balloon gives each way when pulled
const GIVE = 140; // px of pull for most of that

/**
 * The hot-air balloon beside About's portrait. It floats up the side of the
 * picture, from its bottom to its top, and sinks back (globals.css); grab it
 * and it comes with you a little, harder the further you pull, then springs
 * back when you let go. Layers: the track (the portrait's height), the float,
 * the drag, the sway.
 */
export function AboutBalloon() {
  const drag = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = drag.current;
    if (!el) return;
    let start: { x: number; y: number; id: number } | null = null;
    let offset = { x: 0, y: 0 };

    const give = (d: number) => MAX * Math.tanh(d / GIVE);
    const place = (x: number, y: number) => {
      offset = { x, y };
      el.style.translate = `${x.toFixed(1)}px ${y.toFixed(1)}px`;
      el.style.rotate = `${(x / 6).toFixed(2)}deg`;
    };

    const onDown = (event: PointerEvent) => {
      el.getAnimations().forEach((animation) => animation.cancel());
      start = { x: event.clientX - offset.x * (GIVE / MAX), y: event.clientY - offset.y * (GIVE / MAX), id: event.pointerId };
      try {
        el.setPointerCapture(event.pointerId);
      } catch {
        // Not a capturable pointer; the drag still follows its moves over the balloon.
      }
      event.preventDefault();
    };
    const onMove = (event: PointerEvent) => {
      if (!start || event.pointerId !== start.id) return;
      place(give(event.clientX - start.x), give(event.clientY - start.y));
    };
    const onUp = (event: PointerEvent) => {
      if (!start || event.pointerId !== start.id) return;
      start = null;
      const from = { translate: el.style.translate || "0px 0px", rotate: el.style.rotate || "0deg" };
      el.style.translate = "";
      el.style.rotate = "";
      offset = { x: 0, y: 0 };
      el.animate([from, { translate: "0px 0px", rotate: "0deg" }], { duration: 700, easing: "cubic-bezier(0.34, 1.56, 0.64, 1)" });
    };
    // Dragging it on a touch screen mustn't also swipe to the next chapter.
    const keep = (event: TouchEvent) => event.stopPropagation();

    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    el.addEventListener("touchstart", keep, { passive: true });
    el.addEventListener("touchend", keep, { passive: true });
    return () => {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
      el.removeEventListener("touchstart", keep);
      el.removeEventListener("touchend", keep);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="about-balloon pointer-events-none absolute inset-y-0 right-[8%] z-[1] w-[clamp(2.4rem,3.4vw,3.6rem)] lg:right-[calc(100%+0.75rem)] xl:right-[calc(100%+clamp(1rem,2.4vw,3rem))]"
    >
      <div className="about-balloon-rise">
        <div ref={drag} className="pointer-events-auto touch-none select-none">
          <svg viewBox="0 0 26 40" className="fh-balloon-sway block w-full overflow-visible">
            <path d="M13,1 C4,1 1,8 1,14 C1,22 8,27 10,31 H16 C18,27 25,22 25,14 C25,8 22,1 13,1 Z" fill="var(--balloon-a)" />
            <path d="M13,1 C9,1 7.5,8 7.5,14 C7.5,22 10,27 11,31 H15 C16,27 18.5,22 18.5,14 C18.5,8 17,1 13,1 Z" fill="var(--balloon-b)" />
            <path d="M13,1 C11.6,1 11.2,8 11.2,14 C11.2,22 12,27 12.4,31 H13.6 C14,27 14.8,22 14.8,14 C14.8,8 14.4,1 13,1 Z" fill="var(--balloon-c)" />
            <path d="M10.4,31 L10.8,35 M15.6,31 L15.2,35" stroke="var(--balloon-rope)" strokeWidth="0.6" />
            {/* At night the burner glows inside the envelope's mouth. */}
            <ellipse className="balloon-burner night-only" cx="13" cy="31.6" rx="2.6" ry="2.2" fill="#ffd27a" />
            <rect x="10" y="35" width="6" height="4.5" rx="0.6" fill="var(--balloon-basket)" />
          </svg>
        </div>
      </div>
    </div>
  );
}
