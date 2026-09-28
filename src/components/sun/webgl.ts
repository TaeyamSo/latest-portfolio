/** Whether it's worth spinning up WebGL (skips data-saver and GPU-less browsers). */
export function canUseWebGL() {
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  if (connection?.saveData) return false;
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
    return Boolean(gl);
  } catch {
    return false;
  }
}

/** Run `callback` once the main thread is idle (or after a short timeout). */
export function whenIdle(callback: () => void, timeout = 1200) {
  if ("requestIdleCallback" in window) {
    const id = window.requestIdleCallback(callback, { timeout });
    return () => window.cancelIdleCallback(id);
  }
  const id = setTimeout(callback, 250);
  return () => clearTimeout(id);
}
