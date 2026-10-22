"use client";

import { useEffect } from "react";

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const ease = (t: number) => t * t * (3 - 2 * t);

/**
 * Moves the landscape's scenes (Landscape.tsx and Town.tsx): a scene is up while its
 * section fills the lower part of the screen. It rises as the section's top
 * comes up from the bottom of the screen to just past the middle, and sinks
 * as the next section does the same — the two cross over. With reduced motion
 * the scenes cross-fade in place instead.
 *
 * Cheap on purpose: section positions are measured once (and on resize), a
 * scroll only writes transforms, a scene that is fully down isn't rendered at
 * all (the town is skipped with content-visibility, keeping its layout ready),
 * and only a moving scene is promoted to its own layer. The scroll position is
 * taken in the scroll event, never read in the frame (where reading it would
 * force a style and layout pass after the other layers' writes), and a scene's
 * visibility and layer hint are written only when they change.
 */
export function LandscapeMotion() {
  useEffect(() => {
    const scenes = Array.from(document.querySelectorAll<HTMLElement | SVGSVGElement>("[data-scene]")).map((el) => ({
      el,
      section: document.getElementById(el.dataset.scene ?? ""),
      top: Infinity,
      bottom: Infinity,
      shown: -1,
      up: false,
      moving: false,
    }));
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let sy = window.scrollY;

    const measure = () => {
      sy = window.scrollY;
      for (const scene of scenes) {
        const rect = scene.section?.getBoundingClientRect();
        scene.top = rect ? rect.top + sy : Infinity;
        scene.bottom = rect ? rect.bottom + sy : Infinity;
      }
      schedule();
    };

    const update = () => {
      frame = 0;
      const vh = window.innerHeight;
      const span = 0.45 * vh;
      for (const scene of scenes) {
        const top = scene.top - sy;
        const bottom = scene.bottom - sy;
        const amount = ease(clamp01((vh - top) / span)) * (1 - ease(clamp01((vh - bottom) / span)));
        const v = Math.round(amount * 1000) / 1000;
        if (v === scene.shown) continue;
        scene.shown = v;
        const { style } = scene.el;
        // The town keeps its layout while it's down (content-visibility skips it
        // all the same), so bringing it back up costs ~2ms, not ~20.
        const up = v > 0;
        const moving = v > 0 && v < 1;
        if (up !== scene.up) {
          scene.up = up;
          if (scene.el instanceof HTMLElement) style.contentVisibility = up ? "" : "hidden";
          else style.display = up ? "" : "none";
        }
        if (moving !== scene.moving) {
          scene.moving = moving;
          style.willChange = moving ? "transform" : "";
        }
        if (still.matches) {
          style.transform = "none";
          style.opacity = String(v);
        } else {
          style.transform = `translate3d(0, ${((1 - v) * 105).toFixed(2)}%, 0)`;
          style.opacity = "";
        }
      }
    };
    const schedule = () => {
      frame ||= requestAnimationFrame(update);
    };
    const onScroll = () => {
      sy = window.scrollY;
      schedule();
    };
    const restyle = () => {
      scenes.forEach((scene) => {
        scene.shown = -1;
        scene.up = !scene.up; // write them all again
        scene.moving = !scene.moving;
      });
      schedule();
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(document.body);
    window.addEventListener("scroll", onScroll, { passive: true });
    still.addEventListener("change", restyle);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      still.removeEventListener("change", restyle);
    };
  }, []);

  return null;
}
