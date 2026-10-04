const EDGE = "rgb(255 232 178)";

/**
 * Sunlight on a dark surface: a warm line along the edges that face the sun,
 * brightest where the sun is nearest, and a soft warm wash just inside them.
 * Put it inside a `relative` element. The sun's renderer moves and fades
 * these layers as the sun travels (transform and opacity only, so nothing
 * repaints); until then — and without WebGL — they stay invisible. No shadows.
 */
export function SunLit() {
  return (
    <span aria-hidden="true" data-sunlit className="pointer-events-none absolute inset-0 overflow-hidden">
      <span
        data-sun-glow
        className="absolute inset-0 opacity-0 will-change-[transform,opacity]"
        style={{ background: "radial-gradient(closest-side, rgb(255 206 132 / 0.42), rgb(255 206 132 / 0.12) 55%, transparent)" }}
      />
      {(["top", "bottom"] as const).map((side) => (
        <span
          key={side}
          data-sun-edge={side}
          className="absolute left-[-100%] h-[3px] w-[300%] opacity-0 will-change-[transform,opacity]"
          style={{ [side]: 0, background: `linear-gradient(90deg, transparent 30%, ${EDGE} 50%, transparent 70%)` }}
        />
      ))}
      {(["left", "right"] as const).map((side) => (
        <span
          key={side}
          data-sun-edge={side}
          className="absolute top-[-100%] h-[300%] w-[3px] opacity-0 will-change-[transform,opacity]"
          style={{ [side]: 0, background: `linear-gradient(180deg, transparent 30%, ${EDGE} 50%, transparent 70%)` }}
        />
      ))}
    </span>
  );
}
