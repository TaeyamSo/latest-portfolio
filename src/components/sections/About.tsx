import { Duotone } from "@/components/ui/Duotone";
import { Statement } from "@/components/ui/Statement";
import { Tilt } from "@/components/ui/Tilt";
import { about, facts, profile } from "@/content/site";

import { AboutBalloon } from "./AboutBalloon";

type Vars = React.CSSProperties & Record<`--${string}`, string | number>;

/**
 * 08:30, morning, in the foothills. Who Tayam is, in one sentence and two
 * short paragraphs, beside the portrait — with a hot-air balloon floating up
 * beside it, which you can grab (AboutBalloon). The numbers aren't a stats row: they
 * are signposts planted in the hills below, rising out of the ground once the
 * rest has built in.
 */
export function About() {
  return (
    <section id="about" data-chapter aria-labelledby="about-title" className="chapter shell relative outline-none">
      <div className="grid w-full items-center gap-x-16 gap-y-8 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <Statement id="about-title">{about.statement}</Statement>
          <div
            data-build=""
            style={{ "--b": 1 } as Vars}
            className="mt-[clamp(1.25rem,3.5svh,2.25rem)] max-w-[52ch] space-y-3 text-[clamp(0.95rem,1.05vw,1.1rem)] leading-relaxed text-ink/85"
          >
            {about.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>

        <div data-build="" style={{ "--b": 2 } as Vars} className="relative hidden sm:block lg:col-span-5 lg:justify-self-end">
          <AboutBalloon />
          <Tilt max={6} className="w-[min(100%,21rem,36svh)]">
            <figure className="group bg-ink p-3.5 sm:p-4">
              <div className="overflow-hidden">
                <Duotone
                  src={about.portrait.src}
                  alt={about.portrait.alt}
                  sizes="(min-width: 1024px) 21rem, 50vw"
                  className="transition-transform duration-700 ease-expo group-hover:scale-110"
                />
              </div>
              <figcaption className="meta mt-3 flex justify-between gap-4 text-paper/65">
                <span>{profile.fullName}</span>
                <span>{profile.role}</span>
              </figcaption>
            </figure>
          </Tilt>
        </div>
      </div>

      <Signposts />
    </section>
  );
}

/**
 * Wooden signposts in the morning foothills: the numbers, planted in the
 * landscape. Now and then one shakes on its post, and they shake when you
 * point at them.
 */
function Signposts() {
  const tilt = [-3, 2, -1.5];
  return (
    <ul
      aria-label="In numbers"
      data-day-ink=""
      className="pointer-events-none absolute inset-x-0 bottom-0 flex h-[max(var(--strip),5.5rem)] items-end justify-center gap-3 sm:gap-[clamp(1.5rem,7vw,7rem)] overflow-hidden px-(--gutter) sm:justify-end sm:pr-[12vw]"
    >
      {facts.map((fact, i) => (
        <li key={fact.label} data-build="rise" style={{ "--b": 3 + i, "--i": i } as Vars} className="signpost pointer-events-auto flex flex-col items-center">
          <span
            className="flex flex-col items-center rounded-[3px] bg-[#8a3a12] px-[clamp(0.6rem,1.2vw,1rem)] py-[clamp(0.3rem,0.7svh,0.55rem)] text-paper shadow-[inset_0_-3px_0_rgb(0_0_0/0.18)]"
            style={{ rotate: `${tilt[i % tilt.length]}deg` }}
          >
            <span className="text-[clamp(1.1rem,1.8vw,1.7rem)] leading-none font-extrabold tabular-nums">{fact.value}</span>
            <span className="meta mt-1 max-w-[5.5rem] text-center text-[0.58rem] leading-tight tracking-[0.12em] text-paper/85 sm:max-w-none sm:whitespace-nowrap">{fact.label}</span>
          </span>
          <span aria-hidden="true" className="h-[clamp(1.5rem,4svh,2.5rem)] w-[clamp(5px,0.5vw,8px)] bg-[#5a2410] sm:h-[clamp(2.5rem,7svh,5rem)]" />
        </li>
      ))}
    </ul>
  );
}
