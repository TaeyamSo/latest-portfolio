import { SUN } from "./geometry";
import { FLARE_EVENT, smooth, sunPath, type Spot } from "./journey";
import { journeyFragment, journeyVertex } from "./shaders";

/** Radians per second: one turn every 52s, the pace of the CSS sun. */
const TURN = (Math.PI * 2) / 52;
const UNIFORMS = ["uRes", "uDpr", "uTime", "uSun", "uRot", "uPointer", "uFlare", "uIntro", "uFooter"] as const;

/**
 * Draws the travelling sun on a fixed, full-viewport canvas with one fragment
 * shader (no 3D engine needed) and moves the DOM that belongs to it: the heat
 * rings follow the sun and the hero's orbit text fades as the sun leaves.
 *
 * It finds its marks in the page: `[data-sun-stage]` (the hero sun's box),
 * `#home`, `#contact`, `[data-horizon]` (inside the sunset stage), `.rings`
 * and `[data-sun-orbit]`. Once its first frames are on screen it sets
 * `html.sun-webgl`, which retires the SVG/CSS stand-ins (see globals.css).
 *
 * Renders at the display rate while something moves, ~30fps otherwise.
 * Returns a cleanup that hands everything back to CSS.
 */
export function startJourney(canvas: HTMLCanvasElement, onLost: () => void) {
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
  const rings = document.querySelector<HTMLElement>(".rings");
  const orbit = document.querySelector<HTMLElement>("[data-sun-orbit]");

  // Start the rays where the CSS sun has turned them, so the hand-over is seamless.
  const spin = stage?.querySelector(".sun-spin")?.getAnimations()[0];
  const start = performance.now();
  const spun = typeof spin?.currentTime === "number" ? spin.currentTime : start;
  const rot0 = ((spun % 52000) / 1000) * TURN;

  // 100svh, measured: the sky anchors use it, so mobile toolbars don't move the sun.
  const probe = document.createElement("div");
  probe.style.cssText = "position:fixed;top:0;width:0;height:100svh;visibility:hidden;pointer-events:none";
  document.body.append(probe);

  let deviceRatio = 0;
  let dpr = 1;
  let desktop = false;
  let svh = window.innerHeight;
  let heroEnd = 1;
  let heroR = 1;
  let ringsX = 0;
  let ringsY = 0;

  const pointer = { x: 0, y: 0, inside: false };
  const lean = { x: 0, y: 0, hover: 0 }; // pointer relative to the sun, eased
  const drift = { x: 0, y: 0 }; // rings parallax, eased
  let flare = 0;
  let intro = 0;
  let time = 8;
  let frames = 0;
  let raf = 0;
  let last = start;
  let activeUntil = 0;
  let lastScroll = Number.NaN;
  let lastRings = "";
  let lastOrbit = "";

  const render = (now: number) => {
    const dt = Math.min(Math.max(now - last, 0) / 1000, 1 / 15);
    last = now;

    // Measure first, then write — no layout thrashing.
    const scroll = window.scrollY;
    const vh = window.innerHeight;
    const maxScroll = Math.max(1, root.scrollHeight - vh);
    const box = stage?.getBoundingClientRect();
    const footerTop = footer?.getBoundingClientRect().top ?? 1e5;
    const horizonTop = horizon?.getBoundingClientRect().top ?? 2e5;
    const seaDepth = (sea?.getBoundingClientRect().bottom ?? horizonTop) - horizonTop;
    const footerStart = Math.max(heroEnd + 1, footerTop + scroll - vh);
    const heroSpot: Spot | null = box?.width
      ? { x: box.left + box.width / 2, y: box.top + box.height / 2, r: box.width / (2 * SUN.extent) }
      : null;
    const sun = sunPath({
      width: canvas.clientWidth,
      height: svh,
      scroll,
      desktop,
      hero: heroSpot,
      heroEnd,
      footerStart,
      footerEnd: Math.max(footerStart + 1, maxScroll),
      horizon: horizonTop - (maxScroll - scroll), // where it ends up once the page is at the bottom
    });

    const ease = 1 - Math.exp(-dt * 5);
    const slow = 1 - Math.exp(-dt * 3);
    if (pointer.inside) {
      lean.x += ((pointer.x - sun.x) / sun.r - lean.x) * ease;
      lean.y += ((pointer.y - sun.y) / sun.r - lean.y) * ease;
      drift.x += (14 - (pointer.x / window.innerWidth) * 28 - drift.x) * slow;
      drift.y += (14 - (pointer.y / vh) * 28 - drift.y) * slow;
    }
    lean.hover += ((pointer.inside ? 1 : 0) - lean.hover) * ease;
    flare *= Math.exp(-dt * 1.8);
    time += dt;
    if (frames >= 2) intro = Math.min(1, intro + dt / 1.2);

    // The rings stay centred on the sun, shrinking less than it does.
    if (rings) {
      const scale = stage ? Math.pow(sun.r / heroR, 0.6) : 1;
      const x = sun.x - ringsX + drift.x;
      const y = sun.y - ringsY + drift.y;
      const transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) scale(${scale.toFixed(4)})`;
      if (transform !== lastRings) rings.style.transform = lastRings = transform;
    }
    if (orbit) {
      const opacity = (1 - smooth(0, heroEnd * 0.45, scroll)).toFixed(3);
      if (opacity !== lastOrbit) orbit.style.opacity = lastOrbit = opacity;
    }

    const turned = ((now - start) / 1000) * TURN + flare * 0.55;
    gl.uniform2f(u.uRes, canvas.width, canvas.height);
    gl.uniform1f(u.uDpr, dpr);
    gl.uniform1f(u.uTime, time);
    gl.uniform4f(u.uSun, sun.x, sun.y, sun.r, sun.tone);
    gl.uniform2f(u.uRot, rot0 + turned, rot0 + turned * 0.92); // the short rays lag a touch behind
    gl.uniform3f(u.uPointer, lean.x, lean.y, lean.hover);
    gl.uniform1f(u.uFlare, flare);
    gl.uniform1f(u.uIntro, intro);
    gl.uniform4f(u.uFooter, footerTop, svh, horizonTop, seaDepth);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    // Two frames in, the canvas is on screen: retire the SVG and CSS stand-ins.
    if (++frames === 2) root.classList.add("sun-webgl");
  };

  const resize = () => {
    desktop = window.matchMedia("(min-width: 64rem)").matches;
    deviceRatio = window.devicePixelRatio || 1;
    dpr = Math.min(deviceRatio, desktop ? 2 : 1.5);
    const width = Math.max(1, Math.round(canvas.clientWidth * dpr));
    const height = Math.max(1, Math.round(canvas.clientHeight * dpr));
    svh = probe.offsetHeight || window.innerHeight;
    heroEnd = Math.max(1, (hero?.offsetHeight ?? svh) * 0.8);
    heroR = Math.max(1, (stage?.getBoundingClientRect().width ?? 0) / (2 * SUN.extent));
    const css = getComputedStyle(root);
    ringsX = (parseFloat(css.getPropertyValue("--rings-x")) / 100) * root.clientWidth;
    ringsY = (parseFloat(css.getPropertyValue("--rings-y")) / 100) * root.clientHeight;
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
    const scroll = window.scrollY;
    if (scroll !== lastScroll) {
      lastScroll = scroll;
      activeUntil = now + 500;
    }
    // When nothing but the slow spin is moving, every other frame is plenty.
    const busy = now < activeUntil || flare > 0.002 || intro < 1;
    if (busy || now - last >= 30) render(now);
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
  const onContextLost = () => {
    stop();
    onLost();
  };

  const observer = new ResizeObserver(resize);
  resize();
  observer.observe(canvas);
  window.addEventListener("pointermove", onMove, { passive: true });
  root.addEventListener("pointerleave", onLeave);
  window.addEventListener(FLARE_EVENT, onFlare);
  canvas.addEventListener("webglcontextlost", onContextLost);
  raf = requestAnimationFrame(loop);

  function stop() {
    cancelAnimationFrame(raf);
    observer.disconnect();
    window.removeEventListener("pointermove", onMove);
    root.removeEventListener("pointerleave", onLeave);
    window.removeEventListener(FLARE_EVENT, onFlare);
    canvas.removeEventListener("webglcontextlost", onContextLost);
    probe.remove();
    root.classList.remove("sun-webgl");
    if (rings) rings.style.transform = "";
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
