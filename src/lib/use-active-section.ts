import { useEffect, useState } from "react";

/**
 * Scroll-spy: the section crossing the middle of the viewport is "active".
 * (The 2025 nav only updated on click, so it was usually wrong.)
 */
export function useActiveSection<T extends string>(ids: readonly T[]) {
  const [active, setActive] = useState<T>(ids[0]);

  useEffect(() => {
    const idOf = new Map<Element, T>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = idOf.get(entry.target);
          if (entry.isIntersecting && id) setActive(id);
        }
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );
    for (const id of ids) {
      const el = document.getElementById(id);
      if (!el) continue;
      idOf.set(el, id);
      observer.observe(el);
    }
    return () => observer.disconnect();
  }, [ids]);

  return active;
}
