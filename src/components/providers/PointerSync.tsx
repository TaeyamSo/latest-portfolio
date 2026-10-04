"use client";

import { useEffect } from "react";

/**
 * Browsers only re-check what's under a resting mouse once scrolling stops, so
 * the custom cursor and hover effects (tilts, magnetic buttons, the archive
 * preview) lagged behind while the page glided under it. This keeps them in
 * step: as the page scrolls, it checks what's now under the pointer and sends
 * the same over/out events a real mouse move would, plus a move, so effects
 * that follow the pointer's position update too. (CSS :hover is the browser's
 * own and still catches up when the scroll ends.)
 */
export function PointerSync() {
  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    let x = 0;
    let y = 0;
    let inside = false;
    let under: Element | null = null;
    let frame = 0;

    const replay = (type: string, target: Element, related: Element | null) =>
      target.dispatchEvent(
        new PointerEvent(type, {
          bubbles: true,
          cancelable: true,
          composed: true,
          view: window,
          clientX: x,
          clientY: y,
          pointerId: 1,
          pointerType: "mouse",
          isPrimary: true,
          relatedTarget: related,
        }),
      );

    const sync = () => {
      frame = 0;
      if (!inside) return;
      const target = document.elementFromPoint(x, y);
      if (!target) return;
      if (target !== under) {
        const previous = under;
        under = target;
        if (previous?.isConnected) replay("pointerout", previous, target);
        replay("pointerover", target, previous);
      }
      replay("pointermove", target, null);
    };

    // Real pointer input (our replays aren't trusted, so they never feed back in).
    const onMove = (event: PointerEvent) => {
      if (!event.isTrusted) return;
      inside = event.pointerType === "mouse";
      x = event.clientX;
      y = event.clientY;
      if (event.target instanceof Element) under = event.target;
    };
    const onOver = (event: PointerEvent) => {
      if (event.isTrusted && event.target instanceof Element) under = event.target;
    };
    const onLeave = () => {
      inside = false;
    };
    const onScroll = () => {
      if (inside) frame ||= requestAnimationFrame(sync);
    };

    const root = document.documentElement;
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    root.addEventListener("pointerleave", onLeave);
    window.addEventListener("blur", onLeave);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      root.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("blur", onLeave);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return null;
}
