import { CountUp } from "@/components/ui/CountUp";
import { Duotone } from "@/components/ui/Duotone";
import { Reveal } from "@/components/ui/Reveal";
import { ScrubText } from "@/components/ui/ScrubText";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Tilt } from "@/components/ui/Tilt";
import { about, facts, profile, sectionNumber } from "@/content/site";

export function About() {
  return (
    <section
      id="about"
      aria-labelledby="about-title"
      className="shell relative flex min-h-svh items-center py-[clamp(7rem,16vh,12rem)] outline-none"
    >
      <div className="grid w-full items-center gap-x-16 gap-y-16 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <SectionHeading id="about-title" index={sectionNumber("about")} label="About" title="About *me*" />

          <ScrubText text={about.lead} className="mt-10 max-w-[30ch] text-lead lg:mt-14" />

          <Reveal className="mt-8 max-w-[50ch] space-y-3 text-[1.05rem] leading-relaxed text-ink/85" delay={0.1}>
            {about.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </Reveal>

          <dl className="mt-12 grid max-w-xl grid-cols-3 gap-6 border-t-2 border-ink pt-6">
            {facts.map((fact) => (
              <div key={fact.label} className="flex flex-col-reverse gap-2">
                <dt className="meta text-ink/85">{fact.label}</dt>
                <dd className="text-[clamp(2.4rem,4.2vw,4rem)] leading-none font-extrabold tabular-nums">
                  <CountUp value={fact.value} />
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <Reveal from="right" className="lg:col-span-5 lg:justify-self-end">
          <Tilt max={6} className="w-[min(100%,26rem)]">
            <figure data-cursor-tone="light" className="group bg-ink p-4 sm:p-5">
              <div className="overflow-hidden">
                <Duotone
                  src={about.portrait.src}
                  alt={about.portrait.alt}
                  sizes="(min-width: 1024px) 26rem, 90vw"
                  className="transition-transform duration-700 ease-expo group-hover:scale-110"
                />
              </div>
              <figcaption className="meta mt-4 flex justify-between gap-4 text-paper/65">
                <span>{profile.fullName}</span>
                <span>{profile.role}</span>
              </figcaption>
            </figure>
          </Tilt>
        </Reveal>
      </div>
    </section>
  );
}
