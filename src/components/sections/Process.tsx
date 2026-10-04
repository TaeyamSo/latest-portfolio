"use client";

import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";

import { SunGlyph } from "@/components/sun/SunGlyph";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Tilt } from "@/components/ui/Tilt";
import { sectionNumber, softSkills, steps } from "@/content/site";
import { useReducedMotionSafe } from "@/lib/use-media-query";

const pad = (n: number) => String(n).padStart(2, "0");

/** The sky behind each card's mountain, morning to evening as the climb goes on. */
const SKIES = [
  "linear-gradient(var(--color-ember), var(--color-flame) 45%, var(--color-gold))",
  "linear-gradient(var(--color-flame), var(--color-amber) 55%, var(--color-gold))",
  "linear-gradient(var(--color-amber), var(--color-gold) 60%, var(--color-sunlight))",
  "linear-gradient(var(--color-dusk), var(--color-ember) 45%, var(--color-flame) 80%, var(--color-gold))",
];

// The scene, in a 500 × 300 window: a far range, the mountain, foreground hills.
const FAR = "M0,300 L0,170 L50,160 L95,175 L150,140 L205,158 L260,120 L330,150 L390,118 L450,140 L500,128 L500,300 Z";
const MOUNTAIN = "M0,300 L0,248 L70,236 L140,206 L200,170 L250,140 L300,104 L360,62 L400,96 L440,88 L500,120 L500,300 Z";
const HILLS = "M0,300 L0,276 L80,268 L150,282 L230,272 L300,286 L380,274 L440,282 L500,270 L500,300 Z";

/** The trail: switchbacks from the foot of the mountain to its summit. */
const TRAIL = [
  [56, 262],
  [190, 250],
  [128, 228],
  [262, 206],
  [214, 176],
  [322, 152],
  [300, 124],
  [360, 64],
] as const;
const TRAIL_POINTS = TRAIL.map(([x, y]) => `${x},${y}`).join(" ");

/** How far along the trail (0–1) each bend is. */
const ALONG = (() => {
  const run = [0];
  for (let i = 1; i < TRAIL.length; i++) {
    run.push(run[i - 1] + Math.hypot(TRAIL[i][0] - TRAIL[i - 1][0], TRAIL[i][1] - TRAIL[i - 1][1]));
  }
  return run.map((d) => d / run[run.length - 1]);
})();

/** Where each step's milestone stands: the trailhead, halfway, the hillside camp, the summit. */
const STOPS = [0, 3, 5, TRAIL.length - 1];

/**
 * How a project runs, as a climb: four framed cards (the About card's frame)
 * showing the same mountain, one milestone further up the trail each time.
 * On large screens a track fills as you scroll and a small sun rides its
 * leading edge; as it crosses a card, the card's edge fills, its window
 * brightens and that stretch of the trail is walked.
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
  milestone: string;
  description: string;
  index: number;
  count: number;
  progress: MotionValue<number>;
  still: boolean;
};

function Step({ title, milestone, description, index, count, progress, still }: StepProps) {
  const start = index / count;
  const end = (index + 1) / count;
  const edge = useTransform(progress, [start, end], [0, 1]);
  const veil = useTransform(progress, [start, start + 0.12], [0.6, 0]);
  const from = index ? ALONG[STOPS[index - 1]] : 0;
  const walked = useTransform(progress, [start, end], [from, ALONG[STOPS[index]]]);

  return (
    <li>
      <Tilt max={6} className="h-full">
        <div data-cursor-tone="light" className="group relative flex h-full flex-col bg-ink p-4 text-paper sm:p-5">
          <motion.span
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-[3px] origin-left bg-sunlight"
            style={{ scaleX: still ? 1 : edge }}
          />
          <TrailWindow index={index} walked={still ? ALONG[STOPS[index]] : walked} veil={still ? undefined : veil} />
          <h3 className="mt-6 text-[clamp(1.6rem,2.1vw,2.3rem)] leading-none font-extrabold uppercase">{title}</h3>
          <p className="mt-3 flex-1 text-[1rem] leading-relaxed text-paper/80">{description}</p>
          <p className="meta mt-6 flex justify-between gap-4 text-paper/65">
            <span>
              {pad(index + 1)} / {pad(count)}
            </span>
            <span>{milestone}</span>
          </p>
        </div>
      </Tilt>
    </li>
  );
}

type TrailWindowProps = { index: number; walked: MotionValue<number> | number; veil?: MotionValue<number> };

/**
 * The card's picture: the mountain with the trail on it — planned as a dotted
 * route, walked in sunlight up to this step's milestone, earlier milestones
 * left behind in a fainter tone. It zooms on hover like the About portrait.
 */
