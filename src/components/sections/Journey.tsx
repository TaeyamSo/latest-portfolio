import Image from "next/image";

import { Reveal } from "@/components/ui/Reveal";
import { RollText } from "@/components/ui/RollText";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Tilt } from "@/components/ui/Tilt";
import { featuredProjects, sectionNumber, study } from "@/content/site";

function Marker() {
  return <span aria-hidden="true" className="absolute top-3 -left-[calc(2rem+0.8rem)] h-1 w-6 rounded-full bg-ink" />;
}

function When({ children }: { children: React.ReactNode }) {
  return <p className="meta text-ink/85">{children}</p>;
}

/** Keep hyphenated words like "Front-End" on one line (non-breaking hyphen). */
const unbroken = (text: string) => text.replace(/-/g, "‑");

/**
 * Experience first, then credentials. The heading stays put on large screens
 * while the timeline scrolls; the certificate is a compact, verifiable entry
 * instead of a full-size image.
 */
export function Journey() {
  const { degree, certificate } = study;

  return (
    <section id="journey" aria-labelledby="journey-title" className="shell relative py-[clamp(7rem,16vh,12rem)] outline-none">
      <div className="grid gap-16 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-[22vh]">
            <SectionHeading id="journey-title" index={sectionNumber("journey")} label="Journey" title="My *journey*" />
          </div>
        </div>

        <ol className="ml-3 space-y-14 border-l-2 border-ink pl-8 lg:col-span-7 lg:mt-24">
          <Reveal as="li" className="relative">
            <Marker />
            <When>Freelance</When>
            <h3 className="mt-2 text-[clamp(1.5rem,2.2vw,2.1rem)] leading-tight font-semibold">{unbroken("Front-end developer")}</h3>
            <p className="mt-2 max-w-xl text-lg leading-relaxed text-ink/85">
              Websites for {featuredProjects.map((project) => project.name).join(", ").replace(/, ([^,]*)$/, " and $1")}.
            </p>
          </Reveal>

          <Reveal as="li" className="relative" delay={0.05}>
            <Marker />
            <When>
              {certificate.date} · {certificate.kind}
            </When>
            <div className="mt-2 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-[clamp(1.5rem,2.2vw,2.1rem)] leading-tight font-semibold">{unbroken(certificate.title)}</h3>
                <p className="mt-2 text-lg text-ink/85">
                  {certificate.issuer} · {certificate.courses.length} courses
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-4">
                  <Image src={certificate.badge} alt="Meta Front-End Developer certificate badge" className="size-14" sizes="56px" />
                  <a
                    href={certificate.verifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-cursor="Verify"
                    className="group group/roll inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-paper hover:text-ink"
                  >
                    <RollText>Verify credential</RollText>
                    <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                      ↗
                    </span>
                    <span className="sr-only">(opens Coursera in a new tab)</span>
                  </a>
                </div>
              </div>

              <Tilt sheen max={8} className="w-44 shrink-0 sm:w-40 lg:w-44">
                <a
                  href={certificate.verifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Open the Meta Front-End Developer certificate on Coursera (new tab)"
                  data-cursor="Verify"
                  data-cursor-tone="light"
                  className="block rotate-2 bg-ink p-2 shadow-[0_24px_40px_-20px_rgb(0_0_0/0.6)] transition-transform duration-500 ease-expo hover:rotate-0"
                >
                  <Image src={certificate.image} alt={certificate.imageAlt} sizes="176px" placeholder="blur" className="w-full" />
                </a>
              </Tilt>
            </div>

            <details className="group/details mt-6 max-w-xl">
              <summary className="meta inline-flex cursor-pointer list-none items-center gap-2 [&::-webkit-details-marker]:hidden">
                <span aria-hidden="true" className="inline-block transition-transform duration-300 group-open/details:rotate-90">
                  →
                </span>
                The {certificate.courses.length} courses
              </summary>
              <ul className="mt-4 flex flex-wrap gap-2">
                {certificate.courses.map((course) => (
                  <li key={course} className="meta rounded-full border border-ink/35 px-3 py-1.5 text-[0.6rem] tracking-[0.1em]">
                    {course}
                  </li>
                ))}
              </ul>
            </details>
          </Reveal>

          <Reveal as="li" className="relative" delay={0.1}>
            <Marker />
            <When>Degree</When>
            <h3 className="mt-2 text-[clamp(1.5rem,2.2vw,2.1rem)] leading-tight font-semibold">{degree.title}</h3>
            <p className="mt-2 text-lg text-ink/85">{degree.school}</p>
          </Reveal>
        </ol>
      </div>
    </section>
  );
}
