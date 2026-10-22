import { projects } from "@/content/site";

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
