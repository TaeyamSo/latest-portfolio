import { featuredProjects, flagshipProjects, freelanceProjects, projects } from "@/content/site";

/**
 * The case study the visitor is reading. When they head back to the home page
 * (the back button or "All work"), it scrolls straight to that project's stop,
 * so the page they left is where they return — and the card can morph back.
 * In memory only: a fresh page load starts clean.
 */
export const workReturn: { slug: string | null } = { slug: null };

/** The project's wrapper on the home page. */
export const workCardId = (slug: string) => `work-${slug}`;

/** The high street's shops, in order (sections/HighStreet.tsx): the flagship, the freelance work, the UAE client sites. */
const STREET = [...flagshipProjects, ...freelanceProjects, ...featuredProjects].map((project) => project.slug);

/** Which shop along the street a project is — the step its track rests on. */
export function streetStepOf(slug: string) {
  return Math.max(0, STREET.indexOf(slug));
}

/**
 * (For the Work stage, sections/WorkStage.tsx — commented out in app/page.tsx
 * for now.) Which step of the stage's track a project lives on: the B Dashboard
 * takes the first three (overview, what I built, in motion), Mangos the fourth,
 * the UAE client sites share the fifth; the workshop is the last.
 */
export const WORK_STEPS = { flagship: 0, built: 1, motion: 2, freelance: 3, clients: 4, workshop: 5 } as const;

export function workStepOf(slug: string) {
  const kind = projects.find((project) => project.slug === slug)?.kind;
  if (kind === "Flagship") return WORK_STEPS.flagship;
  if (kind === "Freelance") return WORK_STEPS.freelance;
  return WORK_STEPS.clients;
}
