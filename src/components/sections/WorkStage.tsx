import Image from "next/image";
import Link from "next/link";
import { ViewTransition } from "react";

import { WorkRail } from "@/components/sections/WorkRail";
import { BrowserFrame } from "@/components/ui/BrowserFrame";
import { RollText } from "@/components/ui/RollText";
import { Statement } from "@/components/ui/Statement";
import {
  archiveProjects,
  caseStudyPath,
  chapters,
  featuredProjects,
  flagshipProjects,
  freelanceProjects,
  type Clip,
  type Project,
} from "@/content/site";
import { cn } from "@/lib/cn";
import { workCardId } from "@/lib/work-return";
import { WORK_STEPS } from "@/lib/work-steps";

type Vars = React.CSSProperties & Record<`--${string}`, string | number>;

/** Stagger of a piece of content within its step (see `.work-rise` in globals.css). */
const rise = (n: number) => ({ "--r": n }) as Vars;

const STEP = "work-step h-full basis-full shrink-0";
const PANEL = "work-panel shell flex h-full flex-col justify-center";

const RAIL = [
  { label: "B Dashboard", step: WORK_STEPS.flagship },
  { label: "Mangos", step: WORK_STEPS.freelance },
  { label: "UAE sites", step: WORK_STEPS.clients },
  { label: "Workshop", step: WORK_STEPS.workshop },
];
const STEP_COUNT = 6;

/**
 * 14:00, and the page takes over the screen. The Work chapter is a different
 * world from the rest of the page: an opaque dark stage with a town skyline at
 * its foot, walked one project at a time — each gesture of scroll, swipe or key
 * slides the track to the next step (providers/Chapters.tsx does that, exactly
 * as it did for the old high street of shops); after the last step the next gesture
 * glides on to the following chapter. Steps: the B Dashboard (overview, then
 * what I built), Mangos, the UAE client sites, and the workshop.
 *
 * Without chapters (reduced motion) the steps simply stack, one screen each.
 */
export function WorkStage() {
  const { statement, hint } = chapters.work;
  const flagship = flagshipProjects[0];
  const mangos = freelanceProjects[0];

  return (
    <section
      id="work"
      data-chapter=""
      data-tone="dark"
      data-day-ink=""
      data-night-sky=""
      aria-labelledby="work-title"
      className="work-stage relative flex h-svh flex-col overflow-hidden pt-[clamp(4rem,10.5svh,6.5rem)] pb-[clamp(1.25rem,5svh,3.75rem)] text-paper outline-none"
    >
      <Skyline />

      <div className="shell flex flex-wrap items-end justify-between gap-x-8 gap-y-2 pb-[clamp(0.4rem,2.2svh,1.25rem)]">
        <div>
          <Statement id="work-title" className="text-[clamp(1.15rem,2.15vw,2.1rem)]">
            {statement}
          </Statement>
          <p data-build="" style={{ "--b": 1 } as Vars} className="meta mt-2 hidden items-center gap-2 text-paper/65 sm:flex">
            {hint} <span aria-hidden="true">→</span>
          </p>
        </div>
        {/* On phones the index and the counter share one row under the title. */}
        <div
          data-build=""
          style={{ "--b": 2 } as Vars}
          className="flex w-full items-center justify-between gap-3 text-paper/70 sm:w-auto sm:flex-col sm:items-end sm:justify-start sm:gap-1"
        >
          <div className="min-w-0">
            <WorkRail items={RAIL} />
          </div>
          <p aria-hidden="true" className="meta shrink-0 whitespace-nowrap tabular-nums">
            {Array.from({ length: STEP_COUNT }, (_, n) => (
              <span key={n} data-n={n} className="work-count">
                {String(n + 1).padStart(2, "0")} / {String(STEP_COUNT).padStart(2, "0")}
              </span>
            ))}
          </p>
        </div>
      </div>

      <div data-track-view="" className="relative min-h-0 flex-1">
        <ol data-track="" aria-label="Work" className="h-full">
          <Overview project={flagship} />
          <Built project={flagship} />
          <InMotion project={flagship} />
          <MangosStep project={mangos} />
          <Clients />
          <Workshop />
        </ol>
      </div>

      {/* The road: how far along the work you are. */}
      <div aria-hidden="true" className="work-progress absolute inset-x-0 bottom-0 h-[3px] bg-flame" />
    </section>
  );
}

