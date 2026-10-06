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
| Heat rings | Concentric translucent rings fixed behind every section (kept until Phase 5, then retired for a cleaner sky) |
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

- **The sun is a glowing disc.** White-hot in the middle, gold at the rim (brightest in the
  centre, like a real sun), in a soft bloom of light that is always *lighter* than the sky
  — never a dark ring — so it stands clear of the orange. A GPU shader draws it live: the
  edge breathes, the surface simmers, a click makes it flare. At sunset it deepens to red
  over the dark sky. The faceted sunburst lives on as the brand mark (logo, favicon, marquee).
- **A landscape at noon.** Layered poster mountains at the foot of the hero, far ridges hazy
  and near ones deep ember, with the sun sitting in the dip between two peaks and a cloud
  drifting across it. As you scroll the mountains sink away behind the marquee and the sun
  rises out of them; clouds keep drifting through the sky for the rest of the page, warming
  to golden hour, and dark streaks cross the setting sun at the end.
- **The page is a day, and one sun lives through it.** It opens at high noon in the
  hero; as you scroll the same sun lifts into the top-right of the sky, sinks a little
  to its whitest at noon, comes down on the right through the afternoon, then sets in the footer: the dusk sky fills with
  stars, the horizon rises to meet the sun and the sea mirrors it in rippling light.
  Header and navigation switch to light ink automatically.
- **A clean sky.** The 2025 site's concentric heat rings are gone: the flat flame gradient,
  the sun and the landscape carry the hero.
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
| `text-title` | `clamp(3rem, 8.2vw, 8.75rem)` | Large titles on the case-study pages |
| `ease-expo` | `cubic-bezier(.16, 1, .3, 1)` | Every reveal |

Type: **Kanit** (now actually self-hosted via `next/font`) is the voice, **Fraunces Italic** the
accent, **JetBrains Mono** the small technical labels.

- **Plain titles:** every chapter title is one plain sentence in Kanit (`ui/Statement`) — the
  "BIG WORD *italic word*" formula and the "(03) — Services" numbering were common portfolio
  tropes and are gone. The serif accent is kept for the hero ("portfolio", "*alive*.") and for
  clients' quotes; `AccentText` parses the `*word*` markers there (`src/lib/accent.ts`).
- **Fraunces is a pinned static instance** (italic, 400, opsz 144, SOFT 100, WONK 1 — 21 KB) in
  `src/assets/fonts/`, loaded with `next/font/local`. The variable font `next/font/google` would
  ship is 146 KB. Its SIL OFL licence sits next to the file.
- **The hero name is kerned by hand-off:** its letters are split for the intro, which drops the
  font's kerning, so `src/lib/kerning.ts` restores Kanit ExtraBold's own pair values (measured from
  the font; re-measure if the display font changes).

### Time of day

The page is one day, and every part of the story is an hour (`sun/day.ts`): sunrise in the hero,
morning by the about, noon over the services, afternoon through the work and the process, golden
hour by the journey, then sunset and night in the footer. The sky stays in one warm family — no
pinks, purples or blues — and its brightness follows the sun's height: deepest at sunrise,
brightest and most golden at noon, deeper again by evening. `SkyCycle` keeps two fixed layers,
the hour you're in and the next fading in over it, anchored to the sections themselves (each
hour lingers on its section and changes in between); while you scroll only that opacity changes.
The sun, the sky and the side nav's story clock (06:30 → 19:30) all read the same timeline, so
they can never disagree. Every sky keeps ink text above 5.8:1, and a development check warns if a
sky would let the sun's rim sink below its own light (a dark ring) — the reason the sun turns
whiter as it climbs and the golden-hour sky is a touch deeper than the sunrise one.

### Pointer

The native cursor stays (the custom cursor and the film grain are gone: both were common
portfolio tropes and both cost frames). The sun leans a touch towards the pointer.

Browsers only re-check what's under a resting mouse once scrolling stops, so `PointerSync` replays
the pointer as the page scrolls under it: hover effects (tilts, magnetic buttons, the archive
preview) react while the page is still moving.

### Performance

