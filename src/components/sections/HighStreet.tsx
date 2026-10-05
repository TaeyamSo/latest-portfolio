import Image from "next/image";
import Link from "next/link";
import { ViewTransition } from "react";

import { MockBadge } from "@/components/ui/MockBadge";
import { RollText } from "@/components/ui/RollText";
import { Statement } from "@/components/ui/Statement";
import { archiveProjects, caseStudyPath, chapters, featuredProjects, type Project } from "@/content/site";
import { visible } from "@/lib/mock";
import { workCardId } from "@/lib/work-return";

type Vars = React.CSSProperties & Record<`--${string}`, string | number>;

/** Each shop's paint: the wall, the trim (sign letters, frames) and the awning's two stripes. */
const PAINT = [
  { wall: "#0d0a08", trim: "#ffb629", awning: ["#fd5d16", "#fffaf4"] },
  { wall: "#3b1409", trim: "#ffd84a", awning: ["#ffb629", "#0d0a08"] },
  { wall: "#1f1611", trim: "#fd8916", awning: ["#fffaf4", "#b3300c"] },
  { wall: "#4a1d0c", trim: "#ffd84a", awning: ["#fd8916", "#fffaf4"] },
] as const;

const SHOP = "w-[80vw] shrink-0 md:w-[min(34rem,40vw,62svh)]";

/**
 * 14:00, afternoon, in town: the high street. Every client project is a
 * shopfront — its name on the sign, its live site in the window, a door out to
 * the real thing and a brass plaque with the facts. Scrolling walks along the
 * street a shop at a time (the shop you're at comes forward); the window opens
 * the case study, which grows out of the shopfront. The street ends at the
 * workshop, where the template builds are pinned to a board.
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
            <Shop key={project.slug} project={project} paint={PAINT[i % PAINT.length]} order={i} />
          ))}
          <Workshop order={featuredProjects.length} />
        </ol>
      </div>
      {/* The pavement the shops stand on. */}
      <div aria-hidden="true" className="-mx-(--gutter) h-[clamp(0.5rem,1.4svh,0.9rem)] border-t-[3px] border-ink bg-[#3b1409]" />
    </section>
  );
}

function Shop({ project, paint, order }: { project: Project; paint: (typeof PAINT)[number]; order: number }) {
  const href = project.caseStudy ? caseStudyPath(project.slug) : null;
  const details = project.details && visible(project.details) ? project.details : null;
  const [a, b] = paint.awning;
  const titleId = `shop-${project.slug}`;

  const window_ = (
    <ViewTransition name={`shot-${project.slug}`} share="case-shot" default="none">
      <div className="relative overflow-hidden bg-night" style={{ aspectRatio: `${project.image.width} / ${project.image.height}` }}>
        <Image
          src={project.image}
          alt={`${project.name} — home page screenshot`}
          fill
          sizes="(min-width: 768px) 26rem, 64vw"
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
      style={{ "--b": 2 + order, "--trim": paint.trim } as Vars}
      className={`shop group ${SHOP}`}
    >
      {/* Opening the case study grows the shopfront into the page (and back). */}
      <ViewTransition name={`case-${project.slug}`} share="case-close" default="none">
        <article aria-labelledby={titleId} className="relative text-paper">
          <h3
            id={titleId}
            className="relative mx-[5%] border-2 border-(--trim) px-3 py-[clamp(0.35rem,1svh,0.6rem)] text-center text-[clamp(0.95rem,1.5vw,1.45rem)] leading-tight font-extrabold tracking-[0.04em] text-(--trim) uppercase"
            style={{ background: paint.wall }}
          >
            {href ? (
              <Link href={href} transitionTypes={["case-open"]} className="hover:text-paper">
                {project.name}
              </Link>
            ) : (
              project.name
            )}
          </h3>

          {/* The awning: stripes, and a scalloped edge hanging below them. */}
          <div aria-hidden="true">
            <div className="h-[clamp(1.1rem,3svh,1.9rem)]" style={{ background: `repeating-linear-gradient(90deg, ${a} 0 1.4rem, ${b} 1.4rem 2.8rem)` }} />
            <div
              className="h-[0.7rem]"
              style={{
                background: `radial-gradient(circle at 50% 0, ${a} 0.7rem, transparent 0.72rem) 0 0 / 2.8rem 0.7rem repeat-x, radial-gradient(circle at 50% 0, ${b} 0.7rem, transparent 0.72rem) 1.4rem 0 / 2.8rem 0.7rem repeat-x`,
              }}
            />
          </div>

          <div className="-mt-[0.7rem] grid grid-cols-[1fr_auto] items-end gap-[4%] px-[5%] pt-[clamp(1rem,3svh,1.6rem)] pb-[4%]" style={{ background: paint.wall }}>
            <div>
              <div className="border-[3px] border-(--trim)">
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

            {/* The door: out to the real site. */}
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="relative flex aspect-[1/2.1] w-[clamp(3rem,5.5vw,4.6rem)] flex-col items-center justify-center gap-1 border-2 border-(--trim)/70 bg-black/25 text-(--trim) transition-colors hover:bg-(--trim) hover:text-ink"
            >
              <span className="meta text-[0.6rem] tracking-[0.14em]">Visit</span>
              <span aria-hidden="true">↗</span>
              <span aria-hidden="true" className="absolute top-1/2 right-[18%] size-1.5 rounded-full bg-current" />
              <span className="sr-only">{project.name} (opens in a new tab)</span>
            </a>
          </div>

          {/* The brass plaque. */}
          <dl
            className="meta grid grid-cols-2 gap-x-4 gap-y-1 border-t border-(--trim)/30 px-[5%] py-[clamp(0.5rem,1.5svh,0.8rem)] text-[0.62rem] text-paper/70"
            style={{ background: paint.wall }}
          >
            {project.role && <Detail term="Role" value={project.role} />}
            <Detail term="Sector" value={project.category} />
            {details && <Detail term="Year" value={details.year} mock={details.mock} />}
            {details && <Detail term="Stack" value={details.stack} mock={details.mock} />}
          </dl>
        </article>
      </ViewTransition>
    </li>
  );
}

function Detail({ term, value, mock }: { term: string; value: string; mock?: boolean }) {
  return (
    <div className="min-w-0">
      <dt className="flex items-center gap-1.5">
        {term}
        {mock && <MockBadge className="text-paper/70" />}
      </dt>
      <dd className="truncate tracking-[0.06em] text-paper normal-case">{value}</dd>
    </div>
  );
}

/** The end of the street: the template builds, pinned to the workshop's board. */
function Workshop({ order }: { order: number }) {
  const { title, text } = chapters.work.workshop;
  const tilt = [-2.5, 1.5, -1];
  return (
    <li data-step="" data-build="" style={{ "--b": 2 + order } as Vars} className={`shop ${SHOP}`}>
      <section aria-labelledby="workshop-title" className="border-[6px] border-[#3b1409] bg-[#7a4320] p-[5%] text-paper shadow-[inset_0_0_0_2px_rgb(0_0_0/0.15)]">
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
