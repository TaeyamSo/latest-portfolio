import type { SunState } from "./journey";

type Side = "top" | "right" | "bottom" | "left";

type Surface = {
  box: HTMLElement;
  glow: HTMLElement | null;
  edges: Record<Side, HTMLElement | null>;
};

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/**
 * Lights the `[data-sunlit]` layers (see SunLit.tsx) from wherever the sun is:
 * the edges that face it catch a warm line, brightest at the point nearest the
 * sun, with a soft glow just inside. The light grows as the day warms and as
 * the sun comes closer. All surfaces are measured first, then written —
 * transform and opacity only, and only when a value actually changes.
 */
export function createSunlight() {
  const surfaces: Surface[] = Array.from(document.querySelectorAll<HTMLElement>("[data-sunlit]")).map((box) => ({
    box,
    glow: box.querySelector<HTMLElement>("[data-sun-glow]"),
    edges: {
      top: box.querySelector<HTMLElement>('[data-sun-edge="top"]'),
      right: box.querySelector<HTMLElement>('[data-sun-edge="right"]'),
      bottom: box.querySelector<HTMLElement>('[data-sun-edge="bottom"]'),
      left: box.querySelector<HTMLElement>('[data-sun-edge="left"]'),
    },
  }));
  const written = new Map<HTMLElement, string>();

  const write = (el: HTMLElement | null, x: number, y: number, opacity: number) => {
    if (!el) return;
    const transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
    const alpha = opacity.toFixed(3);
    const key = `${transform}|${alpha}`;
    if (written.get(el) === key) return;
    written.set(el, key);
    el.style.transform = transform;
    el.style.opacity = alpha;
  };

  return {
    /** `strength` 0…1: how bright the light is overall (time of day, fade-in). */
    update(sun: SunState, width: number, height: number, strength: number) {
      const rects = surfaces.map((surface) => surface.box.getBoundingClientRect());
      const span = 1.5 * Math.max(width, height);

      surfaces.forEach((surface, i) => {
        const r = rects[i];
        if (!r.width || r.bottom < -80 || r.top > height + 80) return; // off screen: leave it
        const vx = sun.x - (r.left + r.width / 2);
        const vy = sun.y - (r.top + r.height / 2);
        const distance = Math.hypot(vx, vy) || 1;
        const dx = vx / distance;
        const dy = vy / distance;
        // Full strength while the sun is behind or beside the surface, fading with distance.
        const near = clamp(1 - (distance - 0.5 * Math.hypot(r.width, r.height)) / span, 0.3, 1);
        const power = strength * near;
        const facing = (amount: number) => Math.min(1, power * 1.15 * Math.pow(Math.max(0, amount), 0.6));

        // The glow sits on the edge facing the sun, so it washes in from that side.
        write(surface.glow, dx * 0.45 * r.width, dy * 0.45 * r.height, power);
        // Each edge line's bright spot slides to the point nearest the sun.
        const along = (clamp((sun.x - r.left) / r.width, 0, 1) - 0.5) * r.width;
        const down = (clamp((sun.y - r.top) / r.height, 0, 1) - 0.5) * r.height;
        write(surface.edges.top, along, 0, facing(-dy));
        write(surface.edges.bottom, along, 0, facing(dy));
        write(surface.edges.left, 0, down, facing(-dx));
        write(surface.edges.right, 0, down, facing(dx));
      });
    },

    /** Hand the surfaces back unlit. */
    reset() {
      for (const el of written.keys()) {
        el.style.transform = "";
        el.style.opacity = "";
      }
      written.clear();
    },
  };
}
