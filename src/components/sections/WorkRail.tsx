"use client";

import { goToChapter } from "@/lib/chapters";

type Item = { label: string; step: number };

/**
 * The Work chapter's index: one button per project, each jumping to its step.
 * Which one is lit is pure CSS (`#work:has([data-step][data-active])`, see
 * globals.css), so this stays a thin client island. Without chapters (reduced
 * motion) the steps are stacked, so it just scrolls to the project.
 */
export function WorkRail({ items }: { items: Item[] }) {
  const go = (step: number) => {
    if (goToChapter("work", { step })) return;
    document.querySelector<HTMLElement>(`#work [data-step="${step}"]`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <nav aria-label="Jump to a project" className="meta flex flex-wrap justify-start gap-x-3 gap-y-1 text-[0.55rem]! sm:justify-end sm:gap-x-5 sm:gap-y-1.5 sm:text-[0.72rem]!">
      {items.map(({ label, step }) => (
        <button
          key={step}
          type="button"
          data-rail={step}
          onClick={() => go(step)}
          className="work-rail-item flex cursor-pointer items-center gap-1.5 py-0.5 sm:gap-2 sm:py-1 transition-colors hover:text-sunlight focus-visible:text-sunlight"
        >
          <span aria-hidden="true" className="work-rail-dot size-1.5 rounded-full bg-current" />
          {label}
        </button>
      ))}
    </nav>
  );
}
