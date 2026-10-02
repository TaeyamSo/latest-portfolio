import { useEffect, useState } from "react";

/**
 * Scroll-spy: the last section whose top has passed the middle of the viewport
 * is "active" — so a section that isn't in the nav (testimonials) keeps the one
 * before it lit, even straight after a reload. (The 2025 nav only updated on
 * click, so it was usually wrong.)
 */
export function useActiveSection<T extends string>(ids: readonly T[]) {
  const [active, setActive] = useState<T>(ids[0]);

  useEffect(() => {
    const sections = ids.flatMap((id) => {
      const el = document.getElementById(id);
      return el ? [{ id, el }] : [];
    });
    const pick = () => {
      const line = window.innerHeight / 2;
      let current = ids[0];
      for (const { id, el } of sections) if (el.getBoundingClientRect().top <= line) current = id;
      setActive(current);
    };
    // Sections crossing the middle line are the only moments the answer can change.
    const observer = new IntersectionObserver(pick, { rootMargin: "-50% 0px -50% 0px" });
    for (const { el } of sections) observer.observe(el);
    return () => observer.disconnect();
  }, [ids]);

  return active;
}
