"use client";

import { useLayoutEffect, useRef } from "react";

import { sunNow } from "@/components/sun/journey";
import { cn } from "@/lib/cn";
import { applyTheme, getTheme, storedTheme, useTheme } from "@/lib/theme";

/**
 * Day ⇄ night. The icon is a small sun whose rays fold away as a shadow
 * slides across it, leaving a crescent (and back). Switching, the night
 * spreads out from the sun itself — a soft circle growing from wherever the
 * sun is on screen (a view transition, globals.css `theme-reveal`) — while
 * the sun turns into the moon (journey-renderer). Without view transitions,
 * or with reduced motion, the page simply switches.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const theme = useTheme();
  const ref = useRef<HTMLButtonElement>(null);
  const night = theme === "night";

  // The inline script set the saved theme before paint; in development React's
  // remount clears <html>'s attributes, so put it back (a no-op in production).
  useLayoutEffect(() => {
    const saved = storedTheme();
    if (saved !== getTheme()) applyTheme(saved, false);
  }, []);

  const toggle = () => {
    const next = getTheme() === "night" ? "day" : "night";
    const root = document.documentElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || typeof document.startViewTransition !== "function") {
      applyTheme(next);
      return;
    }
    // Spread from the sun (or moon) when it's on screen, else from the button.
    const onScreen = sunNow.x >= 0 && sunNow.y > -sunNow.r && sunNow.y < window.innerHeight + sunNow.r;
    const box = ref.current?.getBoundingClientRect();
    const x = onScreen ? sunNow.x : box ? box.left + box.width / 2 : window.innerWidth / 2;
    const y = onScreen ? sunNow.y : box ? box.top + box.height / 2 : 0;
    root.style.setProperty("--reveal-x", `${x.toFixed(0)}px`);
    root.style.setProperty("--reveal-y", `${y.toFixed(0)}px`);
    root.dataset.themeSwitch = "";
    const transition = document.startViewTransition(() => applyTheme(next));
    // If the browser skips the animation (a hidden tab, a timeout), the theme
    // has still switched; there's nothing to report.
    transition.ready.catch(() => {});
    transition.finished
      .catch(() => {})
      .finally(() => {
        delete root.dataset.themeSwitch;
      });
  };

  return (
    <button
      ref={ref}
      type="button"
      onClick={toggle}
      aria-pressed={night}
      aria-label={night ? "Switch to day" : "Switch to night"}
      title={night ? "Switch to day" : "Switch to night"}
      className={cn("theme-toggle group flex size-11 items-center justify-center rounded-full", className)}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" className="size-6 overflow-visible">
        <defs>
          <mask id="theme-toggle-shadow">
            <rect x="-6" y="-6" width="36" height="36" fill="#fff" />
            <circle className="theme-toggle-shadow" cx="15.5" cy="9" r="6" fill="#000" />
          </mask>
        </defs>
        <g className="theme-toggle-rays" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
            <line key={a} x1="12" y1="2" x2="12" y2="4" transform={`rotate(${a} 12 12)`} />
          ))}
        </g>
        <circle className="theme-toggle-disc" cx="12" cy="12" r="5" fill="currentColor" mask="url(#theme-toggle-shadow)" />
      </svg>
    </button>
  );
}
