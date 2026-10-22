import Image from "next/image";
import Link from "next/link";
import { ViewTransition } from "react";

import { UaeStore, type UaeSlide } from "@/components/sections/UaeStore";
import { CountUp } from "@/components/ui/CountUp";
import { RollText } from "@/components/ui/RollText";
import { Statement } from "@/components/ui/Statement";
import { WindowSlides } from "@/components/ui/WindowSlides";
import {
  archiveProjects,
  caseStudyPath,
  chapters,
  flagshipProjects,
  freelanceProjects,
  uaeStore,
  type Project,
} from "@/content/site";
import { cn } from "@/lib/cn";
import { Palette, palette } from "@/lib/palette";
import { SIGN, STORE, WORKSHOP, type Vars } from "@/lib/street";
import { UAE_STORE_ID, workCardId } from "@/lib/work-return";

/**
 * By day the walls are dark wood and stone and the signs gold; at night (the
 * second colours) the walls are night blues and the signs glow in cool neon —
 * cyan for the flagship, a soft yellow for the restaurant, lilac for the UAE
 * store (globals.css), so no orange is left in the dark but the lamps and the
 * windows.
 */
const PAINT = palette("shops", {
  // The flagship store: dark stone, a gold sign; by night a cyan one.
  wallF: ["#120d0a", "#0c1230"],
  upperF: ["#2a1209", "#18204a"],
  trimF: ["#ffd84a", "#8fe3ff"],
  // The restaurant group: mango stripes; by night a soft yellow neon.
  wallM: ["#2a1608", "#14203f"],
  trimM: ["#ffd84a", "#fff3a0"],
  awnAM: ["#ff9f1c", "#3b4a8c"],
  awnBM: ["#fff4d6", "#c9d0ec"],
  // The UAE store: warm brown and an arched board; by night lilac neon.
  wallU: ["#2b160a", "#10183a"],
  archU: ["#4a1d0c", "#1c1a44"],
  trimU: ["#ffd84a", "#c9b6ff"],
  // Between the stores: lamp posts, their glass (lit at night), planters.
  post: ["#3b1409", "#141a3a"],
  glass: ["#fff1c4", "#ffcf6e"],
  pot: ["#b84d1a", "#2c3770"],
  bush: ["#c25a20", "#1f2a5e"],
  bird: ["#3b1409", "#0a0e22"],
  street: ["#3b1409", "#141a3a"],
  board: ["#7a4320", "#2a2f55"],
});
const P = PAINT.C;

/** Mangos, a restaurant group: a shop under a striped awning, in mango. */
const RESTAURANT = { wall: P.wallM, trim: P.trimM, awning: [P.awnAM, P.awnBM] } as const;

/** A bird sitting on a roof: where along it (%), which way it faces, and when it first pecks (s). */
type Perch = { at: number; flip?: boolean; delay: number };
const FLAGSHIP_BIRDS: Perch[] = [
  { at: 9, delay: 0.8 },
  { at: 15, delay: 3.1, flip: true },
];
const MANGOS_BIRDS: Perch[] = [{ at: 74, delay: 1.9, flip: true }];
/** On the crown of the UAE store's arch, where the curve meets the top of the store. */
const UAE_BIRDS: Perch[] = [
  { at: 45, delay: 2.6 },
  { at: 53, delay: 5.3, flip: true },
];

/** The short names on the UAE store's hanging tabs. */
const UAE_LABELS: Record<string, string> = { baddar: "Baddar", hazo: "Hazo", alaktabout: "Al Aktabout", "al-ain": "Al Ain" };

/**
 * 14:00, afternoon, in town: the high street. Every project is a store about
 * half the screen wide — the one you're at and the next are all you see — with
 * its name on the sign and a line under it saying what it is, its site in
 * the window, and a board beside it saying what
 * Tayam did and when, what it's built with, and the ways in: the case study,
 * and the live site where it loads. First the flagship store — the B Dashboard,
 * two storeys under a big rooftop sign, its window playing the product's
 * screens and its numbers counting up when the chapter arrives — then Mangos,
 * then one store for the UAE client sites, whose window shows them in turn.
 * Lamp posts stand between the stores (lit at night), planters by some doors,
 * and birds sit on the roofs, now and then pecking or hopping. Scrolling walks
 * along the street a store at a time (the store you're at comes forward); the
 * window opens the case study, which grows out of the shopfront. The street
 * ends at the workshop, where the template builds are pinned to a board.
 */
