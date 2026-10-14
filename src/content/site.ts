/**
 * Every word and asset on the site lives here, so updating the portfolio never
 * means touching a component.
 *
 * Markers:
 * - `// DRAFT` — copy written from real facts (projects, certificate, skills);
 *   ships as-is, but should be read and adjusted by Tayam.
 * - `mock: true` — placeholder content. It renders only in development (see
 *   src/lib/mock.ts), so it can never ship by accident. There is none left in
 *   the projects: nothing here is invented.
 *
 * `*word*` sets that word in the serif accent — on the hero only; every chapter
 * title is a plain sentence.
 */
import type { StaticImageData } from "next/image";
import {
  siJavascript,
  siNextdotjs,
  siNodedotjs,
  siNuxt,
  siReact,
  siTailwindcss,
  siTypescript,
  siVuedotjs,
  type SimpleIcon,
} from "simple-icons";

import portrait from "@/assets/about/portrait.webp";
import alAin from "@/assets/projects/al-ain.webp";
import alaktabout from "@/assets/projects/alaktabout.webp";
import baddar from "@/assets/projects/baddar.webp";
import bDashboard from "@/assets/projects/b-dashboard.webp";
import bdCompact from "@/assets/projects/b-dashboard/compact.webp";
import bdDriveThru from "@/assets/projects/b-dashboard/drive-thru.webp";
import bdDriveThruStill from "@/assets/projects/b-dashboard/drive-thru-still.webp";
import bdEmployeeForm from "@/assets/projects/b-dashboard/employee-form.webp";
import bdHiring from "@/assets/projects/b-dashboard/hiring.webp";
import bdMonitoring from "@/assets/projects/b-dashboard/monitoring.webp";
import bdNavigation from "@/assets/projects/b-dashboard/navigation.webp";
import bdReportProblem from "@/assets/projects/b-dashboard/report-problem.webp";
import bdReportProblemStill from "@/assets/projects/b-dashboard/report-problem-still.webp";
import bdScheduling from "@/assets/projects/b-dashboard/scheduling.webp";
import elzero from "@/assets/projects/elzero.webp";
import hazo from "@/assets/projects/hazo.webp";
import kasper from "@/assets/projects/kasper.webp";
import leon from "@/assets/projects/leon.webp";
import mangos from "@/assets/projects/mangos.webp";
import mangosMobile from "@/assets/projects/mangos/mobile.webp";
import mangosVenue from "@/assets/projects/mangos/venue.webp";
import certificate from "@/assets/study/certificate.webp";
import metaBadge from "@/assets/study/meta-badge.webp";

/**
 * The live address of the Mangos site (the Vercel URL). Fill it in and the
 * project gets its "visit the live site" links, its address bar and its
 * structured data; until then the site is shown without a link.
 */
export const MANGOS_URL: string = "";

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

export const about = {
  // DRAFT — the chapter's title is a plain sentence.
  statement: "I'm Tayam. I build web products for real businesses.",
  body: [
    `I'm a ${profile.age}-year-old developer who works across the front end and the API layer: React, Next.js and TypeScript, with real-time video, role-based access and interfaces in English and Arabic.`,
    "At NVT - PNE Pizza I'm the largest contributor to the B Dashboard, the operations platform a multi-store pizza business runs on. Before that I built bilingual websites for UAE businesses, and I delivered a brand site for a restaurant group in Columbus, Ohio.",
  ],
  portrait: {
    src: portrait,
    alt: "Illustrated avatar: a dark-haired character resting their chin on one hand",
  },
};

export type Skill = { name: string; icon: SimpleIcon; accent: string };

// `accent` is the hover colour; the 2025 site gave each tile its own brand hue too.
// Only what the work above actually used (plus the Vue/Nuxt this portfolio's first version was built in).
export const skills: Skill[] = [
  { name: "Next.js", icon: siNextdotjs, accent: "#ffffff" },
  { name: "React", icon: siReact, accent: "#61dafb" },
  { name: "TypeScript", icon: siTypescript, accent: "#3178c6" },
  { name: "Tailwind CSS", icon: siTailwindcss, accent: "#38bdf8" },
  { name: "JavaScript", icon: siJavascript, accent: "#f7df1e" },
  { name: "Node.js", icon: siNodedotjs, accent: "#5fa04e" },
  { name: "Vue", icon: siVuedotjs, accent: "#4fc08d" },
  { name: "Nuxt", icon: siNuxt, accent: "#00dc82" },
];

