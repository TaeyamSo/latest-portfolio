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

### Night

The switch in the header (`chrome/ThemeToggle`, a small sun whose rays fold away into a
crescent) turns the day into one night under a waning moon. The sun is the default; a visitor's
night is remembered (`lib/theme.ts`, put on `<html data-theme="night">` before the first paint by
an inline script, so it never flashes the day). Switching, the night spreads out from the sun
itself — a soft circle growing from wherever the sun is on screen (a view transition) — while the
WebGL sun cools to silver and the moon's shadow slides in.

- **The moon** travels the sun's path, drawn the same way (a glowing disc in a soft bloom) but
  still: a few soft seas, no simmer. It wanes as you scroll (`NIGHT` in `sun/day.ts`, stop for
  stop with the day): full over the hero, gibbous by the about, half over the work, a crescent
  by the coast. In the footer it doesn't set like the sun: the crescent stands over the silver
  sea, small (`MOON_STAND` in `sun/day.ts`: 0.3 of the sunset sun's size, never more than 9% of the
  screen's height in radius), its path glittering on the water. The sun's sunset and the moon's
  stand blend as the theme changes (`journey.ts`), so switching there lifts the sun and shrinks it
  into the moon, or lets it sink back. The dark side keeps a faint earthshine; its bloom stays
  around the lit part.
- **The sky** is deep blue — navy to indigo, darkest at midnight over the services, a violet hint
  before dawn — with twinkling stars, a few bright ones that glint, and now and then a shooting
  star (`scenery/NightSky`). The story clock runs 21:00 → 05:00 beside a crescent.
- **The scenes** keep their drawings and change colour: every scene's palette has a day and a
  night value side by side (`lib/palette.tsx` → CSS variables), so switching re-renders nothing.
  Silhouettes are blues stepping down from the sky; the lights are warm and come on one by one
  when their chapter arrives (`.night-light`): the farm's windows, two in three of the town's
  windows, its lamps and clock face, the city's windows and blinking antennas, headlights with
  short beams, the coast's lighthouse with its beam sweeping over the sea. The stream and the
  sun's path on the water turn silver; fireflies drift over the foothills; the birds are bats;
  the street's lamps light up; the balloon's burner glows.
- **The copy** (`data-night-ink`: the home page's main, header, side nav and sky life) swaps ink
  and paper, so dark text turns moonlight-white. Things with their own dark paint keep the day's
  ink (`data-day-ink`): the shopfronts, the workshop, the signposts and the process cards. The
  footer is dark in both; only its sky colours change (`MOONLIT` in `sun/geometry.ts`).
- **No orange at night.** On the home page the accents turn moonlit (flame and amber →
  periwinkle, sunlight and gold → moonlight silver); the shopfronts get night-blue walls and
  cool neon signs (cyan, pink, mint, lilac, a soft yellow for the restaurant) that glow, and the
  flagship store's upper windows are lit; the portrait's duotone, the balloon, the
  signposts, the awnings and the cars all have night colours; the footer's CSS sunset is the
  crescent over the sea. Only lights stay warm: windows, lamps, headlights, lighthouses.
- Selected text at night is a light highlight with dark text (`::selection` in `globals.css`), so it shows on the dark sky.
- There is no scrollbar (`globals.css`): the page scrolls as ever (wheel, touch, keys, links, chapters) but draws no bar.
- Only the home page dresses for the night; the case studies stay as they are.

### Welcome

Every full page load opens on a welcome screen (`welcome/Welcome.tsx`; styles in `globals.css`,
"Welcome"; timing, geometry and the hand-over in `lib/welcome.ts`), about four seconds long:

- **The sequence.** Black, with TAYAM in white — Kanit ExtraBold with the hero's kerning, rising
  letter by letter like the hero's name. A thin white wiggly line draws itself down through the Y
  (the word is nudged so the Y sits in the exact middle of the screen). The sun's sky fills the
  left half from the left edge, the letters there turning black, and the night's sky with its
  stars fills the right half from the right edge, the letters staying white: the Y ends up split
  along the line. Then the line fades — slipping under the winning half as it sets off, so it
  never shows apart from the edge — and the sun sweeps across the night, turning the letters
  black (in the night theme the night sweeps across the sun and they stay white). The word slides
  up out of sight and the screen fades into the page, whose sky is the same.
- **How it moves.** Each half is a window with the wiggly edge (a `clip-path` polygon) that slides
  in while its contents slide back by the same amount, so the colour sweeps in and the letters
  change exactly where its edge passes. Transforms only, so it stays smooth while the page loads
  behind it. The line and both edges come from one wiggle function, so they meet at every size.
  The line never stops wiggling: the shapes are two screens tall and the wave repeats every
  screen, so they slide up one screen in a loop (`w-wave`, 3.6s) while their contents slide back —
  the wave runs along the line and the edges follow it, still all transforms.
- **The hand-over.** While it shows, `<html data-welcome>` holds the page: the hero's intro waits
  (and plays from the start once let go), the page can't scroll, a chapter link (`/#work`) builds
  in afterwards, and the WebGL sun counts its start from the release. The screen itself starts
  once the word's font is in (`data-welcome-wait`, at most 1.2s on a slow connection — black
  until then), so the word never changes font mid-animation.
- It plays on every full load, with no skip. Without JavaScript it still plays and goes away on
  its own; with reduced motion there is none, like the site's other intros.

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
3. The welcome screen and the hero intro are pure CSS — neither waits for JavaScript (the hero's
   intro waits only for the welcome to let go).
4. Everything continuous is a compositor-friendly transform or opacity.
5. `prefers-reduced-motion` turns off the welcome screen, smooth scrolling, intros, the marquee,
   scroll scrubbing and the sun's animation — the content is identical, just still.

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
| About · 08:30 | "I'm Tayam. I build web products for real businesses." Two short paragraphs (what I work with, and what I've built), the duotone portrait (ink → flame → sunlight) that reveals the original on hover, and the numbers as wooden signposts planted in the morning foothills, rising out of the ground once the rest has built in |
| Services · 12:00 | The promise is the title, on ink bands that sweep in ("I help businesses look as good online as they do in person."); four services side by side, each on a frosted panel (paper tint + blur, so light by day and dark glass at night) with full-strength text, a title and a description of about the same length so the cards match; the panels lift and tilt towards the cursor with a soft sheen (`ui/Tilt`); the toolkit. Below, **the town at noon** comes to life: the shops open (awnings unroll), the bell rings and the pigeons lift off the tower; people stroll by and a cyclist rides past, smoke rises, the clock turns |
| Work · 14:00 | **The high street**: every project is a store, walked one at a time (the one you're at comes forward) — four stops, scrolling walks them all. Every store is about half the screen wide, so the one you're at and the next are all you see, and each has its name on the sign with a line under it saying what it is, its site in the display window (no "Open" sign, no blurred placeholders — images load sharp), and a board beside it: what it is, what Tayam did and when, what it's built with (on taller screens) and the ways in — the case study, and the live site where it loads. First the **flagship store**, the B Dashboard: a big rooftop marquee sign ("B DASHBOARD" in lights, a chasing row of bulbs, a "Flagship" plate, "A full platform for every section of a company") on two posts over two storeys; its window plays the product's own screens (the overview, then the two recordings, each from its first frame) and its key numbers sit under it, counting up from zero each time the chapter arrives (`ui/CountUp`). Then **Mangos** under its striped mango awning, tagline "Two venues, one brand — online", its window fading between its home page and a venue page. Then **one store for the UAE client sites** (`sections/UaeStore.tsx`): an arcade under bunting, an arched "UAE client sites" board, four hanging tabs (Baddar, Hazo, Al Aktabout, Al Ain) and a window that shows the sites in turn with the board beside it following — name, category, role, "Read the case study" / "Visit site"; a tab jumps to a site, the show pauses while the pointer or focus is on the store. The windows only move while the street rests at their store (`ui/WindowSlides`; the moving ones swap in from their still) and are still with reduced motion. The window (or the board's button) opens the project's page; each slide keeps its own fixed transition names so the page's backdrop and screenshot grow out of the window. Lamp posts stand between the stores (lit at night), planters by some doors, birds perch on the roofs, and the pavement builds in and steps aside with the stores. The street ends at the workshop, where the template builds are pinned to a board (`sections/HighStreet.tsx`; shared sizes in `lib/street.ts`). The dark full-screen Work stage that replaced it for a while is kept, not deleted: `sections/WorkStage.tsx`, commented out in `app/page.tsx`, its styles resting on its own `.work-stage` class |
| Case studies | `/work/[slug]` for the B Dashboard, Mangos and each UAE client site: the shopfront grows into a dark page while its screenshot flies to the top. Overview, "A closer look" (the camera glides between details of the screenshot), then — for the projects that have them — by the numbers (counting up as they scroll into view, `ui/CountInView`), in motion (the recordings), what I built (a screen each), the hard parts, how it's wired (drawn as a request's road: stations on one wire with a picture each, grouped under "In the browser" / "On the server", a spark running to the backend and the answer coming back), a client's words (only when real) and what I'd do next (`components/case/CaseExtras.tsx`). The page ends with its two ways on side by side — a big "All work" card and the next project — so going back is never hard to find. "All work" (or the browser's Back button) returns to the store you came from — the saved project beats the URL's `#work`, and the chapters' first placement no longer writes a hash that would send you to Contact (`HomeLanding`, `Chapters` `quiet`). A share image per project |
| Process · 16:00 | "From first call to launch." Four framed cards, each with a small paper browser showing the same website at that stage: notes on a blank page, a wireframe, half built with the code open, the live site. When the chapter arrives the cards build one after another — each edge lights up and its page builds itself |
| Journey · 17:45 | "Where I've worked, and what I've learned." A **timeline**: a line draws itself across the page (down the left on narrow screens) through four stops — the current job (its dot pulses), the one before, the Meta certificate (a compact verifiable entry with the certificate itself shown large, and linked to Coursera) and the degree. Each stop hangs off the line on a frosted panel (paper tint + blur, like the services) with full-strength text; hovering or focusing one swells its dot and lifts the panel. Below, **the coast** comes to life (see the scenery notes) |
| Testimonials | Hidden for now (not rendered in page.tsx); a chapter of its own once there are real quotes. Clients speak in the serif; manual pager, no auto-rotation |
| Contact · 19:30 | "Let's build something bright." The last chapter rests at the very bottom of the page: the glide down carries the sky through dusk while the sun sets into the WebGL sea; email, copy-to-clipboard, GitHub, back to sunrise |
| Site-wide | One sun travelling one day, page transitions between the street and the case studies, chapters, scroll-spy side nav with the story clock, full-screen mobile menu, no scrollbar, branded 404, OG images, favicon, sitemap, robots, manifest, JSON-LD. The welcome screen on every full load (see Welcome), then the hero's CSS intro |

**Life in the sky** (`scenery/Life.tsx`) plays one moment per glide: leaving sunrise, a flock
lifts off the mountains and flies up over the morning; arriving at golden hour, a V of birds flies
home towards the low sun. (A small plane towed a banner with what Tayam does between noon and the
afternoon; it's commented out in `Life.tsx`, ready to bring back.) The page's clouds
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
                  sea), Town (the living town at noon), Life (birds; the plane is commented out)
    chrome/       Header, SideNav, MobileMenu, SectionLink, StoryClock
    sections/     Hero, About, Services, HighStreet + UaeStore (work), Process, Journey, Testimonials, Contact
    sun/          disc.ts → SunDisc (SVG/CSS) + shaders.ts → the journey (journey.ts path,
                  journey-renderer.ts WebGL, SunJourney mount), SunsetStage (CSS sunset), OrbitText;
                  geometry.ts → SunGlyph, the faceted brand mark
    ui/           Statement (chapter titles), InkLabel, Reveal, Tilt, Magnetic, Dashes, RollText,
                  AccentText, BrowserFrame, Duotone, LocalTime, MockBadge
    welcome/      Welcome (the welcome screen), WelcomeGuard (keeps its hold in development)
    providers/    Chapters (the home page, a screen at a time), SmoothScroll (Lenis + Motion),
                  PointerSync (hover while scrolling), SkyCycle (the sky),
                  HomeLanding (where the home page opens when you arrive from another page)
  lib/            chapters (go to a chapter), welcome (the welcome screen's timing, line and hand-over),
                  accent markup, kerning, mock gating, work-return, hooks (active section, tone,
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
arrives. The sunset's own dusk clouds are commented out for now (`SunsetStage.tsx`). The drifting clouds are timed so none rests behind a chapter's title when the page stops there (`CLOUDS` in `CloudLayer.tsx`: each one's `enter`).

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

**Text first.** The words lead and the scenery sits behind them, in two ways. A thin **haze** in the sky's own colour of the hour lies over each scene of the landscape strip (`[data-scene]::after`, so it rises and sinks with its scene and never covers the hero or the footer's sea; `SkyCycle` publishes the colour as `--haze-*`), so the silhouettes sit a step nearer the sky, and the page clouds are softened to 60%. And each chapter's **scene wakes up after its text**: the scenery cues (town, foothills, highway, coast) open `SCENE_AFTER_TEXT_MS` (0.9 s) after the chapter arrives, once its words have built in, so the first thing that moves is what you should read.

**The cloud pass.** A click that jumps four chapters or more (the side nav, the mobile menu, "Let's talk", "Back to sunrise") doesn't race the whole day past: a bank of the page's own poster clouds over the sky of the hour you're arriving at (its orange by day, the ember at the sunset, moonlit blue at night), rolls across the screen — from the right going down the page, from the left going back up — the page jumps to the chapter while it's covered, and the bank rolls on and away to reveal it (about 1.7 s; `scenery/CloudPass.tsx`, `CLOUD_PASS_MIN` and timings in `lib/chapters.ts`). Shorter jumps glide as before.

**One section at a time.** A scroll, swipe or key moves one stop; while the page is moving, and for `SETTLE_MS` (0.7 s) after a new chapter arrives while its content builds in, further input is ignored (nothing queues up), so every section is seen loaded before the next.

**The short welcome.** The full welcome plays on a visitor's first visit (remembered in localStorage, `welcome-seen`) and on every hard refresh (Ctrl+Shift+R / Ctrl+F5 / Cmd+Shift+R — the browser asks for the page with `Cache-Control: no-cache`, and `src/proxy.ts` answers with a 30-second `welcome-full` cookie the head script reads and clears); every other load gets the short one (`data-welcome-mini`): the page's own sky — sunrise, or the night in the night theme — with TAYAM rising in and slipping away, about 1.5 s. The full welcome starts as it always has (once its font is in); the short one waits until the page has hydrated (`welcome:ready` from `WelcomeGuard`, at most 3 s), so the heavy part of loading happens while its screen is still and it plays smoothly from its first frame. Either way the screen is taken out of the page (`display: none`) once it has faded, so its endless animations stop.

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
(~2s) once the page is idle — at once, when the page opens below the hero (a reload halfway down), where the canvas
fades in over about a second instead of popping on, and the footer's CSS sunset fades away over it — and is skipped without WebGL, on data saver, with reduced motion or
forced colours; if the GPU context is lost it hands back to CSS. It draws at up to ~60fps while
you scroll or move the mouse and ~20fps when only the shimmer is moving, within a pixel budget
(about 2.6 million pixels on a desktop, half that on phones — a 1440x900 screen at 2x draws 2.6
million instead of 5.2; never below one pixel per CSS pixel).

**Speed.** The bytes are small (about 1.4 MiB of images, ~260 KB of gzipped JavaScript on the home
page); what a visitor waits for is mostly choreography, so it is kept short: a glide takes 0.95 s
and each piece of a chapter builds in 0.07 s after the last. The window clips load only when
their store is reached, the UAE store's slides are the same lazy images, `profile` and `sections`
live in `content/profile.ts` so the header, menu and side nav don't pull every project into the
browser, the image optimiser makes WebP only (the sources already are, and AVIF is slow to encode
on first request) and caches for a month, and Kanit loads only the weights the site uses. The
welcome screen is untouched on purpose.

**Smooth glides — one rule.** Nothing reads `window.scrollY` inside an animation frame: in Chrome that read forces a full style and layout pass whenever another layer has just written its styles, and during a glide several do (the landscape, the clouds, the sky, the sun). The scroll position is taken in the scroll event instead (`LandscapeMotion`, the sun's renderer, `useDarkAt`); the landscape writes a scene's visibility and layer hint only when they change; and the haze colours live on the landscape strip, never on `<html>` (a custom property changed on the root restyles the whole page). Measured over five glides: slowest frame 83 ms → 17.5 ms, none over 50 ms, main-thread work about a third.

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
3. **Time of day** — tint the sky to the visitor's local time (a true sunrise at 6am), or start
   in the night theme after dark.
4. **Content** — a resume download, a LinkedIn link, newer projects, testimonials.

## 6. Content to confirm

These should be checked by Tayam (all in `src/content/site.ts`). Nothing is mock any more: the
Work chapter, the case studies, the About, the experience and the facts are written from the CV
and from what git shows he built (the B Dashboard) or from the projects themselves.

- **To fill in:** `MANGOS_URL` (the live address — it switches on the "Visit the live site" links
  and the address bar), the Mangos client's exact words (`quote` in its case study — never shown
  until it is real), a LinkedIn link in `profile.socials`, and a city if you want one instead of "UAE".
- **Draft — read and adjust:** the hero tagline, the About lead and body, the four services and
  their one-liners, the four process steps, the marquee words, the role on each project, and each
  case study's summary and "closer look" details.
- **Removed on purpose** because they were not backed by the B Dashboard: Prisma, PostgreSQL and
  Docker (skills, About, services, process, metadata). Add them back only if you have shipped with
  them. Also removed: any "years at the company" claim, the company's franchise brand, and every
  invented testimonial or outcome story.
- **Client links:** only hazoco.net and aatb-rak.net are linked (`linkable: true`). baddarfurniture.com
  (certificate error) and alaktabout.net (does not resolve) are shown but not linked — switch
  `linkable` on once they load.
- **B Dashboard screenshots and recordings** are in `src/assets/projects/b-dashboard/`, with the staff
  names, the signed-in user, one face and the logo in the drive-thru panel blurred. The two
  recordings were cut from Tayam's own screen captures (`Videos/Screen Recordings`, 2026-10-14) as
  8 fps looping WebP with a still each; to change them, re-cut from the recordings. Check with the employer before keeping real sales figures
  and the store number on show. The repo link stays off until the repo's README is replaced.
- "IT student — in progress" and the Journey entries (add dates if you'd like them shown).
- The contact email (`taeyamfrontend@gmail.com`, taken from the git author config).
- A real photo for About — it gets the duotone treatment automatically.
- Unused assets in the old repo (`baker.png` — Tayam's Bakery, `fin.jpg`, `htmllogo.png`) were
  not carried over; the bakery project could be added to `projects`.