export function HighStreet() {
  const { statement, hint } = chapters.work;
  const [flagship] = flagshipProjects;
  const [mangos] = freelanceProjects;
  const uaeSlides: UaeSlide[] = uaeStore.projects.map((project) => ({
    slug: project.slug,
    name: project.name,
    label: UAE_LABELS[project.slug] ?? project.name,
    category: project.category,
    role: project.role,
    image: project.image,
    alt: `${project.name} — home page screenshot`,
    href: project.caseStudy ? caseStudyPath(project.slug) : null,
    live: project.url && project.linkable !== false ? project.url : null,
  }));

  return (
    <section
      id="work"
      data-chapter=""
      aria-labelledby="work-title"
      className="shell relative flex min-h-svh flex-col pt-[clamp(5.5rem,12svh,8rem)] pb-[1.5svh] outline-none short:pt-[3.9rem]"
    >
      <Statement id="work-title" className="short:text-[1.4rem]">
        {statement}
      </Statement>
      <p data-build="" style={{ "--b": 1 } as Vars} className="meta mt-3 flex items-center gap-2 text-ink/75 short:hidden">
        {hint} <span aria-hidden="true">→</span>
      </p>

      <div data-track-view="" className="-mx-(--gutter) mt-auto px-(--gutter) pt-[clamp(0.5rem,2.5svh,1.5rem)] short:pt-1">
        <ol data-track="" aria-label="Projects" className="items-end gap-(--street-gap) [--street-gap:clamp(1rem,3vw,3rem)]">
          {flagship && <FlagshipStore project={flagship} />}
          {mangos && <Shop project={mangos} order={1} birds={MANGOS_BIRDS} planter />}
          <UaeStore
            id={UAE_STORE_ID}
            projects={uaeStore.projects.map((project) => project.slug)}
            order={2}
            title={uaeStore.title}
            tagline={uaeStore.tagline}
            slides={uaeSlides}
            className={STORE}
            roof={UAE_BIRDS.map((perch) => (
              <RoofBird key={perch.at} {...perch} />
            ))}
          >
            <Planter />
            <StreetLamp />
          </UaeStore>
          <Workshop order={3} />
        </ol>
      </div>
      {/* The pavement the stores stand on: it builds in and steps aside with them. */}
      <div
        aria-hidden="true"
        data-build=""
        style={{ "--b": 2 } as Vars}
        className="-ml-[calc(var(--gutter)+var(--rail))] -mr-(--gutter) h-[clamp(0.5rem,1.4svh,0.9rem)] border-t-[3px] border-ink bg-(--shops-street)"
      />
      <Palette of={PAINT} />
    </section>
  );
}

/** The shop's sign: its name, linking to the case study when there is one. */
function ShopName({ project }: { project: Project }) {
  return project.caseStudy ? (
    <Link href={caseStudyPath(project.slug)} transitionTypes={["case-open"]} className="hover:text-paper">
      {project.name}
    </Link>
  ) : (
    project.name
  );
}

/**
 * The display window: the project's screens behind the glass (WindowSlides —
 * they move while the street rests at this store). The case page's frame
 * morphs with the glass.
 */
function ShopWindow({ project, sizes, className }: { project: Project; sizes: string; className?: string }) {
  const href = project.caseStudy ? caseStudyPath(project.slug) : null;
  const slides = project.windowSlides ?? [
    { image: project.image, alt: `${project.name} — ${project.kind === "Flagship" ? "dashboard" : "home page"} screenshot` },
  ];
  const glass = (
    <ViewTransition name={`shot-${project.slug}`} share="case-shot" default="none">
      <div className="relative overflow-hidden bg-night" style={{ aspectRatio: `${project.image.width} / ${project.image.height}` }}>
        <WindowSlides slides={slides} sizes={sizes} />
        {/* The glass. */}
        <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-linear-to-br from-white/18 via-transparent to-transparent" />
      </div>
    </ViewTransition>
  );
  return (
    <div className={cn("relative overflow-hidden border-[3px] border-(--trim)", className)}>
      {href ? (
        // The window opens the case study for pointer users; keyboard users get the link below.
        <Link href={href} transitionTypes={["case-open"]} tabIndex={-1} aria-hidden="true" className="block">
          {glass}
        </Link>
      ) : (
        glass
      )}
    </div>
  );
}

