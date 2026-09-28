import { cn } from "@/lib/cn";

import { PALETTES, facets, pointsAttr, viewBox, type SunTone } from "./geometry";

type Props = {
  /** Unique prefix for gradient ids (several suns can share a page). */
  id: string;
  className?: string;
  /** Slowly rotate the rays; the disc stays lit from the top. */
  spin?: boolean;
  tone?: SunTone;
  ref?: React.Ref<HTMLSpanElement>;
};

/**
 * Static, resolution-independent sun (also the no-WebGL fallback).
 * Rays and disc are separate layers, so spinning is a pure compositor
 * transform — the SVG never has to be re-rasterised.
 */
export function SunGlyph({ id, className, spin = false, tone = "noon", ref }: Props) {
  const palette = PALETTES[tone];
  return (
    <span ref={ref} aria-hidden="true" className={cn("relative block", className)}>
      <svg viewBox={viewBox} focusable="false" className={cn("absolute inset-0 size-full", spin && "sun-spin")}>
        {facets.map((facet, i) => (
          <polygon key={i} points={pointsAttr(facet.points)} fill={palette[facet.layer][facet.side]} />
        ))}
      </svg>
      <svg viewBox={viewBox} focusable="false" className="absolute inset-0 size-full">
        <defs>
          <linearGradient id={`${id}-disc`} x1="0" y1="-1" x2="0" y2="1" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor={palette.disc.top} />
            <stop offset="1" stopColor={palette.disc.bottom} />
          </linearGradient>
          <radialGradient id={`${id}-rim`} cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse">
            <stop offset="0.78" stopColor={palette.disc.rim} stopOpacity="0" />
            <stop offset="1" stopColor={palette.disc.rim} stopOpacity="0.55" />
          </radialGradient>
        </defs>
        <circle r="1" fill={`url(#${id}-disc)`} />
        <circle r="1" fill={`url(#${id}-rim)`} />
      </svg>
    </span>
  );
}
