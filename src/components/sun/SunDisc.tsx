import { cn } from "@/lib/cn";

import { BLOOM, DISC, DISC_STOPS, bloomCss, type DiscTone } from "./disc";
import { SUN, viewBox } from "./geometry";

type Props = {
  /** Unique prefix for the gradient id (several suns can share a page). */
  id: string;
  tone?: DiscTone;
  /** The soft light around the disc. */
  bloom?: boolean;
  className?: string;
  discClassName?: string;
  bloomClassName?: string;
  ref?: React.Ref<HTMLSpanElement>;
};

/** How far the bloom reaches past the box (the box spans the same ±extent as SunGlyph). */
export const bloomInset = (tone: DiscTone) =>
  `${(-((BLOOM[tone === "noon" ? "day" : "dusk"].end / SUN.extent - 1) / 2) * 100).toFixed(2)}%`;

/**
 * The glowing sun as SVG + CSS: a disc that's white-hot in the middle and
 * gold at the rim, in a bloom of light that's always lighter than the sky.
 * Paints on first load and stands in wherever WebGL doesn't run; the shader
 * draws the same sun from the same numbers (disc.ts). Sized like SunGlyph:
 * the disc's radius is the box width / (2 × SUN.extent).
 */
export function SunDisc({ id, tone = "noon", bloom = true, className, discClassName, bloomClassName, ref }: Props) {
  const colors = DISC[tone];
  return (
    <span ref={ref} aria-hidden="true" className={cn("relative block", className)}>
      {bloom && (
        <span
          className={cn("absolute", bloomClassName)}
          style={{ inset: bloomInset(tone), background: bloomCss(tone === "noon" ? "day" : "dusk") }}
        />
      )}
      <svg viewBox={viewBox} focusable="false" className={cn("absolute inset-0 size-full", discClassName)}>
        <defs>
          <radialGradient id={`${id}-disc`} cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse">
            {DISC_STOPS.map((offset, i) => (
              <stop key={offset} offset={offset} stopColor={colors[i]} />
            ))}
          </radialGradient>
        </defs>
        <circle r="1" fill={`url(#${id}-disc)`} />
      </svg>
    </span>
  );
}