/**
 * The board beside the window: what the project is; what Tayam did and when;
 * what it's built with; and the ways in — the case study, and the live site
 * when it loads. On short screens only the ways in stay.
 */
function ShopInfo({ project }: { project: Project }) {
  const credit = [project.role, project.period].filter(Boolean).join(" · ");
  const stack = (project.stack ?? "").split(" · ").filter(Boolean).slice(0, 5);
  const live = project.url && project.linkable !== false ? project.url : null;
  return (
    <div className="mt-[clamp(0.55rem,1.6svh,0.95rem)] lg:mt-0 short:mt-0">
      <p className="text-[clamp(0.85rem,1.05vw,1.05rem)] leading-snug font-semibold text-paper short:hidden">{project.category}</p>
      {credit && <p className="meta mt-1 text-[0.62rem] leading-snug text-paper/70 short:hidden">{credit}</p>}
      {stack.length > 0 && (
        <ul className="mt-[clamp(0.4rem,1.1svh,0.6rem)] flex flex-wrap gap-1.5 short:hidden [@media(max-height:46rem)]:hidden">
          {stack.map((item) => (
            <li key={item} className="meta rounded-full border border-paper/25 px-2 py-0.5 text-[0.55rem] text-paper/80">
              {item}
            </li>
          ))}
        </ul>
      )}
      <div className="mt-[clamp(0.55rem,1.6svh,0.9rem)] flex flex-wrap items-center gap-2">
        {project.caseStudy && (
          <Link
            href={caseStudyPath(project.slug)}
            transitionTypes={["case-open"]}
            className="group/roll inline-flex items-center gap-2 rounded-full bg-(--trim) px-4 py-1.5 text-[0.85rem] font-medium text-ink transition-colors hover:bg-paper"
          >
            <RollText>Read the case study</RollText>
            <span aria-hidden="true">→</span>
            <span className="sr-only">: {project.name}</span>
          </Link>
        )}
        {live && (
          <a
            href={live}
            target="_blank"
            rel="noopener noreferrer"
            className="group/roll inline-flex items-center gap-2 rounded-full border border-(--trim)/70 px-4 py-1.5 text-[0.85rem] font-medium text-(--trim) transition-colors hover:bg-(--trim) hover:text-ink"
          >
            <RollText>Visit site</RollText>
            <span aria-hidden="true">↗</span>
            <span className="sr-only">: {project.name} (opens in a new tab)</span>
          </a>
        )}
      </div>
    </div>
  );
}

/**
 * The flagship store, first on the street: a big rooftop sign over two
 * storeys — a marquee board with the name in lights and what it is, standing
 * on two posts — a row of upper windows (lit at night), then the ground
 * floor's display window with the dashboard moving in it, the key numbers
 * under it, counting up, and the board beside them.
 */
