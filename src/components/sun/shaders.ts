/**
 * GLSL for the sun's journey. Shapes and colours are injected from geometry.ts,
 * so the shader draws exactly the same sun as the SVG fallback — just alive.
 * Colours go straight to the (premultiplied) framebuffer as sRGB, the way CSS
 * paints, so the shader's sky continues the page's gradients seamlessly.
 */
import { EVENING, PALETTES, SUN } from "./geometry";

const NOON = PALETTES.noon;
const SUNSET = PALETTES.sunset;

/** Furthest a ray can reach (breathing, flares, leaning), in disc radii. */
const REACH = SUN.extent + 0.5;
/** Where the glow around the sun has faded out, in disc radii. */
const GLOW = 3.4;

const f = (n: number) => n.toFixed(4);
const vec3 = (hex: string) => {
  const v = hex.replace("#", "").match(/.{2}/g)!.map((c) => parseInt(c, 16) / 255);
  return `vec3(${v.map(f).join(", ")})`;
};
/** A colour that moves from its noon value to its sunset value with `tone`. */
const toned = (noon: string, sunset: string) => `mix(${vec3(noon)}, ${vec3(sunset)}, tone)`;

export const journeyVertex = /* glsl */ `
  attribute vec2 position;

  void main() {
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

export const journeyFragment = /* glsl */ `
  #ifdef GL_FRAGMENT_PRECISION_HIGH
    precision highp float;
  #else
    precision mediump float;
  #endif

  #define PI 3.14159265
  #define TAU 6.28318531

  uniform vec2 uRes;      // drawing buffer, device px
  uniform float uDpr;     // device px per CSS px
  uniform float uTime;
  uniform vec4 uSun;      // centre x, y and disc radius (viewport CSS px, y down), tone
  uniform vec2 uRot;      // rotation of the long and the short rays
  uniform vec3 uPointer;  // pointer relative to the sun in disc radii (y down), presence
  uniform float uFlare;   // 0…1 click impulse
  uniform float uIntro;   // 0…1 fade-in of what the SVG sun never had (glow, stars)
  uniform vec4 uFooter;   // footer top, small viewport height, horizon, sea depth (CSS px)

  const vec3 EMBER = ${vec3(EVENING.ember)};
  const vec3 DUSK = ${vec3(EVENING.dusk)};
  const vec3 NIGHT = ${vec3(EVENING.night)};
  const vec3 SEA = ${vec3(EVENING.sea)};
  const vec3 GOLD = ${vec3(EVENING.gold)};

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

  // 1 below a, 0 above b (smoothstep itself needs its edges in order).
  float fall(float a, float b, float x) {
    return 1.0 - smoothstep(a, b, x);
  }

  // Premultiplied "source over destination".
  vec4 over(vec4 dst, vec4 src) {
    return src + dst * (1.0 - src.a);
  }

  // Coverage (x), facet side (y: 0 light, 1 dark) and distance along the ray (z)
  // for the nearest ray of a layer. Rays are triangles, like the SVG polygons.
  vec3 rayLayer(vec2 p, float count, float offset, float base, float halfW, float tip,
                float rot, float px, float breathe, float lean, vec2 leanDir) {
    float sector = TAU / count;
    float a = atan(p.y, p.x) + PI * 0.5 - rot;
    float k = floor(a / sector - offset + 0.5);
    float ang = (k + offset) * sector - PI * 0.5 + rot;
    vec2 dir = vec2(cos(ang), sin(ang));
    float u = dot(p, dir);
    float v = dot(p, vec2(-dir.y, dir.x));
    float reach = tip + breathe * sin(uTime * 1.3 + k * 1.7) + lean * max(dot(dir, leanDir), 0.0);
    float w = halfW * (reach - u) / (reach - base);
    float cover = step(base, u) * (1.0 - smoothstep(w - px, w + px, abs(v)));
    return vec3(cover, step(0.0, v), u);
  }

  // The faceted sun in sun space (disc radius 1, y down), palette mixed by tone.
  // Flat facets like the SVG sun — no shading — so the hand-over is seamless.
  vec4 sunBody(vec2 q, float px, float lean, vec2 leanDir, float tone) {
    float d = length(q);
    float breathe = 0.022 + uFlare * 0.05;
    vec4 col = vec4(0.0);

    vec3 s = rayLayer(q, ${f(SUN.short.count)}, ${f(SUN.short.offset)}, ${f(SUN.short.base)}, ${f(SUN.short.halfWidth)},
                      ${f(SUN.short.tip)} + uFlare * 0.1, uRot.y, px, breathe, lean * 0.6, leanDir);
    vec3 sCol = mix(${toned(NOON.short.light, SUNSET.short.light)}, ${toned(NOON.short.dark, SUNSET.short.dark)}, s.y);
    col = over(col, vec4(sCol, 1.0) * s.x);

    vec3 l = rayLayer(q, ${f(SUN.long.count)}, ${f(SUN.long.offset)}, ${f(SUN.long.base)}, ${f(SUN.long.halfWidth)},
                      ${f(SUN.long.tip)} + uFlare * 0.18, uRot.x, px, breathe, lean, leanDir);
    vec3 lCol = mix(${toned(NOON.long.light, SUNSET.long.light)}, ${toned(NOON.long.dark, SUNSET.long.dark)}, l.y);
    col = over(col, vec4(lCol, 1.0) * l.x);

    float disc = 1.0 - smoothstep(1.0 - px, 1.0 + px, d);
    vec3 dCol = mix(${toned(NOON.disc.top, SUNSET.disc.top)}, ${toned(NOON.disc.bottom, SUNSET.disc.bottom)},
                    clamp(q.y * 0.5 + 0.5, 0.0, 1.0));
    dCol = mix(dCol, ${toned(NOON.disc.rim, SUNSET.disc.rim)}, smoothstep(0.78, 1.0, d) * 0.55);
    dCol += (fbm(q * 2.3 + vec2(uTime * 0.06, -uTime * 0.09)) - 0.5) * 0.04; // faint heat shimmer
    dCol += uFlare * 0.08;
    return over(col, vec4(dCol, 1.0) * disc);
  }

  // The footer's CSS background: linear-gradient(transparent, ember 12svh, dusk 26svh, night 58svh).
  vec4 eveningSky(float y, float svh) {
    float a = y / (0.12 * svh);
    if (a < 1.0) return vec4(EMBER, 1.0) * max(a, 0.0);
    vec3 c = mix(EMBER, DUSK, clamp((y - 0.12 * svh) / (0.14 * svh), 0.0, 1.0));
    return vec4(mix(c, NIGHT, clamp((y - 0.26 * svh) / (0.32 * svh), 0.0, 1.0)), 1.0);
  }

  // A sparse field of twinkling stars, at most one per 56px cell (CSS px).
  float stars(vec2 p) {
    vec2 cell = floor(p / 56.0);
    float h = hash(cell);
    if (h > 0.3) return 0.0;
    vec2 at = (cell + 0.15 + 0.7 * vec2(hash(cell + 7.13), hash(cell + 3.71))) * 56.0;
    float size = 0.5 + 0.9 * hash(cell + 1.37);
    float twinkle = 0.6 + 0.4 * sin(uTime * (0.7 + 1.6 * hash(cell + 9.21)) + h * 60.0);
    return fall(size - 0.3, size + 0.9, length(p - at)) * twinkle * (0.35 + 0.65 * hash(cell + 5.53));
  }

  // Warm light pooling on the horizon under the sun (the CSS sunset's radial glow).
  vec4 lightPool(float x, float depth) {
    vec2 e = vec2((x - uSun.x) / (0.48 * uRes.x / uDpr), depth / (0.8 * max(uFooter.w, 1.0)));
    float k = length(e);
    vec4 inner = vec4(1.0, 0.439, 0.141, 1.0) * 0.5;
    vec4 outer = vec4(0.702, 0.188, 0.047, 1.0) * 0.22;
    return k < 0.45 ? mix(inner, outer, k / 0.45) : outer * clamp(1.0 - (k - 0.45) / 0.27, 0.0, 1.0);
  }

  void main() {
    vec2 frag = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y) / uDpr; // viewport CSS px, y down
    float r = uSun.z;
    vec2 rel = (frag - uSun.xy) / r;
    float d = length(rel);
    float sky = frag.y - uFooter.x; // how far into the footer

    // Most of the page: nothing but the sun and its glow.
    if (sky < 0.0 && d > ${f(GLOW)}) {
      gl_FragColor = vec4(0.0);
      return;
    }

    float tone = uSun.w;
    float depth = frag.y - uFooter.z; // below the horizon when positive
    float hover = uPointer.z;
    float reach = length(uPointer.xy);
    vec2 pull = uPointer.xy / max(1.0, reach / 3.0);
    float near = hover * fall(1.1, 5.5, reach);
    vec2 leanDir = uPointer.xy / max(reach, 1e-4);
    vec2 q = rel - pull * 0.02 * hover; // the whole sun leans a touch towards the cursor
    float low = fall(0.4, 3.0, (uFooter.z - uSun.y) / r); // 1 once the sun is down on the horizon

    vec4 col = vec4(0.0);
    float dusk = 0.0; // how much of the footer's dark sky is behind this pixel
    if (sky > 0.0) {
      col = eveningSky(sky, uFooter.y);
      dusk = col.a;
      float dark = smoothstep(0.3 * uFooter.y, 0.62 * uFooter.y, sky) * fall(-40.0, -6.0, depth) * smoothstep(1.8, 4.0, d);
      col.rgb += vec3(1.0, 0.94, 0.86) * stars(vec2(frag.x, sky)) * dark * uIntro;
      col = over(col, lightPool(frag.x, depth) * mix(0.55, 1.0, low));
    }

    // A warm glow around the sun — only against the dusk sky. Over the orange
    // page a halo reads as a shadow, so by day the sun stays crisp.
    float glow = exp(-max(length(q) - 1.0, 0.0) * 1.7) * fall(${f(GLOW - 0.8)}, ${f(GLOW)}, d);
    col.rgb += vec3(1.0, 0.58, 0.26) * glow * (0.3 + 0.28 * uFlare) * dusk * uIntro;

    // Sunbeams: soft shafts fanning out from the low sun through the dusk sky.
    // Noise sampled around a circle (by direction), so the fan has no seam.
    if (dusk > 0.0 && depth < 0.0 && low > 0.0) {
      vec2 dir = rel / max(d, 1e-3);
      float shafts = noise(dir * 7.0 + vec2(uTime * 0.04, 3.1)) * 0.65
                   + noise(dir * 17.0 + vec2(-5.3, uTime * 0.03)) * 0.35;
      float reach = smoothstep(1.05, 1.8, d) * exp(-max(d - 1.8, 0.0) * 0.3);
      col.rgb += vec3(1.0, 0.62, 0.3) * smoothstep(0.45, 0.8, shafts) * reach * dusk * low * 0.135 * uIntro;
    }

    // The sun itself, clipped by the horizon.
    if (d < ${f(REACH)}) {
      vec4 sun = sunBody(q, 1.0 / (r * uDpr), 0.15 * near, leanDir, tone);
      col = over(col, sun * clamp(0.5 - depth * uDpr, 0.0, 1.0));
    }

    // The sea: the sun's reflection broken up by waves, a glitter path, the pool mirrored.
    if (depth > -1.0) {
      float w = max(depth, 0.0);
      float k = clamp(w / max(uFooter.w, 1.0), 0.0, 1.0);
      float fade = 1.0 - smoothstep(0.0, 1.0, k);
      vec4 sea = over(vec4(SEA, 1.0), lightPool(frag.x, w) * 0.3 * fade);

      float band = fract(sqrt(w) * 1.7 - uTime * 0.45); // ripples: thin far away, wider up close
      float ripple = smoothstep(0.0, 0.12, band) * fall(0.5, 0.62, band);
      float sway = (sin(w * 0.12 - uTime * 1.7) * 0.7 + sin(w * 0.047 + uTime * 0.8)) * (1.5 + w * 0.05);
      vec2 m = (vec2(frag.x + sway, uFooter.z - w * 0.72) - uSun.xy) / r; // mirrored, stretched
      if (length(m) < ${f(REACH)}) {
        sea = over(sea, sunBody(m, 1.5 / (r * uDpr), 0.0, leanDir, tone) * 0.55 * fade * ripple);
      }

      float column = exp(-pow((frag.x - uSun.x) / (r * (0.9 + 1.6 * k)), 2.0));
      float glitter = pow(noise(vec2(frag.x * 0.07, w * 0.3 - uTime * 1.6)), 5.0);
      sea.rgb += GOLD * glitter * column * fade * low * 1.6;
      col = mix(col, sea, clamp(depth * uDpr + 0.5, 0.0, 1.0));
    }

    // The horizon line, brightest under the sun.
    float line = exp(-abs(depth) * uDpr * 0.8) * step(0.0, sky);
    col.rgb += GOLD * line * (0.25 + 0.75 * exp(-abs(frag.x - uSun.x) / (0.3 * uRes.x / uDpr))) * 0.9;

    // A touch of dither keeps the long dusk gradient free of banding.
    col.rgb += (fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715)))) - 0.5) / 255.0;
    gl_FragColor = clamp(col, 0.0, 1.0);
  }
`;
