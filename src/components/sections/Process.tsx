"use client";

import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";

import { ridgePath } from "@/components/scenery/ridges";
import type { DiscTone } from "@/components/sun/disc";
import { SunDisc } from "@/components/sun/SunDisc";
import { SunGlyph } from "@/components/sun/SunGlyph";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Tilt } from "@/components/ui/Tilt";
import { sectionNumber, softSkills, steps } from "@/content/site";
import { useReducedMotionSafe } from "@/lib/use-media-query";

const pad = (n: number) => String(n).padStart(2, "0");

type Hour = (typeof steps)[number]["hour"];

/** Each card's window: the sky, where the sun stands (centre, % of the window) and the ridges. */
const SCENES: Record<Hour, { sky: string; sun: { x: number; y: number; tone: DiscTone }; far: string }> = {
  dawn: {
    sky: "linear-gradient(var(--color-dusk), var(--color-ember) 35%, var(--color-flame) 62%, var(--color-gold))",
    sun: { x: 24, y: 72, tone: "sunset" },
    far: "fill-ember",
  },
  morning: {
    sky: "linear-gradient(var(--color-flame), var(--color-amber) 55%, var(--color-gold))",
    sun: { x: 32, y: 40, tone: "noon" },
    far: "fill-[#da5018]",
  },
  noon: {
    sky: "linear-gradient(var(--color-amber), var(--color-gold) 60%, var(--color-sunlight))",
    sun: { x: 54, y: 24, tone: "noon" },
    far: "fill-[#da5018]",
  },
  sunset: {
    sky: "linear-gradient(var(--color-night), var(--color-dusk) 28%, var(--color-ember) 60%, var(--color-flame))",
    sun: { x: 74, y: 74, tone: "sunset" },
    far: "fill-ember",
  },
};

// Low poster ridges, a little different on every card (seeded, so server and client agree).
const RIDGES = steps.map((_, i) => ({
  far: ridgePath({
    anchors: [[0, 0.74], [0.3, 0.7], [0.55, 0.76], [0.8, 0.69], [1, 0.73]],
    points: 10,
    amp: 0.025,
    seed: 101 + i * 10,
  }).d,
  near: ridgePath({
    anchors: [[0, 0.88], [0.35, 0.84], [0.6, 0.9], [0.85, 0.85], [1, 0.88]],
    points: 12,
    amp: 0.02,
    seed: 107 + i * 10,
  }).d,
}));

/**
 * How a project runs, as a day under the sun: four framed cards (the About
 * card's frame) whose windows go from dawn to sunset. On large screens a track
 * fills as you scroll and a small sun rides its leading edge; each card's
 * sunlit edge fills as the sun crosses it, and its window brightens.
 */
export function Process() {
  const ref = useRef<HTMLOListElement>(null);
  const still = useReducedMotionSafe();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.8", "end 0.45"] });
  const sunX = useTransform(scrollYProgress, (v) => `${v * 100}%`);

  return (
    <section id="process" aria-labelledby="process-title" className="shell relative py-[clamp(7rem,16vh,12rem)] outline-none">
      <SectionHeading id="process-title" index={sectionNumber("process")} label="Process" title="From idea to *launch*" />

      <div className="relative mt-16 lg:mt-24">
        <div aria-hidden="true" className="absolute inset-x-0 top-0 hidden h-[3px] rounded-full bg-ink/15 lg:block">
          <motion.div
            className="h-full origin-left rounded-full bg-ink"
            style={{ scaleX: still ? 1 : scrollYProgress }}
          />
          <motion.div className="absolute inset-y-0 left-0 w-full" style={{ x: still ? "100%" : sunX }}>
            <SunGlyph id="process-sun" spin className="absolute top-1/2 left-0 size-10 -translate-1/2" />
          </motion.div>
        </div>

        <ol ref={ref} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6 lg:pt-16">
          {steps.map((step, i) => (
            <Step key={step.title} index={i} count={steps.length} progress={scrollYProgress} still={still} {...step} />
          ))}
        </ol>
      </div>

      <Reveal className="mt-16 flex flex-wrap items-center gap-2.5 lg:mt-20">
        <p className="meta mr-3">Along the way</p>
        {softSkills.map((skill) => (
          <span key={skill} className="meta rounded-full border border-ink/40 px-3 py-1.5 text-[0.62rem] tracking-[0.1em]">
            {skill}
          </span>
        ))}
      </Reveal>
    </section>
  );
}

type StepProps = {
  title: string;
  hour: Hour;
  description: string;
  index: number;
  count: number;
  progress: MotionValue<number>;
  still: boolean;
};

function Step({ title, hour, description, index, count, progress, still }: StepProps) {
  const start = index / count;
  const edge = useTransform(progress, [start, (index + 1) / count], [0, 1]);
  const veil = useTransform(progress, [start, start + 0.12], [0.6, 0]);

  return (
    <li>
      <Tilt max={6} className="h-full">
        <div data-cursor-tone="light" className="group relative flex h-full flex-col bg-ink p-4 text-paper sm:p-5">
          <motion.span
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-[3px] origin-left bg-sunlight"
            style={{ scaleX: still ? 1 : edge }}
          />
          <DayWindow hour={hour} index={index} veil={still ? undefined : veil} />
          <h3 className="mt-6 text-[clamp(1.6rem,2.1vw,2.3rem)] leading-none font-extrabold uppercase">{title}</h3>
          <p className="mt-3 flex-1 text-[1rem] leading-relaxed text-paper/80">{description}</p>
          <p className="meta mt-6 flex justify-between gap-4 text-paper/65">
            <span>
              {pad(index + 1)} / {pad(count)}
            </span>
            <span>{hour}</span>
          </p>
        </div>
      </Tilt>
    </li>
  );
}

/** The card's picture: the sun at this hour over two ridges; it zooms on hover like the About portrait. */
function DayWindow({ hour, index, veil }: { hour: Hour; index: number; veil?: MotionValue<number> }) {
  const { sky, sun, far } = SCENES[hour];
  return (
    <div aria-hidden="true" className="relative aspect-[16/9] overflow-hidden sm:aspect-[4/3]">
      {/* A pixel of overdraw so no sky shows at the frame's edges. */}
      <div className="absolute -inset-px transition-transform duration-700 ease-expo group-hover:scale-110" style={{ background: sky }}>
        <div className="absolute aspect-square w-[36%] -translate-1/2" style={{ left: `${sun.x}%`, top: `${sun.y}%` }}>
          <SunDisc id={`process-${hour}`} tone={sun.tone} className="size-full" />
        </div>
        <svg viewBox="0 0 1000 1000" preserveAspectRatio="none" className="absolute inset-0 size-full">
          <path d={RIDGES[index].far} className={far} />
          <path d={RIDGES[index].near} className="fill-[#2a0d06]" />
        </svg>
      </div>
      {veil && <motion.span className="absolute inset-0 bg-dusk" style={{ opacity: veil }} />}
    </div>
  );
}
