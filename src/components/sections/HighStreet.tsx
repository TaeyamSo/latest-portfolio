import Image from "next/image";
import Link from "next/link";
import { ViewTransition } from "react";

import { CountUp } from "@/components/ui/CountUp";
import { RollText } from "@/components/ui/RollText";
import { Statement } from "@/components/ui/Statement";
import {
  archiveProjects,
  caseStudyPath,
  chapters,
  featuredProjects,
  flagshipProjects,
  freelanceProjects,
  type Project,
} from "@/content/site";
import { cn } from "@/lib/cn";
import { Palette, palette } from "@/lib/palette";
import { workCardId } from "@/lib/work-return";

type Vars = React.CSSProperties & Record<`--${string}`, string | number>;

/**
 * Each shop has its own front, so the street reads as a street: the flagship
 * store, two storeys high; a classic shop under a striped awning; an arched
 * front; a gabled one with a pointed roof; and a modern box with an outlined
 * sign. `wall` is the facade, `trim` the sign letters and frames, `awning`
 * the striped shops' two stripes, `roof` the gabled one's roof. At night (the
 * second colours) the walls are night blues and the signs glow in cool neon —
 * cyan, pink, mint, lilac, a soft yellow for the restaurant (globals.css).
 */
const PAINT = palette("shops", {
  wall0: ["#0d0a08", "#0f1330"],
  trim0: ["#ffb629", "#8fe3ff"],
  awnA0: ["#fd5d16", "#3a4a8c"],
  awnB0: ["#fffaf4", "#c9d0ec"],
  wall1: ["#3b1409", "#24183f"],
  trim1: ["#ffd84a", "#ff9ec4"],
  wall2: ["#1f1611", "#112434"],
  trim2: ["#fd8916", "#9ff0c8"],
  roof2: ["#fd8916", "#2c3a6a"],
  wall3: ["#4a1d0c", "#1c1a44"],
  trim3: ["#ffd84a", "#c9b6ff"],
  awnA3: ["#fd8916", "#4a3f8c"],
  // The flagship store: dark stone, a gold sign; by night a cyan one.
  wallF: ["#120d0a", "#0c1230"],
  upperF: ["#2a1209", "#18204a"],
  trimF: ["#ffd84a", "#8fe3ff"],
  // The restaurant group: mango stripes; by night a soft yellow neon.
  wallM: ["#2a1608", "#14203f"],
  trimM: ["#ffd84a", "#fff3a0"],
  awnAM: ["#ff9f1c", "#3b4a8c"],
  awnBM: ["#fff4d6", "#c9d0ec"],
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

const FRONTS = [
  { kind: "awning", wall: P.wall0, trim: P.trim0, roof: P.trim0, awning: [P.awnA0, P.awnB0] },
  { kind: "arch", wall: P.wall1, trim: P.trim1, roof: P.trim1, awning: [P.trim1, P.wall0] },
  { kind: "gable", wall: P.wall2, trim: P.trim2, roof: P.roof2, awning: [P.awnB0, P.wall2] },
  { kind: "modern", wall: P.wall3, trim: P.trim3, roof: P.trim3, awning: [P.awnA3, P.awnB0] },
] as const;

type Front = { kind: (typeof FRONTS)[number]["kind"]; wall: string; trim: string; roof: string; awning: readonly [string, string] };

/** Mangos, a restaurant group: the striped awning, in mango. */
const RESTAURANT: Front = { kind: "awning", wall: P.wallM, trim: P.trimM, roof: P.trimM, awning: [P.awnAM, P.awnBM] };
/** The UAE client sites: the arched, gabled, modern and striped fronts in turn. */
const CLIENT_FRONTS: readonly Front[] = [FRONTS[1], FRONTS[2], FRONTS[3], FRONTS[0]];

/**
 * Every store takes about half the screen, so the one you're at and the next
 * are all you see. From laptops up (and on phones on their side) a store is a proper shopfront: the display
 * window on the left, the board beside it like a sign by the door — wide
 * rather than tall, so the street fits under the title.
 */
const STORE = "w-[84vw] shrink-0 md:w-[min(48vw,120svh)] short:w-[100svh]";
/** The workshop's board of notes, a little narrower on phones on their side. */
const WORKSHOP = "w-[84vw] shrink-0 md:w-[min(48vw,120svh)] short:w-[70svh]";

/** A bird sitting on a roof: where along it (%), which way it faces, and when it first pecks (s). */
type Perch = { at: number; flip?: boolean; delay: number };
const FLAGSHIP_BIRDS: Perch[] = [
  { at: 9, delay: 0.8 },
  { at: 15, delay: 3.1, flip: true },
];
/** The birds on the other shops, in street order (Mangos, then the UAE sites). */
const SHOP_BIRDS: Perch[][] = [[{ at: 74, delay: 1.9, flip: true }], [{ at: 50, delay: 4.2 }], [{ at: 50, delay: 1.2, flip: true }], [{ at: 20, delay: 2.6 }, { at: 28, delay: 5.3, flip: true }]];

const SIGN = "text-[clamp(1.05rem,1.75vw,1.75rem)] leading-tight font-extrabold tracking-[0.04em] text-(--trim) uppercase";

/**
 * 14:00, afternoon, in town: the high street. Every project is a shop about
 * half the screen wide — the one you're at and the next are all you see —
 * its name on the sign, its site in the window (an "Open" sign hanging in
 * it) and a board below saying what it is, what Tayam did and when, what it's
 * built with, and the ways in: the case study, and the live site where it
 * loads. First the flagship store — the B Dashboard, two storeys, its numbers
 * counting up when the chapter arrives — then Mangos, then the UAE client
 * sites, each in its own style. Lamp posts stand between the
 * stores (lit at night), planters by some doors, and birds sit on the roofs,
 * now and then pecking or hopping. Scrolling walks along the street a shop at a
 * time (the shop you're at comes forward); the window opens the case study,
 * which grows out of the shopfront. The street ends at the workshop, where
 * the template builds are pinned to a board.
 */
export function HighStreet() {
  const { statement, hint } = chapters.work;
  const [flagship] = flagshipProjects;
  const shops = [
    ...freelanceProjects.map((project) => ({ project, front: RESTAURANT })),
    ...featuredProjects.map((project, i) => ({ project, front: CLIENT_FRONTS[i % CLIENT_FRONTS.length] })),
  ];
  const first = flagship ? 1 : 0;

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
          {shops.map(({ project, front }, i) => (
            <Shop key={project.slug} project={project} front={front} order={first + i} birds={SHOP_BIRDS[i] ?? []} planter={i % 2 === 0} />
          ))}
          <Workshop order={first + shops.length} />
        </ol>
      </div>
      {/* The pavement the shops stand on. */}
      <div aria-hidden="true" className="-mx-(--gutter) h-[clamp(0.5rem,1.4svh,0.9rem)] border-t-[3px] border-ink bg-(--shops-street)" />
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

/** The live site (or the product's screen) behind the glass; the case page's frame morphs with it. */
function ShopWindow({ project, sizes, className }: { project: Project; sizes: string; className?: string }) {
  const href = project.caseStudy ? caseStudyPath(project.slug) : null;
  const glass = (
    <ViewTransition name={`shot-${project.slug}`} share="case-shot" default="none">
      <div className="relative overflow-hidden bg-night" style={{ aspectRatio: `${project.image.width} / ${project.image.height}` }}>
        <Image
          src={project.image}
          alt={`${project.name} — ${project.kind === "Flagship" ? "dashboard" : "home page"} screenshot`}
          fill
          sizes={sizes}
          placeholder="blur"
          className="object-cover object-top transition-transform duration-[1200ms] ease-expo group-hover:scale-[1.04]"
        />
        {/* The glass. */}
        <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-linear-to-br from-white/18 via-transparent to-transparent" />
      </div>
    </ViewTransition>
  );
  return (
    <div className={cn("relative overflow-hidden border-[3px] border-(--trim)", className)}>
      {/* The sign hanging in the window. */}
      <span
        aria-hidden="true"
        className="shop-open meta pointer-events-none absolute top-[5%] right-[4%] z-10 rounded-sm border-2 border-(--trim) bg-black/60 px-1.5 py-0.5 text-[clamp(0.5rem,0.7vw,0.65rem)] text-(--trim)"
      >
        Open
      </span>
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
 * The board under the window: what the project is; what Tayam did and when;
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
 * The flagship store, first on the street: two storeys — a row of upper
 * windows (lit at night) over the name sign and a "Flagship" plate — then
 * the ground floor's display window with the dashboard and its key numbers
 * beside it, counting up, and the board under them.
 */
function FlagshipStore({ project }: { project: Project }) {
  const titleId = `shop-${project.slug}`;
  const numbers = (project.caseStudy?.metrics ?? []).slice(0, 4);
  return (
    <li
      id={workCardId(project.slug)}
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
          {/* The upper storey. */}
          <div className="px-[4%] pt-[clamp(0.55rem,1.6svh,0.9rem)] pb-[clamp(0.45rem,1.3svh,0.75rem)]" style={{ background: P.upperF }}>
            <div aria-hidden="true" className="grid grid-cols-6 gap-[3%] short:hidden">
              {Array.from({ length: 6 }, (_, i) => (
                <span key={i} className="shop-upper-window h-[clamp(0.6rem,1.8svh,1rem)] border border-(--trim)/50 bg-black/30" />
              ))}
            </div>
            <div className="mt-[clamp(0.45rem,1.3svh,0.75rem)] flex items-center justify-between gap-3 border-y-2 border-(--trim) py-[clamp(0.3rem,0.9svh,0.55rem)]">
              <h3 id={titleId} className={cn(SIGN, "text-[clamp(1.1rem,1.9vw,1.85rem)]")}>
                <ShopName project={project} />
              </h3>
              <span className="meta shrink-0 rounded-sm bg-(--trim) px-2 py-0.5 text-[0.58rem] text-ink">Flagship</span>
            </div>
          </div>

          {/* The ground floor: the display window, and beside it its numbers and the board. */}
          <div className="px-[4%] pt-[clamp(0.7rem,2svh,1.1rem)] pb-[4%]" style={{ background: P.wallF }}>
            <div className="lg:grid lg:grid-cols-[1fr_36%] lg:items-start lg:gap-x-[4%] short:grid short:grid-cols-[1fr_36%] short:items-start short:gap-x-[4%]">
              <ShopWindow project={project} sizes="(min-width: 768px) 30vw, 84vw" />
              <div className="flex flex-col">
                {numbers.length > 0 && (
                  <dl className="mt-[clamp(0.5rem,1.6svh,0.9rem)] grid grid-cols-4 gap-2 md:mt-0 md:grid-cols-2 md:gap-x-3 md:gap-y-[clamp(0.4rem,1.2svh,0.8rem)] short:hidden">
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
                <ShopInfo project={project} />
              </div>
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

function Shop({ project, front, order, birds, planter }: { project: Project; front: Front; order: number; birds: Perch[]; planter: boolean }) {
  const titleId = `shop-${project.slug}`;
  const wall = { background: front.wall };
  const name = <ShopName project={project} />;

  return (
    <li
      id={workCardId(project.slug)}
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
          {front.kind === "awning" && (
            <>
              <h3 id={titleId} className={cn(SIGN, "relative mx-[5%] border-2 border-(--trim) px-3 py-[clamp(0.35rem,1svh,0.6rem)] text-center")} style={wall}>
                {name}
              </h3>
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
            </>
          )}

          {front.kind === "arch" && (
            // An arched front: the name set in the curve of the top.
            <div
              className="border-x-[3px] border-t-[3px] border-(--trim) px-[12%] pt-[clamp(1.8rem,5.5svh,3rem)] pb-[clamp(0.4rem,1.2svh,0.7rem)] text-center"
              style={{ ...wall, borderRadius: "50% 50% 0 0 / 100% 100% 0 0" }}
            >
              <h3 id={titleId} className={SIGN}>
                {name}
              </h3>
            </div>
          )}

          {front.kind === "gable" && (
            <>
              {/* A pointed roof, its gable in the trim colour with a round window. */}
              <div aria-hidden="true" className="relative mx-[3%] h-[clamp(2.4rem,8svh,4.2rem)]" style={{ background: front.roof, clipPath: "polygon(50% 0, 100% 100%, 0 100%)" }}>
                <span className="absolute bottom-[18%] left-1/2 size-[clamp(0.5rem,1.4svh,0.8rem)] -translate-x-1/2 rounded-full" style={wall} />
              </div>
              <div className="border-b-4 border-(--trim) px-[6%] py-[clamp(0.4rem,1.2svh,0.7rem)] text-center" style={wall}>
                <h3 id={titleId} className={SIGN}>
                  {name}
                </h3>
              </div>
            </>
          )}

          {front.kind === "modern" && (
            <>
              {/* A flat modern front: an outlined sign, then a slim canopy. */}
              <div className="px-[5%] pt-[clamp(0.7rem,2svh,1.1rem)] pb-[clamp(0.5rem,1.4svh,0.8rem)]" style={wall}>
                <h3 id={titleId} className={cn(SIGN, "inline-block rounded-md border-2 border-(--trim) px-3 py-1 tracking-[0.18em]")}>
                  {name}
                </h3>
              </div>
              <div aria-hidden="true" className="h-[clamp(0.45rem,1.2svh,0.7rem)]" style={{ background: front.awning[0] }} />
            </>
          )}

          {/* The shop window, the plaque, and the way in. */}
          <div
            className={cn(
              "px-[5%] pb-[5%] lg:grid lg:grid-cols-[1fr_36%] lg:items-start lg:gap-x-[4%] short:grid short:grid-cols-[1fr_36%] short:items-start short:gap-x-[4%]",
              front.kind === "awning" ? "-mt-[0.7rem] pt-[clamp(1rem,3svh,1.6rem)]" : "pt-[clamp(0.8rem,2.4svh,1.3rem)]",
            )}
            style={wall}
          >
            <ShopWindow
              project={project}
              sizes="(min-width: 768px) 30vw, 84vw"
              className={cn(front.kind === "arch" && "rounded-t-[clamp(1rem,3vw,2rem)]", front.kind === "modern" && "rounded-sm")}
            />
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
