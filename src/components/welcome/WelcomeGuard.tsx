"use client";

import { useEffect, useLayoutEffect } from "react";

import { WELCOME_ATTR, WELCOME_MODE_ATTR, WELCOME_READY, welcomeMode, welcomeReleased } from "@/lib/welcome";

/**
 * In development React's Strict Mode remounts the page once and may reset
 * <html> to the attributes it renders itself, dropping the ones the head script
 * set — the page underneath would then play its intro behind the screen, or the
 * wrong screen would show. Put them back, exactly as decided (the hold while the
 * screen hasn't let go yet, and the mode for the whole load). A no-op in
 * production. It also tells the screens when the page has hydrated: the short
 * one starts then.
 */
export function WelcomeGuard() {
  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = document.documentElement;
    const mode = welcomeMode();
    if (mode && root.getAttribute(WELCOME_MODE_ATTR) !== mode) root.setAttribute(WELCOME_MODE_ATTR, mode);
    if (!welcomeReleased() && !root.hasAttribute(WELCOME_ATTR)) root.setAttribute(WELCOME_ATTR, "");
  }, []);

  useEffect(() => {
    window.dispatchEvent(new Event(WELCOME_READY));
  }, []);

  return null;
}
