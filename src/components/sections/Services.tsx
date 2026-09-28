import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { sectionNumber, services, skills } from "@/content/site";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * What Tayam does, not which logos he knows: four capability rows, each backed
 * by real work. On hover a black block sweeps in from the left — the same
 * language as the project tabs. The original skill tiles live on as the toolkit.
 */
export function Services() {
  return (
    <section
      id="services"
      aria-labelledby="services-title"
      className="shell relative py-[clamp(7rem,16vh,12rem)] outline-none"
    >
      <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
        <SectionHeading id="services-title" index={sectionNumber("services")} label="Services" title="What I *do*" />
        <Reveal from="right" className="max-w-sm text-lead lg:pb-12">
          <p>{services.intro}</p>
        </Reveal>
      </div>

      <ol className="mt-16 border-b-2 border-ink lg:mt-20">
        {services.items.map((service, i) => (
          <li key={service.title} data-cursor-tone="light" className="group relative isolate border-t-2 border-ink">
            <span
              aria-hidden="true"
              className="absolute -inset-x-4 inset-y-0 -z-10 origin-left scale-x-0 bg-ink transition-transform duration-700 ease-expo group-hover:scale-x-100"
            />
            <Reveal
              className="grid gap-x-8 gap-y-4 py-8 transition-colors duration-500 group-hover:text-paper lg:grid-cols-12 lg:items-baseline lg:py-11"
              delay={i * 0.05}
            >
              <span className="meta lg:col-span-1">{pad(i + 1)}</span>
              <h3 className="text-[clamp(2rem,4.2vw,4.4rem)] leading-[0.95] font-extrabold uppercase transition-transform duration-700 ease-expo group-hover:translate-x-3 lg:col-span-6">
                {service.title}
              </h3>
              <div className="lg:col-span-5">
                <p className="text-lg leading-relaxed text-ink/85 transition-colors duration-500 group-hover:text-paper/85">
                  {service.description}
                </p>
                <p className="meta mt-4 transition-colors duration-500 group-hover:text-sunlight">
                  {service.proof.join(" · ")}
                </p>
              </div>
            </Reveal>
          </li>
        ))}
      </ol>

      <Reveal className="mt-12 flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-8">
        <p className="meta">Toolkit</p>
        <ul className="flex flex-wrap items-center gap-x-6 gap-y-4">
          {skills.map((skill) => (
            <li
              key={skill.name}
              style={{ "--accent": skill.accent } as React.CSSProperties}
              className="group/tool flex items-center gap-2.5"
            >
              <span
                data-cursor-tone="light"
                className="grid size-10 place-items-center rounded-md bg-ink text-paper transition duration-300 ease-expo group-hover/tool:-translate-y-1 group-hover/tool:text-(--accent)"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5 fill-current">
                  <path d={skill.icon.path} />
                </svg>
              </span>
              <span className="meta">{skill.name}</span>
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}
