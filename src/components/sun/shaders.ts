/**
 * GLSL for the living sun. Shapes and colours are injected from geometry.ts so
 * the shader draws exactly the same sun as the SVG fallback — just alive.
 * All colours are written straight to the (premultiplied) framebuffer as sRGB.
 */
import { PALETTES, SUN } from "./geometry";

const NOON = PALETTES.noon;

/** Canvas half-size, in disc radii (the canvas overhangs the sun for its glow). */
export const NOON_SCALE = SUN.extent * 1.36;

const f = (n: number) => n.toFixed(4);
const vec3 = (hex: string) => {
  const v = hex.replace("#", "").match(/.{2}/g)!.map((c) => parseInt(c, 16) / 255);
  return `vec3(${v.map(f).join(", ")})`;
};

export const fullscreenVertex = /* glsl */ `
  void main() {
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const common = /* glsl */ `
  #define PI 3.14159265
  #define TAU 6.28318531

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * noise(p);
      p = p * 2.03 + 11.7;
      a *= 0.5;
    }
    return v;
  }

  // Premultiplied "source over destination".
  vec4 over(vec4 dst, vec4 src) {
    return src + dst * (1.0 - src.a);
  }

  // Coverage (x), facet side (y: 0 light, 1 dark) and distance along the ray (z)
  // for the nearest ray of a layer. Rays are triangles, like the SVG polygons.
  vec3 rayLayer(vec2 p, float count, float offset, float base, float halfW, float tip,
                float rot, float px, float breathe, float lean, vec2 leanDir, float time) {
    float sector = TAU / count;
    float a = atan(p.y, p.x) + PI * 0.5 - rot;
    float k = floor(a / sector - offset + 0.5);
    float ang = (k + offset) * sector - PI * 0.5 + rot;
    vec2 dir = vec2(cos(ang), sin(ang));
    float u = dot(p, dir);
    float v = dot(p, vec2(-dir.y, dir.x));
    float reach = tip + breathe * sin(time * 1.3 + k * 1.7) + lean * max(dot(dir, leanDir), 0.0);
    float w = halfW * (reach - u) / (reach - base);
    float cover = step(base, u) * (1.0 - smoothstep(w - px, w + px, abs(v)));
    return vec3(cover, step(0.0, v), u);
  }

  vec4 sunBody(vec2 q, float px, float time, float rot, float flare, float lean, vec2 leanDir, vec2 light) {
    float d = length(q);
    float breathe = 0.022 + flare * 0.05;
    vec4 col = vec4(0.0);

    vec3 s = rayLayer(q, ${f(SUN.short.count)}, ${f(SUN.short.offset)}, ${f(SUN.short.base)}, ${f(SUN.short.halfWidth)},
                      ${f(SUN.short.tip)} + flare * 0.1, rot * 0.92, px, breathe, lean * 0.6, leanDir, time);
    vec3 sCol = mix(${vec3(NOON.short.light)}, ${vec3(NOON.short.dark)}, s.y) * mix(0.84, 1.0, smoothstep(1.0, 1.16, s.z));
    col = over(col, vec4(sCol, 1.0) * s.x);

    vec3 l = rayLayer(q, ${f(SUN.long.count)}, ${f(SUN.long.offset)}, ${f(SUN.long.base)}, ${f(SUN.long.halfWidth)},
                      ${f(SUN.long.tip)} + flare * 0.18, rot, px, breathe, lean, leanDir, time);
    vec3 lCol = mix(${vec3(NOON.long.light)}, ${vec3(NOON.long.dark)}, l.y) * mix(0.86, 1.0, smoothstep(1.0, 1.24, l.z));
    col = over(col, vec4(lCol, 1.0) * l.x);

    float disc = 1.0 - smoothstep(1.0 - px, 1.0 + px, d);
    vec3 dCol = mix(${vec3(NOON.disc.top)}, ${vec3(NOON.disc.bottom)}, clamp(q.y * 0.5 + 0.5, 0.0, 1.0));
    dCol = mix(dCol, ${vec3(NOON.disc.rim)}, smoothstep(0.78, 1.0, d) * 0.55);
    dCol += (fbm(q * 2.3 + vec2(time * 0.06, -time * 0.09)) - 0.5) * 0.075; // heat shimmer
    dCol += 0.075 * (1.0 - smoothstep(0.0, 0.95, length(q - light)));       // soft highlight
    dCol += flare * 0.08;
    return over(col, vec4(dCol, 1.0) * disc);
  }
`;

/** The hero sun: centred in its canvas, reacting to the pointer and clicks. */
export const noonFragment = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform vec2 uRes;      // drawing buffer, device px
  uniform vec2 uPointer;  // pointer relative to the sun, in disc radii (y down)
  uniform float uHover;   // 0…1, eased pointer presence
  uniform float uFlare;   // 0…1 click impulse

  ${common}

  void main() {
    float m = min(uRes.x, uRes.y);
    vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / (0.5 * m) * ${f(NOON_SCALE)};
    p.y = -p.y; // y down, like the DOM and the SVG
    float px = 2.0 * ${f(NOON_SCALE)} / m;

    float near = uHover * smoothstep(5.5, 1.1, length(uPointer));
    vec2 q = p - uPointer * 0.028 * uHover;     // lean the whole sun a touch
    vec2 leanDir = normalize(uPointer + vec2(1e-4));
    float rot = uTime * TAU / 52.0 + uFlare * 0.55; // one turn every 52s, like the original
    float d = length(q);

    vec4 col = vec4(0.0);
    // Warm light around the sun (additive: alpha stays 0), faded before the canvas edge.
    float glow = exp(-max(d - 1.0, 0.0) * 2.3) * smoothstep(${f(NOON_SCALE)}, ${f(NOON_SCALE * 0.7)}, d);
    col.rgb += vec3(1.0, 0.87, 0.52) * glow * (0.3 + 0.28 * uFlare + 0.06 * near);

    vec2 light = vec2(-0.32, -0.38) + uPointer * 0.07 * uHover;
    col = over(col, sunBody(q, px, uTime, rot, uFlare, 0.15 * near, leanDir, light));
    gl_FragColor = col;
  }
`;
