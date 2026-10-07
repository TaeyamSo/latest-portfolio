"use client";

import { sections, type SectionId } from "@/content/site";
import { cn } from "@/lib/cn";
import { useActiveSection } from "@/lib/use-active-section";
import { useTheme } from "@/lib/theme";
import { useDarkAt } from "@/lib/use-dark-at";
import { useScrollTo } from "@/lib/use-scroll-to";

import { StoryClock } from "./StoryClock";

const ids = sections.map((s) => s.id) as SectionId[];

/**
 * The original side navigation: a column of dashes, the active one longer.
 * Now it tracks the scroll position and reveals labels on hover/focus, and
 * keeps the story's clock: the time of day the page has reached.
 */
export function SideNav() {
  const active = useActiveSection(ids);
  // At night the ink is already light (globals.css), even over the footer.
  const night = useTheme() === "night";
  const dark = useDarkAt(0.5) && !night;
  const scrollTo = useScrollTo();
  const activeIndex = ids.indexOf(active);

  return (
    <nav
      aria-label="Sections"
      data-night-ink=""
      className={cn(
        "intro-slide fixed top-1/2 left-[calc(var(--gutter)*0.5)] z-40 hidden -translate-y-1/2 transition-colors duration-500 lg:block",
        dark ? "text-paper" : "text-ink",
      )}
    >
      <ul className="flex flex-col gap-4">
        {sections.map((section, i) => {
          const isActive = section.id === active;
          return (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                onClick={(event) => scrollTo(`#${section.id}`, event)}
                aria-current={isActive ? "location" : undefined}
                className="group relative flex h-7 items-center"
              >
                <span
                  className={cn(
                    "block h-2 rounded-full bg-current transition-[width] duration-500 ease-(--ease-expo)",
                    isActive ? "w-12" : "w-7 group-hover:w-10 group-focus-visible:w-10",
                  )}
                />
                <span
                  className={cn(
                    "meta pointer-events-none absolute left-full ml-4 rounded-full px-3 py-1 whitespace-nowrap opacity-0 transition duration-300",
                    "-translate-x-2 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100",
                    dark ? "bg-paper text-ink" : "bg-ink text-paper",
                  )}
                >
                  {String(i + 1).padStart(2, "0")} — {section.label}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
      <p className="meta mt-8 tabular-nums" aria-hidden="true">
        {String(activeIndex + 1).padStart(2, "0")}
        <span className="opacity-50"> / {String(ids.length).padStart(2, "0")}</span>
      </p>
      <StoryClock className="mt-3" />
    </nav>
  );
}
