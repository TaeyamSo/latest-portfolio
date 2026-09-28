import { useEffect, useState } from "react";

/**
 * True while a `[data-tone="dark"]` element sits under the horizontal line at
 * `fraction` of the viewport height — lets fixed UI flip to light ink.
 */
export function useDarkAt(fraction: number) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    let frame = 0;
    const check = () => {
      frame = 0;
      const line = window.innerHeight * fraction;
      const hit = Array.from(document.querySelectorAll<HTMLElement>("[data-tone='dark']")).some((el) => {
        const rect = el.getBoundingClientRect();
        return rect.top <= line && rect.bottom >= line;
      });
      setDark(hit);
    };
    const schedule = () => {
      frame ||= requestAnimationFrame(check);
    };

    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [fraction]);

  return dark;
}
