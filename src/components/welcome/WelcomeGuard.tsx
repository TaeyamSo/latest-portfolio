"use client";

import { useLayoutEffect } from "react";

import { WELCOME_ATTR, welcomeReleased } from "@/lib/welcome";

/**
 * In development React's Strict Mode remounts the page once and resets <html>
 * to the attributes it renders itself, dropping the `data-welcome` the head
 * script set — the page underneath would then play its intro behind the
 * screen. Put it back if the screen hasn't let go yet. (A no-op in production.)
 */
export function WelcomeGuard() {
  useLayoutEffect(() => {
    if (welcomeReleased() || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = document.documentElement;
    if (!root.hasAttribute(WELCOME_ATTR)) root.setAttribute(WELCOME_ATTR, "");
  }, []);

  return null;
}