/** The journey's work history, newest first. */
export const experience = [
  {
    period: "Now · NVT - PNE Pizza",
    title: "Web developer engineer",
    text: "Largest contributor to the B Dashboard, the operations platform a multi-store pizza business runs on: live store monitoring, hiring, scheduling and analytics.",
  },
  {
    period: "Before · 3 months",
    title: "Front-end developer",
    text: "Delivered bilingual websites for UAE businesses.",
  },
] as const;

export const study = {
  degree: {
    title: "IT student — in progress", // DRAFT — add the year when you want to show it.
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

/** A detail of the project's screenshot, and where to look for it (0–1 from the top left). */
export type Highlight = { title: string; text: string; focus: { x: number; y: number; zoom: number } };
/** `short` is the label for tight spaces (the Work chapter's overview). */
export type Metric = { value: string; label: string; short?: string };
export type DeepDive = { title: string; text: string; image: StaticImageData; alt: string };
export type Shot = { image: StaticImageData; alt: string; caption: string };
/** A short screen recording: an animated image, plus a still for visitors who prefer no motion. */
export type Clip = { title: string; text: string; clip: StaticImageData; still: StaticImageData; alt: string };

export type CaseStudy = {
  /** DRAFT — what the project is, written from what's on it. */
  summary: string;
  /** DRAFT — details you can see on the screenshot; the case page zooms into each one. */
  highlights: Highlight[];
  /** A few plain numbers, each one counted. */
  metrics?: Metric[];
  /** The product in motion: short looping screen recordings. */
  clips?: Clip[];
  /** What I built: a screen and a few plain sentences each. */
  deepDives?: DeepDive[];
  /** The hard parts, in plain words. */
  challenges?: { title: string; text: string }[];
  /** How it's wired, step by step. */
  architecture?: { label: string; note: string }[];
  /** More screens. */
  gallery?: Shot[];
  /** A client's own words — shown only when there are real ones. */
  quote?: { text: string; by: string };
  /** What I would do next. */
  nextUp?: string;
};

export type ProjectKind = "Flagship" | "Client" | "Freelance" | "Template build";

export type Project = {
  slug: string;
  name: string;
  category: string;
  kind: ProjectKind;
  /** The public address, when it has one. */
  url?: string;
  /** False when the address is known not to load — it is shown, but not linked. */
  linkable?: boolean;
  /** What the browser frame shows when there is no public address. */
  displayUrl?: string;
  image: StaticImageData;
  /** What Tayam did on it. */
  role?: string;
  period?: string;
  stack?: string;
  /** The project's public code, when it is public. */
  repo?: string;
  /** Projects with a case study get a page at /work/[slug]. */
  caseStudy?: CaseStudy;
};

export const projects: Project[] = [
  {
    slug: "b-dashboard",
    name: "B Dashboard",
    category: "Operations platform for a multi-store pizza business",
    kind: "Flagship",
    displayUrl: "internal tool — screenshots only",
    image: bDashboard,
    role: "Largest contributor: front end and API layer",
    period: "NVT - PNE Pizza · now",
    stack: "Next.js 16 · React 19 · TypeScript · Tailwind CSS · Zustand · LiveKit",
    caseStudy: {
      summary:
        "The operations platform a multi-store pizza business runs on: live store monitoring, hiring, scheduling and sales analytics in one place, in English and Arabic. Four core developers built it; I'm the largest contributor, with 301 of its 497 commits.",
      highlights: [
        {
          title: "The day at a glance",
          text: "A strip of the day's key numbers (cash sales, deposits, refunds, customers, tips, over/short and waste) sits above more than thirty cards in six colour-coded groups.",
          focus: { x: 0.58, y: 0.18, zoom: 1.5 },
        },
        {
          title: "One score for the store",
          text: "Store Score turns the day's targets into a single score out of 100, with every target listed underneath it.",
          focus: { x: 0.68, y: 0.44, zoom: 2.4 },
        },
        {
          title: "Sales by hour and channel",
          text: "Hourly sales stack by order channel — register, phone, website, mobile, delivery apps and drive-thru — so a quiet hour or a busy one shows at once.",
          focus: { x: 0.78, y: 0.82, zoom: 2 },
        },
      ],
      metrics: [
        { value: "95", label: "screens" },
        { value: "380+", label: "API routes" },
        { value: "13", label: "backend services connected", short: "backend services" },
        { value: "2", label: "languages, English and Arabic", short: "languages" },
        { value: "301", label: "of 497 commits, one of 4 core developers", short: "commits" },
      ],
      clips: [
        {
          title: "Report a Problem",
          text: "Anyone can pick any card or section of any dashboard page. The page screenshots exactly what they picked, without touching the live screen, and files a ticket with the page details attached.",
          clip: bdReportProblem,
          still: bdReportProblemStill,
          alt: "A screen recording: the Report a problem button is pressed, the Weekly Sales card is picked, and a ticket form opens with its screenshot",
        },
        {
          title: "The drive-thru hotline",
          text: "From any page, connect to a drive-thru lane and talk with one tap. The microphone goes through in-browser noise suppression that can be tuned from the same panel.",
          clip: bdDriveThru,
          still: bdDriveThruStill,
          alt: "A screen recording: the drive-thru panel opens over the dashboard, connects, and the talk button lights up red while talking (logo blurred)",
        },
      ],
      deepDives: [
        {
          title: "Live store monitoring",
          text: "Every kitchen screen and drive-thru lane is a live room. Managers watch several at once, control them remotely, keep them in a floating window while they work elsewhere, and talk to any lane with browser-based noise suppression.",
          image: bdMonitoring,
          alt: "The Screen Project page: one live station large, three more beside it (face blurred)",
        },
        {
          title: "Hiring and labor",
          text: "Hiring and separation requests, an employee master with multi-section forms, and a weekly labor dashboard for headcount, turnover and overtime.",
          image: bdHiring,
          alt: "The Manage Requests page: a table of hiring requests with their status",
        },
        {
          title: "Weekly scheduling",
          text: "Planned, actual and compare views from one fetch, shift drafts with bulk save, conflict warnings a manager can override, and publishing to staff.",
          image: bdScheduling,
          alt: "The Employee Schedule page: a week of shifts per employee (names blurred)",
        },
      ],
      challenges: [
        {
          title: "Many live rooms, one page",
          text: "Several stations stay connected while their tiles swap places, so nothing reconnects or flickers when a manager rearranges the view.",
        },
        {
          title: "Screens that look after themselves",
          text: "A store screen runs unattended. After a drop it signs itself back in, replays the last commands and checks a device change before trusting it.",
        },
        {
          title: "Cleaner audio, inside the browser",
          text: "Noise suppression runs in an audio worklet in the page and falls back to the raw microphone if it fails, so the line never goes silent.",
        },
      ],
      architecture: [
        { label: "Screen", note: "React components" },
        { label: "Hook", note: "one per feature" },
        { label: "Service", note: "typed API calls" },
        { label: "Route handler", note: "Next.js: auth, errors, uploads" },
        { label: "Backend", note: "13 services" },
      ],
      gallery: [
        { image: bdEmployeeForm, alt: "The Add Employee form, with its Personal, Availability, Compensation and Admin tabs", caption: "Add an employee, in four tabs." },
        { image: bdNavigation, alt: "The dashboard with the sidebar open, showing every area of the platform", caption: "Every area, one sidebar." },
        { image: bdCompact, alt: "The dashboard with the sidebar collapsed to icons", caption: "The same page with the sidebar collapsed." },
      ],
      nextUp: "Next, I'd add automated tests around the money and scheduling logic, where a mistake costs the most.",
    },
  },
  {
    slug: "mangos",
    name: "Mangos",
    category: "Website for a two-venue restaurant group",
    kind: "Freelance",
    url: MANGOS_URL || undefined,
    linkable: Boolean(MANGOS_URL),
    displayUrl: "mangos — live link coming",
    image: mangos,
    role: "Design and development",
    period: "Jul–Sep 2026 · freelance, part-time · Columbus, Ohio",
    stack: "Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · Motion",
    repo: "https://github.com/TaeyamSo/mangos-website",
    caseStudy: {
      summary:
        "A brand website for Mangos, a restaurant group in Columbus, Ohio with two venues: a bar and hookah lounge, and a Mediterranean grill. A branded intro opens onto the two venues, and each venue's photo grows into its own page.",
      highlights: [
        {
          title: "Mangos Cafe",
          text: "The bar and hookah lounge gets its own card, with its address and phone number and one tap to enter.",
          focus: { x: 0.29, y: 0.55, zoom: 2.1 },
        },
        {
          title: "Mangos Mediterranean Grill",
          text: "The grill sits beside it, with its halal certification and the same one-tap way in.",
          focus: { x: 0.71, y: 0.55, zoom: 2.1 },
        },
      ],
      challenges: [
        {
          title: "A bug only the live site had",
          text: "The page transition stuttered in production only: an uncached image fetch was racing the route animation. Preloading the images and making the timing consistent fixed it.",
        },
        {
          title: "Content that can move to a backend",
          text: "Every word and image sits in a typed content layer that one setting switches to an HTTP backend, so a CMS can take over without touching a component.",
        },
        {
          title: "The client's real tools",
          text: "Square gift-card checkout, Apple or Google Maps depending on the device, a live \"open now\" badge that handles hours past midnight, and an embedded PDF menu.",
        },
      ],
      gallery: [
        { image: mangosVenue, alt: "A venue page: the bar's photo behind its name, address and phone number", caption: "A venue page, after the photo has grown into it." },
        { image: mangosMobile, alt: "The Mangos home page on a phone: the two venue cards stacked", caption: "On a phone, the venues stack." },
      ],
    },
  },
  {
    slug: "baddar",
    name: "Baddar Furniture",
    category: "Furniture e-commerce store",
    kind: "Client",
    url: "https://baddarfurniture.com/",
    linkable: false,
    image: baddar,
    role: "Front-end development",
    caseStudy: {
      summary:
        "An online store for Baddar Furniture: office furniture and sofas by category, every piece with its model code, its price in dirhams and an order button — in English and Arabic.",
      highlights: [
        {
          title: "Bilingual from the first click",
          text: "A gold menu bar holds the whole catalogue — products, new collections, catalogues — with an Arabic switch at the end.",
          focus: { x: 0.5, y: 0.15, zoom: 2 },
        },
        {
          title: "Shop by category",
          text: "Office furniture, sofas and steel office furniture sit in a sidebar right next to the product grid.",
          focus: { x: 0.2, y: 0.45, zoom: 2.2 },
        },
        {
          title: "One tap to order",
          text: "Every piece shows its code and price with an Order Now button, and WhatsApp is always a tap away.",
          focus: { x: 0.8, y: 0.72, zoom: 2 },
        },
      ],
    },
  },
  {
    slug: "hazo",
    name: "Hazo Interiors",
    category: "Interior design & furnishing",
    kind: "Client",
    url: "https://hazoco.net",
    linkable: true,
    image: hazo,
    role: "Front-end development",
    caseStudy: {
      summary:
        "The website of Hazo Interiors, an interior design and furnishing company: a full-screen slider of interiors up front, with projects, services, clients and certificates a click away — in English and Arabic.",
      highlights: [
        {
          title: "One bar for everything",
          text: "Projects, services, profile, clients and certificates share one menu, with an Arabic switch and social links beside it.",
          focus: { x: 0.5, y: 0.08, zoom: 2 },
        },
        {
          title: "Photography first",
          text: "A full-screen slider lets the rooms speak, with the company's name set quietly over each image.",
          focus: { x: 0.5, y: 0.56, zoom: 1.5 },
        },
      ],
    },
  },
  {
    slug: "alaktabout",
    name: "Al Aktabout",
    category: "Documents clearing services",
    kind: "Client",
    url: "https://alaktabout.net/",
    linkable: false,
    image: alaktabout,
    role: "Front-end development",
    caseStudy: {
      summary:
        "The website of Al Aktabout, a documents clearing company, dressed in its black and gold identity from the header to a framed hero slider — in English and Arabic.",
      highlights: [
        {
          title: "Black and gold",
          text: "The logo's black and gold run through the menu, with the page you're on picked out in gold.",
          focus: { x: 0.3, y: 0.08, zoom: 2.2 },
        },
        {
          title: "A framed showcase",
          text: "A thin gold frame and slide dots turn the hero slider into a showcase.",
          focus: { x: 0.5, y: 0.55, zoom: 1.35 },
        },
      ],
    },
  },
  {
    slug: "al-ain",
    name: "Al Ain Al Thahabiah",
    category: "Building contracting company",
    kind: "Client",
    url: "https://aatb-rak.net/",
    linkable: true,
    image: alAin,
    role: "Front-end development",
    caseStudy: {
      summary:
        "The website of Al Ain Al Thahabiah, a building contracting company: a bilingual identity, a city skyline up front, and its services, projects and certificates one click away.",
      highlights: [
        {
          title: "Two languages, one name",
          text: "The company's English and Arabic names sit side by side in the logo that opens every page.",
          focus: { x: 0.12, y: 0.05, zoom: 2.6 },
        },
        {
          title: "A skyline to open",
          text: "The hero opens on a city skyline, setting the scene for a building contractor.",
          focus: { x: 0.5, y: 0.4, zoom: 1.25 },
        },
        {
          title: "Gold, carried through",
          text: "The logo's gold comes back as the background of the sections below.",
          focus: { x: 0.6, y: 0.9, zoom: 2 },
        },
      ],
    },
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

/** The flagship, then the freelance work: the first two stops of the Work chapter. */
export const flagshipProjects = projects.filter((project) => project.kind === "Flagship");
export const freelanceProjects = projects.filter((project) => project.kind === "Freelance");
/** The UAE client websites (the town scene lights exactly four windows for them). */
export const featuredProjects = projects.filter((project) => project.kind === "Client");
/** Template builds live in the workshop at the end of the Work chapter. */
export const archiveProjects = projects.filter((project) => project.kind === "Template build");

/** Projects with a case-study page, in the order of the Work chapter. */
export const caseStudies = projects.filter(
  (project): project is Project & { caseStudy: CaseStudy } => project.caseStudy !== undefined,
);

export const caseStudyPath = (slug: string) => `/work/${slug}`;

const projectName = (slug: string) => projects.find((project) => project.slug === slug)?.name ?? slug;

// DRAFT — "what I do", each backed by work that exists. The intro is the chapter's title.
export const services = {
  intro: "Websites that look right, systems that run right.",
  items: [
    {
      title: "Business websites",
      description: "Fast, responsive sites that make a company look as good online as it does in person — landing pages included.",
      proof: ["hazo", "al-ain", "alaktabout"].map(projectName),
    },
    {
      title: "E-commerce stores",
      description: "Product catalogues and shopping flows that are a pleasure to browse on any device.",
      proof: ["baddar"].map(projectName),
    },
    {
      title: "Web apps & systems",
      description: "Dashboards and internal tools that run a business day to day: live video monitoring, hiring, scheduling and analytics.",
      proof: ["B Dashboard"],
    },
    {
      title: "Interactive experiences",
      description: "Motion, micro-interactions and the small details that make an interface feel alive.",
      proof: ["Mangos", "This portfolio"],
    },
  ],
};

// DRAFT — the titles of the remaining chapters: plain sentences.
export const chapters = {
  work: {
    statement: "The things I've built, for real businesses.",
    hint: "Scroll to move through the work",
    workshop: { title: "The workshop", text: "Template builds — sites I made to practise and to learn." },
  },
  process: { statement: "From first call to launch." },
  journey: { statement: "Where I've worked, and what I've learned." },
  testimonials: { statement: "What clients say." },
  contact: { statement: "Let's build something", highlight: "bright." },
};

// DRAFT — how a project runs, start to finish. Each card shows the same site in
// a browser at that stage: its address, and a one-word caption.
export const steps = [
  {
    title: "Discover",
    stage: "Brief",
    address: "about:blank",
    description: "We talk goals, audience and content, and agree on what success looks like.",
  },
  {
    title: "Design",
    stage: "Wireframe",
    address: "draft / homepage",
    description: "A visual direction and key screens you can react to early, before any code.",
  },
  {
    title: "Build",
    stage: "Code",
    address: "localhost:3000",
    description: "Clean code from the front end to the API layer, shared as a live preview as it grows.",
  },
  {
    title: "Launch",
    stage: "Live",
    address: "your-business.com",
    description: "Real-device and speed checks, then live — with support after.",
  },
];

// DRAFT — the band under the hero.
export const marquee = ["Websites", "Web apps", "Next.js", "TypeScript", "React", "E-commerce", "Landing pages", "Responsive"];

export type Testimonial = { quote: string; name: string; role: string; mock?: boolean };

// Real client quotes only (with permission), word for word. None yet — the
// Mangos client's exact words go here once they're in hand. Not shown anywhere
// until the Testimonials section is mounted.
export const testimonials: Testimonial[] = [];

// DRAFT — the signposts on the about: three honest numbers, each one counted.
export const facts = [
  { value: 95, label: "Screens in the B Dashboard" },
  { value: 13, label: "Backend services connected" },
  { value: 2, label: "Languages, English and Arabic" },
];
