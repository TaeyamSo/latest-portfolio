import Image from "next/image";

import { CountInView } from "@/components/ui/CountInView";
import type { CaseStudy, WireIcon } from "@/content/site";
import { cn } from "@/lib/cn";

const pad = (n: number) => String(n).padStart(2, "0");

function Heading({ n, id, children }: { n: number; id: string; children: string }) {
  return (
    <h2 id={id} className="meta flex items-center gap-3 text-paper/60">
      <span>({pad(n)})</span>
      <span aria-hidden="true" className="h-px w-10 bg-current" />
      <span>{children}</span>
    </h2>
  );
}

/**
 * The rest of a case study, for the projects that have more to show: the
 * numbers (counting up as they come into view), what I built (a screen each),
 * the hard parts, how it is wired (drawn as the road a request travels), a
 * client's words, and what comes next. Every part is optional — a
 * project shows only what it has — and the numbering follows (`from` is the
 * first free number after the page's own sections).
 */
export function CaseExtras({ caseStudy, name, from }: { caseStudy: CaseStudy; name: string; from: number }) {
  const { metrics, clips, deepDives, challenges, architecture, quote, nextUp } = caseStudy;
  let n = from - 1;
  const next = () => ++n;

  return (
    <>
      {metrics && metrics.length > 0 && (
        <section aria-labelledby="numbers-title" className="shell py-20 lg:py-32">
          <Heading n={next()} id="numbers-title">
            By the numbers
          </Heading>
          <dl className="mt-12 grid grid-cols-2 gap-x-8 gap-y-10 border-t border-paper/15 pt-10 lg:grid-cols-5">
            {metrics.map((metric, i) => (
              <div key={metric.label}>
                <dd className="text-[clamp(2rem,4.2vw,4.4rem)] leading-none font-extrabold tracking-[-0.02em] tabular-nums">
                  <CountInView value={metric.value} delay={i * 140} />
                </dd>
                <dt className="meta mt-3 text-paper/60">{metric.label}</dt>
              </div>
            ))}
          </dl>
        </section>
      )}

      {clips && clips.length > 0 && (
        <section aria-labelledby="motion-title" className="shell py-20 lg:py-32">
          <Heading n={next()} id="motion-title">
            In motion
          </Heading>
          <ul className="mt-12 grid gap-16 lg:grid-cols-2 lg:gap-12">
            {clips.map((clip) => (
              <li key={clip.title}>
                <div className="overflow-hidden border border-paper/15 bg-night">
                  {/* Animated for most visitors; a still for those who prefer no motion. */}
                  <Image src={clip.clip} alt={clip.alt} unoptimized sizes="(min-width: 1024px) 46vw, 92vw" className="h-auto w-full motion-reduce:hidden" />
                  <Image src={clip.still} alt={clip.alt} sizes="(min-width: 1024px) 46vw, 92vw" className="hidden h-auto w-full motion-reduce:block" />
                </div>
                <h3 className="mt-6 text-2xl font-bold">{clip.title}</h3>
                <p className="mt-3 max-w-[46ch] leading-relaxed text-paper/75">{clip.text}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {deepDives && deepDives.length > 0 && (
        <section aria-labelledby="built-title" className="shell py-20 lg:py-32">
          <Heading n={next()} id="built-title">
            What I built
          </Heading>
          <ol className="mt-12 grid gap-20 lg:gap-28">
            {deepDives.map((dive, i) => (
              <li key={dive.title} className="grid items-center gap-8 lg:grid-cols-12 lg:gap-12">
                <div className={cn("lg:col-span-5", i % 2 === 1 && "lg:order-2")}>
                  <p className="meta text-sunlight">{pad(i + 1)}</p>
                  <h3 className="mt-2 text-[clamp(1.7rem,2.6vw,2.8rem)] leading-tight font-bold">{dive.title}</h3>
                  <p className="mt-4 max-w-[42ch] text-lg leading-relaxed text-paper/75">{dive.text}</p>
                </div>
                <div className={cn("lg:col-span-7", i % 2 === 1 && "lg:order-1")}>
                  <div className="relative aspect-[16/9] overflow-hidden border border-paper/15 bg-night">
                    <Image
                      src={dive.image}
                      alt={dive.alt}
                      fill
                      sizes="(min-width: 1024px) 56vw, 92vw"
                      className="object-cover object-top"
                    />
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {challenges && challenges.length > 0 && (
        <section aria-labelledby="hard-title" className="shell py-20 lg:py-32">
          <Heading n={next()} id="hard-title">
            The hard parts
          </Heading>
          <div className="mt-12 grid gap-12 lg:grid-cols-3">
            {challenges.map((challenge) => (
              <div key={challenge.title} className="border-t border-paper/15 pt-6">
                <h3 className="text-2xl font-bold">{challenge.title}</h3>
                <p className="mt-4 leading-relaxed text-paper/75">{challenge.text}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {architecture && architecture.length > 0 && (
        <section aria-labelledby="wired-title" className="shell py-20 lg:py-32">
          <Heading n={next()} id="wired-title">
            How it&rsquo;s wired
          </Heading>
          <Wiring parts={architecture} />
        </section>
      )}

      {quote && (
        <section aria-label={`What the client said about ${name}`} className="shell py-20 lg:py-32">
          <figure className="border-t border-paper/15 pt-10">
            <blockquote className="max-w-[26ch] text-[clamp(1.8rem,3.4vw,3.6rem)] leading-[1.15] font-medium">&ldquo;{quote.text}&rdquo;</blockquote>
            <figcaption className="meta mt-6 text-paper/60">{quote.by}</figcaption>
          </figure>
        </section>
      )}

      {nextUp && (
        <section aria-labelledby="next-up-title" className="shell py-20 lg:py-32">
          <Heading n={next()} id="next-up-title">
            What I&rsquo;d do next
          </Heading>
          <p className="mt-10 max-w-[40ch] text-[clamp(1.4rem,2.2vw,2.3rem)] leading-snug font-medium">{nextUp}</p>
        </section>
      )}
    </>
  );
}

type Part = { label: string; note: string; zone: "browser" | "server"; icon: WireIcon };

/** Where the parts run: consecutive parts in the same zone share one bracket. */
function zonesOf(parts: Part[]) {
  const zones: { zone: Part["zone"]; from: number; span: number }[] = [];
  parts.forEach((part, i) => {
    const last = zones[zones.length - 1];
    if (last && last.zone === part.zone) last.span++;
    else zones.push({ zone: part.zone, from: i, span: 1 });
  });
  return zones;
}

const ZONE_LABEL = { browser: "In the browser", server: "On the server" } as const;

const ICONS: Record<WireIcon, string> = {
  screen: "M3 4.5h18v12H3z M9 20h6 M12 16.5V20",
  hook: "M9 4C7 4 6 5 6 7v2c0 1.5-1 3-2 3 1 0 2 1.5 2 3v2c0 2 1 3 3 3 M15 4c2 0 3 1 3 3v2c0 1.5 1 3 2 3-1 0-2 1.5-2 3v2c0 2-1 3-3 3",
  service: "M3 12h12 M11 8l4 4-4 4 M19 5v14",
  route: "M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z M9 12l2 2 4-4",
  backend: "M5 6c0-1.7 3.1-3 7-3s7 1.3 7 3-3.1 3-7 3-7-1.3-7-3z M5 6v12c0 1.7 3.1 3 7 3s7-1.3 7-3V6 M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3",
};

/**
 * How it's wired, drawn as the road a request travels: each part is a station
 * on one wire — its picture, its number, what it is — grouped under where it
 * runs (in the browser, on the server). A spark of light runs along the wire to
 * the backend and a fainter one comes back, the answer (globals.css, "wire").
 * Across the page on wide screens, down its left side on narrow ones; still
 * with reduced motion.
 */
function Wiring({ parts }: { parts: Part[] }) {
  const zones = zonesOf(parts);
  const columns = { gridTemplateColumns: `repeat(${parts.length}, minmax(0, 1fr))` };
  return (
    <div className="mt-12">
      {/* Where each group runs: a bracket over its stations (wide screens). */}
      <div aria-hidden="true" className="hidden gap-4 lg:grid" style={columns}>
        {zones.map((zone) => (
          <div key={zone.from} style={{ gridColumn: `${zone.from + 1} / span ${zone.span}` }} className="text-center">
            <p className="meta text-sunlight">{ZONE_LABEL[zone.zone]}</p>
            <div className="mx-[8%] mt-3 h-3 border-x border-t border-paper/30" />
          </div>
        ))}
      </div>

      <div className="wire relative mt-6" style={{ "--wire-n": parts.length } as React.CSSProperties}>
        <span aria-hidden="true" className="wire-track">
          <span className="wire-spark" />
          <span className="wire-spark wire-spark-back" />
        </span>
        <ol className="wire-stations relative grid gap-10 lg:gap-4">
          {parts.map((part, i) => {
            const zoneStart = zones.find((zone) => zone.from === i);
            return (
              <li key={part.label} className="flex gap-5 lg:flex-col lg:items-center lg:gap-0 lg:text-center">
                <span
                  aria-hidden="true"
                  className="relative z-10 grid size-11 shrink-0 place-items-center rounded-full border border-paper/35 bg-ink text-paper lg:size-16"
                >
                  <svg viewBox="0 0 24 24" className="size-5 fill-none stroke-current lg:size-7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d={ICONS[part.icon]} />
                  </svg>
                </span>
                <div className="lg:mt-5">
                  {/* On narrow screens each group's name sits above its first station. */}
                  {zoneStart && <p className="meta mb-2 text-sunlight lg:hidden">{ZONE_LABEL[part.zone]}</p>}
                  <p className="meta text-paper/50">{pad(i + 1)}</p>
                  <p className="mt-1 text-xl font-bold lg:text-2xl">{part.label}</p>
                  <p className="meta mt-1.5 text-paper/60 normal-case">{part.note}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      <p className="meta mt-12 flex flex-wrap items-center gap-x-6 gap-y-2 text-paper/50 normal-case">
        <span className="inline-flex items-center gap-2">
          <span aria-hidden="true" className="size-2 rounded-full bg-sunlight" /> a request on its way in
        </span>
        <span className="inline-flex items-center gap-2">
          <span aria-hidden="true" className="size-2 rounded-full bg-paper/60" /> the answer on its way back
        </span>
      </p>
    </div>
  );
}
