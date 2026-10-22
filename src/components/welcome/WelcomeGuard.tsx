"use client";

import { useEffect, useLayoutEffect } from "react";

import { WELCOME_ATTR, WELCOME_READY, welcomeReleased } from "@/lib/welcome";

/**
 * In development React's Strict Mode remounts the page once and resets <html>
 * to the attributes it renders itself, dropping the `data-welcome` the head
 * script set — the page underneath would then play its intro behind the
 * screen. Put it back if the screen hasn't let go yet. (A no-op in production.)
 * It also tells the screen when the page has hydrated, so it starts then.
 */
export function WelcomeGuard() {
  useLayoutEffect(() => {
    if (welcomeReleased() || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = document.documentElement;
    if (!root.hasAttribute(WELCOME_ATTR)) root.setAttribute(WELCOME_ATTR, "");
  }, []);

  // The page has hydrated: the welcome screen can start now, smoothly (lib/welcome.ts).
  useEffect(() => {
    window.dispatchEvent(new Event(WELCOME_READY));
  }, []);

  return null;
}