Nothing reads layout per frame: the sun's renderer, the sky, the clock and the landscape measure
the page once (and again when it resizes) and then only work from the scroll position. Scroll
only writes transforms and opacity; a landscape scene that is fully down isn't rendered, and only
a moving scene gets its own layer. The shader draws near the disc only — the wide glow around the
sun is a CSS layer it moves — and nothing sets page-wide CSS variables while scrolling (that would
restyle the whole page).

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

The home page reads as **chapters**, one screen and one hour each (`providers/Chapters.tsx`). A
small scroll, a swipe or a key press glides to the next chapter: the content steps aside, the page
glides — so the sky, the sun, the clock and the landscape change with it — and once it rests the
new chapter's content builds in, piece by piece. Content that doesn't fit one screen walks
sideways instead (the high street's shops; services and process cards on phones). Every chapter
title is a plain sentence: no section numbers, no italic accent word. With reduced motion the
chapters are simply shown and the page scrolls normally.

| Chapter | What it does |
| --- | --- |
| Hero · 06:30 | Letter-by-letter mask reveal with restored kerning, the sun rising out of the mountains (SVG on first paint, then the WebGL sun takes over from the same spot), click-to-flare, a text ring that writes itself letter by letter around the sun, status kicker (availability + live local time) |
| About · 08:30 | "I'm Tayam. I turn ideas into fast, responsive websites for real businesses." Two short paragraphs, the duotone portrait (ink → flame → sunlight) that reveals the original on hover, and the numbers as wooden signposts planted in the morning foothills, rising out of the ground once the rest has built in |
| Services · 12:00 | The promise is the title, on ink bands that sweep in ("I help businesses look as good online as they do in person."); four services side by side, each backed by real projects; the toolkit. Below, **the town at noon** comes to life: the shops open (awnings unroll), the bell rings and the pigeons lift off the tower; people stroll by and a cyclist rides past, smoke rises, the clock turns |
| Work · 14:00 | **The high street**: every client project is a shopfront — its name on the sign, a striped awning, its live site in the shop window, a door out to the real site and a brass plaque (role, sector, year, stack). Scrolling walks down the street a shop at a time (the one you're at comes forward); the window or "Read the case study" opens the project's page, which grows out of the shopfront. The street ends at the workshop, where the template builds are pinned to a board |
| Case studies | `/work/[slug]` for each client project: the shopfront grows into a dark page while its window's screenshot flies to the top. Overview, "A closer look" (the camera glides between details of the live site), the story (brief, approach, outcome), next project, contact. "All work" returns to the same shop. A share image per project |
| Process · 16:00 | "From first call to launch." Four framed cards, each with a small paper browser showing the same website at that stage: notes on a blank page, a wireframe, half built with the code open, the live site. When the chapter arrives the cards build one after another — each edge lights up and its page builds itself |
| Journey · 17:45 | "Where I've worked, and what I've learned." Freelance work, the Meta certificate as a compact verifiable entry, the degree — side by side. Below, **the coast** comes to life (see the scenery notes) |
| Testimonials | Hidden for now (not rendered in page.tsx); a chapter of its own once there are real quotes. Clients speak in the serif; manual pager, no auto-rotation |
| Contact · 19:30 | "Let's build something bright." The last chapter rests at the very bottom of the page: the glide down carries the sky through dusk while the sun sets into the WebGL sea; email, copy-to-clipboard, GitHub, back to sunrise |
| Site-wide | One sun travelling one day, page transitions between the street and the case studies, chapters, scroll-spy side nav with the story clock, full-screen mobile menu, a hairline scrollbar in the colour of the sky, branded 404, OG images, favicon, sitemap, robots, manifest, JSON-LD. No preloader: the intro is CSS and plays on first paint |

**Life in the sky** (`scenery/Life.tsx`) plays one moment per glide: leaving sunrise, a flock
lifts off the mountains and flies up over the morning; between noon and the afternoon a small plane
crosses the sky towing a banner with what Tayam does (the old marquee's message, told by the
story); arriving at golden hour, a V of birds flies home towards the low sun. The page's clouds
take the hour's colour (cream at noon, warmer around it, golden by golden hour) and bob gently as
they drift. After sunset the lighthouse on the far coast lights up and the town's lights come on
one by one — the four brighter ones are the client sites. All of it is time-based transforms on
fixed layers; nothing plays with reduced motion. No moon: the night belongs to a future moon theme.

**The highway** (`scenery/Highway.tsx`), under the process, is built like the town: a side-on road
out of the city (its last towers fading on the left) towards the sea and the lighthouse on the
right, with poles and wires, a guardrail and a "Coast →" sign. When the process arrives
(`data-open`, from `HighwayCues`) the centre line paints in; traffic runs both ways (a car takes a surfboard to the coast), birds hop on the
wire and now and then fly off, a tumbleweed rolls by, the truck kicks up dust; pointing at a car
makes it honk.

**The coast** (`scenery/Coast.tsx`), under the journey, is where the highway was going: the road
ends at a lookout on the cliff where the surfboard car is parked, the lighthouse (unlit — the
footer lights it at sunset) stands by its keeper's cottage, above the sea. When the journey arrives
(`data-open`, from `CoastCues`) the sun's path opens on the water, a sailboat glides in and the
gulls come; the sun's path shimmers, the gulls circle; point at a gull and it flies off with a squawk (and comes
back), point at the sailboat and it rocks.

**The foothills** (`scenery/Foothills.tsx`), under the about: a farm on the near slope (its chimney
smokes) with a windmill beside it, and a stream winding down the valley. When the about arrives
(`data-open`, from `FoothillsCues`) the windmill starts turning and the chimney smokes; point at the
windmill and it spins faster. In front, About's signposts shake now and then (and when you point at
them), and a hot-air balloon floats up the side of the portrait and back — grab it and it comes with
you a little, then springs back (`AboutBalloon`).

