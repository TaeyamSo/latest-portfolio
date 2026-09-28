#!/usr/bin/env node
/**
 * Convert source images (png/jpg) into lean WebP files for src/assets.
 *
 * Usage:
 *   node scripts/optimize-images.mjs <input>=<output.webp> [...more pairs] [--width=1600] [--quality=82]
 *
 * Example (add a new project screenshot):
 *   pnpm images ~/Desktop/shot.png=src/assets/projects/my-project.webp
 *
 * Images are never upscaled; alpha channels are preserved.
 */
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const hit = args.find((a) => a.startsWith(`--${name}=`));
  return hit ? Number(hit.split("=")[1]) : fallback;
};
const width = flag("width", 1600);
const quality = flag("quality", 82);
const jobs = args.filter((a) => !a.startsWith("--")).map((pair) => pair.split("="));

if (jobs.length === 0 || jobs.some((job) => job.length !== 2)) {
  console.error("Usage: node scripts/optimize-images.mjs <input>=<output.webp> [--width=1600] [--quality=82]");
  process.exit(1);
}

for (const [input, output] of jobs) {
  await fs.mkdir(path.dirname(output), { recursive: true });
  const before = (await fs.stat(input)).size;
  const info = await sharp(input)
    .resize({ width, withoutEnlargement: true })
    .webp({ quality, effort: 6, smartSubsample: true })
    .toFile(output);
  const kb = (bytes) => `${Math.round(bytes / 1024)} KB`;
  console.log(`${path.basename(input)} -> ${output}  ${info.width}x${info.height}  ${kb(before)} -> ${kb(info.size)}`);
}
