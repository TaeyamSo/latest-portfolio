import { Statement } from "@/components/ui/Statement";
import { Tilt } from "@/components/ui/Tilt";
import { services, skills } from "@/content/site";

type Vars = React.CSSProperties & Record<`--${string}`, string | number>;

/**
 * 12:00, noon, over the town. The title is the promise itself, a plain statement;
 * below it, what Tayam builds — four services side by side, each a title and a
 * description of about the same length so the cards match in height (on phones
 * they slide sideways, one at a time) — and the toolkit. Each service sits on a
 * frosted panel (paper tint + blur, which swaps with the theme) so its text
 * reads over the town and the sky. The panels answer the cursor: they lift,
 * firm up and tilt towards it with a soft sheen.
 */
export function Services() {
  return (
    <section id="services" data-chapter aria-labelledby="services-title" className="chapter shell relative outline-none">
      <Statement id="services-title">{services.intro}</Statement>

      <div data-track-view="" className="-mx-(--gutter) mt-[clamp(1.5rem,5svh,3.5rem)] px-(--gutter)">
        <ol data-track="" className="gap-4 lg:gap-4 xl:gap-6">
          {services.items.map((service, i) => (
            <li
              key={service.title}
              data-step=""
              data-build=""
              style={{ "--b": 1 + i } as Vars}
              className="w-[78vw] shrink-0 sm:w-[44vw] lg:w-auto lg:min-w-0 lg:flex-1 lg:shrink"
            >
              <Tilt
                sheen
                max={4}
                className="h-full overflow-hidden rounded-2xl border border-ink/15 bg-paper/75 px-4 py-[clamp(0.5rem,2.2svh,1.25rem)] shadow-[0_0.5rem_1.75rem_-0.75rem_rgb(0_0_0/0.35)] backdrop-blur-sm transition-[translate,background-color,box-shadow] duration-300 ease-expo hover:bg-paper/85 hover:shadow-[0_1.25rem_2.5rem_-0.75rem_rgb(0_0_0/0.45)] motion-safe:hover:-translate-y-1.5 xl:px-5 [@media(max-height:46rem)]:py-2"
              >
                <h3 className="text-[clamp(1.2rem,1.55vw,1.65rem)] leading-tight font-bold">{service.title}</h3>
                <p className="mt-2 text-[clamp(0.92rem,1vw,1.02rem)] leading-relaxed text-ink [@media(max-height:46rem)]:mt-1 [@media(max-height:46rem)]:text-[0.86rem] [@media(max-height:46rem)]:leading-snug">
                  {service.description}
                </p>
              </Tilt>
            </li>
          ))}
        </ol>
      </div>

      <div
        data-build=""
        style={{ "--b": 6 } as Vars}
        className="mt-[clamp(1.25rem,4svh,2.75rem)] flex flex-wrap items-center gap-x-5 gap-y-3"
      >
        <p className="meta">Toolkit</p>
        <ul className="flex flex-wrap items-center gap-x-5 gap-y-3">
          {skills.map((skill) => (
            <li key={skill.name} title={skill.name} style={{ "--accent": skill.accent } as Vars} className="group/tool flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-md bg-ink text-paper transition duration-300 ease-expo group-hover/tool:-translate-y-1 group-hover/tool:text-(--accent)">
                <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4 fill-current">
                  <path d={skill.icon.path} />
                </svg>
              </span>
              {/* Names show from 1280px; below that the icons carry it (the name stays for screen readers and as a tooltip). */}
              <span className="meta sr-only xl:not-sr-only">{skill.name}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
