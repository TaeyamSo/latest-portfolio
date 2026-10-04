"use client";

import {
  AnimatePresence,
  motion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState, ViewTransition } from "react";

import { SunLit } from "@/components/sun/SunLit";
import { BrowserFrame } from "@/components/ui/BrowserFrame";
import { MockBadge } from "@/components/ui/MockBadge";
import { EASE_EXPO, Reveal } from "@/components/ui/Reveal";
import { RollText } from "@/components/ui/RollText";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Tilt } from "@/components/ui/Tilt";
import { archiveProjects, caseStudyPath, featuredProjects, sectionNumber, type Project } from "@/content/site";
import { visible } from "@/lib/mock";
import { useMediaQuery, useReducedMotionSafe } from "@/lib/use-media-query";
import { workCardId } from "@/lib/work-return";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Each client project gets a full-screen moment: dark cards that pin and stack
 * as you scroll (from tablet up), the previous one scaling back into the deck.
 * Each card opens its case study (/work/[slug]). Template builds follow in an
 * archive list with cursor-following previews.
 */
export function Projects() {
  const stackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: stackRef, offset: ["start start", "end end"] });

  return (
    <section id="work" aria-labelledby="projects-title" className="relative py-[clamp(7rem,16vh,12rem)] outline-none">
      <div className="shell">
        <SectionHeading id="projects-title" index={sectionNumber("work")} label="Projects" title="Selected *work*" />
      </div>

      <div ref={stackRef} className="relative mt-16 lg:mt-20">
        {featuredProjects.map((project, i) => (
          <ProjectCard
            key={project.slug}
            project={project}
            index={i}
            count={featuredProjects.length}
            progress={scrollYProgress}
          />
        ))}
      </div>

      <Archive />
    </section>
  );
}

type CardProps = { project: Project; index: number; count: number; progress: MotionValue<number> };

function ProjectCard({ project, index, count, progress }: CardProps) {
  const stacking = useMediaQuery("(min-width: 48rem)");
  const still = useReducedMotionSafe();
  const last = index === count - 1;
  const span = Math.max(1, count - 1);
  const start = index / span;
  // Cards further back in the deck end up smaller and darker.
  const scale = useTransform(progress, last ? [0, 1] : [start, 1], [1, last ? 1 : 1 - (count - 1 - index) * 0.04]);
  const dim = useTransform(progress, last ? [0, 1] : [start, Math.min(1, start + 1 / span)], [0, last ? 0 : 0.6]);
  const animate = stacking && !still;
  const details = project.details && visible(project.details) ? project.details : null;
  const href = project.caseStudy ? caseStudyPath(project.slug) : null;

  return (
    <div
      id={workCardId(project.slug)}
      style={{ "--i": index, zIndex: index + 1 } as React.CSSProperties}
      className="px-(--gutter) pb-6 md:sticky md:top-0 md:h-svh md:px-0 md:pt-[calc(7svh+var(--i)*1.4rem)] md:pb-0"
    >
      {/* Opening the case study grows this card into the page (and back). */}
      <ViewTransition name={`case-${project.slug}`} share="case-close" default="none">
        <motion.article
          data-tone="dark"
          data-cursor-tone="light"
          aria-labelledby={`project-${project.slug}`}
          style={animate ? { scale } : undefined}
          className="relative origin-top overflow-hidden bg-ink text-paper md:h-[min(78svh,50rem)]"
        >
          <div className="md:shell grid h-full gap-8 px-5 py-8 md:grid-rows-[auto_1fr_auto] md:py-10 lg:py-12">
            <div className="meta flex flex-wrap justify-between gap-3 text-paper/70">
              <span>
                ({pad(index + 1)} / {pad(count)})
              </span>
              <span>{project.kind}</span>
            </div>

            <div className="grid items-center gap-10 lg:grid-cols-12">
              <div className="lg:col-span-5">
                <h3
                  id={`project-${project.slug}`}
                  className="text-[clamp(2.4rem,5vw,5.4rem)] leading-[0.92] font-extrabold uppercase"
                >
                  {href ? (
                    <Link href={href} transitionTypes={["case-open"]} data-cursor="Read" className="hover:text-sunlight">
                      {project.name}
                    </Link>
                  ) : (
                    project.name
                  )}
                </h3>
                {href && (
                  <Link
                    href={href}
                    transitionTypes={["case-open"]}
                    data-cursor="Read"
                    data-cursor-tone="dark"
                    className="group group/roll mt-8 inline-flex items-center gap-3 rounded-full bg-sunlight px-6 py-3 text-sm font-medium tracking-wide text-ink transition-colors duration-300 hover:bg-paper"
                  >
                    <RollText>Read the case study</RollText>
                    <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                    <span className="sr-only">: {project.name}</span>
                  </Link>
                )}
              </div>
              <div className="lg:col-span-7">
                <Monitor project={project} href={href} />
              </div>
            </div>

            <dl className="meta grid grid-cols-2 gap-x-6 gap-y-4 border-t border-paper/15 pt-5 text-paper/70 sm:grid-cols-4">
              {project.role && <Detail term="Role" value={project.role} />}
              <Detail term="Sector" value={project.category} />
              {details && <Detail term="Year" value={details.year} mock={details.mock} />}
              {details && <Detail term="Stack" value={details.stack} mock={details.mock} />}
            </dl>
          </div>

          <SunLit />
          <motion.div
            aria-hidden="true"
            style={animate ? { opacity: dim } : { opacity: 0 }}
            className="pointer-events-none absolute inset-0 bg-ink"
          />
        </motion.article>
      </ViewTransition>
    </div>
  );
}

