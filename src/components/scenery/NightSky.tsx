"use client";

import { useEffect, useRef } from "react";

import { useTheme } from "@/lib/theme";

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
 * The night sky's stars (the night theme), on SkyCycle's night layers: a still
 * field that twinkles in three groups (each group's opacity breathes, so the
 * compositor does the work), a few bright stars with a soft glint, and now and
 * then a shooting star. Only at night, only while the tab is visible, never
 * with reduced motion.
 */
export function NightSky() {
  const shooting = useRef<HTMLSpanElement>(null);
  const night = useTheme() === "night";

  useEffect(() => {
    const star = shooting.current;
    if (!night || !star || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let timer = 0;
    const next = () => {
      timer = window.setTimeout(shoot, 8000 + Math.random() * 10000);
    };
    const shoot = () => {
      if (document.visibilityState === "visible") {
        star.style.left = `${(15 + Math.random() * 70).toFixed(1)}%`;
        star.style.top = `${(4 + Math.random() * 26).toFixed(1)}%`;
        star.getAnimations().forEach((animation) => animation.cancel());
        star.animate(
          [
            { transform: "rotate(-24deg) translateX(0) scaleX(0.2)", opacity: 0 },
            { transform: "rotate(-24deg) translateX(-6vmax) scaleX(1)", opacity: 1, offset: 0.25 },
            { transform: "rotate(-24deg) translateX(-26vmax) scaleX(0.6)", opacity: 0 },
          ],
          { duration: 1100, easing: "cubic-bezier(0.3, 0, 0.6, 1)" },
        );
      }
      next();
    };
    timer = window.setTimeout(shoot, 2500);
    return () => window.clearTimeout(timer);
  }, [night]);

  return (
    <div className="night-only absolute inset-0 overflow-hidden">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMin slice" className="night-stars absolute inset-0 size-full">
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
      <span ref={shooting} className="shooting-star absolute opacity-0" />
    </div>
  );
}
