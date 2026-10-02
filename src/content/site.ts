/**
 * Every word and asset on the site lives here, so updating the portfolio never
 * means touching a component.
 *
 * Markers:
 * - `// DRAFT` — copy written from real facts (projects, certificate, skills);
 *   ships as-is, but should be read and adjusted by Tayam.
 * - `mock: true` — placeholder content (testimonials, status, city). It renders
 *   only in development (see src/lib/mock.ts), so it can never ship by accident.
 *
 * `*word*` sets that word in the serif accent.
 */
import type { StaticImageData } from "next/image";
import {
  siCss,
  siJavascript,
  siNuxt,
  siReact,
  siSass,
  siVuedotjs,
  type SimpleIcon,
} from "simple-icons";

import portrait from "@/assets/about/portrait.webp";
import alAin from "@/assets/projects/al-ain.webp";
import alaktabout from "@/assets/projects/alaktabout.webp";
import baddar from "@/assets/projects/baddar.webp";
import elzero from "@/assets/projects/elzero.webp";
import hazo from "@/assets/projects/hazo.webp";
import kasper from "@/assets/projects/kasper.webp";
import leon from "@/assets/projects/leon.webp";
import certificate from "@/assets/study/certificate.webp";
import metaBadge from "@/assets/study/meta-badge.webp";