function Detail({ term, value, mock }: { term: string; value: string; mock?: boolean }) {
  return (
    <div>
      <dt className="flex items-center gap-2">
        {term}
        {mock && <MockBadge className="text-paper/70" />}
      </dt>
      <dd className="mt-1.5 tracking-[0.08em] text-paper normal-case">{value}</dd>
    </div>
  );
}

/**
 * The original monitor, inverted for the dark cards: paper bezel, neck, and
 * "Visit website" as its base. The screen opens the case study, and flies to
 * the top of it while the page opens.
 */
function Monitor({ project, href }: { project: Project; href: string | null }) {
  const screen = (
    <ViewTransition name={`shot-${project.slug}`} share="case-shot" default="none">
      <div
        className="relative overflow-hidden bg-night"
        style={{ aspectRatio: `${project.image.width} / ${project.image.height}` }}
      >
        <Image
          src={project.image}
          alt={`${project.name} — home page screenshot`}
          fill
          sizes="(min-width: 1024px) 46rem, 92vw"
          placeholder="blur"
          className="object-cover object-top transition-transform duration-[1200ms] ease-expo group-hover:scale-[1.04]"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-linear-to-br from-white/12 via-transparent to-transparent"
        />
      </div>
    </ViewTransition>
  );

  return (
    <Tilt max={4} className="mx-auto w-full max-w-[46rem]">
      <BrowserFrame url={project.url} className="group">
        {href ? (
          // A second way into the case study for pointer users; keyboard users get the button.
          <Link href={href} transitionTypes={["case-open"]} tabIndex={-1} aria-hidden="true" data-cursor="Read" className="block">
            {screen}
          </Link>
        ) : (
          screen
        )}
      </BrowserFrame>
      <div aria-hidden="true" className="mx-auto h-8 w-4 bg-paper sm:h-10" />
      <a
        href={project.url}
        target="_blank"
        rel="noopener noreferrer"
        data-cursor="Visit"
        data-cursor-tone="dark"
        className="group group/roll mx-auto flex w-56 items-center justify-center gap-2 bg-paper py-3 text-sm font-medium tracking-wide text-ink transition-colors duration-300 hover:bg-sunlight"
      >
        <RollText>Visit website</RollText>
        <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
          ↗
        </span>
        <span className="sr-only">: {project.name} (opens in a new tab)</span>
      </a>
    </Tilt>
  );
}

/** Template builds. On mouse devices a preview of the site follows the cursor. */
function Archive() {
  const fine = useMediaQuery("(hover: hover) and (pointer: fine)");
  const [active, setActive] = useState<number | null>(null);
  const x = useSpring(0, { stiffness: 320, damping: 30, mass: 0.6 });
  const y = useSpring(0, { stiffness: 320, damping: 30, mass: 0.6 });

  const onPointerMove = (event: React.PointerEvent) => {
    if (event.pointerType !== "mouse") return;
    x.set(event.clientX);
    y.set(event.clientY);
  };

  return (
    <div className="shell mt-20 lg:mt-28">
      <Reveal>
        <div className="flex items-baseline justify-between border-b-2 border-ink pb-3">
          <h3 className="meta">Archive — template builds</h3>
          <span className="meta">{pad(archiveProjects.length)}</span>
        </div>
        <ul onPointerMove={fine ? onPointerMove : undefined} onPointerLeave={() => setActive(null)}>
          {archiveProjects.map((project, i) => (
            <li key={project.slug} className="border-b border-ink/25" onPointerEnter={() => setActive(i)}>
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="Visit"
                onFocus={() => setActive(null)}
                className="group grid grid-cols-[1fr_auto] items-baseline gap-4 py-4 sm:grid-cols-[minmax(10rem,16rem)_1fr_auto]"
              >
                <span className="text-xl font-semibold transition-transform duration-500 ease-expo group-hover:translate-x-2">
                  {project.name}
                </span>
                <span className="meta hidden text-ink/85 sm:block">{project.category}</span>
                <span className="meta link-dash">
                  Visit ↗<span className="sr-only"> {project.name} (opens in a new tab)</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </Reveal>

      {fine && (
        <motion.div aria-hidden="true" style={{ x, y }} className="pointer-events-none fixed top-0 left-0 z-[80]">
          <AnimatePresence>
            {active !== null && (
              <motion.div
                key={archiveProjects[active].slug}
                initial={{ opacity: 0, scale: 0.85, rotate: -8 }}
                animate={{ opacity: 1, scale: 1, rotate: -3 }}
                exit={{ opacity: 0, scale: 0.9, rotate: 0 }}
                transition={{ duration: 0.45, ease: EASE_EXPO }}
                className="absolute top-0 left-10 w-72 -translate-y-1/2 bg-ink p-1.5 shadow-[0_30px_60px_-25px_rgb(0_0_0/0.6)]"
              >
                <Image src={archiveProjects[active].image} alt="" sizes="288px" className="w-full" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
