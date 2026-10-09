import { cn } from "@/lib/cn";

/** The same stars every visit (a small seeded random). */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

type Star = { x: number; y: number; r: number; warm: boolean };

const W = 1600;
const H = 1000;

/** Three twinkling groups of small stars, denser high in the sky, and a few bright ones. */
const { groups, bright } = (() => {
  const r = seeded(20261007);
  const groups: Star[][] = [[], [], []];
  for (let i = 0; i < 150; i++) {
    const y = Math.pow(r(), 1.5) * H * 0.82;
    groups[i % 3].push({ x: r() * W, y, r: 0.7 + r() * 1.1, warm: r() > 0.82 });
  }
  const bright = Array.from({ length: 7 }, () => ({ x: 60 + r() * (W - 120), y: 40 + r() * H * 0.45, r: 1.8 + r() * 0.8, warm: r() > 0.6 }));
  return { groups, bright };
})();

/**
 * The night sky's stars: a still field that twinkles in three groups (each
 * group's opacity breathes), and a few bright stars with a soft glint
 * (globals.css). Drawn over the whole box it's given, the same way wherever
 * it's used — the night sky (NightSky) and the welcome screen's night half —
 * so the stars sit in the same places on both.
 */
export function NightStars({ className }: { className?: string }) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMin slice" aria-hidden="true" className={cn("night-stars absolute inset-0 size-full", className)}>
      {groups.map((stars, i) => (
        <g key={i} className="night-twinkle" style={{ "--i": i } as React.CSSProperties}>
          {stars.map((s, j) => (
            <circle key={j} cx={s.x.toFixed(1)} cy={s.y.toFixed(1)} r={s.r.toFixed(2)} fill={s.warm ? "#fff1d0" : "#eef0ff"} />
          ))}
        </g>
      ))}
      {bright.map((s, i) => (
        <g key={i} className="night-glint" transform={`translate(${s.x.toFixed(1)} ${s.y.toFixed(1)})`} style={{ "--i": i } as React.CSSProperties}>
          <circle r={s.r * 3} fill={s.warm ? "#ffe9c2" : "#dfe6ff"} opacity="0.12" />
          <path d={`M0,${-s.r * 4} L${s.r * 0.35},0 L0,${s.r * 4} L${-s.r * 0.35},0 Z M${-s.r * 4},0 L0,${s.r * 0.35} L${s.r * 4},0 L0,${-s.r * 0.35} Z`} fill="#f4f6ff" opacity="0.7" />
          <circle r={s.r} fill="#ffffff" />
        </g>
      ))}
    </svg>
  );
}
