import Image from "next/image";
import Link from "next/link";
import { ViewTransition } from "react";

import { RollText } from "@/components/ui/RollText";
import { Statement } from "@/components/ui/Statement";
import { archiveProjects, caseStudyPath, chapters, featuredProjects, type Project } from "@/content/site";
import { cn } from "@/lib/cn";
import { Palette, palette } from "@/lib/palette";
import { workCardId } from "@/lib/work-return";

type Vars = React.CSSProperties & Record<`--${string}`, string | number>;

/**
 * Each shop has its own front, so the street reads as a street: a classic shop
 * under a striped awning, an arched front, a gabled one with a pointed roof,
 * and a modern box with an outlined sign. `wall` is the facade, `trim` the
 * sign letters and frames, `awning` the classic shop's two stripes, `roof` the
 * gabled one's roof. At night (the second colours) the walls are night blues
 * and the signs glow in cool neon — cyan, pink, mint, lilac (globals.css).
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

type Front = (typeof FRONTS)[number];

const SHOP = "w-[80vw] shrink-0 md:w-[min(34rem,40vw,62svh)]";

/**
 * 14:00, afternoon, in town: the high street. Every client project is a
 * shopfront, each in its own style — its name on the sign, its live site in
 * the window. Scrolling walks along the street a shop at a time (the shop
 * you're at comes forward); the window opens the case study, which grows out
 * of the shopfront. The street ends at the workshop, where the template
 * builds are pinned to a board.
 */
export function HighStreet() {
  const { statement, hint } = chapters.work;
  return (
    <section
      id="work"
      data-chapter=""
      aria-labelledby="work-title"
      className="shell relative flex min-h-svh flex-col pt-[clamp(5.5rem,12svh,8rem)] pb-[1.5svh] outline-none"
    >
      <Statement id="work-title">{statement}</Statement>
      <p data-build="" style={{ "--b": 1 } as Vars} className="meta mt-3 flex items-center gap-2 text-ink/75">
        {hint} <span aria-hidden="true">→</span>
      </p>

      <div data-track-view="" className="-mx-(--gutter) mt-auto px-(--gutter) pt-6">
        <ol data-track="" aria-label="Client projects" className="items-end gap-[clamp(1rem,3vw,3rem)]">
          {featuredProjects.map((project, i) => (
            <Shop key={project.slug} project={project} front={FRONTS[i % FRONTS.length]} order={i} />
          ))}
          <Workshop order={featuredProjects.length} />
        </ol>
      </div>
      {/* The pavement the shops stand on. */}
      <div aria-hidden="true" className="-mx-(--gutter) h-[clamp(0.5rem,1.4svh,0.9rem)] border-t-[3px] border-ink bg-(--shops-street)" />
      <Palette of={PAINT} />
    </section>
  );
}

function Shop({ project, front, order }: { project: Project; front: Front; order: number }) {
  const href = project.caseStudy ? caseStudyPath(project.slug) : null;
  const titleId = `shop-${project.slug}`;
  const wall = { background: front.wall };

  const name = href ? (
    <Link href={href} transitionTypes={["case-open"]} className="hover:text-paper">
      {project.name}
    </Link>
  ) : (
    project.name
  );
  const sign = "text-[clamp(0.95rem,1.45vw,1.4rem)] leading-tight font-extrabold tracking-[0.04em] text-(--trim) uppercase";

  const window_ = (
    <ViewTransition name={`shot-${project.slug}`} share="case-shot" default="none">
      <div className="relative overflow-hidden bg-night" style={{ aspectRatio: `${project.image.width} / ${project.image.height}` }}>
        <Image
          src={project.image}
          alt={`${project.name} — home page screenshot`}
          fill
          sizes="(min-width: 768px) 30rem, 72vw"
          placeholder="blur"
          className="object-cover object-top transition-transform duration-[1200ms] ease-expo group-hover:scale-[1.04]"
        />
        {/* The glass. */}
        <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-linear-to-br from-white/18 via-transparent to-transparent" />
      </div>
    </ViewTransition>
  );

  return (
    <li
      id={workCardId(project.slug)}
      data-step=""
      data-build=""
      style={{ "--b": 2 + order, "--trim": front.trim } as Vars}
      className={`shop group ${SHOP}`}
    >
      {/* Opening the case study grows the shopfront into the page (and back). */}
      <ViewTransition name={`case-${project.slug}`} share="case-close" default="none">
        <article aria-labelledby={titleId} data-day-ink="" className="relative text-paper">
          {front.kind === "awning" && (
            <>
              <h3 id={titleId} className={cn(sign, "relative mx-[5%] border-2 border-(--trim) px-3 py-[clamp(0.35rem,1svh,0.6rem)] text-center")} style={wall}>
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
              <h3 id={titleId} className={sign}>
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
                <h3 id={titleId} className={sign}>
                  {name}
                </h3>
              </div>
            </>
          )}

          {front.kind === "modern" && (
            <>
              {/* A flat modern front: an outlined sign, then a slim canopy. */}
              <div className="px-[5%] pt-[clamp(0.7rem,2svh,1.1rem)] pb-[clamp(0.5rem,1.4svh,0.8rem)]" style={wall}>
                <h3 id={titleId} className={cn(sign, "inline-block rounded-md border-2 border-(--trim) px-3 py-1 tracking-[0.18em]")}>
                  {name}
                </h3>
              </div>
              <div aria-hidden="true" className="h-[clamp(0.45rem,1.2svh,0.7rem)]" style={{ background: front.awning[0] }} />
            </>
          )}

          {/* The shop window: the live site, opening the case study. */}
          <div
            className={cn("px-[5%] pb-[5%]", front.kind === "awning" ? "-mt-[0.7rem] pt-[clamp(1rem,3svh,1.6rem)]" : "pt-[clamp(0.8rem,2.4svh,1.3rem)]")}
            style={wall}
          >
            <div
              className={cn(
                "overflow-hidden border-[3px] border-(--trim)",
                front.kind === "arch" && "rounded-t-[clamp(1rem,3vw,2rem)]",
                front.kind === "modern" && "rounded-sm",
              )}
            >
              {href ? (
                // The window opens the case study for pointer users; keyboard users get the link below.
                <Link href={href} transitionTypes={["case-open"]} tabIndex={-1} aria-hidden="true" className="block">
                  {window_}
                </Link>
              ) : (
                window_
              )}
            </div>
            {href && (
              <Link
                href={href}
                transitionTypes={["case-open"]}
                className="group/roll mt-[clamp(0.5rem,1.6svh,0.9rem)] inline-flex items-center gap-2 rounded-full bg-(--trim) px-4 py-1.5 text-[0.82rem] font-medium text-ink transition-colors hover:bg-paper"
              >
                <RollText>Read the case study</RollText>
                <span aria-hidden="true">→</span>
                <span className="sr-only">: {project.name}</span>
              </Link>
            )}
          </div>
        </article>
      </ViewTransition>
    </li>
  );
}

/** The end of the street: the template builds, pinned to the workshop's board. */
function Workshop({ order }: { order: number }) {
  const { title, text } = chapters.work.workshop;
  const tilt = [-2.5, 1.5, -1];
  return (
    <li data-step="" data-build="" style={{ "--b": 2 + order } as Vars} className={`shop ${SHOP}`}>
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