function FlagshipStore({ project }: { project: Project }) {
  const titleId = `shop-${project.slug}`;
  const numbers = (project.caseStudy?.metrics ?? []).slice(0, 4);
  return (
    <li
      id={workCardId(project.slug)}
      data-projects={project.slug}
      data-step=""
      data-build=""
      style={{ "--b": 2, "--trim": P.trimF } as Vars}
      className={`shop group relative ${STORE}`}
    >
      {/* Opening the case study grows the storefront into the page (and back). */}
      <ViewTransition name={`case-${project.slug}`} share="case-close" default="none">
        <article aria-labelledby={titleId} data-day-ink="" className="relative text-paper">
          {FLAGSHIP_BIRDS.map((perch) => (
            <RoofBird key={perch.at} {...perch} />
          ))}

          {/* The rooftop sign: the name in lights. */}
          <div className="relative mx-[1.5%] mb-[clamp(0.45rem,1.4svh,0.8rem)]">
            <div className="border-x-4 border-(--trim) px-[3%] py-[clamp(0.3rem,0.9svh,0.55rem)]" style={{ background: P.wallF }}>
              <div aria-hidden="true" className="sign-bulbs short:hidden [@media(max-height:46rem)]:hidden" />
              <div className="flex items-center justify-between gap-3 py-[clamp(0.2rem,0.8svh,0.5rem)]">
                <div className="min-w-0">
                  <h3
                    id={titleId}
                    className="sign-title text-[clamp(1.6rem,4.1vw,4.2rem)] leading-none font-extrabold tracking-[0.05em] text-(--trim) uppercase [@media(max-height:46rem)]:text-[clamp(1.4rem,3.3vw,2.6rem)] short:text-[1.3rem]"
                  >
                    <ShopName project={project} />
                  </h3>
                  {project.tagline && (
                    <p className="mt-[clamp(0.2rem,0.6svh,0.4rem)] text-[clamp(0.7rem,1.1vw,1.1rem)] leading-snug text-paper/90 short:hidden">{project.tagline}</p>
                  )}
                </div>
                <span className="meta shrink-0 -rotate-3 rounded-sm bg-(--trim) px-2 py-0.5 text-[0.58rem] text-ink">Flagship</span>
              </div>
              <div aria-hidden="true" className="sign-bulbs sign-bulbs-b short:hidden [@media(max-height:46rem)]:hidden" />
            </div>
            {/* The posts it stands on. */}
            <span aria-hidden="true" className="absolute top-full left-[12%] h-[0.7rem] w-[0.45rem] bg-(--trim) short:hidden [@media(max-height:46rem)]:hidden" />
            <span aria-hidden="true" className="absolute top-full right-[12%] h-[0.7rem] w-[0.45rem] bg-(--trim) short:hidden [@media(max-height:46rem)]:hidden" />
          </div>

          {/* The upper storey. */}
          <div className="px-[4%] py-[clamp(0.45rem,1.3svh,0.75rem)] short:hidden [@media(max-height:46rem)]:hidden" style={{ background: P.upperF }}>
            <div aria-hidden="true" className="grid grid-cols-6 gap-[3%]">
              {Array.from({ length: 6 }, (_, i) => (
                <span key={i} className="shop-upper-window h-[clamp(0.6rem,1.8svh,1rem)] border border-(--trim)/50 bg-black/30" />
              ))}
            </div>
          </div>

          {/* The ground floor: the display window, and beside it its numbers and the board. */}
          <div className="px-[4%] pt-[clamp(0.7rem,2svh,1.1rem)] pb-[4%]" style={{ background: P.wallF }}>
            <div className="lg:grid lg:grid-cols-[1fr_36%] lg:items-start lg:gap-x-[4%] short:grid short:grid-cols-[1fr_36%] short:items-start short:gap-x-[4%]">
              <div>
                <ShopWindow project={project} sizes="(min-width: 768px) 30vw, 84vw" />
                {numbers.length > 0 && (
                  <dl className="mt-[clamp(0.6rem,1.8svh,1rem)] grid grid-cols-4 gap-2 md:gap-x-3 short:hidden">
                    {numbers.map((metric, i) => (
                      <div key={metric.label} className="flex flex-col-reverse border-t-2 border-(--trim)/60 pt-1">
                        <dt className="meta text-[0.56rem] leading-tight text-paper/70">{metric.short ?? metric.label}</dt>
                        <dd className="text-[clamp(1.15rem,1.9vw,1.9rem)] leading-none font-extrabold text-(--trim)">
                          <CountUp value={metric.value} chapter="work" delay={450 + i * 120} />
                        </dd>
                      </div>
                    ))}
                  </dl>
                )}
              </div>
              <ShopInfo project={project} />
            </div>
          </div>
        </article>
      </ViewTransition>
      <StreetLamp />
    </li>
  );
}

