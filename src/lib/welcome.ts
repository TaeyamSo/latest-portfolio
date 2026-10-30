/**
 * The welcome screens, and the one rule that picks between them.
 *
 *   localStorage["welcome-seen"] empty   →  the FULL welcome (components/welcome/Welcome.tsx,
 *                                           `#welcome`): TAYAM on black, split down the middle
 *                                           by a thin wiggly line through the Y; the sun's
 *                                           colours fill the left half and the night's the
 *                                           right, then one takes the whole screen.
 *   localStorage["welcome-seen"] set     →  the SHORT welcome (`#welcome-mini`): the page's own
 *                                           sky — sunrise, or the night in the night theme —
 *                                           with TAYAM rising in, then slipping away. ~1.5 s.
 *
 * The key is written when a full welcome has played to its end — never at its
 * start — so a visit interrupted by a reload still counts as the first one, and
 * a full welcome is never replaced half-way by the short one. To see the full
 * one again, delete the key (DevTools → Application → Local Storage).
 *
 * The two screens are separate pieces of markup and CSS; `<html data-welcome-mode>`
 * (set once, before the first paint, and never removed) says which one this
 * load uses, and the other is `display: none`. Separately, <html data-welcome>
 * is the *hold*: while it is there the page underneath waits (its intro is
 * paused, it can't be scrolled, the WebGL sun holds off). Both screens play on
 * their own (CSS) once they're started — <html data-welcome-wait> keeps them
 * still (black / the sky) until the word's font is in (the short one also waits
 * for the page to hydrate, so it plays smoothly), for at most the caps below.
 * When the screen lets go — its `welcome-release` animation ends — the inline
 * script below takes the hold off, notes the moment and fires WELCOME_DONE.
 *
 * Kept free of React so the root layout can use it on the server.
 */

export type WelcomeMode = "full" | "mini";

/** On <html> while a welcome holds the page. */
export const WELCOME_ATTR = "data-welcome";
/** On <html> while the screen is waiting to start. */
export const WELCOME_WAIT_ATTR = "data-welcome-wait";
/** On <html>, for the whole load: which screen this load uses ("full" | "mini"). */
export const WELCOME_MODE_ATTR = "data-welcome-mode";
/** The localStorage key that, once set, turns every later visit into the short welcome. */
export const WELCOME_KEY = "welcome-seen";
/** Fired on `window` once the page has hydrated (WelcomeGuard): the short screen starts then. */
export const WELCOME_READY = "welcome:ready";
export const WELCOME_DONE = "welcome:done";

/** The longest the short screen waits for the page to hydrate before it starts anyway (ms). */
export const WELCOME_START_CAP_MS = 3000;
/** The longest a screen waits for the word's font before it starts anyway (ms). */
export const WELCOME_FONT_WAIT_MS = 1200;
/** The full welcome: when the page underneath is let go (ms after it starts): once the word has left. */
export const WELCOME_RELEASE_MS = 4250;
/** The short welcome: when the page is let go (ms after it starts); globals.css, `.welcome-mini`. */
export const WELCOME_MINI_RELEASE_MS = 1550;

type WelcomeWindow = Window & { __welcomeAt?: number; __welcomeMode?: WelcomeMode };

/** True while the welcome screen holds the page. */
export const welcomeActive = () => typeof document !== "undefined" && document.documentElement.hasAttribute(WELCOME_ATTR);

/** When the page was let go (performance.now() ms), or 0 if there was no welcome. */
export const welcomeReleasedAt = () => (typeof window === "undefined" ? 0 : ((window as WelcomeWindow).__welcomeAt ?? 0));

/** Whether the welcome has let the page go already (or never held it). */
export const welcomeReleased = () => typeof window !== "undefined" && (window as WelcomeWindow).__welcomeAt !== undefined;

/** Which screen this load decided on (set by the head script), if any. */
export const welcomeMode = () => (typeof window === "undefined" ? undefined : (window as WelcomeWindow).__welcomeMode);

/**
 * In <head>, before the first paint: the one rule — key empty, the full welcome;
 * key set, the short one — then hold the page (and the screen, until it starts),
 * unless the visitor prefers reduced motion (no screen at all then).
 */
export const WELCOME_HEAD_SCRIPT = `(function(){try{if(!matchMedia("(prefers-reduced-motion: reduce)").matches){var r=document.documentElement,m="full";try{if(localStorage.getItem("${WELCOME_KEY}"))m="mini"}catch(e){}window.__welcomeMode=m;r.setAttribute("${WELCOME_MODE_ATTR}",m);r.setAttribute("${WELCOME_ATTR}","");r.setAttribute("${WELCOME_WAIT_ATTR}","")}}catch(e){}})()`;