/** Lit windows (x, y) on the skyline's buildings — they only show at night. */
const WINDOWS = [
  [124, 52], [136, 52], [124, 64], [306, 42], [318, 42], [306, 54], [436, 56], [448, 56],
  [626, 46], [640, 46], [626, 58], [806, 52], [818, 52], [1006, 56], [1018, 56], [1096, 66],
] as const;

/** The town at the foot of the stage, in dusk on ink. */
function Skyline() {
  return (
    <>
      <div aria-hidden="true" className="work-glow pointer-events-none absolute inset-0 -z-10" />
      {/* By night the sky fills with stars and the town's windows light up. */}
      <div aria-hidden="true" className="work-stars pointer-events-none absolute inset-0 -z-10" />
      <svg
        aria-hidden="true"
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[clamp(2.5rem,9svh,6rem)] w-full fill-dusk"
      >
        <path d="M0 120V82H38V62H78V92H118V42H150V72H200V52H240V96H300V32H330V66H380V86H430V46H470V76H520V56H560V102H620V36H655V72H700V52H750V92H800V42H835V82H890V62H940V96H1000V46H1040V76H1090V56H1130V86H1200V120Z" />
        <g className="work-windows" fill="#ffd84a">
          {WINDOWS.map(([x, y]) => (
            <rect key={`${x}-${y}`} x={x} y={y} width="7" height="6" />
          ))}
        </g>
      </svg>
    </>
  );
}

/* ── Small pieces ──────────────────────────────────────────────────────── */

function CaseLink({ project, className }: { project: Project; className?: string }) {
  return (
    <Link
      href={caseStudyPath(project.slug)}
      transitionTypes={["case-open"]}
      className={cn(
        "group/roll inline-flex items-center gap-2 rounded-full bg-sunlight px-5 py-2 text-[0.85rem] font-medium text-ink transition-colors hover:bg-paper",
        className,
      )}
    >
      <RollText>Read the case study</RollText>
      <span aria-hidden="true">→</span>
      <span className="sr-only">: {project.name}</span>
    </Link>
  );
}