export const profile = {
  firstName: "Tayam",
  lastName: "Soubuh",
  fullName: "Tayam Soubuh",
  role: "Front-End Developer",
  // DRAFT — replace with your own positioning line.
  tagline: ["Front-end developer", "crafting websites that feel *alive*."],
  email: "taeyamfrontend@gmail.com",
  socials: [{ label: "GitHub", href: "https://github.com/TaeyamSo" }],
  // MOCK — your real status and city (the clock follows `timeZone`).
  availability: { mock: true, text: "Available for new projects" },
  location: { mock: true, city: "Dubai", timeZone: "Asia/Dubai" },
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

/** "02" for the second section, and so on — keeps every label in sync with the nav. */
export const sectionNumber = (id: SectionId) =>
  String(sections.findIndex((section) => section.id === id) + 1).padStart(2, "0");

export const about = {
  // DRAFT
  lead: "I'm Tayam, a front-end developer who turns ideas into fast, responsive websites for real businesses.",
  body: [
    "From an online furniture store to a building contractor, I've shipped sites for clients who needed their brand to look as good online as it does in person.",
    "I care about the details that make a site feel alive — clean code, smooth motion, pages that work on every screen — and I'm always learning what's next.",
  ],
  portrait: {
    src: portrait,
    alt: "Illustrated avatar: a dark-haired character resting their chin on one hand",
  },
};

export type Skill = { name: string; icon: SimpleIcon; accent: string };

// `accent` is the hover colour; the 2025 site gave each tile its own brand hue too.
export const skills: Skill[] = [
  { name: "CSS", icon: siCss, accent: "#9d7bff" },
  { name: "Sass", icon: siSass, accent: "#ff8fc8" },
  { name: "JavaScript", icon: siJavascript, accent: "#f7df1e" },
  { name: "Vue", icon: siVuedotjs, accent: "#4fc08d" },
  { name: "Nuxt", icon: siNuxt, accent: "#00dc82" },
  { name: "React", icon: siReact, accent: "#61dafb" },
];

export const softSkills = [
  "Time Management",
  "Problem Solving",
  "Communication",
  "Teamwork",
  "Quick Learner",
  "Adaptability",
  "Leadership Skills",
  "Strategic Thinking",
];

export const study = {
  degree: {
    title: "IT Student — Year 3", // DRAFT — confirm the current year.
    school: "Syrian Virtual University",
  },
  certificate: {
    title: "Meta Front-End Developer",
    kind: "Professional Certificate",
    issuer: "Meta · Coursera",
    date: "Jun 2023",
    verifyUrl: "https://coursera.org/verify/professional-cert/M9BVM7QHY7MD",
    image: certificate,
    imageAlt:
      "Coursera certificate: Tayam Soubuh completed the Meta Front-End Developer Professional Certificate on June 10, 2023",
    badge: metaBadge,
    courses: [
      "Introduction to Front-End Development",
      "Programming with JavaScript",
      "Version Control",
      "HTML and CSS in depth",
      "React Basics",
      "Advanced React",
      "Principles of UX/UI Design",
      "Front-End Developer Capstone",
      "Coding Interview Preparation",
    ],
  },
};

export type Project = {
  slug: string;
  name: string;
  category: string;
  kind: "Client" | "Template build";
  url: string;
  image: StaticImageData;
  /** DRAFT — what Tayam did on it. */
  role?: string;
  /** MOCK until confirmed — shown on the project cards in development only. */
  details?: { year: string; stack: string; mock?: boolean };
};

export const projects: Project[] = [
  {
    slug: "baddar",
    name: "Baddar Furniture",
    category: "Furniture e-commerce store",
    kind: "Client",
    url: "https://baddarfurniture.com/",
    image: baddar,
    role: "Front-end development",
    details: { mock: true, year: "2024", stack: "HTML · Sass · JavaScript" },
  },
  {
    slug: "hazo",
    name: "Hazo Interiors",
    category: "Interior design & furnishing",
    kind: "Client",
    url: "https://hazoco.net",
    image: hazo,
    role: "Front-end development",
    details: { mock: true, year: "2024", stack: "HTML · Sass · JavaScript" },
  },
  {
    slug: "alaktabout",
    name: "Al Aktabout",
    category: "Documents clearing services",
    kind: "Client",
    url: "https://alaktabout.net/",
    image: alaktabout,
    role: "Front-end development",
    details: { mock: true, year: "2023", stack: "HTML · Sass · JavaScript" },
  },
  {
    slug: "al-ain",
    name: "Al Ain Al Thahabiah",
    category: "Building contracting company",
    kind: "Client",
    url: "https://aatb-rak.net/",
    image: alAin,
    role: "Front-end development",
    details: { mock: true, year: "2023", stack: "HTML · Sass · JavaScript" },
  },
  {
    slug: "elzero",
    name: "Elzero",
    category: "Blog landing page",
    kind: "Template build",
    url: "https://taeyamso.github.io/Elzero-Website-/",
    image: elzero,
  },
  {
    slug: "kasper",
    name: "Kasper",
    category: "Creative agency landing page",
    kind: "Template build",
    url: "https://taeyamso.github.io/kasper-website/",
    image: kasper,
  },
  {
    slug: "leon",
    name: "Leon",
    category: "Minimal agency landing page",
    kind: "Template build",
    url: "https://taeyamso.github.io/leon-website/",
    image: leon,
  },
];

/** Client work is featured in the monitor; template builds live in the archive. */
export const featuredProjects = projects.filter((project) => project.kind === "Client");
export const archiveProjects = projects.filter((project) => project.kind === "Template build");

const projectName = (slug: string) => projects.find((project) => project.slug === slug)?.name ?? slug;

// DRAFT — "what I do", each backed by work that exists.
export const services = {
  intro: "I help businesses look as good online as they do in person.",
  items: [
    {
      title: "Business websites",
      description: "Fast, responsive sites that make a company look as good online as it does in person.",
      proof: ["hazo", "al-ain", "alaktabout"].map(projectName),
    },
    {
      title: "E-commerce stores",
      description: "Product catalogues and shopping flows that are a pleasure to browse on any device.",
      proof: ["baddar"].map(projectName),
    },
    {
      title: "Landing pages",
      description: "Focused one-page stories that turn a visit into an enquiry.",
      proof: ["kasper", "leon", "elzero"].map(projectName),
    },
    {
      title: "Interactive experiences",
      description: "Motion, micro-interactions and the small details that make an interface feel alive.",
      proof: ["This portfolio"],
    },
  ],
};

// DRAFT — how a project runs, start to finish.
export const steps = [
  { title: "Discover", description: "We talk goals, audience and content, and agree on what success looks like." },
  { title: "Design", description: "A visual direction and key screens you can react to early, before any code." },
  { title: "Build", description: "Clean, responsive code with motion and detail, shared as a live preview as it grows." },
  { title: "Launch", description: "Testing on real devices and speed checks, then going live — with support after." },
];

// DRAFT — the band under the hero.
export const marquee = ["Websites", "E-commerce", "Landing pages", "Interfaces", "Motion", "Responsive", "Accessible", "Fast"];

export type Testimonial = { quote: string; name: string; role: string; mock?: boolean };

// MOCK — fictional people, so the section can be designed. Replace with real
// client quotes (with permission) and drop `mock: true`.
export const testimonials: Testimonial[] = [
  {
    mock: true,
    quote: "Tayam turned our catalogue into a store customers actually enjoy browsing. Quick, patient, and sharp on every detail.",
    name: "Client name",
    role: "Owner · Retail business",
  },
  {
    mock: true,
    quote: "We finally have a website that looks like the company we are. The whole process was clear from the first call to launch.",
    name: "Client name",
    role: "Managing director · Contracting company",
  },
  {
    mock: true,
    quote: "Every change we asked for came back better than we imagined, and always on time.",
    name: "Client name",
    role: "Marketing lead · Services company",
  },
];

export const facts = [
  { value: featuredProjects.length, label: "Client websites" },
  { value: projects.length, label: "Projects shipped" },
  { value: skills.length, label: "Core technologies" },
];
