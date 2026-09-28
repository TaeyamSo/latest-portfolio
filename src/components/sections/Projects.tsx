"use client";

import { animate, motion } from "motion/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { EASE_EXPO, Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Tilt } from "@/components/ui/Tilt";
import { projects } from "@/content/site";
import { cn } from "@/lib/cn";

const pad = (n: number) => String(n).padStart(2, "0");
const displayUrl = (url: string) => url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

export function Projects() {
  const [active, setActive] = useState(0);
  const [previous, setPrevious] = useState<number | null>(null);
  const tabs = useRef<Array<HTMLButtonElement | null>>([]);

  const select = (index: number) => {
    if (index === active) return;
    setPrevious(active);
    setActive(index);
  };

  const onKeyDown = (event: React.KeyboardEvent, index: number) => {
    const last = projects.length - 1;
    const keys: Record<string, number> = {
      ArrowDown: index === last ? 0 : index + 1,
      ArrowRight: index === last ? 0 : index + 1,
      ArrowUp: index === 0 ? last : index - 1,
      ArrowLeft: index === 0 ? last : index - 1,
      Home: 0,
      End: last,
    };
    const next = keys[event.key];
    if (next === undefined) return;
    event.preventDefault();
    select(next);
    tabs.current[next]?.focus();
  };

  return (
    <section
      id="projects"
      aria-labelledby="projects-title"
      className="shell relative flex min-h-svh items-center py-[clamp(7rem,16vh,12rem)] outline-none"
    >
      <div className="grid w-full gap-x-16 gap-y-12 lg:grid-cols-12 lg:gap-y-14">
        <SectionHeading className="lg:col-span-12" id="projects-title" index="05" label="Selected work" title="Projects" />

        <div className="lg:col-span-7 lg:col-start-6 lg:row-start-2 lg:self-center">
          <Monitor active={active} previous={previous} />
        </div>

        <Reveal className="lg:col-span-5 lg:row-start-2 lg:self-center" delay={0.1}>
          <div role="tablist" aria-orientation="vertical" aria-labelledby="projects-title" className="-mx-4">
            {projects.map((project, i) => {
              const selected = i === active;
              return (
                <button
                  key={project.slug}
                  ref={(el) => {
                    tabs.current[i] = el;
                  }}
                  type="button"
                  role="tab"
                  id={`project-tab-${project.slug}`}
                  aria-selected={selected}
                  aria-controls="project-panel"
                  tabIndex={selected ? 0 : -1}
                  onClick={() => select(i)}
                  onKeyDown={(event) => onKeyDown(event, i)}
                  className={cn(
                    "group relative isolate flex w-full items-center gap-4 px-4 py-3 text-left transition-colors duration-300",
                    selected ? "text-paper" : "hover:text-paper",
                  )}
                >
                  {selected && (
                    <motion.span
                      layoutId="project-highlight"
                      aria-hidden="true"
                      className="absolute inset-0 -z-10 bg-ink"
                      transition={{ type: "spring", stiffness: 420, damping: 38 }}
                    />
                  )}
                  <span className="meta w-6 opacity-70">{pad(i + 1)}</span>
                  <span className="text-[clamp(1.15rem,1.55vw,1.5rem)] font-semibold transition-transform duration-300 ease-expo group-hover:translate-x-1.5">
                    {project.name}
                  </span>
                  <span className="meta ml-auto hidden opacity-60 sm:block">
                    {project.kind === "Client" ? "Client" : "Template"}
                  </span>
                </button>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/** The original "monitor": black bezel, a neck, and "Visit website" as its base. */
function Monitor({ active, previous }: { active: number; previous: number | null }) {
  const layers = useRef<Array<HTMLDivElement | null>>([]);
  const first = useRef(true);
  const project = projects[active];

  // Wipe the newly selected screenshot in from the left, over the previous one.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const layer = layers.current[active];
    if (!layer) return;
    const controls = animate(
      layer,
      { clipPath: ["inset(0% 100% 0% 0%)", "inset(0% 0% 0% 0%)"] },
      { duration: 0.95, ease: EASE_EXPO },
    );
    // If another project is picked mid-wipe, finish this one so it sits fully underneath.
    return () => controls.complete();
  }, [active]);

  return (
    <Reveal from="right" className="mx-auto w-full max-w-[54rem]">
      <Tilt max={4}>
        <div className="bg-ink p-2.5 shadow-[0_50px_90px_-40px_rgb(0_0_0/0.65)] sm:p-3.5">
          <div className="flex items-center gap-3 px-1.5 pb-2.5 sm:pb-3">
            <span aria-hidden="true" className="flex gap-1.5">
              <span className="size-2.5 rounded-full bg-flame" />
              <span className="size-2.5 rounded-full bg-amber" />
              <span className="size-2.5 rounded-full bg-sunlight" />
            </span>
            <span className="meta flex-1 truncate rounded-full bg-paper/10 px-3 py-1 text-center text-[0.6rem] tracking-[0.08em] text-paper/70 normal-case">
              {displayUrl(project.url)}
            </span>
          </div>

          <div
            id="project-panel"
            role="tabpanel"
            aria-labelledby={`project-tab-${project.slug}`}
            className="relative aspect-[16/9] overflow-hidden bg-night"
          >
            {projects.map((item, i) => {
              const isActive = i === active;
              const isPrevious = i === previous;
              return (
                <div
                  key={item.slug}
                  ref={(el) => {
                    layers.current[i] = el;
                  }}
                  aria-hidden={!isActive}
                  className={cn(
                    "absolute inset-0 transition-transform duration-[1200ms] ease-expo",
                    isActive ? "z-20" : isPrevious ? "z-10 scale-[1.04]" : "invisible z-0",
                  )}
                >
                  <Image
                    src={item.image}
                    alt={isActive ? `${item.name} — home page screenshot` : ""}
                    fill
                    sizes="(min-width: 1024px) 50vw, 92vw"
                    placeholder="blur"
                    className="object-cover object-top"
                  />
                </div>
              );
            })}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-30 bg-linear-to-br from-white/12 via-transparent to-transparent"
            />
          </div>
        </div>

        <div aria-hidden="true" className="mx-auto h-10 w-4 bg-ink sm:h-12" />
        <a
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group mx-auto flex w-56 items-center justify-center gap-2 bg-ink py-3 text-sm font-medium tracking-wide text-paper transition-colors duration-300 hover:bg-paper hover:text-ink"
        >
          Visit website
          <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
            ↗
          </span>
          <span className="sr-only">: {project.name} (opens in a new tab)</span>
        </a>
      </Tilt>
      <p className="meta mt-6 text-center text-ink/75">
        {project.category} · {project.kind}
      </p>
    </Reveal>
  );
}
