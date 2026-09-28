import Image from "next/image";

import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Tilt } from "@/components/ui/Tilt";
import { study } from "@/content/site";

function Marker() {
  return <span aria-hidden="true" className="absolute top-3 -left-[calc(2rem+0.8rem)] h-1 w-6 rounded-full bg-ink" />;
}

export function Study() {
  const { degree, certificate } = study;

  return (
    <section
      id="study"
      aria-labelledby="study-title"
      className="shell relative flex min-h-svh items-center py-[clamp(7rem,16vh,12rem)] outline-none"
    >
      <div className="grid w-full items-center gap-16 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <SectionHeading id="study-title" index="04" label="Education" title="My study" />

          <ol className="mt-12 ml-3 space-y-12 border-l-2 border-ink pl-8">
            <Reveal as="li" className="relative">
              <Marker />
              <p className="meta text-ink/70">Degree</p>
              <h3 className="mt-2 text-[clamp(1.4rem,2vw,1.9rem)] leading-tight font-semibold">{degree.title}</h3>
              <p className="mt-1 text-lg">{degree.school}</p>
            </Reveal>

            <Reveal as="li" className="relative" delay={0.1}>
              <Marker />
              <p className="meta text-ink/70">
                {certificate.kind} · {certificate.date}
              </p>
              <h3 className="mt-2 text-[clamp(1.4rem,2vw,1.9rem)] leading-tight font-semibold">{certificate.title}</h3>
              <p className="mt-1 text-lg">
                {certificate.issuer} · {certificate.courses.length} courses
              </p>

              <div className="mt-6 flex items-center gap-5">
                <Image src={certificate.badge} alt="Meta Front-End Developer certificate badge" className="size-20" sizes="80px" />
                <a
                  href={certificate.verifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-paper hover:text-ink"
                >
                  Verify credential
                  <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">↗</span>
                  <span className="sr-only">(opens Coursera in a new tab)</span>
                </a>
              </div>

              <ul aria-label="Courses" className="mt-6 flex max-w-xl flex-wrap gap-2">
                {certificate.courses.map((course) => (
                  <li key={course} className="meta rounded-full border border-ink/35 px-3 py-1.5 text-[0.6rem] tracking-[0.1em]">
                    {course}
                  </li>
                ))}
              </ul>
            </Reveal>
          </ol>
        </div>

        <Reveal from="right" className="lg:col-span-6">
          <Tilt sheen max={5}>
            <a
              href={certificate.verifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open the Meta Front-End Developer certificate on Coursera (new tab)"
              className="group block bg-ink p-4 sm:p-5"
            >
              <div className="overflow-hidden">
                <Image
                  src={certificate.image}
                  alt={certificate.imageAlt}
                  sizes="(min-width: 1024px) 46vw, 92vw"
                  placeholder="blur"
                  className="w-full transition-transform duration-700 ease-expo group-hover:scale-[1.04]"
                />
              </div>
              <span className="meta mt-4 flex items-center justify-between text-paper/65">
                <span>Coursera · {certificate.date}</span>
                <span className="transition-colors group-hover:text-sunlight">Verify ↗</span>
              </span>
            </a>
          </Tilt>
        </Reveal>
      </div>
    </section>
  );
}
