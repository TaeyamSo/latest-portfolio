import { measureStops } from "./day";
import { DAY_TONE_MAX, GLOW } from "./disc";
import { SUN } from "./geometry";
import { getTheme, THEME_EVENT, type ThemeChange } from "@/lib/theme";

import { FLARE_EVENT, smooth, sunNow, sunPath, type Spot } from "./journey";
import { journeyFragment, journeyVertex } from "./shaders";

const UNIFORMS = ["uRes", "uDpr", "uTime", "uSun", "uPointer", "uFlare", "uIntro", "uFooter", "uMoon", "uPhase"] as const;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
/** How long the canvas takes to fade in when it doesn't start on the hero sun (s). */
const APPEAR_S = 1.1;
/** About the most pixels the canvas draws per frame on a desktop screen (half that on phones). */
const PIXEL_BUDGET = 2.6e6;
/** Shortest time between two drawn frames while something moves (~60 fps, however fast the screen is), and when only the shimmer does. */
const BUSY_GAP_MS = 14;
const IDLE_GAP_MS = 50;
/** How long the CSS sunset takes to fade away over the canvas when the footer is in view (ms). */
const SOFT_MS = 800;

/**
 * Draws the travelling sun on a fixed, full-viewport canvas with one fragment
 * shader (no 3D engine needed), and fades the hero's orbit text as it leaves.
 *
 * It finds its marks in the page: `[data-sun-stage]` (the hero sun's box),
 * `#home`, the sections the day's stops are anchored to (day.ts), `#contact`,
 * `[data-horizon]` (inside the sunset stage) and `[data-sun-orbit]`, and
 * measures them once (again on resize), never per frame. Once its first frames
 * are on screen it sets `html.sun-webgl`, which retires the SVG/CSS stand-ins
 * (see globals.css). It also moves the sun's wide glow, a CSS layer underneath.
 *
 * When the hero sun isn't on screen as it starts (a reload further down the
 * page) there is nothing to take over from, so the canvas fades in over
 * APPEAR_S instead of popping on. If the footer is in view it has a stand-in
 * of its own (the CSS sunset): the canvas is opaque underneath, and the
 * stand-in fades away over it (SOFT_MS).
 *
 * In the night theme the same orb is the moon (THEME_EVENT): switching, the sun
 * cools to silver as the phase's shadow slides in, over about a second and a
 * half, and the glow's layer cross-fades to moonlight (`moonGlow`).
 *
 * Renders at up to ~60fps while something moves, ~20fps when only the
 * shimmer is moving, within a pixel budget (PIXEL_BUDGET).
 * Returns a cleanup that hands everything back to CSS.
 */
