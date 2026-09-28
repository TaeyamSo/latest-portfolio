# Tayam Soubuh — Portfolio v2

The rebuild of my 2025 Nuxt portfolio in **Next.js 16**. Same identity — the flame-orange
gradient, heavy Kanit type, the sun and its heat rings, the double dash — now fully responsive,
accessible, fast, and alive: a real-time WebGL sun, smooth scrolling, and a page that plays out
like a day, from high noon to sunset.

→ Design rationale, audit of the old site and roadmap: [`docs/DESIGN.md`](docs/DESIGN.md)

## Stack

- [Next.js 16](https://nextjs.org) (App Router, Turbopack, static prerendering) + React 19 + TypeScript
- [Tailwind CSS 4](https://tailwindcss.com) with design tokens in `src/app/globals.css`
- [Motion](https://motion.dev) for reveals and scroll-linked animation
- [Lenis](https://lenis.darkroom.engineering) for smooth scrolling
- [three.js](https://threejs.org) + [React Three Fiber](https://r3f.docs.pmnd.rs) for the WebGL sun (lazy-loaded)

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
