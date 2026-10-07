/**
 * GLSL for the sun's journey. The disc and bloom ramps are generated from the
 * same numbers as the SVG/CSS sun (disc.ts), so the shader draws exactly that
 * sun — just alive. Colours go straight to the (premultiplied) framebuffer as
 * sRGB, the way CSS paints, so the shader's sky continues the page seamlessly.
 */
import { BLOOM, DISC, DISC_STOPS, MOON, ZENITH, bloomStops } from "./disc";
import { EVENING, MOONLIT } from "./geometry";

const f = (n: number) => n.toFixed(4);
const rgb = (hex: string) => hex.replace("#", "").match(/.{2}/g)!.map((c) => parseInt(c, 16) / 255);
const vec3 = (hex: string) => `vec3(${rgb(hex).map(f).join(", ")})`;

/** Piecewise-linear colour ramp over the disc stops: zenith ← noon → sunset by `tone` (−1…1). */
const discRamp = () => {
  const stop = (i: number) =>
    `mix(${vec3(DISC.noon[i])}, tone < 0.0 ? ${vec3(ZENITH[i])} : ${vec3(DISC.sunset[i])}, abs(tone))`;
  const steps = DISC_STOPS.slice(1).map(
    (at, i) => `c = mix(c, ${stop(i + 1)}, clamp((x - ${f(DISC_STOPS[i])}) / ${f(at - DISC_STOPS[i])}, 0.0, 1.0));`,
  );
  return `vec3 discColor(float x, float tone) {
    vec3 c = ${stop(0)};
    ${steps.join("\n    ")}
    return c;
  }`;
};

/** The moon's colour ramp over the same stops. */
const moonRamp = () => {
  const steps = DISC_STOPS.slice(1).map(
    (at, i) => `c = mix(c, ${vec3(MOON[i + 1])}, clamp((x - ${f(DISC_STOPS[i])}) / ${f(at - DISC_STOPS[i])}, 0.0, 1.0));`,
  );
  return `vec3 moonColor(float x) {
    vec3 c = ${vec3(MOON[0])};
    ${steps.join("\n    ")}
    return c;
  }`;
};