function ExtLink({ href, children }: { href: string; children: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group/roll inline-flex items-center gap-2 rounded-full border border-paper/35 px-5 py-2 text-[0.85rem] font-medium transition-colors hover:border-paper hover:bg-paper hover:text-ink"
    >
      <RollText>{children}</RollText>
      <span aria-hidden="true">↗</span>
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

/** A project's home-page screenshot in the paper browser; the case page's frame morphs with it. */
function Shot({ project, sizes }: { project: Project; sizes: string }) {
  const { image } = project;
  return (
    <BrowserFrame url={project.url ?? project.displayUrl ?? project.name} className="work-frame">
      <ViewTransition name={`shot-${project.slug}`} share="case-shot" default="none">
        <div
          className="relative w-full overflow-hidden bg-night [@media(max-height:46rem)]:max-h-[17svh] lg:[@media(max-height:46rem)]:max-h-none"
          style={{ aspectRatio: `${image.width} / ${image.height}` }}
        >
          <Image src={image} alt={`${project.name} — screenshot`} fill sizes={sizes} className="object-cover object-top" />
        </div>
      </ViewTransition>
    </BrowserFrame>
  );
}

const Chips = ({ stack, className }: { stack?: string; className?: string }) => (
  <ul className={cn("flex flex-wrap gap-2", className)}>
    {(stack ?? "")
      .split(" · ")
      .filter(Boolean)
      .map((item) => (
        <li key={item} className="meta rounded-full border border-paper/25 px-3 py-1 text-[0.58rem] text-paper/80">
          {item}
        </li>
      ))}
  </ul>
);

/* ── Steps ─────────────────────────────────────────────────────────────── */

/** Step 1 — the flagship: what it is, in numbers, and the dashboard itself. */
function Overview({ project }: { project: Project }) {
  const numbers = (project.caseStudy?.metrics ?? []).slice(0, 4);
  return (
    <li id={workCardId(project.slug)} data-step={WORK_STEPS.flagship} aria-label={`${project.name}: overview`} className={STEP}>
      <ViewTransition name={`case-${project.slug}`} share="case-close" default="none">
        <article aria-labelledby={`work-${project.slug}-title`} className={cn(PANEL, "gap-[clamp(0.75rem,2.5svh,1.5rem)] lg:grid lg:grid-cols-12 lg:items-center lg:gap-10")}>
          <div className="lg:col-span-5">
            <p className="meta work-rise text-sunlight" style={rise(0)}>
              Flagship · NVT - PNE Foods
            </p>
            <h3
              id={`work-${project.slug}-title`}
              style={rise(1)}
              className="work-rise mt-2 text-[clamp(2.2rem,5vw,5.2rem)] leading-[0.88] font-extrabold tracking-[-0.03em] uppercase lg:mt-3"
            >
              {project.name}
            </h3>
            <p style={rise(2)} className="work-rise mt-3 max-w-[30ch] text-[clamp(1rem,1.55vw,1.5rem)] leading-snug font-medium lg:mt-4">
              The operations platform a multi-store pizza business runs on.
            </p>
            <p style={rise(3)} className="work-rise mt-2 hidden max-w-[44ch] text-[0.95rem] leading-snug text-paper/70 sm:block">
              Live store monitoring, hiring, scheduling and analytics, in English and Arabic.
            </p>
            <dl style={rise(4)} className="work-rise mt-[clamp(0.75rem,2.5svh,1.5rem)] grid grid-cols-4 gap-x-3 gap-y-3 border-t border-paper/15 pt-3 sm:gap-x-5">
              {numbers.map((metric) => (
                <div key={metric.label}>
                  <dd className="text-[clamp(1.25rem,2.6vw,2.4rem)] leading-none font-extrabold tabular-nums">{metric.value}</dd>
                  <dt className="meta mt-1.5 text-[0.5rem] leading-tight text-paper/65 sm:text-[0.56rem]">{metric.short ?? metric.label}</dt>
                </div>
              ))}
            </dl>
            <Chips stack={project.stack} className="work-rise mt-4 hidden sm:flex short:hidden" />
            <div style={rise(6)} className="work-rise mt-[clamp(0.75rem,2.5svh,1.5rem)]">
              <CaseLink project={project} />
            </div>
          </div>
          <div style={rise(2)} className="work-rise lg:col-span-7">
            <Shot project={project} sizes="(min-width: 1024px) 58vw, 92vw" />
          </div>
        </article>
      </ViewTransition>
    </li>
  );
}

/** Step 2 — the flagship's three biggest pieces, one screen each. */
function Built({ project }: { project: Project }) {
  const dives = project.caseStudy?.deepDives ?? [];
  return (
    <li id={`${workCardId(project.slug)}-built`} data-step={WORK_STEPS.built} aria-label={`${project.name}: what I built`} className={STEP}>
      <div className={cn(PANEL, "gap-[clamp(0.75rem,2.5svh,1.75rem)]")}>
        <p className="meta work-rise text-sunlight" style={rise(0)}>
          B Dashboard · what I built
        </p>
        <ul className="grid gap-[clamp(0.6rem,2svh,1.25rem)] lg:grid-cols-3 lg:gap-6">
          {dives.map((dive, i) => (
            <li key={dive.title} style={rise(i + 1)} className="work-rise grid grid-cols-[34%_1fr] items-start gap-3 lg:block">
              <div className="relative aspect-[16/10] overflow-hidden border border-paper/15 bg-night lg:aspect-[16/9]">
                <Image
                  src={dive.image}
                  alt={dive.alt}
                  fill
                  sizes="(min-width: 1024px) 30vw, 34vw"
                  className="object-cover object-top"
                />
              </div>
              <div>
                <h4 className="text-[clamp(1rem,1.5vw,1.4rem)] leading-tight font-bold lg:mt-3">{dive.title}</h4>
                <p className="mt-1 line-clamp-3 text-[0.82rem] leading-snug text-paper/75 sm:text-[0.9rem] lg:line-clamp-5 [@media(max-height:46rem)]:line-clamp-2">{dive.text}</p>
              </div>
            </li>
          ))}
        </ul>
        <div style={rise(4)} className="work-rise flex flex-wrap items-center justify-between gap-x-8 gap-y-3 border-t border-paper/15 pt-[clamp(0.6rem,2svh,1.1rem)]">
          <p className="max-w-[48ch] text-[0.9rem] leading-snug text-paper/80">
            Largest contributor: <strong className="font-bold text-paper">301 of 497 commits</strong>, one of 4 core developers.
          </p>
          <CaseLink project={project} />
        </div>
      </div>
    </li>
  );
}

/** A recording of a tool at work: animated for most visitors, a still for those who prefer no motion. */
function ClipImage({ clip, sizes }: { clip: Clip; sizes: string }) {
  return (
    <div className="relative w-full overflow-hidden bg-night" style={{ aspectRatio: `${clip.still.width} / ${clip.still.height}` }}>
      {/* Off-screen (the track slides to it), so it would load late — fetch it early, at low priority. */}
      <Image src={clip.clip} alt={clip.alt} fill unoptimized loading="eager" fetchPriority="low" sizes={sizes} className="object-cover object-center motion-reduce:hidden" />
      <Image src={clip.still} alt={clip.alt} fill sizes={sizes} className="hidden object-cover object-center motion-reduce:block" />
    </div>
  );
}

/** Step 3 — the flagship in motion: two of the tools I built, as they run. */
function InMotion({ project }: { project: Project }) {
  const clips = project.caseStudy?.clips ?? [];
  return (
    <li id={`${workCardId(project.slug)}-motion`} data-step={WORK_STEPS.motion} aria-label={`${project.name}: in motion`} className={STEP}>
      <div className={cn(PANEL, "gap-[clamp(0.75rem,2.5svh,1.75rem)]")}>
        <p className="meta work-rise text-sunlight" style={rise(0)}>
          B Dashboard · in motion
        </p>
        <ul className="grid gap-[clamp(0.75rem,2.5svh,1.25rem)] sm:grid-cols-2 sm:gap-6 lg:gap-10">
          {clips.map((clip, i) => (
            <li key={clip.title} style={rise(i + 1)} className="work-rise">
              <div className={cn(i > 0 && "max-sm:hidden")}>
                <BrowserFrame url="internal tool — screen recording" className="work-frame">
                  <ClipImage clip={clip} sizes="(min-width: 640px) 44vw, 92vw" />
                </BrowserFrame>
              </div>
              <h4 className="mt-2.5 text-[clamp(1rem,1.5vw,1.4rem)] leading-tight font-bold">{clip.title}</h4>
              <p className="mt-1 line-clamp-2 text-[0.82rem] leading-snug text-paper/75 sm:line-clamp-3 sm:text-[0.9rem]">{clip.text}</p>
            </li>
          ))}
        </ul>
        <div style={rise(3)} className="work-rise">
          <CaseLink project={project} />
        </div>
      </div>
    </li>
  );
}

/** Step 4 — Mangos: the home page, the same site on a phone, and where to see it. */
function MangosStep({ project }: { project: Project }) {
  const phone = project.caseStudy?.gallery?.[1];
  return (
    <li id={workCardId(project.slug)} data-step={WORK_STEPS.freelance} aria-label={`${project.name}: freelance website`} className={STEP}>
      <ViewTransition name={`case-${project.slug}`} share="case-close" default="none">
        <article aria-labelledby={`work-${project.slug}-title`} className={cn(PANEL, "gap-[clamp(0.75rem,2.5svh,1.5rem)] lg:grid lg:grid-cols-12 lg:items-center lg:gap-10")}>
          <div className="lg:col-span-5">
            <p className="meta work-rise text-sunlight" style={rise(0)}>
              Freelance · Jul–Sep 2026 · Columbus, Ohio
            </p>
            <h3
              id={`work-${project.slug}-title`}
              style={rise(1)}
              className="work-rise mt-2 text-[clamp(2.2rem,5vw,5.2rem)] leading-[0.88] font-extrabold tracking-[-0.03em] uppercase lg:mt-3"
            >
              {project.name}
            </h3>
            <p style={rise(2)} className="work-rise mt-3 max-w-[32ch] text-[clamp(1rem,1.55vw,1.5rem)] leading-snug font-medium lg:mt-4">
              A website for a two-venue restaurant group, where each venue&rsquo;s photo grows into its own page.
            </p>
            <p style={rise(3)} className="work-rise mt-2 hidden max-w-[44ch] text-[0.95rem] leading-snug text-paper/70 sm:block">
              A bar and hookah lounge, and a Mediterranean grill: one brand, two experiences.
            </p>
            <Chips stack={project.stack} className="work-rise mt-4 hidden sm:flex short:hidden" />
            <div style={rise(5)} className="work-rise mt-[clamp(0.75rem,2.5svh,1.5rem)] flex flex-wrap gap-3">
              <CaseLink project={project} />
              {project.linkable && project.url && <ExtLink href={project.url}>Visit the live site</ExtLink>}
              {project.repo && <ExtLink href={project.repo}>Read the code</ExtLink>}
            </div>
          </div>
          <div style={rise(2)} className="work-rise relative lg:col-span-7">
            <div className="w-full sm:w-[86%]">
              <Shot project={project} sizes="(min-width: 1024px) 50vw, 92vw" />
            </div>
            {phone && (
              <div className="absolute right-0 bottom-[-4%] hidden w-[19%] overflow-hidden rounded-[1.1rem] border-[3px] border-paper bg-night shadow-[0_30px_50px_-20px_rgb(0_0_0/0.9)] sm:block">
                <Image src={phone.image} alt={phone.alt} sizes="12vw" className="aspect-[780/1688] w-full object-cover object-top" />
              </div>
            )}
          </div>
        </article>
      </ViewTransition>
    </li>
  );
}

/** Step 5 — the four UAE client websites. */
function Clients() {
  return (
    <li data-step={WORK_STEPS.clients} aria-label="Websites for UAE businesses" className={STEP}>
      <div className={cn(PANEL, "gap-[clamp(0.75rem,2.5svh,1.75rem)]")}>
        <div>
          <p className="meta work-rise text-sunlight" style={rise(0)}>
            Websites for UAE businesses
          </p>
          <h3 style={rise(1)} className="work-rise mt-2 max-w-[24ch] text-[clamp(1.5rem,3vw,2.8rem)] leading-[1.04] font-extrabold tracking-[-0.02em]">
            Bilingual in English and Arabic. I built the front end.
          </h3>
        </div>
        <ul className="grid grid-cols-2 gap-x-3 gap-y-[clamp(0.6rem,2svh,1.25rem)] lg:grid-cols-4 lg:gap-5">
          {featuredProjects.map((project, i) => (
            <ClientTile key={project.slug} project={project} order={i} />
          ))}
        </ul>
      </div>
    </li>
  );
}

function ClientTile({ project, order }: { project: Project; order: number }) {
  const href = caseStudyPath(project.slug);
  const titleId = `tile-${project.slug}`;
  return (
    <li id={workCardId(project.slug)} style={rise(order + 2)} className="work-rise">
      <ViewTransition name={`case-${project.slug}`} share="case-close" default="none">
        <article aria-labelledby={titleId} className="group">
          <Link href={href} transitionTypes={["case-open"]} tabIndex={-1} aria-hidden="true" className="block">
            <ViewTransition name={`shot-${project.slug}`} share="case-shot" default="none">
              <div className="relative aspect-[4/3] overflow-hidden border border-paper/20 bg-night [@media(max-height:46rem)]:aspect-[16/9]">
                <Image
                  src={project.image}
                  alt={`${project.name} — home page screenshot`}
                  fill
                  sizes="(min-width: 1024px) 22vw, 44vw"
                  className="object-cover object-top transition-transform duration-[1200ms] ease-expo group-hover:scale-[1.04]"
                />
              </div>
            </ViewTransition>
          </Link>
          <h4 id={titleId} className="mt-2.5 text-[clamp(0.92rem,1.2vw,1.15rem)] leading-tight font-bold">
            {project.name}
          </h4>
          <p className="meta mt-1 hidden text-[0.54rem] leading-snug text-paper/65 sm:block">{project.category}</p>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[0.8rem]">
            <Link href={href} transitionTypes={["case-open"]} className="link-dash">
              Case study<span className="sr-only">: {project.name}</span> →
            </Link>
            {project.linkable && project.url && (
              <a href={project.url} target="_blank" rel="noopener noreferrer" className="link-dash">
                Visit ↗<span className="sr-only"> {project.name} (opens in a new tab)</span>
              </a>
            )}
          </div>
        </article>
      </ViewTransition>
    </li>
  );
}

/** Step 6 — the end of the road: the template builds, pinned to the workshop's board. */
function Workshop() {
  const { title, text } = chapters.work.workshop;
  const tilt = [-2.5, 1.5, -1];
  const builds = archiveProjects.filter((project) => project.url);
  return (
    <li data-step={WORK_STEPS.workshop} aria-label={title} className={STEP}>
      <div className={cn(PANEL, "items-center")}>
        <section
          aria-labelledby="workshop-title"
          style={rise(0)}
          className="work-rise w-full max-w-[min(54rem,100%)] border-[6px] border-ink bg-dusk p-[clamp(0.9rem,3vw,2rem)] text-paper shadow-[inset_0_0_0_2px_rgb(255_255_255/0.06)]"
        >
          <h3 id="workshop-title" className="text-[clamp(1.1rem,1.7vw,1.6rem)] font-extrabold tracking-[0.04em] uppercase">
            {title}
          </h3>
          <p className="mt-1 text-[0.9rem] leading-snug text-paper/80">{text}</p>
          <ul className="mt-[clamp(0.9rem,3svh,1.75rem)] grid grid-cols-3 gap-[4%]">
            {builds.map((project, i) => (
              <li key={project.slug} style={{ rotate: `${tilt[i % tilt.length]}deg` }} className="work-note relative bg-paper p-1.5 text-ink shadow-[0_10px_18px_-10px_rgb(0_0_0/0.6)] sm:p-2">
                <span aria-hidden="true" className="absolute -top-1.5 left-1/2 size-2.5 -translate-x-1/2 rounded-full bg-flame shadow-[0_1px_0_rgb(0_0_0/0.4)]" />
                <a href={project.url} target="_blank" rel="noopener noreferrer" className="group/note block">
                  <Image src={project.image} alt="" sizes="(min-width: 640px) 16rem, 28vw" className="aspect-[4/3] w-full object-cover object-top" />
                  <span className="mt-1.5 block text-[0.78rem] leading-tight font-semibold sm:text-[0.9rem]">{project.name}</span>
                  <span className="meta hidden text-[0.52rem] leading-snug text-ink/70 sm:block">{project.category}</span>
                  <span className="meta mt-1 block text-[0.55rem] group-hover/note:text-flame">
                    Visit ↗<span className="sr-only"> {project.name} (opens in a new tab)</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </li>
  );
}
