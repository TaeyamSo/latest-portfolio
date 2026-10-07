import { cn } from "@/lib/cn";
import { Palette, palette } from "@/lib/palette";

type Circle = readonly [cx: number, cy: number, r: number];
type Capsule = readonly [x: number, y: number, w: number, h: number];

/** Shapes in a 100 × 40 box, built from circles on a flat capsule base. */
const SHAPES = {
  puff: { circles: [[28, 27, 12], [45, 20, 17], [63, 24, 13], [78, 29, 8]], base: [14, 26, 74, 10] },
  bank: { circles: [[16, 29, 9], [31, 23, 13], [49, 17, 16], [67, 22, 13], [82, 28, 9]], base: [7, 27, 86, 9] },
  streak: { circles: [[26, 24, 6], [44, 20, 9], [65, 23, 6]], base: [2, 23, 96, 9] },
  wisp: { circles: [[34, 26, 4], [57, 25, 5]], base: [0, 26, 100, 6] },
} satisfies Record<string, { circles: readonly Circle[]; base: Capsule }>;

export type CloudShape = keyof typeof SHAPES;

/**
 * Every colour is lighter than the sky behind it, so a cloud never reads as a
 * shadow. At night (the second colour) the same clouds are moonlit: a silver
 * edge on a body a little lighter than the night sky.
 */
const PAINT = palette("cloud", {
  dayLit: ["#fff1d0", "#aab6e2"],
  dayBody: ["#ffc994", "#36437c"],
  dayShade: ["#ffa868", "#2a3463"],
  goldenLit: ["#ffdca0", "#b8bfe8"],
  goldenBody: ["#ffaa74", "#3b4683"],
  goldenShade: ["#fb8c5c", "#2d3769"],
  duskLit: ["#ffa860", "#7d8cc8"],
  duskBody: ["#74301a", "#1c2452"],
  duskShade: ["#4e1c0e", "#141a3c"],
});
const P = PAINT.C;

export const CLOUD_PALETTES = {
  day: { lit: P.dayLit, body: P.dayBody, shade: P.dayShade },
  golden: { lit: P.goldenLit, body: P.goldenBody, shade: P.goldenShade },
  dusk: { lit: P.duskLit, body: P.duskBody, shade: P.duskShade },
} as const;

export type CloudPalette = keyof typeof CLOUD_PALETTES;

/** Where the light comes from: above and to the right, or — at sunset — from below. */
const LIGHT = {
  "top-right": { body: [-3, 2.5], shade: [-5, 6], shadeBand: [26, 14] },
  top: { body: [0, 3], shade: [0, 6.5], shadeBand: [26, 14] },
  below: { body: [0, -3], shade: [0, -6], shadeBand: [0, 20] },
} as const;

type Props = {
  /** Unique prefix for the clip ids. */
  id: string;
  shape: CloudShape;
  palette: CloudPalette;
  light?: keyof typeof LIGHT;
  className?: string;
};

function Parts({ shape }: { shape: CloudShape }) {
  const { circles, base } = SHAPES[shape];
  const [x, y, w, h] = base;
  return (
    <>
        {circles.map(([cx, cy, r]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} />
        ))}
        <rect x={x} y={y} width={w} height={h} rx={h / 2} />
    </>
  );
}

/**
 * A flat poster cloud: the whole shape in the lit colour, the body drawn again
 * a little away from the light (so a bright rim faces the sun), and a shade in
 * its lower part. No filters or blur — it stays crisp and cheap to move.
 */
export function Cloud({ id, shape, palette, light = "top-right", className }: Props) {
  const colors = CLOUD_PALETTES[palette];
  const { body, shade, shadeBand } = LIGHT[light];
  return (
    <>
    <Palette of={PAINT} />
    <svg viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true" focusable="false" className={cn("block", className)}>
      <defs>
        <clipPath id={`${id}-shape`}>
          <Parts shape={shape} />
        </clipPath>
        <clipPath id={`${id}-band`}>
          <rect x="0" y={shadeBand[0]} width="100" height={shadeBand[1]} />
        </clipPath>
      </defs>
      <g fill={colors.lit}>
        <Parts shape={shape} />
      </g>
      <g clipPath={`url(#${id}-shape)`}>
        <g fill={colors.body} transform={`translate(${body[0]} ${body[1]})`}>
          <Parts shape={shape} />
        </g>
        <g clipPath={`url(#${id}-band)`}>
          <g fill={colors.shade} transform={`translate(${shade[0]} ${shade[1]})`}>
            <Parts shape={shape} />
          </g>
        </g>
      </g>
    </svg>
    </>
  );
}