/** Piecewise-linear bloom opacity over distance, sampled exactly like the CSS gradient. */
const bloomRamp = (name: string, mood: keyof typeof BLOOM) => {
  const stops = bloomStops(mood);
  const steps = stops
    .slice(1)
    .map(
      (s, i) =>
        `a = mix(a, ${f(s.alpha)}, clamp((d - ${f(stops[i].d)}) / ${f(s.d - stops[i].d)}, 0.0, 1.0));`,
    );
  return `float ${name}(float d) {
    float a = ${f(stops[0].alpha)};
    ${steps.join("\n    ")}
    return a;
  }`;
};

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

  uniform vec2 uRes;      // drawing buffer, device px
  uniform float uDpr;     // device px per CSS px
  uniform float uTime;
  uniform vec4 uSun;      // centre x, y and disc radius (viewport CSS px, y down), tone
  uniform vec3 uPointer;  // pointer relative to the sun in disc radii (y down), presence
  uniform float uFlare;   // 0…1 click impulse
  uniform float uIntro;   // 0…1 fade-in of what the SVG sun doesn't have (shimmer, stars)
  uniform vec4 uFooter;   // footer top, small viewport height, horizon, sea depth (CSS px)
  uniform float uMoon;    // 0 the sun … 1 the moon (the night theme), eased
  uniform float uPhase;   // the moon's phase here: 0 full … 1 new

  const vec3 EMBER = ${vec3(EVENING.ember)};
  const vec3 DUSK = ${vec3(EVENING.dusk)};
  const vec3 NIGHT = ${vec3(EVENING.night)};
  const vec3 SEA = ${vec3(EVENING.sea)};
  const vec3 GOLD = ${vec3(EVENING.gold)};
  const vec3 BLOOM_DAY = ${vec3(BLOOM.day.color)};
  const vec3 BLOOM_DUSK = ${vec3(BLOOM.dusk.color)};
  const vec3 BLOOM_MOON = ${vec3(BLOOM.moon.color)};
  const vec3 N_EMBER = ${vec3(MOONLIT.ember)};
  const vec3 N_DUSK = ${vec3(MOONLIT.dusk)};
  const vec3 N_NIGHT = ${vec3(MOONLIT.night)};
  const vec3 N_SEA = ${vec3(MOONLIT.sea)};
  const vec3 SILVER = ${vec3(MOONLIT.gold)};

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

  ${discRamp()}

  ${bloomRamp("bloomDay", "day")}

  ${bloomRamp("bloomDusk", "dusk")}

  ${bloomRamp("bloomMoon", "moon")}

  ${moonRamp()}

  // The glowing disc in sun space (radius 1, y down): white-hot in the middle,
  // gold at the rim. Its edge breathes a little, the surface simmers, and a
  // click whitens it — all scaled by uIntro, so the first frame is the SVG sun.
  vec4 discBody(vec2 q, float px, float tone, float detail) {
    float d = length(q);
    vec2 dir = q / max(d, 1e-4);
    float wobble = (noise(dir * 2.2 + uTime * vec2(0.21, -0.17)) - 0.5) * 2.0 * mix(0.006, 0.014, max(tone, 0.0));
    float dd = d / (1.0 + wobble * uIntro + 0.03 * uFlare);
    vec3 c = discColor(min(dd, 1.0), tone);
    if (detail > 0.0 && d < 1.05) {
      float grain = fbm(q * 7.0 + uTime * vec2(0.05, -0.04)) - 0.5;
      c *= 1.0 + grain * mix(0.06, 0.09, tone) * smoothstep(0.15, 0.8, dd) * detail * uIntro;
    }
    c += (noise(q * 1.6 + vec2(0.0, uTime * 0.12)) - 0.5) * 0.025 * uIntro;
    c = mix(c, vec3(1.0, 0.99, 0.95), 0.3 * uFlare * (1.0 - min(dd, 1.0)));
    return vec4(c, 1.0) * (1.0 - smoothstep(1.0 - px, 1.0 + px, dd));
  }

  // The moon in moon space (radius 1, y down), drawn like the sun — bright in
  // the middle, cooler at the rim — but still: its seas don't simmer. The
  // phase's shadow covers it from the right (a waning moon, lit on the left),
  // with a soft terminator; the dark side keeps a faint earthshine, so the
  // whole disc still reads against the sky. A click makes it shimmer.
  vec4 moonBody(vec2 q, float px, float phase) {
    float d = length(q);
    vec3 c = moonColor(min(d, 1.0));
    // The seas: a few soft, darker patches (fixed — the moon always shows us the same face).
    float seas = smoothstep(0.56, 0.74, fbm(q * 2.1 + vec2(3.1, 7.4)));
    c *= 1.0 - 0.075 * seas * smoothstep(1.0, 0.55, d);
    c *= 1.0 + (fbm(q * 11.0 + 2.3) - 0.5) * 0.025;
    c = mix(c, vec3(1.0), 0.25 * uFlare * (1.0 - min(d, 1.0)));
    float edge = cos(3.14159265 * phase) * sqrt(max(1.0 - q.y * q.y, 0.0));
    float lit = 1.0 - smoothstep(edge - 0.05 - px, edge + 0.05 + px, q.x);
    vec3 shade = vec3(0.09, 0.11, 0.24) + c * 0.04;
    float a = mix(0.16, 1.0, lit);
    return vec4(mix(shade, c, lit), 1.0) * a * (1.0 - smoothstep(1.0 - px, 1.0 + px, d));
  }

  // The sun, or the moon, or (while the theme changes) the one becoming the
  // other: the sun cools to silver as the phase's shadow slides in.
  vec4 orb(vec2 q, float px, float tone, float detail) {
    vec4 sun = uMoon < 1.0 ? discBody(q, px, tone, detail) : vec4(0.0);
    if (uMoon <= 0.0) return sun;
    return mix(sun, moonBody(q, px, uPhase * uMoon), uMoon);
  }

  // The footer's CSS background: linear-gradient(transparent, ember 12svh, dusk 26svh, night 58svh),
  // in the night theme's colours by uMoon.
  vec4 eveningSky(float y, float svh) {
    vec3 ember = mix(EMBER, N_EMBER, uMoon);
    float a = y / (0.12 * svh);
    if (a < 1.0) return vec4(ember, 1.0) * max(a, 0.0);
    vec3 c = mix(ember, mix(DUSK, N_DUSK, uMoon), clamp((y - 0.12 * svh) / (0.14 * svh), 0.0, 1.0));
    return vec4(mix(c, mix(NIGHT, N_NIGHT, uMoon), clamp((y - 0.26 * svh) / (0.32 * svh), 0.0, 1.0)), 1.0);
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
    vec4 inner = mix(vec4(1.0, 0.439, 0.141, 1.0) * 0.5, vec4(0.62, 0.68, 0.95, 1.0) * 0.22, uMoon);
    vec4 outer = mix(vec4(0.702, 0.188, 0.047, 1.0) * 0.22, vec4(0.2, 0.24, 0.5, 1.0) * 0.14, uMoon);
    return k < 0.45 ? mix(inner, outer, k / 0.45) : outer * clamp(1.0 - (k - 0.45) / 0.27, 0.0, 1.0);
  }

  void main() {
    vec2 frag = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y) / uDpr; // viewport CSS px, y down
    float r = uSun.z;
    float hover = uPointer.z;
    vec2 pull = uPointer.xy / max(1.0, length(uPointer.xy) / 3.0);
    vec2 q = (frag - uSun.xy) / r - pull * 0.02 * hover; // the sun leans a touch towards the cursor
    float d = length(q);
    float sky = frag.y - uFooter.x; // how far into the footer
    float tone = uSun.w;

    // Most of the page: nothing but the sun and its day bloom. (The wide glow
    // around it is a CSS layer underneath — see SunJourney — so most pixels
    // stop here.)
    if (sky < 0.0 && d > ${f(Math.max(BLOOM.day.end, BLOOM.moon.end))} * (1.0 + 0.35 * uFlare)) {
      gl_FragColor = vec4(0.0);
      return;
    }

    float depth = frag.y - uFooter.z; // below the horizon when positive
    float low = fall(0.4, 3.0, (uFooter.z - uSun.y) / r); // 1 once the sun is down on the horizon

    vec4 col = vec4(0.0);
    float dusk = 0.0; // how much of the footer's dark sky is behind this pixel
    if (sky > 0.0) {
      col = eveningSky(sky, uFooter.y);
      dusk = col.a;
      float dark = smoothstep(0.3 * uFooter.y, 0.62 * uFooter.y, sky) * fall(-40.0, -6.0, depth) * smoothstep(1.8, 4.0, d);
      col.rgb += mix(vec3(1.0, 0.94, 0.86), vec3(0.9, 0.93, 1.0), uMoon) * stars(vec2(frag.x, sky)) * dark * uIntro * (1.0 + 0.4 * uMoon);
      col = over(col, lightPool(frag.x, depth) * mix(0.55, 1.0, low));
    }

    // The bloom: light around the disc that's always lighter than the sky behind
    // it — the day bloom over the page, the warmer dusk bloom over the dark sky.
    // A flare widens and brightens it.
    if (d > 0.9) {
      float spread = 1.0 + (d - 1.0) / (1.0 + 0.35 * uFlare);
      float boost = 1.0 + 0.6 * uFlare;
      float aDay = min(bloomDay(spread) * boost, 0.9) * (1.0 - smoothstep(0.2, 0.6, tone));
      float aDusk = min(bloomDusk(spread) * boost, 0.9);
      vec4 bloom = mix(vec4(BLOOM_DAY * aDay, aDay), vec4(BLOOM_DUSK * aDusk, aDusk), dusk);
      if (uMoon > 0.0) {
        // Moonlight: around the lit part, not the dark limb (it shifts towards
        // the lit side and tightens as the moon wanes), and as much as the moon
        // is lit — a crescent glows less than the full moon. None on the disc.
        float phase = uPhase * uMoon;
        float dm = length(q + vec2(0.7 * phase, 0.0)) / (1.0 - 0.3 * phase);
        float spreadM = max(1.0 + (dm - 1.0) / (1.0 + 0.35 * uFlare), 1.0);
        float aMoon = min(bloomMoon(spreadM) * boost, 0.9) * (1.0 - 0.6 * phase) * smoothstep(0.98, 1.06, d);
        bloom = mix(bloom, vec4(BLOOM_MOON * aMoon, aMoon), uMoon);
      }
      col = over(col, bloom * clamp(0.5 - depth * uDpr, 0.0, 1.0));
    }

    // The disc itself, clipped by the horizon.
    if (d < 1.1) {
      vec4 sun = orb(q, 1.0 / (r * uDpr), tone, 1.0);
      col = over(col, sun * clamp(0.5 - depth * uDpr, 0.0, 1.0));
    }

    // The sea: the sun's reflection broken up by waves, a glitter path, the pool mirrored.
    if (depth > -1.0) {
      float w = max(depth, 0.0);
      float k = clamp(w / max(uFooter.w, 1.0), 0.0, 1.0);
      float fade = 1.0 - smoothstep(0.0, 1.0, k);
      vec4 sea = over(vec4(mix(SEA, N_SEA, uMoon), 1.0), lightPool(frag.x, w) * 0.3 * fade);

      float band = fract(sqrt(w) * 1.7 - uTime * 0.45); // ripples: thin far away, wider up close
      float ripple = smoothstep(0.0, 0.12, band) * fall(0.5, 0.62, band);
      float sway = (sin(w * 0.12 - uTime * 1.7) * 0.7 + sin(w * 0.047 + uTime * 0.8)) * (1.5 + w * 0.05);
      vec2 m = (vec2(frag.x + sway, uFooter.z - w * 0.72) - uSun.xy) / r; // mirrored, stretched
      if (length(m) < 1.1) {
        sea = over(sea, orb(m, 1.5 / (r * uDpr), tone, 0.0) * 0.55 * fade * ripple);
      }

      float column = exp(-pow((frag.x - uSun.x) / (r * (0.9 + 1.6 * k)), 2.0));
      float glitter = pow(noise(vec2(frag.x * 0.07, w * 0.3 - uTime * 1.6)), 5.0);
      sea.rgb += mix(GOLD, SILVER, uMoon) * glitter * column * fade * low * mix(1.6, 0.85, uMoon);
      col = mix(col, sea, clamp(depth * uDpr + 0.5, 0.0, 1.0));
    }

    // The horizon line, brightest under the sun.
    float line = exp(-abs(depth) * uDpr * 0.8) * step(0.0, sky);
    col.rgb += mix(GOLD, SILVER * 0.7, uMoon) * line * (0.25 + 0.75 * exp(-abs(frag.x - uSun.x) / (0.3 * uRes.x / uDpr))) * 0.9;

    // A touch of dither keeps the long gradients free of banding.
    col.rgb += (fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715)))) - 0.5) / 255.0;
    gl_FragColor = clamp(col, 0.0, 1.0);
  }
`;
