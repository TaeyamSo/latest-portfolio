"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { DAY, dayAt, measureStops, mixHex } from "@/components/sun/day";

const AMBER = "#fd8916"; // the page's right edge, wherever there's no sky cycle (case studies, 404)
const DARK = "#0d0a08";

/**
 * Keeps the thin scrollbar in the colours of the section beside it: the sky
 * at the right edge on the home page (the day's timeline, sun/day.ts), or
 * dark wherever a `[data-tone="dark"]` surface reaches the right edge
 * at mid-screen — the project cards, the evening footer, the case studies.
 * The colours go into a small stylesheet of their own, aimed at the page's
 * own scrollbar: setting them as variables on <html> restyled every element
 * on the page (~50ms a time) and made glides stutter. Only writes when the
 * colour actually changes, once the scrolling rests; re-checks on every page.
 */
export function ScrollbarTone() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    let frame = 0;
    let idle = 0;
    let last = "";
    const sheet = document.createElement("style");
    sheet.dataset.scrollbarTone = "";
    document.head.append(sheet);
    // The day's stops, on pages that have them (measured once, and on resize).
    let stops: number[] | null = null;
    const measure = () => {
      stops = document.getElementById("about") ? measureStops() : null;
      schedule();
    };

    const update = () => {
      frame = 0;
      const line = window.innerHeight / 2;
      const edge = root.clientWidth - 2;
      const dark = Array.from(document.querySelectorAll<HTMLElement>("[data-tone='dark']")).some((el) => {
        const r = el.getBoundingClientRect();
        return r.top <= line && r.bottom >= line && r.right >= edge && r.left <= edge;
      });
      let sky = AMBER;
      if (stops) {
        const day = dayAt(window.scrollY, stops);
        sky = mixHex(DAY[day.index].sky[1], DAY[day.next].sky[1], Math.round(day.t * 20) / 20);
      }
      const track = dark ? DARK : sky;
      const thumb = dark ? "rgb(255 250 244 / 0.4)" : "rgb(13 10 8 / 0.45)";
      const key = `${track}|${thumb}`;
      if (key === last) return;
      last = key;
      sheet.textContent =
        `html::-webkit-scrollbar-track,html::-webkit-scrollbar-corner{background:${track}}` +
        `html::-webkit-scrollbar-thumb{background:${thumb}}` +
        `@supports not selector(::-webkit-scrollbar){html{scrollbar-color:${thumb} ${track}}}`;
    };
    const schedule = () => {
      window.clearTimeout(idle);
      idle = window.setTimeout(() => {
        frame ||= requestAnimationFrame(update);
      }, 140);
    };

    measure(); // after the new page has painted
    const observer = new ResizeObserver(measure);
    observer.observe(document.body);
    window.addEventListener("scroll", schedule, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(idle);
      observer.disconnect();
      sheet.remove();
      window.removeEventListener("scroll", schedule);
    };
  }, [pathname]);

  return null;
}
