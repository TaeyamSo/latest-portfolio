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
 * font is in — unless the visitor prefers reduced motion.
 */
export const WELCOME_HEAD_SCRIPT = `(function(){try{if(!matchMedia("(prefers-reduced-motion: reduce)").matches){var r=document.documentElement;r.setAttribute("${WELCOME_ATTR}","");r.setAttribute("${WELCOME_WAIT_ATTR}","")}}catch(e){}})()`;

/**
 * Right after the screen in <body>: start it once the word's font is in (or
 * WELCOME_FONT_WAIT_MS has passed), then let the page go when the screen says
 * so (or, should that never come, a little after it should have).
 */
export const WELCOME_END_SCRIPT = `(function(){var r=document.documentElement,o=document.getElementById("welcome"),on=0;function done(){if(window.__welcomeAt!==undefined)return;window.__welcomeAt=performance.now();r.removeAttribute("${WELCOME_ATTR}");window.dispatchEvent(new Event("${WELCOME_DONE}"))}function go(){if(on)return;on=1;r.removeAttribute("${WELCOME_WAIT_ATTR}");setTimeout(done,${WELCOME_RELEASE_MS + 2500})}if(!o||!r.hasAttribute("${WELCOME_ATTR}")){r.removeAttribute("${WELCOME_WAIT_ATTR}");done();return}o.addEventListener("animationend",function(e){if(e.target===o&&e.animationName==="welcome-release")done()});setTimeout(go,${WELCOME_FONT_WAIT_MS});try{var s=getComputedStyle(o.querySelector(".w-word"));document.fonts.load(s.fontWeight+" 16px "+s.fontFamily,"TAYAM").then(go,go)}catch(e){go()}})()`;

/* --- The wiggly line ------------------------------------------------------- */

/**
 * The line's sideways offset at height y (0 top … 1 bottom), in units of its
 * amplitude (`--wa`, set in CSS): two gentle waves, crossing the exact middle
 * at half height — where the Y of TAYAM is.
 */
const wiggle = (y: number) => {
  const u = y - 0.5;
  return 0.62 * Math.sin(2 * Math.PI * 1.35 * u) + 0.38 * Math.sin(2 * Math.PI * 3.1 * u);
};

/** Heights the edge is drawn through (%), a little past the top and bottom. */
const HEIGHTS = Array.from({ length: 57 }, (_, i) => -2 + (104 * i) / 56);

/** A point on the line, `base` from the element's left edge (a CSS length), plus `extra`. */
const point = (base: string, y: number, extra = "") => `calc(${base} + var(--wa) * ${wiggle(y / 100).toFixed(4)}${extra}) ${y.toFixed(2)}%`;

/**
 * The shapes, as CSS clip-paths, all from the same line so they meet exactly
 * at every screen size: the sun's window (everything left of the line, which
 * sits 8vw in from its right edge), the night's (everything right of it, 8vw
 * in from its left edge) and the line itself (a band `2 × --wl` wide) — down
 * the middle of the screen, where the word's Y is.
 */
export const WELCOME_SHAPES = {
  sun: `polygon(0% -2%, ${HEIGHTS.map((y) => point("100% - 8vw", y)).join(", ")}, 0% 102%)`,
  night: `polygon(${HEIGHTS.map((y) => point("8vw", y)).join(", ")}, 100% 102%, 100% -2%)`,
  line: `polygon(${HEIGHTS.map((y) => point("50%", y, " - var(--wl)")).join(", ")}, ${[...HEIGHTS]
    .reverse()
    .map((y) => point("50%", y, " + var(--wl)"))
    .join(", ")})`,
};
