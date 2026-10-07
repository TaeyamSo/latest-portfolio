import { cn } from "@/lib/cn";

import { BLOOM, DISC, DISC_STOPS, MOON, bloomCss, type DiscTone } from "./disc";
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
/**
 * The full moon as SVG + CSS, in the same box as SunDisc: the night theme's
 * hero before the WebGL moon takes over, and wherever WebGL doesn't run. A
 * silver disc with a few soft seas, in its cool bloom.
 */
export function MoonDisc({ id, className, discClassName, bloomClassName }: Omit<Props, "tone" | "bloom" | "ref">) {
  const inset = `${(-((BLOOM.moon.end / SUN.extent - 1) / 2) * 100).toFixed(2)}%`;
  return (
    <span aria-hidden="true" className={cn("relative block", className)}>
      <span className={cn("absolute", bloomClassName)} style={{ inset, background: bloomCss("moon") }} />
      <svg viewBox={viewBox} focusable="false" className={cn("absolute inset-0 size-full", discClassName)}>
        <defs>
          <radialGradient id={`${id}-moon`} cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse">
            {DISC_STOPS.map((offset, i) => (
              <stop key={offset} offset={offset} stopColor={MOON[i]} />
            ))}
          </radialGradient>
          <radialGradient id={`${id}-sea`}>
            <stop offset="0" stopColor="#c9cdd8" stopOpacity="0.55" />
            <stop offset="1" stopColor="#c9cdd8" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle r="1" fill={`url(#${id}-moon)`} />
        {[
          [-0.32, -0.28, 0.3],
          [0.18, -0.38, 0.22],
          [-0.12, 0.22, 0.34],
          [0.38, 0.12, 0.2],
        ].map(([cx, cy, r]) => (
          <circle key={`${cx}${cy}`} cx={cx} cy={cy} r={r} fill={`url(#${id}-sea)`} />
        ))}
      </svg>
    </span>
  );
}

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
