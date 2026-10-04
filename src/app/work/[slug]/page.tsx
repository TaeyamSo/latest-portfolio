import type { Metadata, Viewport } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ViewTransition } from "react";

import { CaseBackdrop } from "@/components/case/CaseBackdrop";
import { CaseMarker } from "@/components/case/CaseMarker";
import { CaseTour } from "@/components/case/CaseTour";
import { Header } from "@/components/chrome/Header";
import { CopyEmail } from "@/components/sections/ContactActions";
import { AccentText } from "@/components/ui/AccentText";
import { BrowserFrame } from "@/components/ui/BrowserFrame";
import { MockBadge } from "@/components/ui/MockBadge";
import { RevealWords } from "@/components/ui/Reveal";
import { RollText } from "@/components/ui/RollText";
import { caseStudies, caseStudyPath, profile, type Project } from "@/content/site";
import { stripAccents } from "@/lib/accent";
import { visible } from "@/lib/mock";
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
  const details = project.details && visible(project.details) ? project.details : null;
  const story = caseStudy.story && visible(caseStudy.story) ? caseStudy.story : null;
  const ratio = { aspectRatio: `${project.image.width} / ${project.image.height}` };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.name,
    about: project.category,
    description: stripAccents(caseStudy.summary),
    url: `${siteUrl}${caseStudyPath(slug)}`,
    sameAs: project.url,
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
        <div data-tone="dark" data-cursor-tone="light" className="relative z-10 text-paper">
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
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor="Visit"
                  data-cursor-tone="dark"
                  className="group group/roll inline-flex items-center gap-2 rounded-full border border-paper/35 px-5 py-2.5 text-sm font-medium tracking-wide transition-colors duration-300 hover:border-paper hover:bg-paper hover:text-ink"
                >
                  <RollText>Visit the live site</RollText>
                  <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                    ↗
                  </span>
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </div>

              <BrowserFrame url={project.url} className="mt-10 lg:mt-12">
                <ViewTransition name={`shot-${slug}`} share="case-shot" default="none">
                  <div className="relative overflow-hidden bg-night" style={ratio}>
                    <Image
                      src={project.image}
                      alt={`${project.name} — home page screenshot`}
                      fill
                      preload
                      sizes="(min-width: 1536px) 88rem, 92vw"
                      placeholder="blur"
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
                  {details && <Fact term="Year" value={details.year} mock={details.mock} />}
                  {details && <Fact term="Stack" value={details.stack} mock={details.mock} />}
                </dl>
              </div>
            </section>

            <CaseTour
              highlights={caseStudy.highlights}
              image={project.image}
              url={project.url}
              name={project.name}
              label="02"
            />

            {story && (
              <section aria-labelledby="story-title" className="shell py-24 lg:py-36">
                <h2 id="story-title" className="meta flex items-center gap-3 text-paper/60">
                  <span>(03)</span>
                  <span aria-hidden="true" className="h-px w-10 bg-current" />
                  <span>The story</span>
                  {story.mock && <MockBadge className="text-paper/70" />}
                </h2>
                <div className="mt-12 grid gap-12 lg:grid-cols-3">
                  {(
                    [
                      ["The brief", story.brief],
                      ["The approach", story.approach],
                      ["The outcome", story.outcome],
                    ] as const
                  ).map(([title, text]) => (
                    <div key={title} className="border-t border-paper/15 pt-6">
                      <h3 className="text-2xl font-bold">{title}</h3>
                      <p className="mt-4 leading-relaxed text-paper/75">{text}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <NextProject project={next} />
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
              <BackToWork label="Back to all work" />
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

function Fact({ term, value, mock }: { term: string; value: string; mock?: boolean }) {
  return (
    <div>
      <dt className="flex items-center gap-2">
        {term}
        {mock && <MockBadge className="text-paper/70" />}
      </dt>
      <dd className="mt-1.5 tracking-[0.08em] text-paper normal-case">{value}</dd>
    </div>
  );
}

/** Back to the deck — the home page brings this project's card into view and the page folds back into it. */
function BackToWork({ label = "All work" }: { label?: string }) {
  return (
    <Link
      href="/"
      scroll={false}
      transitionTypes={["case-close"]}
      data-cursor="Back"
      className="group inline-flex items-center gap-2 text-paper transition-colors hover:text-sunlight"
    >
      <span aria-hidden="true" className="transition-transform duration-300 group-hover:-translate-x-1">
        ←
      </span>
      {label}
    </Link>
  );
}

function NextProject({ project }: { project: Project }) {
  return (
    <section aria-labelledby="next-title" className="border-t border-paper/15">
      <Link
        href={caseStudyPath(project.slug)}
        transitionTypes={["case-next"]}
        data-cursor="Next"
        className="group shell flex flex-col gap-10 py-20 lg:flex-row lg:items-end lg:justify-between lg:py-28"
      >
        <div>
          <p className="meta flex items-center gap-3 text-paper/60">
            Next project
            <span aria-hidden="true" className="transition-transform duration-500 ease-expo group-hover:translate-x-2">
              →
            </span>
          </p>
          <h2
            id="next-title"
            className="mt-6 text-[clamp(2.8rem,8vw,8.5rem)] leading-[0.9] font-extrabold uppercase transition-colors duration-300 group-hover:text-sunlight"
          >
            {project.name}
          </h2>
          <p className="mt-5 text-lg text-paper/70">{project.category}</p>
        </div>
        <BrowserFrame
          url={project.url}
          className="w-full max-w-[28rem] shrink-0 transition-transform duration-700 ease-expo group-hover:-translate-y-2 group-hover:-rotate-2"
        >
          <div className="relative overflow-hidden bg-night" style={{ aspectRatio: `${project.image.width} / ${project.image.height}` }}>
            <Image src={project.image} alt="" fill sizes="28rem" placeholder="blur" className="object-cover object-top" />
          </div>
        </BrowserFrame>
      </Link>
    </section>
  );
}
