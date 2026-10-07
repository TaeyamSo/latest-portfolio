import { cn } from "@/lib/cn";

import { MOON } from "./disc";
import { viewBox } from "./geometry";

/**
 * The night theme's mark: a silver crescent, sized like SunGlyph (same box),
 * so the two can stand in for each other — the logo and the story clock show
 * it at night.
 */
export function MoonGlyph({ id, className }: { id: string; className?: string }) {
  return (
    <span aria-hidden="true" className={cn("relative block", className)}>
      <svg viewBox={viewBox} focusable="false" className="absolute inset-0 size-full">
        <defs>
          <radialGradient id={`${id}-moon`} cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse">
            {MOON.map((color, i) => (
              <stop key={i} offset={i / (MOON.length - 1)} stopColor={color} />
            ))}
          </radialGradient>
          <mask id={`${id}-shadow`}>
            <rect x="-2" y="-2" width="4" height="4" fill="#fff" />
            <circle cx="0.62" cy="-0.42" r="0.92" fill="#000" />
          </mask>
        </defs>
        <circle r="1" fill={`url(#${id}-moon)`} opacity="0.18" />
        <circle r="1" fill={`url(#${id}-moon)`} mask={`url(#${id}-shadow)`} />
      </svg>
    </span>
  );
}