**The town at noon** (`scenery/Town.tsx`) is the one scene with life of its own, built on the
hero's lesson — things build in front of you, react to the mouse, and something moves by itself.
It's drawn in the strip's 1440 × 240 units inside a box of exactly that shape that covers the
strip, so the moving parts (HTML/SVG elements over the drawing) line up at every size; on phones
the middle shows — the office, the clock tower, the shop and the billboard. On wide, short screens
the street is trimmed at the strip's top; smoke and pigeons rise freely. `TownCues` sets the
noon moment (`data-open`) from the chapter controller's `chapter:arrive` event. Everything moves with
transform and opacity, and nothing runs while the scene is down. The noon cloud (`CloudLayer`) is
tied to the services rather than the page's length, so it always rests beside the noon sun.

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
  app/            routes (home, work/[slug] case studies), metadata files (OG images, icons,
                  sitemap, robots, manifest), global CSS
  content/        site.ts — every word, link and image on the site
  components/
    case/         CaseBackdrop (the morph target), CaseTour ("A closer look"), CaseMarker
    scenery/      ridges.ts (seeded mountain silhouettes), HeroLandscape (ridges + hero clouds),
                  HeroScroll (the hero's scroll progress, SinkLayer), Cloud (poster cloud art),
                  CloudLayer (clouds through the page, the noon cloud), Landscape +
                  LandscapeMotion (the scenery along the bottom of the screen, mountains to the
                  sea), Town (the living town at noon), Life (birds, the plane)
    chrome/       Header, SideNav, MobileMenu, SectionLink, StoryClock
    sections/     Hero, About, Services, HighStreet (work), Process, Journey, Testimonials, Contact
    sun/          disc.ts → SunDisc (SVG/CSS) + shaders.ts → the journey (journey.ts path,
                  journey-renderer.ts WebGL, SunJourney mount), SunsetStage (CSS sunset), OrbitText;
                  geometry.ts → SunGlyph, the faceted brand mark
    ui/           Statement (chapter titles), InkLabel, Reveal, Tilt, Magnetic, Dashes, RollText,
                  AccentText, BrowserFrame, Duotone, LocalTime, MockBadge
    providers/    Chapters (the home page, a screen at a time), SmoothScroll (Lenis + Motion),
                  PointerSync (hover while scrolling), SkyCycle (the sky), ScrollbarTone (scrollbar
                  colours), HomeLanding (where the home page opens when you arrive from another page)
  lib/            chapters (go to a chapter), accent markup, kerning, mock gating, work-return, hooks (active section, tone,
                  media queries, scroll-to)
  assets/         optimised WebP images (see scripts/optimize-images.mjs)
```

**One sun, two renderers.** `sun/disc.ts` holds the disc's colour stops and the bloom's
light (as formulas, sampled into gradient stops). `SunDisc` paints them as SVG + CSS for the
first frame and without WebGL; `shaders.ts` builds its GLSL ramps from the same arrays, so the
two are the same sun and the hand-over at ~2s is invisible (the bloom steps aside at once, the
disc cross-fades). One rule shapes the colours: moving outwards from the centre, brightness may
only fall — the bloom just past the rim is never brighter than the rim — so the sun can't wear
a dark ring; a development check warns if a change breaks it over any sky the sun meets. By day
the disc stays bright (tone capped); it only deepens to red once the dark footer sky is behind
it. `sun/geometry.ts` keeps the faceted sunburst for the brand mark (SunGlyph, favicon, OG).

**The landscape.** Mountains are three layers of faceted silhouettes generated from a few
anchor points plus seeded jitter (`scenery/ridges.ts`, rendered on the server, identical every
time), with protected zones so they never sit behind the scroll cue or the "portfolio" word.
Desktop and phone ranges are both in the page and CSS picks one. Back to front the hero is: sun
→ hero clouds → orbit ring and "portfolio" → ridges → text, so a cloud can cross the sun with or
without WebGL. As the hero leaves, each layer sinks by a set amount (`SinkLayer`: far 85svh, mid
70svh, near 50svh, clouds 45svh), so far ridges barely move and the sun climbs out of them; the
layers slip behind the marquee band. Clouds are flat poster shapes (`Cloud`): a lit rim on the
side facing the sun, the body, a shade below — no filters. `CloudLayer` is a fixed layer
between the sun's canvas and the page, so clouds pass in front of the sun but behind the copy;
each rises at its depth's pace, is placed so it has left by 90% of the page (never over the
sunset's sea), cross-fades to golden hour with the page, and the layer fades out as the footer
arrives. The sunset has its own clouds, clipped at the horizon.

The day also travels somewhere. After the hero's mountains, a fixed strip along the bottom of the
screen (`Landscape`, between the clouds and the page) shows where the story has got to: foothills
with a farm and a windmill by the about, a small town with its clock tower, shops and
people under the services, the city skyline behind the work, the highway to the coast under the
process, then the coast — cliffs, a lighthouse, the sea catching the sun — by the journey. As each
section's top comes up the screen its scene rises and the last one sinks (`LandscapeMotion`,
transforms only; a cross-fade with reduced motion). The scenes are mid-tones one step darker than
the sky, so copy scrolling over them stays readable; the work cards simply cover the strip. In the
footer the far coast and the lighthouse wait on the horizon, left of the setting sun. Every movement is a transform
or opacity tied to scroll; reduced motion keeps the scenery still (and drops the page clouds),
forced colours hide it.

**The sun's journey.** One fixed, full-viewport canvas and a single fragment shader, no 3D
engine. Each frame `journey.ts` turns the scroll position and a few measured marks (the hero
sun's box, the footer, the horizon) into the sun's position, size and tone:

1. **Hero → morning**: it starts exactly on the hero sun and climbs into the top right, shrinking.
2. **The day** (`day.ts`): it stands highest, small and nearly white, over the services at noon,
   then comes down on the right through the afternoon, bigger and deeper gold by golden hour —
   always clear of the copy on the left. A wide, faint glow keeps the brightest sky around it.
3. **Sunset** (the footer): it drifts down to where the horizon will be at the bottom of the page
   while the horizon rises to meet it. It only moves over and grows once the contact copy has
   passed, so on large screens it never sits behind the heading (three short lines leave the
   right of the sky free). Light copy it may cross on phones gets a soft shade.

While it runs, `html.sun-webgl` retires the stand-ins: the hero disc cross-fades out and its
bloom steps aside, and the footer's gradient and the CSS sunset step aside because the shader
paints the same gradient, then the stars, the sea and the reflection.

**Progressive enhancement.** The server renders a complete, readable page. The hero sun paints as
SVG immediately and the CSS/SVG sunset is a full fallback. The journey starts after the intro
(~2s) once the page is idle, and is skipped without WebGL, on data saver, with reduced motion or
forced colours; if the GPU context is lost it hands back to CSS. It renders at the display rate
while you scroll or move the mouse and drops to ~30fps when only the shimmer is moving.

**Case studies and page transitions.** The pages are prerendered from `site.ts`
(`generateStaticParams`; any other slug is the 404). Moving between the work and a case study
uses React's `<ViewTransition>` with the browser's View Transitions API, so it needs no
animation library and simply doesn't animate where the API is missing:

- **Opening** ("Read the case study"): the card and the case page's fixed dark backdrop share a
  name (`case-<slug>`), so the card grows to fill the screen while its contents fade under it.
  The screenshot shares a name too (`shot-<slug>`) and flies from the monitor to the top of
  the page; the rest of the page rises in once it has opened.
- **Closing** ("All work"): the reverse. The home page first jumps to the card you came from
  (`HomeLanding`, before the first paint, so the page can fold back into it). The back button
  lands on the same card without the animation: React applies back/forward navigations at once
  so the browser can restore the page.
- **Next project** slides the page along. The header keeps a fixed name, so it stays put
  above everything that moves. With reduced motion nothing animates.

Links to home sections from other pages (`SectionLink`) are client-side navigations, and the
home page scrolls to the section itself, so `/#contact` lands exactly where the in-page link
would.

**Performance.** The images in use went from 7.1 MB of PNG/JPG to 0.52 MB of WebP (and are
served as AVIF/WebP at the right size by `next/image`). Fonts are self-hosted and subset. Every
route is statically prerendered. The WebGL renderer is a 6 KB (gzipped) chunk loaded after the
intro; three.js and React Three Fiber (~240 KB) are gone. The initial JavaScript is ~265 KB
gzipped (React, Next.js, Motion, Lenis).

## 5. Roadmap — where the visuals can go next

Done: Phase 3, the WebGL sunset (stars, a rippling water reflection) and one sun for the page;
Phase 4, case studies with page transitions; then a clean sky (no rings), hover that keeps up
with scrolling, the glowing-disc sun and the hero landscape with clouds through the page.
(Edge sunlight and sunbeams were tried and removed.)

1. **Richer case studies** — more screens per project (inner pages, mobile, the Arabic version)
   in the "closer look", and real numbers in the story once there are some.
2. **3D monitor** — the monitor as a 3D object with screenshots as textures and a scroll-driven
   orbit (this would bring three.js back, lazily, for that section only).
3. **Time of day** — tint the sky to the visitor's local time (a true sunrise at 6am).
4. **Content** — a resume download, a LinkedIn link, newer projects, testimonials.

## 6. Content to confirm

These should be checked by Tayam (all in `src/content/site.ts`):

- **Mock — replace to make it appear on the live site:** the 3 testimonials, the availability line
  ("Available for new projects"), the city/time zone (placeholder: Dubai), each client
  project's year and stack (`details` in `projects`), and each case study's story — the brief,
  the approach and the outcome (`caseStudy.story`).
- **Draft — read and adjust:** the hero tagline ("crafting websites that feel *alive*.", replacing
  "21 Year Old /"), the About lead and body, the four services and their one-liners, the four
  process steps, the marquee words, the role on each project ("Front-end development"), and each
  case study's summary and "closer look" details. These were written only from what the
  screenshots show (bilingual menus, the catalogue, the sliders) — check they still match the
  live sites and say what you'd like said about your part in them.
- "IT Student — Year 3" and the Journey entries (add dates if you'd like them shown).
- The contact email (`taeyamfrontend@gmail.com`, taken from the git author config).
- A real photo for About — it gets the duotone treatment automatically.
- Unused assets in the old repo (`baker.png` — Tayam's Bakery, `fin.jpg`, `htmllogo.png`) were
  not carried over; the bakery project could be added to `projects`.
