/**
 * Every word and asset on the site lives here, so updating the portfolio never
 * means touching a component. Copy was carried over from the 2025 Nuxt site
 * (typos fixed, brand names corrected against the live sites).
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
  // DRAFT — replace with your own positioning line. `*word*` sets the serif accent.
  tagline: ["Front-end developer", "crafting websites that feel *alive*."],
  email: "taeyamfrontend@gmail.com",
  socials: [{ label: "GitHub", href: "https://github.com/TaeyamSo" }],
} as const;

export const sections = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "study", label: "Study" },
  { id: "projects", label: "Projects" },
  { id: "contact", label: "Contact" },
] as const;

export type SectionId = (typeof sections)[number]["id"];

export const about = {
  lead:
    "Motivated front-end developer with a proven ability to deliver high-quality projects for real clients, ensuring user-centric design and functionality.",
  body: [
    "Strong problem-solving skills and a passion for staying current with industry trends.",
    "Eager to leverage my expertise and contribute to a forward-thinking team while seeking opportunities for professional growth and development.",
  ],
  portrait: {
    src: portrait,
    alt: "Illustrated avatar: a dark-haired character resting their chin on one hand",
  },
};

export type Skill = { name: string; icon: SimpleIcon; accent: string };

// `accent` is the hover color; the 2025 site gave each tile its own brand hue too.
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
    title: "IT Student — Year 3",
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
};

export const projects: Project[] = [
  {
    slug: "baddar",
    name: "Baddar Furniture",
    category: "Furniture e-commerce store",
    kind: "Client",
    url: "https://baddarfurniture.com/",
    image: baddar,
  },
  {
    slug: "hazo",
    name: "Hazo Interiors",
    category: "Interior design & furnishing",
    kind: "Client",
    url: "https://hazoco.net",
    image: hazo,
  },
  {
    slug: "alaktabout",
    name: "Al Aktabout",
    category: "Documents clearing services",
    kind: "Client",
    url: "https://alaktabout.net/",
    image: alaktabout,
  },
  {
    slug: "al-ain",
    name: "Al Ain Al Thahabiah",
    category: "Building contracting company",
    kind: "Client",
    url: "https://aatb-rak.net/",
    image: alAin,
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

export const facts = [
  { value: projects.length, label: "Projects shipped" },
  { value: projects.filter((p) => p.kind === "Client").length, label: "Client websites" },
  { value: study.certificate.courses.length, label: "Meta courses" },
];
