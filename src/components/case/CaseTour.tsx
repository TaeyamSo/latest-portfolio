"use client";

import { cubicBezier, motion, useMotionValueEvent, useScroll, useTransform } from "motion/react";
import Image, { type StaticImageData } from "next/image";
import { useRef, useState } from "react";

import { BrowserFrame } from "@/components/ui/BrowserFrame";
import type { Highlight } from "@/content/site";
import { cn } from "@/lib/cn";

const pad = (n: number) => String(n).padStart(2, "0");
const glide = cubicBezier(0.65, 0, 0.35, 1);
const hold = (t: number) => t;

type Props = { highlights: Highlight[]; image: StaticImageData; url: string; name: string; label: string };

/**
 * Pan and zoom that centre `focus` in the frame, without ever showing past the
 * screenshot's edges. As CSS: translate(x, y) scale(scale), origin centre.
 */
function framing({ x, y, zoom }: Highlight["focus"]) {
  const half = 0.5 / zoom;
  const cx = Math.min(1 - half, Math.max(half, x));
  const cy = Math.min(1 - half, Math.max(half, y));
  return { scale: zoom, x: `${((0.5 - cx) * zoom * 100).toFixed(2)}%`, y: `${((0.5 - cy) * zoom * 100).toFixed(2)}%` };
}

/**
 * "A closer look": details of the live site, found on its screenshot. On large
 * screens the screenshot pins and the camera glides from one detail to the
 * next as you scroll; elsewhere (and with reduced motion) each detail is a
 * still close-up. Both are in the page and CSS shows one, so nothing swaps
 * after hydration (hidden markup is skipped by screen readers too).
 */
export function CaseTour(props: Props) {
  return (
    <section aria-labelledby="tour-title" className="relative">
      <div className="hidden lg:motion-safe:block">
        <Gliding {...props} />
      </div>
      <div className="lg:motion-safe:hidden">
        <Stills {...props} />
      </div>
    </section>
  );
}

function Heading({ label, id }: { label: string; id?: string }) {
  return (
    <h2 id={id} className="meta flex items-center gap-3 text-paper/60">
      <span>({label})</span>
      <span aria-hidden="true" className="h-px w-10 bg-current" />
      <span>A closer look</span>
    </h2>
  );
}

function Detail({ highlight, index, className }: { highlight: Highlight; index: number; className?: string }) {
  return (
    <div className={className}>
      <p className="meta text-sunlight">{pad(index + 1)}</p>
      <h3 className="mt-2 text-[clamp(1.4rem,1.8vw,2.1rem)] leading-tight font-bold">{highlight.title}</h3>
      <p className="mt-3 max-w-[36ch] text-paper/75">{highlight.text}</p>
    </div>
  );
}

const screen = (image: StaticImageData) => ({ aspectRatio: `${image.width} / ${image.height}` });

function Gliding({ highlights, image, url, label }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const n = highlights.length;

  // Each detail owns an equal stretch of the scroll: the camera glides for the
  // first 35% of it, then holds while you read.
  const input = [0];
  const scales = [1];
  const xs = ["0%"];
  const ys = ["0%"];
  highlights.forEach((highlight, i) => {
    const stop = framing(highlight.focus);
    input.push((i + 0.35) / n, (i + 1) / n);
    scales.push(stop.scale, stop.scale);
    xs.push(stop.x, stop.x);
    ys.push(stop.y, stop.y);
  });
  const ease = input.slice(1).map((_, k) => (k % 2 === 0 ? glide : hold));
  const scale = useTransform(scrollYProgress, input, scales, { ease });
  const x = useTransform(scrollYProgress, input, xs, { ease });
  const y = useTransform(scrollYProgress, input, ys, { ease });

  const [active, setActive] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => setActive(Math.min(n - 1, Math.floor(v * n))));

  return (
    <div ref={ref} style={{ height: `${n * 90 + 100}svh` }}>
      <div className="sticky top-0 flex h-svh items-center">
        <div className="shell grid w-full grid-cols-12 items-center gap-12">
          <div className="col-span-4">
            <Heading label={label} id="tour-title" />
            <ol className="mt-12 flex flex-col gap-10">
              {highlights.map((highlight, i) => (
                <li
                  key={highlight.title}
                  aria-current={i === active ? "step" : undefined}
                  className={cn("transition-opacity duration-500", i === active ? "opacity-100" : "opacity-35")}
                >
                  <Detail highlight={highlight} index={i} />
                </li>
              ))}
            </ol>
          </div>
          <div className="col-span-8">
            <BrowserFrame url={url}>
              {/* The list describes what's in view, so the moving picture stays decorative. */}
              <div aria-hidden="true" className="relative overflow-hidden bg-night" style={screen(image)}>
                <motion.div className="absolute inset-0" style={{ scale, x, y }}>
                  <Image src={image} alt="" fill sizes="66vw" className="object-cover object-top" />
                </motion.div>
              </div>
            </BrowserFrame>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stills({ highlights, image, url, name, label }: Props) {
  return (
    <div className="shell py-20">
      <Heading label={label} />
      <ol className="mt-12 grid gap-16">
        {highlights.map((highlight, i) => {
          const stop = framing(highlight.focus);
          return (
            <li key={highlight.title} className="grid gap-6 md:grid-cols-2 md:items-center md:gap-12">
              <Detail highlight={highlight} index={i} />
              <BrowserFrame url={url}>
                <div className="relative overflow-hidden bg-night" style={screen(image)}>
                  <div
                    className="absolute inset-0"
                    style={{ transform: `translate(${stop.x}, ${stop.y}) scale(${stop.scale})` }}
                  >
                    <Image
                      src={image}
                      alt={`${name} home page, close-up: ${highlight.title.toLowerCase()}`}
                      fill
                      sizes="(min-width: 768px) 46vw, 92vw"
                      className="object-cover object-top"
                    />
                  </div>
                </div>
              </BrowserFrame>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
