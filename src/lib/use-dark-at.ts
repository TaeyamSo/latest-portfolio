import { useEffect, useState } from "react";

/**
 * True while a `[data-tone="dark"]` element sits under the horizontal line at
 * `fraction` of the viewport height — lets fixed UI flip to light ink. Their
 * places on the page are measured once (and whenever it resizes), so a scroll
 * only compares numbers — no layout reads while the page glides (the scroll
 * position is taken in the scroll event, not read inside the frame).
 */
export function useDarkAt(fraction: number) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    let frame = 0;
    let spans: (readonly [top: number, bottom: number])[] = [];
    let sy = window.scrollY;
    const check = () => {
      frame = 0;
      const line = sy + window.innerHeight * fraction;
      setDark(spans.some(([top, bottom]) => top <= line && bottom >= line));
    };
    const schedule = () => {
      frame ||= requestAnimationFrame(check);
    };
    const onScroll = () => {
      sy = window.scrollY;
      schedule();
    };
    const measure = () => {
      sy = window.scrollY;
      spans = Array.from(document.querySelectorAll<HTMLElement>("[data-tone='dark']"), (el) => {
        const rect = el.getBoundingClientRect();
        return [rect.top + sy, rect.bottom + sy] as const;
      });
      schedule();
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(document.body);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
    };
  }, [fraction]);

  return dark;
}
