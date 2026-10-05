"use client";

import { useEffect } from "react";

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const ease = (t: number) => t * t * (3 - 2 * t);

/**
 * Moves the landscape's scenes (Landscape.tsx): a scene is up while its
 * section fills the lower part of the screen. It rises as the section's top
 * comes up from the bottom of the screen to just past the middle, and sinks
 * as the next section does the same — the two cross over. With reduced motion
 * the scenes cross-fade in place instead.
 *
 * Cheap on purpose: section positions are measured once (and on resize), a
 * scroll only writes transforms, a scene that is fully down isn't rendered at
 * all, and only a moving scene is promoted to its own layer.
 */
export function LandscapeMotion() {
  useEffect(() => {
    const scenes = Array.from(document.querySelectorAll<SVGSVGElement>("svg[data-scene]")).map((el) => ({
      el,
      section: document.getElementById(el.dataset.scene ?? ""),
      top: Infinity,
      bottom: Infinity,
      shown: -1,
    }));
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;

    const measure = () => {
      const sy = window.scrollY;
      for (const scene of scenes) {
        const rect = scene.section?.getBoundingClientRect();
        scene.top = rect ? rect.top + sy : Infinity;
        scene.bottom = rect ? rect.bottom + sy : Infinity;
      }
      schedule();
    };

    const update = () => {
      frame = 0;
      const sy = window.scrollY;
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
        style.display = v > 0 ? "" : "none";
        style.willChange = v > 0 && v < 1 ? "transform, opacity" : "";
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
    const restyle = () => {
      scenes.forEach((scene) => (scene.shown = -1));
      schedule();
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(document.body);
    window.addEventListener("scroll", schedule, { passive: true });
    still.addEventListener("change", restyle);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      still.removeEventListener("change", restyle);
    };
  }, []);

  return null;
}
