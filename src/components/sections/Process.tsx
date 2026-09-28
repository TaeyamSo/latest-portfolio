"use client";

import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";

import { SunGlyph } from "@/components/sun/SunGlyph";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { sectionNumber, softSkills, steps } from "@/content/site";
import { useReducedMotionSafe } from "@/lib/use-media-query";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * How a project runs. On large screens a track fills as you scroll and a small
 * sun rides its leading edge; each step lights up as the sun reaches it.
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

        <ol ref={ref} className="grid gap-12 lg:grid-cols-4 lg:gap-10 lg:pt-16">
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
  description: string;
  index: number;
  count: number;
  progress: MotionValue<number>;
  still: boolean;
};

function Step({ title, description, index, count, progress, still }: StepProps) {
  const start = index / count;
  const opacity = useTransform(progress, [start, start + 0.12], [0.35, 1]);

  return (
    <li className="border-t-2 border-ink pt-6 lg:border-0 lg:pt-0">
      <motion.div style={still ? undefined : { opacity }}>
        <p className="meta flex items-center gap-3">
          {pad(index + 1)}
          <span aria-hidden="true" className="h-[3px] w-6 rounded-full bg-current" />
        </p>
        <h3 className="mt-5 text-[clamp(1.9rem,2.6vw,2.7rem)] leading-none font-extrabold uppercase">{title}</h3>
        <p className="mt-4 max-w-[30ch] text-[1.05rem] leading-relaxed text-ink/85">{description}</p>
      </motion.div>
    </li>
  );
}