export function startJourney(
  canvas: HTMLCanvasElement,
  glow: HTMLElement | null,
  moonGlow: HTMLElement | null,
  onLost: () => void,
) {
  const gl = canvas.getContext("webgl", {
    alpha: true,
    premultipliedAlpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: "low-power",
  });
  const program = gl && createProgram(gl);
  if (!gl || !program) {
    onLost();
    return () => {};
  }

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW); // one big triangle
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  gl.useProgram(program);
  const u = Object.fromEntries(UNIFORMS.map((name) => [name, gl.getUniformLocation(program, name)])) as Record<
    (typeof UNIFORMS)[number],
    WebGLUniformLocation | null
  >;

  const root = document.documentElement;
  const stage = document.querySelector<HTMLElement>("[data-sun-stage]");
  const hero = document.getElementById("home");
  const footer = document.getElementById("contact");
  const horizon = document.querySelector<HTMLElement>("[data-horizon]");
  const sea = horizon?.parentElement;
  const orbit = document.querySelector<HTMLElement>("[data-sun-orbit]");

  const start = performance.now();

  // 100svh, measured: the sky anchors use it, so mobile toolbars don't move the sun.
  const probe = document.createElement("div");
  probe.style.cssText = "position:fixed;top:0;width:0;height:100svh;visibility:hidden;pointer-events:none";
  document.body.append(probe);

  let deviceRatio = 0;
  let dpr = 1;
  let desktop = false;
  let svh = window.innerHeight;
  let heroEnd = 1;
  let cssWidth = canvas.clientWidth;

  // Where things are on the page (document px), measured once and on resize.
  const marks = {
    stage: null as Spot | null,
    footerTop: 1e5,
    horizonTop: 2e5,
    seaBottom: 2e5,
    maxScroll: 1,
    stops: [0] as number[],
  };
  const measure = () => {
    const sy = window.scrollY;
    const box = stage?.getBoundingClientRect();
    marks.stage = box?.width
      ? { x: box.left + box.width / 2, y: box.top + sy + box.height / 2, r: box.width / (2 * SUN.extent) }
      : null;
    marks.footerTop = (footer?.getBoundingClientRect().top ?? 1e5) + sy;
    marks.horizonTop = (horizon?.getBoundingClientRect().top ?? 2e5) + sy;
    marks.seaBottom = (sea?.getBoundingClientRect().bottom ?? marks.horizonTop - sy) + sy;
    marks.maxScroll = Math.max(1, root.scrollHeight - window.innerHeight);
    marks.stops = measureStops();
  };
  let lastGlow = "";
  let glowSize = 1;

  const pointer = { x: 0, y: 0, inside: false };
  const lean = { x: 0, y: 0, hover: 0 }; // pointer relative to the sun, eased
  let flare = 0;
  let intro = 0;
  let appear = 1; // the canvas's own opacity; below 1 while it fades in
  let soft = false; // the stand-ins fade out over the canvas instead of switching off
  let softTimer = 0;
  let moonTarget = getTheme() === "night" ? 1 : 0;
  let moon = moonTarget; // starts where the page is: no morph on load
  let time = 8;
  let frames = 0;
  let raf = 0;
  let last = start;
  let activeUntil = 0;
  let lastScroll = Number.NaN;
  let lastOrbit = "";

  const render = (now: number) => {
    const dt = Math.min(Math.max(now - last, 0) / 1000, 1 / 15);
    last = now;

    // Everything from the cached marks and the scroll position: no layout reads.
    const scroll = scrollNow;
    const vh = window.innerHeight;
    const { maxScroll, stops } = marks;
    const footerTop = marks.footerTop - scroll;
    const horizonTop = marks.horizonTop - scroll;
    const seaDepth = marks.seaBottom - marks.horizonTop;
    const footerStart = Math.max(stops[stops.length - 1] + 1, marks.footerTop - vh);
    const heroSpot: Spot | null = marks.stage ? { ...marks.stage, y: marks.stage.y - scroll } : null;
    // Ahead of the path: the footer's sunset becomes the moon's stand as it blends.
    moon += (moonTarget - moon) * (1 - Math.exp(-dt * 2.6));
    if (Math.abs(moonTarget - moon) < 0.001) moon = moonTarget;
    const sun = sunPath({
      moon,
      width: cssWidth,
      height: svh,
      scroll,
      desktop,
      hero: heroSpot,
      stops,
      footerStart,
      footerEnd: Math.max(footerStart + 1, maxScroll),
      horizon: horizonTop - (maxScroll - scroll), // where it ends up once the page is at the bottom
    });

    const ease = 1 - Math.exp(-dt * 5);
    if (pointer.inside) {
      lean.x += ((pointer.x - sun.x) / sun.r - lean.x) * ease;
      lean.y += ((pointer.y - sun.y) / sun.r - lean.y) * ease;
    }
    lean.hover += ((pointer.inside ? 1 : 0) - lean.hover) * ease;
    flare *= Math.exp(-dt * 1.8);
    time += dt;
    if (frames >= 2) intro = Math.min(1, intro + dt / 1.2);

    if (orbit) {
      const opacity = (1 - smooth(0, heroEnd * 0.45, scroll)).toFixed(3);
      if (opacity !== lastOrbit) orbit.style.opacity = lastOrbit = opacity;
    }

    // The disc only deepens to red once the dark footer sky is behind it; over
    // the page it stays bright (whitest at noon), so its rim never sinks below
    // its bloom.
    const skyBehind = clamp01((sun.y - footerTop) / (0.12 * svh));
    const tone = Math.min(sun.tone, DAY_TONE_MAX) + (sun.tone - Math.min(sun.tone, DAY_TONE_MAX)) * skyBehind;
    gl.uniform2f(u.uRes, canvas.width, canvas.height);
    gl.uniform1f(u.uDpr, dpr);
    gl.uniform1f(u.uTime, time);
    gl.uniform4f(u.uSun, sun.x, sun.y, sun.r, tone);
    gl.uniform3f(u.uPointer, lean.x, lean.y, lean.hover);
    gl.uniform1f(u.uFlare, flare);
    gl.uniform1f(u.uIntro, intro);
    gl.uniform4f(u.uFooter, footerTop, svh, horizonTop, seaDepth);
    gl.uniform1f(u.uMoon, moon);
    gl.uniform1f(u.uPhase, sun.phase);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    sunNow.x = sun.x;
    sunNow.y = sun.y;
    sunNow.r = sun.r;

    // The wide glow follows the sun (by day; the footer's dark sky covers it),
    // and its moonlit twin follows the moon.
    if (glow) {
      const size = glowSize;
      const shown = intro * (1 - smooth(0.2, 0.6, tone));
      const lit = 1 - 0.6 * sun.phase;
      const next = `translate3d(${(sun.x - size / 2).toFixed(1)}px, ${(sun.y - size / 2).toFixed(1)}px, 0) scale(${((sun.r * 2 * GLOW.end) / size).toFixed(4)})|${(shown * (1 - moon)).toFixed(3)}|${(intro * lit * moon * (1 - smooth(0.2, 0.6, tone))).toFixed(3)}`;
      if (next !== lastGlow) {
        lastGlow = next;
        const [transform, sunOpacity, moonOpacity] = next.split("|");
        glow.style.transform = transform;
        glow.style.opacity = sunOpacity;
        if (moonGlow) {
          moonGlow.style.transform = transform;
          moonGlow.style.opacity = moonOpacity;
        }
      }
    }

    // Two frames in, the canvas is on screen: retire the SVG and CSS stand-ins —
    // or, when it's fading in, once it has (they'd leave a gap behind it otherwise).
    frames++;
    if (appear < 1) {
      appear = Math.min(1, appear + dt / APPEAR_S);
      canvas.style.opacity = appear >= 1 ? "" : (appear * appear * (3 - 2 * appear)).toFixed(3);
      if (appear >= 1) root.classList.add("sun-webgl");
    } else if (frames === 2) {
      if (soft) {
        root.classList.add("sun-webgl-soft");
        softTimer = window.setTimeout(() => {
          root.classList.add("sun-webgl");
          root.classList.remove("sun-webgl-soft");
        }, SOFT_MS);
      } else root.classList.add("sun-webgl");
    }
  };

  const resize = () => {
    desktop = window.matchMedia("(min-width: 64rem)").matches;
    deviceRatio = window.devicePixelRatio || 1;
    // A sharp canvas where it's cheap, a budgeted one where it isn't: a 1440x900 screen at 2x is five
    // million pixels of shader, far more than a soft-edged sun needs (never below 1 pixel per CSS pixel).
    const area = Math.max(1, canvas.clientWidth * canvas.clientHeight);
    dpr = Math.min(deviceRatio, desktop ? 2 : 1.5, Math.max(1, Math.sqrt((desktop ? PIXEL_BUDGET : PIXEL_BUDGET / 2) / area)));
    const width = Math.max(1, Math.round(canvas.clientWidth * dpr));
    const height = Math.max(1, Math.round(canvas.clientHeight * dpr));
    svh = probe.offsetHeight || window.innerHeight;
    heroEnd = Math.max(1, (hero?.offsetHeight ?? svh) * 0.8);
    cssWidth = canvas.clientWidth;
    glowSize = glow?.offsetWidth || 1;
    measure();
    scrollNow = window.scrollY;
    if (width === canvas.width && height === canvas.height) return;
    // Resizing clears the canvas, so paint again right away (no blank frame).
    canvas.width = width;
    canvas.height = height;
    gl.viewport(0, 0, width, height);
    if (frames) render(performance.now());
  };

  const loop = (now: number) => {
    raf = requestAnimationFrame(loop);
    if ((window.devicePixelRatio || 1) !== deviceRatio) resize(); // zoomed or moved to another screen
    const scroll = scrollNow;
    if (scroll !== lastScroll) {
      lastScroll = scroll;
      activeUntil = now + 500;
    }
    // When nothing but the slow shimmer is moving, every other frame is plenty.
    const busy = now < activeUntil || flare > 0.002 || intro < 1 || appear < 1 || moon !== moonTarget;
    if (now - last >= (busy ? BUSY_GAP_MS : IDLE_GAP_MS)) render(now);
  };

  // The scroll position, taken in the scroll event: reading it inside the frame would force a style
  // and layout pass whenever the page's other layers have just written theirs.
  let scrollNow = window.scrollY;
  const onScroll = () => {
    scrollNow = window.scrollY;
  };

  const onMove = (event: PointerEvent) => {
    if (event.pointerType !== "mouse") return;
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.inside = true;
    activeUntil = performance.now() + 500;
  };
  const onLeave = () => {
    pointer.inside = false;
  };
  const onFlare = () => {
    flare = 1;
  };
  const onTheme = (event: Event) => {
    moonTarget = (event as CustomEvent<ThemeChange>).detail.theme === "night" ? 1 : 0;
  };
  const onContextLost = () => {
    stop();
    onLost();
  };

  const observer = new ResizeObserver(resize);
  resize();
  const heroBox = stage?.getBoundingClientRect();
  if (heroBox && (heroBox.bottom <= 0 || heroBox.top >= window.innerHeight)) {
    if (footer && footer.getBoundingClientRect().top < window.innerHeight) soft = true;
    else {
      appear = 0;
      canvas.style.opacity = "0";
    }
  }
  observer.observe(canvas);
  observer.observe(document.body); // the page's layout changed: measure again
  stage?.addEventListener("animationend", measure); // the hero sun's rise has settled
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("pointermove", onMove, { passive: true });
  root.addEventListener("pointerleave", onLeave);
  window.addEventListener(FLARE_EVENT, onFlare);
  window.addEventListener(THEME_EVENT, onTheme);
  canvas.addEventListener("webglcontextlost", onContextLost);
  raf = requestAnimationFrame(loop);

  function stop() {
    cancelAnimationFrame(raf);
    observer.disconnect();
    stage?.removeEventListener("animationend", measure);
    if (glow) glow.style.opacity = "0";
    if (moonGlow) moonGlow.style.opacity = "0";
    sunNow.x = -1;
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("pointermove", onMove);
    root.removeEventListener("pointerleave", onLeave);
    window.removeEventListener(FLARE_EVENT, onFlare);
    window.removeEventListener(THEME_EVENT, onTheme);
    canvas.removeEventListener("webglcontextlost", onContextLost);
    probe.remove();
    window.clearTimeout(softTimer);
    root.classList.remove("sun-webgl", "sun-webgl-soft");
    canvas.style.opacity = "";
    if (orbit) orbit.style.opacity = "";
    if (gl && !gl.isContextLost()) {
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    }
  }

  return stop;
}

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
  if (process.env.NODE_ENV !== "production") console.error(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
  return null;
}

function createProgram(gl: WebGLRenderingContext) {
  const vertex = compile(gl, gl.VERTEX_SHADER, journeyVertex);
  const fragment = compile(gl, gl.FRAGMENT_SHADER, journeyFragment);
  const program = gl.createProgram();
  if (!vertex || !fragment || !program) return null;
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.bindAttribLocation(program, 0, "position");
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (gl.getProgramParameter(program, gl.LINK_STATUS)) return program;
  if (process.env.NODE_ENV !== "production") console.error(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
  return null;
}