function TrailWindow({ index, walked, veil }: TrailWindowProps) {
  const [x, y] = TRAIL[STOPS[index]];
  const past = (stop: number) => STOPS.slice(0, index).includes(stop);
  return (
    <div aria-hidden="true" className="relative aspect-[5/3] overflow-hidden">
      {/* A pixel of overdraw so no sky shows at the frame's edges. */}
      <div className="absolute -inset-px transition-transform duration-700 ease-expo group-hover:scale-110" style={{ background: SKIES[index] }}>
        <svg viewBox="0 0 500 300" className="absolute inset-0 size-full">
          <path d={FAR} className="fill-ink/20" />
          <path d={MOUNTAIN} className="fill-[#6e210c]" />
          <path d={HILLS} className="fill-[#2a0d06]" />

          <polyline
            points={TRAIL_POINTS}
            fill="none"
            strokeWidth={4}
            strokeDasharray="1 10"
            strokeLinecap="round"
            className="stroke-paper/60"
          />
          {index > 0 && (
            <motion.polyline
              points={TRAIL_POINTS}
              fill="none"
              strokeWidth={5}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="stroke-sunlight"
              style={{ pathLength: walked }}
            />
          )}

          {/* Milestones already passed, quieter. */}
          {past(STOPS[0]) && <Pin at={TRAIL[STOPS[0]]} faded />}
          {past(STOPS[1]) && <Flag at={TRAIL[STOPS[1]]} faded />}
          {past(STOPS[2]) && <Camp at={TRAIL[STOPS[2]]} faded built />}

          {/* This step's milestone. */}
          {index === 0 && (
            <>
              <Goal at={TRAIL[TRAIL.length - 1]} />
              <Pin at={[x, y]} />
            </>
          )}
          {index === 1 && <Flag at={[x, y]} />}
          {index === 2 && <Camp at={[x, y]} />}
          {index === 3 && <Flag at={[x, y]} summit />}
        </svg>
      </div>
      {veil && <motion.span className="absolute inset-0 bg-dusk" style={{ opacity: veil }} />}
    </div>
  );
}

type MarkProps = { at: readonly [number, number]; faded?: boolean };

const place = ([x, y]: readonly [number, number], faded?: boolean) => ({
  transform: `translate(${x} ${y})`,
  opacity: faded ? 0.45 : 1,
});

/** Discover: a map pin at the trailhead. */
function Pin({ at, faded }: MarkProps) {
  return (
    <g {...place(at, faded)}>
      <path d="M0,0 C-5,-9 -13,-15 -13,-25 A13,13 0 1 1 13,-25 C13,-15 5,-9 0,0 Z" className="fill-sunlight" />
      <circle cy={-25} r={5} className="fill-ink" />
    </g>
  );
}

/** Where the route is headed: an X on the summit. */
function Goal({ at }: MarkProps) {
  return (
    <g {...place(at)} strokeWidth={4} strokeLinecap="round" className="stroke-paper">
      <path d="M-7,-15 L7,-1 M7,-15 L-7,-1" />
    </g>
  );
}

/** Design: a flag halfway; Launch: a bigger one on the summit. */
function Flag({ at, faded, summit }: MarkProps & { summit?: boolean }) {
  const h = summit ? 48 : 34;
  const w = summit ? 34 : 24;
  return (
    <g {...place(at, faded)}>
      <path d={`M0,0 L0,${-h}`} strokeWidth={4} strokeLinecap="round" className="stroke-paper" />
      <path d={`M0,${-h} L${w},${-h + w * 0.32} L0,${-h + w * 0.64} Z`} className="fill-sunlight" />
      {summit && (
        <g strokeWidth={3} strokeLinecap="round" className="stroke-sunlight">
          <path d="M-14,-44 L-24,-50 M-16,-30 L-28,-30 M46,-52 L54,-60 M50,-36 L62,-36" />
        </g>
      )}
    </g>
  );
}

/** Build: a structure going up on the hillside — scaffolding and a crane, or finished once passed. */
function Camp({ at, faded, built }: MarkProps & { built?: boolean }) {
  return (
    <g {...place(at, faded)}>
      <rect x={-18} y={built ? -34 : -18} width={36} height={built ? 34 : 18} className="fill-paper" />
      {built ? (
        <path d="M-22,-34 L0,-48 L22,-34 Z" className="fill-sunlight" />
      ) : (
        <g fill="none" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
          <path d="M-18,-18 L-18,-38 L18,-38 L18,-18 M-18,-38 L18,-18 M18,-38 L-18,-18" className="stroke-paper/70" />
          <path d="M28,0 L28,-58 M14,-58 L62,-58 M28,-48 L40,-58 M54,-58 L54,-42" className="stroke-sunlight" />
          <rect x={49} y={-42} width={10} height={8} className="fill-sunlight stroke-none" />
        </g>
      )}
    </g>
  );
}
