/**
 * Builds the static site for GitHub Pages into `out/`:  pnpm build:pages
 *
 * Runs `next build` in export mode (next.config.ts), then adds `.nojekyll` so
 * GitHub Pages serves the `_next/` folder. The address is read from the
 * environment, with this project's defaults:
 *
 *   NEXT_PUBLIC_BASE_PATH  the sub-folder it's served from   ("/latest-portfolio"; "" for a root or custom domain)
 *   NEXT_PUBLIC_SITE_URL   the full address, for metadata, the sitemap and share links
 *                          ("https://taeyamso.github.io/latest-portfolio")
 */
import { spawnSync } from "node:child_process";
import { copyFileSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";

const require = createRequire(import.meta.url);
const env = {
  ...process.env,
  STATIC_EXPORT: "1",
  NEXT_PUBLIC_BASE_PATH: process.env.NEXT_PUBLIC_BASE_PATH ?? "/latest-portfolio",
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL ?? "https://taeyamso.github.io/latest-portfolio",
};

const next = require.resolve("next/dist/bin/next");
const build = spawnSync(process.execPath, [next, "build"], { stdio: "inherit", env });
if (build.status !== 0) process.exit(build.status ?? 1);

writeFileSync(join("out", ".nojekyll"), "");

// Next prefixes every link it writes with the base path except the page's
// <link rel="apple-touch-icon"> (and its copy in the pages' data files), which
// comes out as "/apple-icon?…". Prefix it here, so it doesn't point outside the site.
const base = env.NEXT_PUBLIC_BASE_PATH;
let fixed = 0;
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path);
    else if (base && /\.(html|txt)$/.test(name)) {
      const before = readFileSync(path, "utf8");
      const after = before.replace(/(["'])\/apple-icon\?/g, `$1${base}/apple-icon?`);
      if (after !== before) {
        writeFileSync(path, after);
        fixed++;
      }
    }
  }
};
walk("out");
console.log(`Prefixed the apple-touch-icon link in ${fixed} files.`);

// Next writes a dynamic page's prefetch data into folders ("__next.work/$d$slug/__PAGE__.txt")
// but the browser asks for it by a flat, dotted name ("__next.work.$d$slug.__PAGE__.txt"); a
// server maps one to the other, a static host can't. Write each file under the name it's asked for too.
let copied = 0;
const flatten = (dir) => {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (!statSync(path).isDirectory()) continue;
    if (name.startsWith("__next.")) {
      const files = [];
      const collect = (d, trail) => {
        for (const entry of readdirSync(d)) {
          const full = join(d, entry);
          if (statSync(full).isDirectory()) collect(full, [...trail, entry]);
          else files.push([full, [...trail, entry]]);
        }
      };
      collect(path, []);
      for (const [from, trail] of files) {
        copyFileSync(from, join(dir, `${name}.${trail.join(".")}`));
        copied++;
      }
    } else flatten(path);
  }
};
flatten("out");
console.log(`Wrote ${copied} prefetch files under their flat names.`);
console.log(`\nStatic site written to out/  (base path "${env.NEXT_PUBLIC_BASE_PATH}", address ${env.NEXT_PUBLIC_SITE_URL})`);
