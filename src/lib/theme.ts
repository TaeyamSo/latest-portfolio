"use client";

import { useSyncExternalStore } from "react";

import { THEME_KEY, type Theme } from "./theme-script";

export type { Theme };

/**
 * Day or night. The sun theme is the default; a visitor who switches to the
 * night keeps it (localStorage). The theme lives on `<html data-theme>` — set
 * before paint by the inline script in app/layout.tsx — and every part of the
 * page reads it from there: CSS (`html[data-theme="night"] …`), the WebGL sun
 * (THEME_EVENT), and React (useTheme).
 */
export const THEME_EVENT = "theme:change";
export type ThemeChange = { theme: Theme };

/** The browser bar's colour per theme (the hero's sky). */
export const THEME_COLOR: Record<Theme, string> = { day: "#fd5d16", night: "#1b2350" };

export function getTheme(): Theme {
  return typeof document !== "undefined" && document.documentElement.dataset.theme === "night" ? "night" : "day";
}

export function storedTheme(): Theme {
  try {
    return localStorage.getItem(THEME_KEY) === "night" ? "night" : "day";
  } catch {
    return "day";
  }
}

/** Puts the theme on <html> and tells everyone; `save` keeps it for next time. */
export function applyTheme(theme: Theme, save = true) {
  const root = document.documentElement;
  if (theme === "night") root.dataset.theme = "night";
  else delete root.dataset.theme;
  if (save) {
    try {
      if (theme === "night") localStorage.setItem(THEME_KEY, "night");
      else localStorage.removeItem(THEME_KEY);
    } catch {
      // Private mode or blocked storage: the switch still works for this visit.
    }
  }
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", THEME_COLOR[theme]);
  window.dispatchEvent(new CustomEvent<ThemeChange>(THEME_EVENT, { detail: { theme } }));
}

function subscribe(onChange: () => void) {
  window.addEventListener(THEME_EVENT, onChange);
  return () => window.removeEventListener(THEME_EVENT, onChange);
}

/** The current theme; "day" while server rendering. */
export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, getTheme, () => "day");
}
