import Image from "next/image";

import type { CaseStudy } from "@/content/site";
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
 * numbers, what I built (a screen each), the hard parts, how it is wired, more
 * screens, a client's words, and what comes next. Every part is optional — a
 * project shows only what it has — and the numbering follows (`from` is the
 * first free number after the page's own sections).
 */
export function CaseExtras({ caseStudy, name, from }: { caseStudy: CaseStudy; name: string; from: number }) {
  const { metrics, clips, deepDives, challenges, architecture, gallery, quote, nextUp } = caseStudy;
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
            {metrics.map((metric) => (
              <div key={metric.label}>
                <dd className="text-[clamp(2rem,4.2vw,4.4rem)] leading-none font-extrabold tracking-[-0.02em] tabular-nums">{metric.value}</dd>
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
                  <Image src={clip.still} alt={clip.alt} placeholder="blur" sizes="(min-width: 1024px) 46vw, 92vw" className="hidden h-auto w-full motion-reduce:block" />
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
                      placeholder="blur"
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
          <ol className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:flex lg:items-stretch lg:gap-0">
            {architecture.map((part, i) => (
              <li key={part.label} className="flex items-center lg:flex-1">
                <div className="h-full w-full border border-paper/25 p-5">
                  <p className="meta text-sunlight">{pad(i + 1)}</p>
                  <p className="mt-2 text-xl font-bold">{part.label}</p>
                  <p className="meta mt-2 text-paper/60 normal-case">{part.note}</p>
                </div>
                {i < architecture.length - 1 && (
                  <span aria-hidden="true" className="hidden px-3 text-2xl text-paper/50 lg:block">
                    →
                  </span>
                )}
              </li>
            ))}
          </ol>
        </section>
      )}

      {gallery && gallery.length > 0 && (
        <section aria-labelledby="screens-title" className="shell py-20 lg:py-32">
          <Heading n={next()} id="screens-title">
            More screens
          </Heading>
          <ul className="mt-12 grid items-start gap-10 md:grid-cols-2 lg:gap-12">
            {gallery.map((shot) => (
              <li key={shot.caption}>
                <div className="overflow-hidden border border-paper/15 bg-night">
                  <Image
                    src={shot.image}
                    alt={shot.alt}
                    placeholder="blur"
                    sizes="(min-width: 768px) 46vw, 92vw"
                    className="h-auto w-full"
                  />
                </div>
                <p className="meta mt-3 text-paper/60 normal-case">{shot.caption}</p>
              </li>
            ))}
          </ul>
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
