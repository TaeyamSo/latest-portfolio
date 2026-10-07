/**
 * Single source of truth for the sun's shape — a faceted, two-layer sunburst
 * modelled on the 2025 site's sun.png. The SVG glyph, favicon, OG image and
 * the WebGL shader are all generated from these numbers, so every sun on the
 * site matches.
 *
 * Units are relative to the disc radius (disc = 1). Each ray is a triangle
 * whose base sits hidden inside the disc (at `base`) and whose tip reaches `tip`.
 */
export const SUN = {
  long: { count: 8, offset: 0, base: 0.6, halfWidth: 0.52, tip: 1.46 },
  short: { count: 8, offset: 0.5, base: 0.6, halfWidth: 0.42, tip: 1.22 },
  /** Ray tip reach, used to size containers around the disc. */
  extent: 1.46,
} as const;

export type SunPalette = {
  long: { light: string; dark: string };
  short: { light: string; dark: string };
  disc: { top: string; bottom: string; rim: string };
};

export const PALETTES = {
  noon: {
    long: { light: "#ffbe2e", dark: "#ff9412" },
    short: { light: "#ffab1f", dark: "#f98107" },
    disc: { top: "#ffe45e", bottom: "#ffbd1d", rim: "#ff9f0a" },
  },
  sunset: {
    long: { light: "#ff9b3d", dark: "#f0621b" },
    short: { light: "#ff8a2b", dark: "#dc4f16" },
    disc: { top: "#ffd166", bottom: "#ff7a2c", rim: "#f25b18" },
  },
} satisfies Record<string, SunPalette>;

export type SunTone = keyof typeof PALETTES;

/**
 * The footer's evening: sky stops (the ember → dusk → night tokens in
 * globals.css), the sea and the horizon line. Shared by the CSS sunset and
 * the shader that replaces it.
 */
export const EVENING = {
  ember: "#b3300c",
  dusk: "#3b1409",
  night: "#120705",
  sea: "#0a0403",
  gold: "#ffb629",
} as const;

/**
 * The same footer at night (the night theme): indigo over the sea instead of
 * ember, then navy, then the deepest night; the moon's path on the water is
 * silver instead of gold. The footer's CSS tokens swap to these (globals.css).
 */
export const MOONLIT = {
  ember: "#2a2f6e",
  dusk: "#121838",
  night: "#05060f",
  sea: "#03050d",
  gold: "#dfe6ff",
} as const;

type Layer = (typeof SUN)["long"] | (typeof SUN)["short"];
type Point = [number, number];

export type Facet = { points: Point[]; layer: "long" | "short"; side: "light" | "dark" };

/** Two facets (light + dark half) per ray, rays pointing up first. */
function layerFacets(layer: Layer, name: Facet["layer"]): Facet[] {
  const facets: Facet[] = [];
  for (let i = 0; i < layer.count; i++) {
    const angle = ((i + layer.offset) / layer.count) * Math.PI * 2 - Math.PI / 2;
    const dir: Point = [Math.cos(angle), Math.sin(angle)];
    const perp: Point = [-dir[1], dir[0]];
    const at = (u: number, v: number): Point => [dir[0] * u + perp[0] * v, dir[1] * u + perp[1] * v];
    const tip = at(layer.tip, 0);
    const axis = at(layer.base, 0);
    facets.push({ points: [at(layer.base, -layer.halfWidth), tip, axis], layer: name, side: "light" });
    facets.push({ points: [axis, tip, at(layer.base, layer.halfWidth)], layer: name, side: "dark" });
  }
  return facets;
}

/** Short rays first so the long ones are drawn on top. */
export const facets = [...layerFacets(SUN.short, "short"), ...layerFacets(SUN.long, "long")];

export const pointsAttr = (points: Point[]) =>
  points.map(([x, y]) => `${x.toFixed(4)},${y.toFixed(4)}`).join(" ");

export const viewBox = `${-SUN.extent} ${-SUN.extent} ${SUN.extent * 2} ${SUN.extent * 2}`;

/** Standalone SVG markup (favicon, OG image). */
export function sunSvg({ size = 64, tone = "noon" }: { size?: number; tone?: SunTone } = {}) {
  const p = PALETTES[tone];
  const rays = facets
    .map((f) => `<polygon points="${pointsAttr(f.points)}" fill="${p[f.layer][f.side]}"/>`)
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="${viewBox}"><defs><linearGradient id="d" x1="0" y1="-1" x2="0" y2="1" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${p.disc.top}"/><stop offset="1" stop-color="${p.disc.bottom}"/></linearGradient><radialGradient id="r" r="1" cx="0" cy="0" gradientUnits="userSpaceOnUse"><stop offset="0.78" stop-color="${p.disc.rim}" stop-opacity="0"/><stop offset="1" stop-color="${p.disc.rim}" stop-opacity="0.55"/></radialGradient></defs>${rays}<circle r="1" fill="url(#d)"/><circle r="1" fill="url(#r)"/></svg>`;
}
