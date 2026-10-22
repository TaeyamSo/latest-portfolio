import Image from "next/image";

import { RollText } from "@/components/ui/RollText";
import { Statement } from "@/components/ui/Statement";
import { Tilt } from "@/components/ui/Tilt";
import { chapters, experience, study } from "@/content/site";

type Vars = React.CSSProperties & Record<`--${string}`, string | number>;

/** Keep hyphenated words like "Front-End" on one line (non-breaking hyphen). */
const unbroken = (text: string) => text.replace(/-/g, "‑");

/** A frosted panel (paper tint + blur, so light by day and dark glass at night) under each entry, so its text reads over the coast. */
const PANEL =
  "rounded-2xl border border-ink/15 bg-paper/75 px-3.5 py-[clamp(0.5rem,1.4svh,1rem)] shadow-[0_0.5rem_1.75rem_-0.75rem_rgb(0_0_0/0.35)] backdrop-blur-sm transition-[translate,background-color,box-shadow] duration-300 ease-expo group-focus-within/stop:bg-paper/85 group-hover/stop:bg-paper/85 group-hover/stop:shadow-[0_1rem_2.25rem_-0.75rem_rgb(0_0_0/0.45)] md:px-4 motion-safe:group-hover/stop:-translate-y-1.5 xl:px-5 [@media(max-height:46rem)]:py-2";

/**
 * 17:45, golden hour, on the coast. A timeline: a line runs through the four
 * stops — the current job, the one before, the Meta certificate (a compact
 * verifiable entry, with the certificate itself shown large) and the degree —
 * and each stop hangs off it on a frosted panel. Across the page on wide
 * screens, down the left on narrow ones.
 */
export function Journey() {
  const { degree, certificate } = study;
  const [now, before] = experience;

  return (
    <section id="journey" data-chapter aria-labelledby="journey-title" className="chapter shell relative outline-none">
      <Statement id="journey-title">{chapters.journey.statement}</Statement>

      <ol className="relative mt-[clamp(1rem,3.5svh,3rem)] flex flex-col gap-3 pl-8 lg:grid lg:grid-cols-[1fr_1fr_1.5fr_0.95fr] lg:items-start lg:gap-x-4 lg:pl-0 xl:gap-x-6">
        <span
          aria-hidden="true"
          className="tl-line absolute top-3 bottom-3 left-[0.7rem] w-0.5 rounded-full bg-ink/70 lg:top-[0.4rem] lg:right-0 lg:bottom-auto lg:left-4 lg:h-0.5 lg:w-auto"
        />

        <Stop order={1} now>
          <p className="meta text-ink">{now.period}</p>
          <h3 className={TITLE}>{unbroken(now.title)}</h3>
          <p className={TEXT}>{now.text}</p>
        </Stop>

        <Stop order={2}>
          <p className="meta text-ink">{before.period}</p>
          <h3 className={TITLE}>{unbroken(before.title)}</h3>
          <p className={TEXT}>{before.text}</p>
        </Stop>

        <Stop order={3}>
          <p className="meta text-ink">
            {certificate.date} · {certificate.kind}
          </p>
          <h3 className={TITLE}>{unbroken(certificate.title)}</h3>
          <p className="mt-2 text-[clamp(0.92rem,1vw,1.05rem)] text-ink [@media(max-height:46rem)]:mt-1">
            {certificate.issuer} · {certificate.courses.length} courses
          </p>
          <div className="mt-[clamp(0.6rem,1.8svh,1rem)] flex flex-col gap-[clamp(0.6rem,1.8svh,1rem)] [@media(max-height:46rem)]:flex-row [@media(max-height:46rem)]:items-center">
            <div className="flex flex-wrap items-center gap-3">
              <Image
                src={certificate.badge}
                alt="Meta Front-End Developer certificate badge"
                className="size-11 [@media(max-height:46rem)]:hidden"
                sizes="44px"
              />
              <a
                href={certificate.verifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group group/roll inline-flex shrink-0 items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-medium whitespace-nowrap text-paper transition-colors hover:bg-paper hover:text-ink"
              >
                <RollText>Verify credential</RollText>
                <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                  ↗
                </span>
                <span className="sr-only">(opens Coursera in a new tab)</span>
              </a>
            </div>
            <Tilt sheen max={6} className="hidden w-fit min-w-0 md:block">
              <a
                href={certificate.verifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open the Meta Front-End Developer certificate on Coursera (new tab)"
                className="block bg-ink p-1 shadow-[0_18px_30px_-16px_rgb(0_0_0/0.6)] transition-transform duration-500 ease-expo hover:-rotate-1"
              >
                <Image
                  src={certificate.image}
                  alt={certificate.imageAlt}
                  // Served as is (1266px wide): the optimiser's small, compressed copy turned the fine print soft.
                  unoptimized
                  className="h-[clamp(4.5rem,19svh,14rem)] w-auto max-w-full [@media(max-height:46rem)]:h-[min(15svh,6rem)]"
                />
              </a>
            </Tilt>
          </div>
        </Stop>

        <Stop order={4}>
          <p className="meta text-ink">Degree</p>
          <h3 className={TITLE}>{degree.title}</h3>
          <p className="mt-2 text-[clamp(0.92rem,1vw,1.05rem)] text-ink [@media(max-height:46rem)]:mt-1">{degree.school}</p>
        </Stop>
      </ol>
    </section>
  );
}

const TITLE = "mt-2 text-[clamp(1.3rem,1.9vw,1.9rem)] leading-tight font-semibold [@media(max-height:46rem)]:mt-1";
const TEXT =
  "mt-2 text-[clamp(0.92rem,1vw,1.05rem)] leading-relaxed text-ink [@media(max-height:46rem)]:mt-1 [@media(max-height:46rem)]:leading-snug";

/**
 * One stop on the timeline: a dot on the line, a short stem, and the panel. The
 * current stop (`now`) has a ring that slowly pulses. Builds in with the chapter.
 * Reacts to the cursor and to keyboard focus: its dot swells and turns hollow,
 * the stem darkens, and the panel lifts and firms up.
 */
function Stop({ order, now = false, children }: { order: number; now?: boolean; children: React.ReactNode }) {
  return (
    <li data-build="" style={{ "--b": order } as Vars} className="group/stop relative lg:pt-7">
      <span
        aria-hidden="true"
        className={`absolute top-[1.25rem] -left-[1.68rem] size-3.5 rounded-full border-2 border-paper bg-ink transition-[scale,background-color,border-color] duration-300 ease-expo group-focus-within/stop:scale-[1.45] group-focus-within/stop:border-ink group-focus-within/stop:bg-paper group-hover/stop:scale-[1.45] group-hover/stop:border-ink group-hover/stop:bg-paper lg:top-0 lg:left-4 ${now ? "tl-now" : ""}`}
      />
      <span
        aria-hidden="true"
        className="absolute top-[1.65rem] -left-[1.25rem] h-0.5 w-[1.25rem] bg-ink/70 transition-colors duration-300 group-focus-within/stop:bg-ink group-hover/stop:bg-ink lg:top-3.5 lg:left-[calc(1rem+0.4375rem-1px)] lg:h-3.5 lg:w-0.5"
      />
      <div className={PANEL}>{children}</div>
    </li>
  );
}