/** A bird sitting on a roof's edge; now and then it pecks, or hops (globals.css). */
function RoofBird({ at, flip, delay }: Perch) {
  return (
    <span
      aria-hidden="true"
      className="roof-bird pointer-events-none absolute bottom-full w-[clamp(0.85rem,1.5vw,1.25rem)] -translate-x-1/2"
      style={{ left: `${at}%`, "--delay": `${delay}s` } as Vars}
    >
      <svg viewBox="0 0 20 14" className={cn("block w-full overflow-visible", flip && "-scale-x-100")}>
        <g className="roof-bird-body" fill={P.bird}>
          <path d="M3,8.5 Q5,4.6 10,5 Q14.4,5.3 15.6,8 Q14,11.6 9,11.6 Q5,11.6 3,8.5 Z" />
          <circle cx="15" cy="4.7" r="2.5" />
          <path d="M17.2,4.2 L19.6,4.9 L17.2,5.6 Z" />
          <path d="M3.5,8.6 L0,6.6 L0.7,9.9 Z" />
        </g>
        <path d="M8.6,11.4 V14 M11,11.4 V14" stroke={P.bird} strokeWidth="0.9" />
      </svg>
    </span>
  );
}

/** A lamp post in the gap after a store, its glass lit at night with a pool of light on the pavement. */
function StreetLamp() {
  return (
    <span
      aria-hidden="true"
      className="street-prop pointer-events-none absolute bottom-0 left-[calc(100%+var(--street-gap)/2)] h-[clamp(4.5rem,22svh,11rem)] -translate-x-1/2"
    >
      <span className="street-lamp-pool absolute -bottom-[0.35rem] left-1/2 h-[0.7rem] w-[clamp(3rem,6vw,5.5rem)] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgb(255_207_110/0.55),transparent)]" />
      <span className="street-lamp-glow absolute top-[9%] left-1/2 size-[clamp(3rem,6vw,5rem)] -translate-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(255_207_110/0.5),transparent)]" />
      <svg viewBox="0 0 16 120" preserveAspectRatio="xMidYMax meet" className="relative block h-full w-auto overflow-visible">
        <g fill={P.post}>
          <rect x="7" y="19" width="2" height="97" />
          <rect x="4.5" y="114" width="7" height="6" rx="1" />
          <path d="M2.5,6.5 L8,2 L13.5,6.5 Z" />
          <rect x="6" y="17" width="4" height="3" />
        </g>
        <rect className="street-lamp-glass" x="4" y="6.5" width="8" height="10.5" fill={P.glass} />
        <path d="M4,6.5 H12 V17 H4 Z M8,6.5 V17" fill="none" stroke={P.post} strokeWidth="1" />
      </svg>
    </span>
  );
}

/** A planter by a shop's door. */
function Planter() {
  return (
    <svg aria-hidden="true" viewBox="0 0 30 26" className="street-prop pointer-events-none absolute right-[3%] bottom-0 z-10 w-[clamp(1.3rem,2.2vw,2rem)]">
      <g fill={P.bush}>
        <circle cx="9" cy="11" r="6" />
        <circle cx="16" cy="8" r="7" />
        <circle cx="22" cy="12" r="5.5" />
      </g>
      <path d="M4,15 H26 L23.5,26 H6.5 Z" fill={P.pot} />
      <rect x="3" y="14" width="24" height="3" fill={P.pot} />
    </svg>
  );
}

/**
 * Mangos: a shop under a striped awning — its name and what it is on the
 * sign, then the window and the board.
 */
