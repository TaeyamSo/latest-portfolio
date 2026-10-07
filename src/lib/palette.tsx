/**
 * A scene's colours by day and by night, side by side:
 *
 *   const { C, css } = palette("town", { roof: ["#b84d1a", "#1a2147"], … });
 *
 * `C.roof` is `var(--town-roof)`, usable anywhere a colour is (SVG fill and
 * stop-color included); `<Palette css={css} />` defines the variables — the
 * day's on :root, the night's under `html[data-theme="night"]` — once per page
 * (React hoists and dedupes the <style> by its href). Switching the theme is
 * then one attribute on <html>; nothing re-renders.
 */
export function palette<const T extends Record<string, readonly [day: string, night: string]>>(scope: string, colours: T) {
  const keys = Object.keys(colours) as (keyof T & string)[];
  const C = Object.fromEntries(keys.map((key) => [key, `var(--${scope}-${key})`])) as { [K in keyof T]: string };
  const declare = (i: 0 | 1) => keys.map((key) => `--${scope}-${key}:${colours[key][i]}`).join(";");
  return { C, scope, css: `:root{${declare(0)}}html[data-theme="night"]{${declare(1)}}` };
}

export function Palette({ of }: { of: { scope: string; css: string } }) {
  return (
    <style href={`palette-${of.scope}`} precedence="medium">
      {of.css}
    </style>
  );
}
