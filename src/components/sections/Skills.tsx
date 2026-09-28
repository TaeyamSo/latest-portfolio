import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { skills, softSkills } from "@/content/site";

const pad = (n: number) => String(n).padStart(2, "0");

export function Skills() {
  return (
    <section
      id="skills"
      aria-labelledby="skills-title"
      className="shell relative flex min-h-svh items-center py-[clamp(7rem,16vh,12rem)] outline-none"
    >
      <div className="grid w-full items-center gap-16 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <SectionHeading id="skills-title" index="03" label="Skills" title="My skills" />

          {/* The original tiles: black box, white border, brand colour on hover. */}
          <ul className="mt-12 grid max-w-[34rem] grid-cols-3 gap-4 sm:gap-6">
            {skills.map((skill, i) => (
              <Reveal as="li" key={skill.name} delay={i * 0.06}>
                <div
                  style={{ "--accent": skill.accent } as React.CSSProperties}
                  className="group flex aspect-square flex-col items-center justify-center gap-3 border-[3px] border-paper bg-ink text-paper transition duration-300 ease-expo hover:-translate-y-1.5 hover:border-(--accent) hover:text-(--accent) hover:shadow-[0_22px_44px_-18px_var(--accent)]"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true" className="size-[40%] fill-current transition-transform duration-500 ease-expo group-hover:scale-110">
                    <path d={skill.icon.path} />
                  </svg>
                  <span className="meta text-[0.62rem] text-paper/70 transition-colors group-hover:text-(--accent)">
                    {skill.name}
                  </span>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>

        <Reveal from="right" className="lg:col-span-5 lg:justify-self-end">
          <div className="w-full bg-ink p-8 text-paper sm:p-10 lg:w-[26rem]">
            <h3 className="flex items-baseline justify-between text-xl font-semibold">
              Soft skills <span className="meta text-paper/45">{pad(softSkills.length)}</span>
            </h3>
            <ul className="mt-6">
              {softSkills.map((skill, i) => (
                <li key={skill} className="group flex items-center gap-4 border-t border-paper/10 py-3">
                  <span className="meta w-6 text-paper/40">{pad(i + 1)}</span>
                  <span aria-hidden="true" className="h-[3px] w-4 rounded-full bg-sunlight transition-[width] duration-500 ease-expo group-hover:w-9" />
                  <span className="transition-colors duration-300 group-hover:text-sunlight">{skill}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