function Shop({ project, order, birds, planter }: { project: Project; order: number; birds: Perch[]; planter: boolean }) {
  const titleId = `shop-${project.slug}`;
  const front = RESTAURANT;
  const wall = { background: front.wall };

  return (
    <li
      id={workCardId(project.slug)}
      data-projects={project.slug}
      data-step=""
      data-build=""
      style={{ "--b": 2 + order, "--trim": front.trim } as Vars}
      className={`shop group relative ${STORE}`}
    >
      {/* Opening the case study grows the shopfront into the page (and back). */}
      <ViewTransition name={`case-${project.slug}`} share="case-close" default="none">
        <article aria-labelledby={titleId} data-day-ink="" className="relative text-paper">
          {birds.map((perch) => (
            <RoofBird key={perch.at} {...perch} />
          ))}
          <div className="relative mx-[5%] border-2 border-(--trim) px-3 py-[clamp(0.35rem,1svh,0.6rem)] text-center" style={wall}>
            <h3 id={titleId} className={SIGN}>
              <ShopName project={project} />
            </h3>
            {project.tagline && (
              <p className="mt-0.5 text-[clamp(0.65rem,0.9vw,0.9rem)] leading-snug font-medium text-paper/85 short:hidden">{project.tagline}</p>
            )}
          </div>
          {/* The awning: stripes, and a scalloped edge hanging below them. */}
          <div aria-hidden="true">
            <div
              className="h-[clamp(1.1rem,3svh,1.9rem)]"
              style={{ background: `repeating-linear-gradient(90deg, ${front.awning[0]} 0 1.4rem, ${front.awning[1]} 1.4rem 2.8rem)` }}
            />
            <div
              className="h-[0.7rem]"
              style={{
                background: `radial-gradient(circle at 50% 0, ${front.awning[0]} 0.7rem, transparent 0.72rem) 0 0 / 2.8rem 0.7rem repeat-x, radial-gradient(circle at 50% 0, ${front.awning[1]} 0.7rem, transparent 0.72rem) 1.4rem 0 / 2.8rem 0.7rem repeat-x`,
              }}
            />
          </div>

          {/* The shop window, the board, and the way in. */}
          <div
            className="-mt-[0.7rem] px-[5%] pt-[clamp(1rem,3svh,1.6rem)] pb-[5%] lg:grid lg:grid-cols-[1fr_36%] lg:items-start lg:gap-x-[4%] short:grid short:grid-cols-[1fr_36%] short:items-start short:gap-x-[4%]"
            style={wall}
          >
            <ShopWindow project={project} sizes="(min-width: 768px) 30vw, 84vw" />
            <ShopInfo project={project} />
          </div>
        </article>
      </ViewTransition>
      {planter && <Planter />}
      <StreetLamp />
    </li>
  );
}

/** The end of the street: the template builds, pinned to the workshop's board. */
function Workshop({ order }: { order: number }) {
  const { title, text } = chapters.work.workshop;
  const tilt = [-2.5, 1.5, -1];
  return (
    <li data-step="" data-build="" style={{ "--b": 2 + order } as Vars} className={`shop ${WORKSHOP}`}>
      <section aria-labelledby="workshop-title" data-day-ink="" className="border-[6px] border-(--shops-street) bg-(--shops-board) p-[5%] text-paper shadow-[inset_0_0_0_2px_rgb(0_0_0/0.15)]">
        <h3 id="workshop-title" className="text-[clamp(1rem,1.5vw,1.4rem)] font-extrabold tracking-[0.04em] uppercase">
          {title}
        </h3>
        <p className="mt-1 text-[0.85rem] leading-snug text-paper/80">{text}</p>
        <ul className="mt-[clamp(0.75rem,2.5svh,1.25rem)] grid grid-cols-3 gap-[4%]">
          {archiveProjects.map((project, i) => (
            <li key={project.slug} style={{ rotate: `${tilt[i % tilt.length]}deg` }} className="relative bg-paper p-1.5 text-ink shadow-[0_10px_18px_-10px_rgb(0_0_0/0.6)]">
              <span aria-hidden="true" className="absolute -top-1.5 left-1/2 size-2.5 -translate-x-1/2 rounded-full bg-flame shadow-[0_1px_0_rgb(0_0_0/0.4)]" />
              <a href={project.url} target="_blank" rel="noopener noreferrer" className="group/note block">
                <Image src={project.image} alt="" sizes="9rem" className="aspect-[4/3] w-full object-cover object-top" />
                <span className="mt-1.5 block text-[0.8rem] leading-tight font-semibold">{project.name}</span>
                <span className="meta block text-[0.52rem] leading-snug text-ink/70">{project.category}</span>
                <span className="meta mt-1 block text-[0.55rem] group-hover/note:text-flame">
                  Visit ↗<span className="sr-only"> {project.name} (opens in a new tab)</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </li>
  );
}
