/**
 * The welcome screen (components/welcome/Welcome.tsx): "TAYAM" on black, split
 * down the middle by a thin wiggly line through the Y; the sun's colours fill
 * the left half from the left edge, the night's the right half from the right.
 * Then the line goes and one of them takes the whole screen — the sun, or the
 * night if that's the visitor's theme — and the site opens.
 *
 * The screen plays on its own (CSS) once the word's font is in: until then
 * <html> carries `data-welcome-wait`, which holds it (black) — for at most
 * WELCOME_FONT_WAIT_MS, after which it starts anyway. While it shows,
 * <html> carries `data-welcome`: the page under it holds its intro (globals.css),
 * can't be scrolled (Chapters), and the WebGL sun waits (SunJourney). When the
 * screen lets go — its `welcome-release` animation ends — the inline script
 * below takes the attribute off, notes the moment and fires WELCOME_DONE.
 *
 * Kept free of React so the root layout can use it on the server.
 */

export const WELCOME_ATTR = "data-welcome";
export const WELCOME_WAIT_ATTR = "data-welcome-wait";
/** On every visit after the first: the short welcome (globals.css), the page's sky and TAYAM rising in. */
export const WELCOME_MINI_ATTR = "data-welcome-mini";
/** Remembered once the full welcome has played (localStorage), so later visits get the short one. */
const WELCOME_SEEN_KEY = "welcome-seen";
/** Left for a moment by the proxy (src/proxy.ts) on a hard refresh: play the full welcome again. */
export const WELCOME_FULL_COOKIE = "welcome-full";
/** Fired on `window` once the page has hydrated (WelcomeGuard): the screen starts then, when the page is quiet. */
export const WELCOME_READY = "welcome:ready";

/** The longest the screen waits for the page to hydrate before it starts anyway (ms after its script runs). */
export const WELCOME_START_CAP_MS = 3000;
export const WELCOME_DONE = "welcome:done";

/** The longest the screen waits for the word's font before it starts anyway (ms). */
export const WELCOME_FONT_WAIT_MS = 1200;

/** When the page underneath is let go (ms after the screen starts): once the word has left. */
export const WELCOME_RELEASE_MS = 4250;

type WelcomeWindow = Window & { __welcomeAt?: number };

/** True while the welcome screen holds the page. */
export const welcomeActive = () => typeof document !== "undefined" && document.documentElement.hasAttribute(WELCOME_ATTR);

/** When the page was let go (performance.now() ms), or 0 if there was no welcome. */
export const welcomeReleasedAt = () => (typeof window === "undefined" ? 0 : ((window as WelcomeWindow).__welcomeAt ?? 0));

/** Whether the welcome has let the page go already (or never held it). */
export const welcomeReleased = () => typeof window !== "undefined" && (window as WelcomeWindow).__welcomeAt !== undefined;

/**
 * In <head>, before the first paint: hold the page, and the screen until its
 * font is in — unless the visitor prefers reduced motion. The first visit gets
 * the whole welcome, and so does a hard refresh (the proxy's cookie); every
 * other load (remembered in localStorage) the short one.
 */
export const WELCOME_HEAD_SCRIPT = `(function(){try{if(!matchMedia("(prefers-reduced-motion: reduce)").matches){var r=document.documentElement;r.setAttribute("${WELCOME_ATTR}","");r.setAttribute("${WELCOME_WAIT_ATTR}","");var full=/(?:^|; )${WELCOME_FULL_COOKIE}=1/.test(document.cookie);if(full)document.cookie="${WELCOME_FULL_COOKIE}=; Max-Age=0; path=/";try{if(!full&&localStorage.getItem("${WELCOME_SEEN_KEY}"))r.setAttribute("${WELCOME_MINI_ATTR}","");else localStorage.setItem("${WELCOME_SEEN_KEY}","1")}catch(e){}}}catch(e){}})()`;

/**
 * Right after the screen in <body>: start it once the word's font is in (or
 * WELCOME_FONT_WAIT_MS has passed) — and the short welcome also only once the
 * page has hydrated (WELCOME_READY: the busiest moment of a load is over, so
 * it plays smoothly from its first frame; WELCOME_START_CAP_MS at the latest;
 * the full welcome starts as it always has) — then let the page go
 * when the screen says so (or, should that never come, a little after it
 * should have). Once it has
 * faded it is taken out of the page (display: none), so its endless wave and
 * stars stop costing frames.
 */
export const WELCOME_END_SCRIPT = `(function(){var r=document.documentElement,o=document.getElementById("welcome"),on=0,font=0,ready=r.hasAttribute("${WELCOME_MINI_ATTR}")?0:1;function done(){if(window.__welcomeAt!==undefined)return;window.__welcomeAt=performance.now();r.removeAttribute("${WELCOME_ATTR}");window.dispatchEvent(new Event("${WELCOME_DONE}"))}function start(){r.removeAttribute("${WELCOME_WAIT_ATTR}");setTimeout(done,${WELCOME_RELEASE_MS + 2500})}function go(){if(on)return;on=1;requestAnimationFrame(function(){requestAnimationFrame(start)})}function check(){if(font&&ready)go()}function fontIn(){font=1;check()}if(!o||!r.hasAttribute("${WELCOME_ATTR}")){r.removeAttribute("${WELCOME_WAIT_ATTR}");done();return}o.addEventListener("animationend",function(e){if(e.target!==o)return;if(e.animationName==="welcome-release")done();if(e.animationName==="welcome-fade")o.style.display="none"});window.addEventListener("${WELCOME_READY}",function(){ready=1;check()},{once:true});setTimeout(fontIn,${WELCOME_FONT_WAIT_MS});if(!ready)setTimeout(go,${WELCOME_START_CAP_MS});try{var s=getComputedStyle(o.querySelector(".w-word"));document.fonts.load(s.fontWeight+" 16px "+s.fontFamily,"TAYAM").then(fontIn,fontIn)}catch(e){fontIn()}})()`;

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