/**
 * Right after the screens in <body>: start the chosen one once the word's font
 * is in (or WELCOME_FONT_WAIT_MS has passed) — the short one also once the page
 * has hydrated (WELCOME_READY, or WELCOME_START_CAP_MS at the latest), so it
 * plays smoothly from its first frame. Starting waits for a painted frame but
 * not for ever (a hidden tab has none). The page is let go when the screen's
 * `welcome-release` animation ends (or, should that never come, a little after
 * it should have); a finished full welcome writes the key; a faded screen is
 * taken out of the page (display: none), so nothing of it keeps costing frames.
 */
export const WELCOME_END_SCRIPT = `(function(){var r=document.documentElement,m=window.__welcomeMode||"full",o=document.getElementById(m==="mini"?"welcome-mini":"welcome"),font=0,ready=m==="mini"?0:1,went=0,started=0;function done(){if(window.__welcomeAt!==undefined)return;window.__welcomeAt=performance.now();if(m==="full"){try{localStorage.setItem("${WELCOME_KEY}","1")}catch(e){}}r.removeAttribute("${WELCOME_ATTR}");window.dispatchEvent(new Event("${WELCOME_DONE}"))}function start(){if(started)return;started=1;r.removeAttribute("${WELCOME_WAIT_ATTR}");setTimeout(done,(m==="mini"?${WELCOME_MINI_RELEASE_MS}:${WELCOME_RELEASE_MS})+2500)}function go(){if(went)return;went=1;var t=setTimeout(start,400);requestAnimationFrame(function(){requestAnimationFrame(function(){clearTimeout(t);start()})})}function check(){if(font&&ready)go()}function fontIn(){font=1;check()}if(!o||!r.hasAttribute("${WELCOME_ATTR}")){r.removeAttribute("${WELCOME_WAIT_ATTR}");done();return}o.addEventListener("animationend",function(e){if(e.target!==o)return;if(e.animationName==="welcome-release")done();if(e.animationName==="welcome-fade")o.style.display="none"});if(m==="mini"){window.addEventListener("${WELCOME_READY}",function(){ready=1;check()},{once:true});setTimeout(go,${WELCOME_START_CAP_MS})}setTimeout(fontIn,${WELCOME_FONT_WAIT_MS});try{var s=getComputedStyle(o.querySelector(".w-word,.wm-word"));document.fonts.load(s.fontWeight+" 16px "+s.fontFamily,"TAYAM").then(fontIn,fontIn)}catch(e){fontIn()}})()`;

/* --- The wiggly line ------------------------------------------------------- */

/**
 * The line's sideways offset at height u (in screen heights, 0 top … 1 bottom),
 * in units of its amplitude (`--wa`, set in CSS): a wave and its third harmonic.
 * It repeats exactly every screen height, so the shapes below — two screen
 * heights tall — can slide up by one screen height, over and over, and the
 * wave runs along the line without a seam (globals.css, `w-wave`).
 */
const wiggle = (u: number) => 0.62 * Math.sin(2 * Math.PI * u) + 0.38 * Math.sin(2 * Math.PI * 3 * u + 0.9);

/** The shapes cover u = -0.05 … 2.05 (a little past each end), in 84 steps — a whole number per wave. */
const FROM = -0.05;
const SPAN = 2.1;
const STEPS = 84;
const HEIGHTS = Array.from({ length: STEPS + 1 }, (_, i) => FROM + (SPAN * i) / STEPS);

/** A point on the line, `base` from the element's left edge (a CSS length), plus `extra`. */
const point = (base: string, u: number, extra = "") =>
  `calc(${base} + var(--wa) * ${wiggle(u).toFixed(4)}${extra}) ${(((u - FROM) / SPAN) * 100).toFixed(3)}%`;

/**
 * The shapes, as CSS clip-paths, all from the same line so they meet exactly
 * at every screen size and at every moment of the wave: the sun's window
 * (everything left of the line, which sits 8vw in from its right edge), the
 * night's (everything right of it, 8vw in from its left edge) and the line
 * itself (a band `2 × --wl` wide) — down the middle of the screen, where the
 * word's Y is. Each is for an element 2.1 screen heights tall that starts 5% of
 * a screen above the top (`.w-clip`, `.w-line` in globals.css).
 */
export const WELCOME_SHAPES = {
  sun: `polygon(0% 0%, ${HEIGHTS.map((u) => point("100% - 8vw", u)).join(", ")}, 0% 100%)`,
  night: `polygon(${HEIGHTS.map((u) => point("8vw", u)).join(", ")}, 100% 100%, 100% 0%)`,
  line: `polygon(${HEIGHTS.map((u) => point("50%", u, " - var(--wl)")).join(", ")}, ${[...HEIGHTS]
    .reverse()
    .map((u) => point("50%", u, " + var(--wl)"))
    .join(", ")})`,
};
