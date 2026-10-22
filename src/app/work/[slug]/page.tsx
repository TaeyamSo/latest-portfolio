import type { Metadata, Viewport } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ViewTransition } from "react";

import { CaseBackdrop } from "@/components/case/CaseBackdrop";
import { CaseExtras } from "@/components/case/CaseExtras";
import { CaseMarker } from "@/components/case/CaseMarker";
import { CaseTour } from "@/components/case/CaseTour";
import { Header } from "@/components/chrome/Header";
import { CopyEmail } from "@/components/sections/ContactActions";
import { AccentText } from "@/components/ui/AccentText";
import { BrowserFrame } from "@/components/ui/BrowserFrame";
import { RevealWords } from "@/components/ui/Reveal";
import { RollText } from "@/components/ui/RollText";
import { caseStudies, caseStudyPath, profile, type Project } from "@/content/site";
import { stripAccents } from "@/lib/accent";
import { siteUrl } from "@/lib/site-url";

const pad = (n: number) => String(n).padStart(2, "0");

// Only the client projects have pages; anything else is the 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return caseStudies.map((project) => ({ slug: project.slug }));
}

export const viewport: Viewport = { themeColor: "#0d0a08" };

export async function generateMetadata({ params }: PageProps<"/work/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = caseStudies.find((p) => p.slug === slug);
  if (!project) return {};
  const title = `${project.name} — case study`;
  const description = stripAccents(project.caseStudy.summary);
  return {
    title,
    description,
    alternates: { canonical: caseStudyPath(slug) },
    openGraph: { type: "article", url: caseStudyPath(slug), title, description },
    twitter: { card: "summary_large_image", title, description },
  };
}

/**
 * A case study. It opens out of the project's card on the home page: the card
 * grows into this dark page (CaseBackdrop) while the screenshot flies to the
 * top of it, and everything else rises in after. "All work" or the back button
 * reverses it.
 */
export default async function CaseStudyPage({ params }: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  const index = caseStudies.findIndex((p) => p.slug === slug);
  if (index === -1) notFound();

  const project = caseStudies[index];
  const next = caseStudies[(index + 1) % caseStudies.length];
  const { caseStudy } = project;
  // What the browser frame shows, and whether there is a live site to link to.
  const address = project.url ?? project.displayUrl ?? project.name;
  const liveUrl = project.linkable && project.url ? project.url : null;
  const ratio = { aspectRatio: `${project.image.width} / ${project.image.height}` };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.name,
    about: project.category,
    description: stripAccents(caseStudy.summary),
    url: `${siteUrl}${caseStudyPath(slug)}`,
    ...(liveUrl ? { sameAs: liveUrl } : {}),
    creator: { "@type": "Person", name: profile.fullName, url: siteUrl },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <CaseBackdrop slug={slug} />
      <CaseMarker slug={slug} />
      <Header onHome={false} />

      {/* Rises in once the card has opened; slides along to the next project. */}
      <ViewTransition
        key={slug}
        enter={{ "case-next": "case-slide-in", default: "case-content-in" }}
        exit={{ "case-next": "case-slide-out", default: "case-content-out" }}
        default="none"
      >
        <div data-tone="dark" className="relative z-10 text-paper">
          <main id="main" className="outline-none">
            <section aria-labelledby="case-title" className="shell pt-28 lg:pt-36">
              <div className="meta flex flex-wrap items-center justify-between gap-4 text-paper/60">
                <BackToWork />
                <span>
                  Case study · {pad(index + 1)} / {pad(caseStudies.length)}
                </span>
              </div>

              <h1
                id="case-title"
                className="mt-10 text-[clamp(3.1rem,9vw,9rem)] leading-[0.88] font-extrabold tracking-[-0.03em] uppercase lg:mt-12"
              >
                <RevealWords text={project.name} />
              </h1>

              <div className="mt-6 flex flex-wrap items-end justify-between gap-6 lg:mt-8">
                <p className="text-lead text-paper/80">{project.category}</p>
                <div className="flex flex-wrap gap-3">
                  {liveUrl && <OutLink href={liveUrl}>Visit the live site</OutLink>}
                  {project.repo && <OutLink href={project.repo}>Read the code</OutLink>}
                </div>
              </div>

              <BrowserFrame url={address} className="mt-10 lg:mt-12">
                <ViewTransition name={`shot-${slug}`} share="case-shot" default="none">
                  <div className="relative overflow-hidden bg-night" style={ratio}>
                    <Image
                      src={project.image}
                      alt={`${project.name} — home page screenshot`}
                      fill
                      preload
                      sizes="(min-width: 1536px) 88rem, 92vw"
                      className="object-cover object-top"
                    />
                  </div>
                </ViewTransition>
              </BrowserFrame>
            </section>

            <section aria-labelledby="overview-title" className="shell grid gap-10 py-24 lg:grid-cols-12 lg:py-36">
              <h2 id="overview-title" className="meta flex items-center gap-3 self-start text-paper/60 lg:col-span-3">
                <span>(01)</span>
                <span aria-hidden="true" className="h-px w-10 bg-current" />
                <span>Overview</span>
              </h2>
              <div className="lg:col-span-9">
                <p className="text-[clamp(1.6rem,2.7vw,3rem)] leading-[1.2] font-medium">
                  <AccentText text={caseStudy.summary} />
                </p>
                <dl className="meta mt-14 grid grid-cols-2 gap-x-8 gap-y-6 border-t border-paper/15 pt-6 text-paper/60 sm:grid-cols-4">
                  {project.role && <Fact term="Role" value={project.role} />}
                  <Fact term="Sector" value={project.category} />
                  {project.period && <Fact term="When" value={project.period} />}
                  {project.stack && <Fact term="Stack" value={project.stack} />}
                </dl>
              </div>
            </section>

            <CaseTour
              highlights={caseStudy.highlights}
              image={project.image}
              url={address}
              name={project.name}
              label="02"
            />

            <CaseExtras caseStudy={caseStudy} name={project.name} from={3} />

            <CaseEnd next={next} />
          </main>

          <footer className="shell flex flex-col gap-12 border-t border-paper/15 py-16 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="meta text-paper/60">Have a project in mind?</p>
              <a
                href={`mailto:${profile.email}`}
                className="link-dash mt-4 inline-block text-[clamp(1.35rem,3.2vw,2.8rem)] leading-tight font-medium break-all"
              >
                {profile.email}
              </a>
              <div className="mt-6">
                <CopyEmail email={profile.email} />
              </div>
            </div>
            <div className="meta flex flex-col gap-3 text-paper/55 lg:items-end">
              <p>
                © {new Date().getFullYear()} {profile.fullName}
              </p>
            </div>
          </footer>
        </div>
      </ViewTransition>
    </>
  );
}

