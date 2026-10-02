# Design & rebuild notes

This is the plan behind v2: what the 2025 Nuxt site got right, what held it back,
and how the Next.js rebuild keeps its identity while turning it into something alive.

## 1. Audit of the 2025 site (`myportfolio4`)

The old repo only contains the generated Nuxt build, so the audit was done by
serving that build and inspecting it at laptop sizes (1440×900 and 1366×768).

### Identity worth keeping

| Element | Detail |
| --- | --- |
| Palette | Flame → amber gradient (`#fd5d16 → #fd8916` at 49%), black type, white as the hover/active colour |
| The sun | A faceted, two-layer sunburst rotating once every 52s, with "PORTFOLIO" overlapping it |
| Heat rings | Concentric translucent rings fixed behind every section |
| Typography | Heavy uppercase display headings (100–120px), Kanit |
| The double dash | Two offset black pills under every heading — the site's signature |
| Black frames | Portrait, certificate, tech tiles and the project "monitor" all sit in black boxes |
| Side navigation | A column of dashes; the active one is longer |
| Motion | Text slides in from the left, the sun from the right; hover turns things white |

### What held it back

| Problem | Evidence |
| --- | --- |
| Scrolling was disabled | `body { overflow: hidden }` above 768px and no wheel/keyboard handler — the five unlabeled dashes were the only way to move |
| Navigation lied | The active dash only changed on click, never on scroll |
| The font never loaded | Kanit was declared but never imported, so most visitors saw Arial |
| Not responsive | Fixed pixel sizes (`margin-left: 180px`, `620px` sun, `translateX(-550px)`); at 1366×768 the sun clipped off-screen and the dashes collided with headings |
| Mobile hid content | Sun, portrait, certificate and soft skills were `display: none` on phones |
| No SEO | No `<title>`, no description, no Open Graph image |
| Accessibility | 0 of 11 images had `alt`, nav links had no accessible names, projects were clickable `<h4>`s (no keyboard support) |
| Weight | ~2.4 MB on first load; one project screenshot alone was 1.1 MB |
| No way to get in touch | No email, socials or call to action anywhere |
| Content slips | "Comunication", "Certifcate", "Hazo Enteriors", "Badar Furniture", "AL Alaktabout", "Al Ain-AlThahabia"; external links used `target="#"` |

## 2. Direction — "A day under the sun"

Keep every recognisable piece, then make it feel alive and give it a story:

- **The sun is real-time.** A GPU shader draws the same faceted sun (same geometry,
  same colours) — its rays breathe, rotate on the original 52s cycle, lean towards
  the cursor, and flare when clicked. The disc has a subtle heat shimmer.
- **The page is a day, and one sun lives through it.** It opens at high noon in the
  hero; as you scroll the same sun lifts into the top-right of the sky, sinks a little
  and warms through the afternoon, then sets in the footer: the dusk sky fills with
  stars, the horizon rises to meet the sun and the sea mirrors it in rippling light.
  The heat rings stay centred on it the whole way. Header and navigation switch to
  light ink automatically.
- **The double dash is the system.** Under headings, as nav indicators, list bullets,
  timeline markers, link underlines and the mobile menu button.
- **Content is the hero.** Big type, black frames, real screenshots in a monitor with a
  URL bar, verifiable credentials — nothing invented.

### Tokens (`src/app/globals.css`)

| Token | Value | Use |
| --- | --- | --- |
| `flame` / `amber` | `#fd5d16` / `#fd8916` | The original background gradient |
| `gold` / `sunlight` | `#ffb629` / `#ffd84a` | Accents on dark (sunset, menu) |
| `ember` → `dusk` → `night` | `#b3300c` → `#3b1409` → `#120705` | The sunset footer |
| `ink` / `paper` | `#0d0a08` / `#fffaf4` | Type, frames / hover, light ink |
| `text-display` | `clamp(3.6rem, 15vw, 8rem)`, `9.6vw` on desktop | The name |
| `text-title` | `clamp(3rem, 8.2vw, 8.75rem)` | Section titles |
| `ease-expo` | `cubic-bezier(.16, 1, .3, 1)` | Every reveal |

Type: **Kanit** (now actually self-hosted via `next/font`) is the voice, **Fraunces Italic** the
accent, **JetBrains Mono** the small technical labels such as `(02) — About`.

- **The accent rule:** one serif-italic word per composition, marked in copy with asterisks —
  `"About *me*"`, `"Selected *work*"`, `"something *bright.*"`. `RevealWords` and `AccentText`
  parse the markers (`src/lib/accent.ts`); accent masks carry extra room for the italic lean,
  ascenders and descenders.
