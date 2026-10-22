/**
 * Who Tayam is and the home page's chapter list — kept apart from the rest of
 * the content (`site.ts`, which carries every project and its images) so the
 * small client components (header, side nav, menu) can read them without
 * pulling all of that into the browser. `site.ts` re-exports both.
 */
export const profile = {
  firstName: "Tayam",
  lastName: "Soubuh",
  fullName: "Tayam Soubuh",
  role: "Full Stack / Front End Developer",
  age: 23,
  // DRAFT — replace with your own positioning line.
  tagline: ["Full-stack developer", "building web products that feel *alive*."],
  email: "taeyamfrontend@gmail.com",
  socials: [{ label: "GitHub", href: "https://github.com/TaeyamSo" }],
  // Real (not mock) — the clock follows `timeZone` (the UAE has one).
  availability: { text: "Open to full-time roles" } as { text: string; mock?: boolean },
  location: { city: "UAE", timeZone: "Asia/Dubai" } as { city: string; timeZone: string; mock?: boolean },
} as const;

export const sections = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "services", label: "Services" },
  { id: "work", label: "Work" },
  { id: "process", label: "Process" },
  { id: "journey", label: "Journey" },
  { id: "contact", label: "Contact" },
] as const;

export type SectionId = (typeof sections)[number]["id"];
