import Image from "next/image";

import { RollText } from "@/components/ui/RollText";
import { Statement } from "@/components/ui/Statement";
import { Tilt } from "@/components/ui/Tilt";
import { chapters, featuredProjects, softSkills, study } from "@/content/site";

type Vars = React.CSSProperties & Record<`--${string}`, string | number>;

/** Keep hyphenated words like "Front-End" on one line (non-breaking hyphen). */
const unbroken = (text: string) => text.replace(/-/g, "‑");

/**
 * 17:45, golden hour, on the coast. Experience first, then credentials, side by
 * side: the freelance work, the Meta certificate as a compact verifiable entry,
 * the degree — and what was learned along the way, in one line.
 */
export function Journey() {
  const { degree, certificate } = study;
  const clients = featuredProjects.map((project) => project.name).join(", ").replace(/, ([^,]*)$/, " and $1");

  return (
    <section id="journey" data-chapter aria-labelledby="journey-title" className="chapter shell relative outline-none">
      <Statement id="journey-title">{chapters.journey.statement}</Statement>

      <ol className="mt-[clamp(1.25rem,4.5svh,3rem)] grid gap-x-10 gap-y-6 border-t-2 border-ink pt-[clamp(1rem,3svh,1.75rem)] md:grid-cols-3">
        <li data-build="" style={{ "--b": 1 } as Vars}>
          <p className="meta text-ink/85">Freelance</p>
          <h3 className="mt-2 text-[clamp(1.3rem,1.9vw,1.9rem)] leading-tight font-semibold">{unbroken("Front-end developer")}</h3>
          <p className="mt-2 text-[clamp(0.92rem,1vw,1.05rem)] leading-relaxed text-ink/85">Websites for {clients}.</p>
        </li>

        <li data-build="" style={{ "--b": 2 } as Vars}>
          <p className="meta text-ink/85">
            {certificate.date} · {certificate.kind}
          </p>
          <h3 className="mt-2 text-[clamp(1.3rem,1.9vw,1.9rem)] leading-tight font-semibold">{unbroken(certificate.title)}</h3>
          <p className="mt-2 text-[clamp(0.92rem,1vw,1.05rem)] text-ink/85">
            {certificate.issuer} · {certificate.courses.length} courses
          </p>
          <div className="mt-[clamp(0.75rem,2.5svh,1.25rem)] flex flex-wrap items-center gap-3">
            <Image src={certificate.badge} alt="Meta Front-End Developer certificate badge" className="size-11" sizes="44px" />
            <a
              href={certificate.verifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group group/roll inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-medium text-paper transition-colors hover:bg-paper hover:text-ink"
            >
              <RollText>Verify credential</RollText>
              <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                ↗
              </span>
              <span className="sr-only">(opens Coursera in a new tab)</span>
            </a>
            <Tilt sheen max={8} className="hidden w-24 lg:block">
              <a
                href={certificate.verifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open the Meta Front-End Developer certificate on Coursera (new tab)"
                className="block rotate-2 bg-ink p-1 shadow-[0_18px_30px_-16px_rgb(0_0_0/0.6)] transition-transform duration-500 ease-expo hover:rotate-0"
              >
                <Image src={certificate.image} alt={certificate.imageAlt} sizes="96px" placeholder="blur" className="w-full" />
              </a>
            </Tilt>
          </div>
        </li>

        <li data-build="" style={{ "--b": 3 } as Vars}>
          <p className="meta text-ink/85">Degree</p>
          <h3 className="mt-2 text-[clamp(1.3rem,1.9vw,1.9rem)] leading-tight font-semibold">{degree.title}</h3>
          <p className="mt-2 text-[clamp(0.92rem,1vw,1.05rem)] text-ink/85">{degree.school}</p>
        </li>
      </ol>

      <p
        data-build=""
        style={{ "--b": 4 } as Vars}
        className="mt-[clamp(1.25rem,4svh,2.5rem)] max-w-[72ch] text-[clamp(0.88rem,0.95vw,1rem)] leading-relaxed text-ink/85"
      >
        <span className="meta mr-3 text-ink">Along the way</span>
        {softSkills.join(" · ")}
      </p>
    </section>
  );
}
