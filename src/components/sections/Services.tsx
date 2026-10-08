import { Statement } from "@/components/ui/Statement";
import { services, skills } from "@/content/site";

type Vars = React.CSSProperties & Record<`--${string}`, string | number>;

/**
 * 12:00, noon, over the town. The title is the promise itself, a plain statement;
 * below it, what Tayam builds — four services side by side, each backed
 * by real work (on phones they slide sideways, one at a time) — and the
 * toolkit.
 */
export function Services() {
  return (
    <section id="services" data-chapter aria-labelledby="services-title" className="chapter shell relative outline-none">
      <Statement id="services-title">{services.intro}</Statement>

      <div data-track-view="" className="-mx-(--gutter) mt-[clamp(1.5rem,5svh,3.5rem)] px-(--gutter)">
        <ol data-track="" className="gap-4 lg:gap-8">
          {services.items.map((service, i) => (
            <li
              key={service.title}
              data-step=""
              data-build=""
              style={{ "--b": 1 + i } as Vars}
              className="w-[78vw] shrink-0 border-t-2 border-ink pt-4 sm:w-[44vw] lg:w-auto lg:min-w-0 lg:flex-1 lg:shrink"
            >
              <h3 className="text-[clamp(1.2rem,1.55vw,1.65rem)] leading-tight font-bold">{service.title}</h3>
              <p className="mt-2 text-[clamp(0.92rem,1vw,1.02rem)] leading-relaxed text-ink/85">{service.description}</p>
              <p className="meta mt-3 text-ink/75">{service.proof.join(" · ")}</p>
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
