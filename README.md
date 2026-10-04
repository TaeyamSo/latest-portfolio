# Tayam Soubuh — Portfolio v2

The rebuild of my 2025 Nuxt portfolio in **Next.js 16**. Same identity — the flame-orange
gradient, heavy Kanit type, the faceted sun, the double dash — now fully responsive,
accessible, fast, and alive: one real-time WebGL sun that travels the page as you scroll, from
high noon in the hero to sunset over the sea in the footer, and a case study for each client
project that opens out of its card.

→ Design rationale, audit of the old site and roadmap: [`docs/DESIGN.md`](docs/DESIGN.md)

## Stack

- [Next.js 16](https://nextjs.org) (App Router, Turbopack, static prerendering) + React 19 + TypeScript
- [Tailwind CSS 4](https://tailwindcss.com) with design tokens in `src/app/globals.css`
- [Motion](https://motion.dev) for reveals and scroll-linked animation
- [Lenis](https://lenis.darkroom.engineering) for smooth scrolling
- Plain WebGL: one hand-written fragment shader for the sun's journey (a 6.5 KB lazy chunk)

## Getting started

Requires Node 20.9+ and [pnpm](https://pnpm.io).

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm build      # production build (all routes prerendered)
pnpm start      # serve the production build
pnpm lint
```

## Editing content

Everything on the page — name, tagline, about text, skills, study, projects, email, socials —
lives in [`src/content/site.ts`](src/content/site.ts). Components never hard-code copy.

### Adding a project

1. Convert the screenshot to an optimised WebP:

   ```bash
   pnpm images path/to/screenshot.png=src/assets/projects/my-project.webp
   ```

2. Import it in `site.ts` and add an entry to `projects`.
3. For a case study, give it a `caseStudy`: a one-line `summary` and a few `highlights`, each with
   the spot on the screenshot to zoom into (`focus`: x and y from 0 to 1, and a zoom). The page at
   `/work/<slug>` and its share image are generated from it.

## Deploying

Deploys to [Vercel](https://vercel.com/new) with zero configuration (image optimisation included).
Once a custom domain exists, set `NEXT_PUBLIC_SITE_URL` (see `.env.example`) so canonical URLs,
the sitemap and social previews point at it.

## Project structure

```
src/
  app/          routes + metadata (OG image, icons, sitemap, robots, manifest)
  content/      all copy and data
  components/   chrome/ · sections/ · sun/ · ui/ · providers/
  lib/          small hooks and helpers
  assets/       optimised images
scripts/        image optimisation
docs/           design notes
```
