"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const AMBER = [0xfd, 0x89, 0x16]; // the page's right edge at noon (body gradient)
const GOLDEN = [0xf7, 0x70, 0x1a]; // …and at golden hour (DayCycle)
const DARK = "#0d0a08";

const mix = (a: number[], b: number[], t: number) =>
  `#${a.map((v, i) => Math.round(v + (b[i] - v) * t).toString(16).padStart(2, "0")).join("")}`;

/**
 * Keeps the thin scrollbar in the colours of the section beside it: the
 * orange of the page (warming to golden hour as you scroll, like DayCycle),
 * or dark wherever a `[data-tone="dark"]` surface reaches the right edge
 * at mid-screen — the project cards, the evening footer, the case studies.
 * Only writes when the colour actually changes; re-checks on every page.
 */
export function ScrollbarTone() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    let frame = 0;
    let last = "";

    const update = () => {
      frame = 0;
      const line = window.innerHeight / 2;
      const edge = root.clientWidth - 2;
      const dark = Array.from(document.querySelectorAll<HTMLElement>("[data-tone='dark']")).some((el) => {
        const r = el.getBoundingClientRect();
        return r.top <= line && r.bottom >= line && r.right >= edge && r.left <= edge;
      });
      const max = root.scrollHeight - window.innerHeight;
      const progress = max > 0 ? window.scrollY / max : 0;
      // DayCycle's curve, in tenths, so the page isn't restyled on every frame.
      const warm = Math.round(Math.min(1, Math.max(0, (progress - 0.3) / 0.55)) * 10) / 10;
      const track = dark ? DARK : mix(AMBER, GOLDEN, warm);
      const thumb = dark ? "rgb(255 250 244 / 0.4)" : "rgb(13 10 8 / 0.45)";
      const key = `${track}|${thumb}`;
      if (key === last) return;
      last = key;
      root.style.setProperty("--scrollbar-track", track);
      root.style.setProperty("--scrollbar-thumb", thumb);
    };
    const schedule = () => {
      frame ||= requestAnimationFrame(update);
    };

    schedule(); // after the new page has painted
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [pathname]);

  return null;
}