function Fact({ term, value }: { term: string; value: string }) {
  return (
    <div>
      <dt>{term}</dt>
      <dd className="mt-1.5 tracking-[0.08em] text-paper normal-case">{value}</dd>
    </div>
  );
}

function OutLink({ href, children }: { href: string; children: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group group/roll inline-flex items-center gap-2 rounded-full border border-paper/35 px-5 py-2.5 text-sm font-medium tracking-wide transition-colors duration-300 hover:border-paper hover:bg-paper hover:text-ink"
    >
      <RollText>{children}</RollText>
      <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
        ↗
      </span>
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

/** Back to the deck — the home page brings this project's card into view and the page folds back into it. */
function BackToWork({ label = "All work" }: { label?: string }) {
  return (
    <Link
      href="/"
      scroll={false}
      transitionTypes={["case-close"]}
      className="group inline-flex items-center gap-2 text-paper transition-colors hover:text-sunlight"
    >
      <span aria-hidden="true" className="transition-transform duration-300 group-hover:-translate-x-1">
        ←
      </span>
      {label}
    </Link>
  );
}

/**
 * The end of a case study: the two ways on, side by side so neither is missed —
 * back to all the work (the home page folds back into this project's store),
 * and on to the next project.
 */
function CaseEnd({ next }: { next: Project }) {
  return (
    <section aria-label="Where next" className="border-t border-paper/15">
      <div className="shell grid gap-4 py-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-6 lg:py-24">
        <Link
          href="/"
          scroll={false}
          transitionTypes={["case-close"]}
          className="group flex min-h-56 flex-col justify-between rounded-2xl border border-paper/20 p-8 transition-colors duration-300 hover:border-sunlight hover:bg-paper/5 lg:p-10"
        >
          <p className="meta text-paper/60">Back to</p>
          <div>
            <span
              aria-hidden="true"
              className="block text-[clamp(2.4rem,4vw,3.6rem)] leading-none text-sunlight transition-transform duration-500 ease-expo group-hover:-translate-x-2"
            >
              ←
            </span>
            <p className="mt-4 text-[clamp(1.8rem,3.2vw,3rem)] leading-[0.95] font-extrabold uppercase transition-colors duration-300 group-hover:text-sunlight">
              All work
            </p>
            <p className="mt-3 text-paper/60">Every project, back on the high street.</p>
          </div>
        </Link>

        <Link
          href={caseStudyPath(next.slug)}
          transitionTypes={["case-next"]}
          className="group flex flex-col gap-8 rounded-2xl border border-paper/20 p-8 transition-colors duration-300 hover:border-sunlight hover:bg-paper/5 lg:flex-row lg:items-end lg:justify-between lg:p-10"
        >
          <div className="min-w-0">
            <p className="meta flex items-center gap-3 text-paper/60">
              Next project
              <span aria-hidden="true" className="transition-transform duration-500 ease-expo group-hover:translate-x-2">
                →
              </span>
            </p>
            <h2
              id="next-title"
              className="mt-6 text-[clamp(2.4rem,5.5vw,6rem)] leading-[0.9] font-extrabold uppercase transition-colors duration-300 group-hover:text-sunlight"
            >
              {next.name}
            </h2>
            <p className="mt-4 text-lg text-paper/70">{next.category}</p>
          </div>
          <BrowserFrame
            url={next.url ?? next.displayUrl ?? next.name}
            className="w-full max-w-[22rem] shrink-0 transition-transform duration-700 ease-expo group-hover:-translate-y-2 group-hover:-rotate-2"
          >
            <div className="relative overflow-hidden bg-night" style={{ aspectRatio: `${next.image.width} / ${next.image.height}` }}>
              <Image src={next.image} alt="" fill sizes="22rem" className="object-cover object-top" />
            </div>
          </BrowserFrame>
        </Link>
      </div>
    </section>
  );
}