- **Fraunces is a pinned static instance** (italic, 400, opsz 144, SOFT 100, WONK 1 — 21 KB) in
  `src/assets/fonts/`, loaded with `next/font/local`. The variable font `next/font/google` would
  ship is 146 KB. Its SIL OFL licence sits next to the file.
- **The hero name is kerned by hand-off:** its letters are split for the intro, which drops the
  font's kerning, so `src/lib/kerning.ts` restores Kanit ExtraBold's own pair values (measured from
  the font; re-measure if the display font changes).

### Time of day

The page's colour follows the day: noon orange at the top deepens to golden hour by the projects
(`DayCycle`, a scroll-linked opacity layer the browser animates on its scroll timeline), then the
footer carries it into dusk and night. Every stop keeps ink text above 4.5:1.

### Cursor

On mouse devices a dot + trailing ring replaces the cursor. The ring grows over controls and shows
a label from `data-cursor` (Flare, Visit, Verify, Copy, Rise); it turns light over surfaces
marked `data-cursor-tone="light"`. Touch, pen, forced colours and reduced motion keep the native
cursor.

### Motion principles

1. Things arrive from the left (the original's direction) or rise out of a mask.
2. One easing curve (`ease-expo`) everywhere, so the site moves with one voice.
3. The hero intro is pure CSS, so it plays on first paint — no waiting for JavaScript.
4. Everything continuous is a compositor-friendly transform or opacity.
5. `prefers-reduced-motion` turns off smooth scrolling, intros, the marquee, scroll
   scrubbing and the sun's animation — the content is identical, just still.

## 3. What was built

The page tells a story in order: **who** (hero, about) → **what** (services) → **proof** (work) →
**how** (process) → **background** (journey) → **trust** (testimonials) → **contact**.

| Section | What it does |
| --- | --- |
| Hero | Letter-by-letter mask reveal with restored kerning, the sun (SVG on first paint, then the WebGL sun takes over from the same spot), click-to-flare, orbiting text ring that fades as the sun leaves, status kicker (availability + live local time) |
| Marquee | What Tayam does, in alternating Kanit caps and serif italic; drifts, speeds up with scroll velocity, reverses on scroll up |
| About | First-person lead that lights up word by word, count-up facts from the data, duotone portrait (ink → flame → sunlight) that reveals the original on hover |
| Services | "What I *do*": four capability rows, each backed by real projects; a black block sweeps in on hover. The original skill tiles live on as a compact toolkit shelf |
| Work | Each client project is a full-screen dark card; from tablets up the cards pin and stack as you scroll, the previous one scaling back into the deck and dimming. The monitor turns paper-on-ink with "Visit website" as its stand; role, sector, year and stack sit underneath. Template builds follow in an archive list whose rows show a tilted preview that follows the cursor |
| Process | "From idea to *launch*": four steps on a track that fills as you scroll, with a small sun riding the leading edge; soft skills as "Along the way" |
| Journey | Freelance client work, the Meta certificate as a compact verifiable entry (badge, thumbnail, courses in a disclosure), the degree; sticky heading |
| Testimonials | "Kind *words*": clients speak in the serif. Manual pager, no auto-rotation |
| Contact | Sunset finale: the travelling sun sets right of the copy (centred on phones) into a WebGL sea with ripples, a glitter path and stars; big mailto link, copy-to-clipboard, GitHub, back to sunrise |
| Site-wide | One sun travelling the whole page, smooth scrolling, scroll-spy side nav, header that tucks away while reading, full-screen mobile menu, custom cursor, time-of-day tint, grain, branded 404, OG image, favicon, sitemap, robots, manifest, JSON-LD. No preloader: the intro is CSS and plays on first paint |

### Draft and mock content

- **DRAFT** (in comments) marks copy written from real facts — projects, certificate, skills — that
  ships but should be read and adjusted.
- **`mock: true`** marks placeholder content that would be a false claim if it shipped
  (testimonials, availability, city). It renders **only in development**, with a dashed "Mock"
  badge, and is left out of production builds automatically (`src/lib/mock.ts`). To preview it on a
  deploy, set `NEXT_PUBLIC_SHOW_MOCKS=true`. Replace it with real content and drop the flag.

## 4. Architecture

```
src/
  app/            routes, metadata files (OG image, icons, sitemap, robots, manifest), global CSS
  content/        site.ts — every word, link and image on the site
  components/
    chrome/       Header, SideNav, MobileMenu, Cursor
    sections/     Hero, Marquee, About, Services, Projects (work), Process, Journey, Testimonials, Contact
    sun/          geometry.ts → SunGlyph (SVG) + shaders.ts → the journey (journey.ts path,
                  journey-renderer.ts WebGL, SunJourney mount), OrbitText, SunsetStage (CSS sunset)
    ui/           Reveal, SectionHeading, ScrubText, Tilt, Magnetic, CountUp, Dashes, RollText,
                  AccentText, Duotone, LocalTime, MockBadge
    providers/    SmoothScroll (Lenis + Motion), PointerParallax (rings), DayCycle (tint)
  lib/            accent markup, kerning, mock gating, hooks (active section, tone, media queries, scroll-to)
  assets/         optimised WebP images (see scripts/optimize-images.mjs)
```

**One sun, many renderers.** `sun/geometry.ts` defines the ray counts, shapes and palettes.
The SVG glyph, favicon, OG image and the GLSL shader are all generated from it, so they can
never drift apart.

**The sun's journey.** One fixed, full-viewport canvas and a single fragment shader, no 3D
engine. Each frame `journey.ts` turns the scroll position and a few measured marks (the hero
sun's box, the footer, the horizon) into the sun's position, size and tone:

1. **Hero → sky** (the first 80% of the hero): it starts exactly on the hero sun and eases into
   the top right, shrinking.
2. **Afternoon** (the middle of the page): it sinks a little and its palette warms towards sunset.
3. **Sunset** (the footer): it drifts down to where the horizon will be at the bottom of the page
   while the horizon rises to meet it. It only moves over and grows once the contact copy has
   passed, so on large screens it never sits behind the heading (three short lines leave the
   right of the sky free). Light copy it may cross on phones gets a soft shade.

While it runs, `html.sun-webgl` retires the stand-ins: the hero glyph cross-fades out (the rays
start where the CSS spin has turned them, so nothing jumps), and the footer's gradient and the
CSS sunset step aside because the shader paints the same gradient, then the stars, the sea and
the reflection. The heat rings follow the sun (moved by the renderer, scaled a little less).

**Progressive enhancement.** The server renders a complete, readable page. The hero sun paints as
SVG immediately and the CSS/SVG sunset is a full fallback. The journey starts after the intro
(~2s) once the page is idle, and is skipped without WebGL, on data saver, with reduced motion or
forced colours; if the GPU context is lost it hands back to CSS. It renders at the display rate
while you scroll or move the mouse and drops to ~30fps when only the slow spin is moving.

**Performance.** The images in use went from 7.1 MB of PNG/JPG to 0.52 MB of WebP (and are
served as AVIF/WebP at the right size by `next/image`). Fonts are self-hosted and subset. Every
route is statically prerendered. The WebGL renderer is a 6 KB (gzipped) chunk loaded after the
intro; three.js and React Three Fiber (~240 KB) are gone. The initial JavaScript is ~265 KB
gzipped (React, Next.js, Motion, Lenis).

## 5. Roadmap — where the visuals can go next

Done in Phase 3: the WebGL sunset (stars, a rippling water reflection) and one sun for the page.

1. **Case studies (Phase 4)** — `/work/[slug]` pages (the data model already has slugs) with
   shared-element transitions from the project cards, using React's `<ViewTransition>`.
2. **Sunlight on the page** — let the sun's position light the frames and cards it passes (a soft
   rim of light on the side facing it), and god rays through the dusk.
3. **3D monitor** — the monitor as a 3D object with screenshots as textures and a scroll-driven
   orbit (this would bring three.js back, lazily, for that section only).
4. **Time of day** — tint the sky to the visitor's local time (a true sunrise at 6am).
5. **Content** — a resume download, a LinkedIn link, newer projects, testimonials.

## 6. Content to confirm

These should be checked by Tayam (all in `src/content/site.ts`):

- **Mock — replace to make it appear on the live site:** the 3 testimonials, the availability line
  ("Available for new projects"), the city/time zone (placeholder: Dubai), and each client
  project's year and stack (`details` in `projects`).
- **Draft — read and adjust:** the hero tagline ("crafting websites that feel *alive*.", replacing
  "21 Year Old /"), the About lead and body, the four services and their one-liners, the four
  process steps, the marquee words, and the role on each project ("Front-end development").
- "IT Student — Year 3" and the Journey entries (add dates if you'd like them shown).
- The contact email (`taeyamfrontend@gmail.com`, taken from the git author config).
- A real photo for About — it gets the duotone treatment automatically.
- Unused assets in the old repo (`baker.png` — Tayam's Bakery, `fin.jpg`, `htmllogo.png`) were
  not carried over; the bakery project could be added to `projects`.
