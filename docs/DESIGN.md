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
- **The page is a day.** It opens at high noon and ends at sunset: the footer fades
  into dusk, and the sun sinks into the horizon as you reach the bottom, mirrored on
  shimmering water. Header and navigation switch to light ink automatically.
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

Type: **Kanit** (now actually self-hosted via `next/font`) for everything, **JetBrains Mono**
for small technical labels such as `(02) — About`.

### Motion principles

1. Things arrive from the left (the original's direction) or rise out of a mask.
2. One easing curve (`ease-expo`) everywhere, so the site moves with one voice.
3. The hero intro is pure CSS, so it plays on first paint — no waiting for JavaScript.
4. Everything continuous is a compositor-friendly transform or opacity.
5. `prefers-reduced-motion` turns off smooth scrolling, intros, the marquee, scroll
   scrubbing and the sun's animation — the content is identical, just still.

## 3. What was built

| Section | Enhancements |
| --- | --- |
| Hero | Letter-by-letter mask reveal, WebGL sun (SVG until WebGL is ready), click-to-flare, scroll cue |
| Marquee | Skills band that drifts, speeds up with scroll velocity and reverses when you scroll up |
| About | Words light up as you scroll, count-up facts derived from the data, tilting framed portrait |
| Skills | The original black tiles, now monochrome logos that bloom into brand colour on hover |
| Study | Timeline with dash markers, all 9 Meta courses, one-click credential verification |
| Projects | Keyboard-accessible tabs (↑ ↓ Home End), a black highlight that slides, monitor with URL bar, wipe transitions, preloaded screenshots |
| Contact | New. Sunset finale, big mailto link, copy-to-clipboard, GitHub, back to sunrise |
| Site-wide | Smooth scrolling, scroll-spy side nav with labels, full-screen mobile menu, grain texture, branded 404, OG image, favicon, sitemap, robots, manifest, JSON-LD |

## 4. Architecture

```
src/
  app/            routes, metadata files (OG image, icons, sitemap, robots, manifest), global CSS
  content/        site.ts — every word, link and image on the site
  components/
    chrome/       Header, SideNav, MobileMenu
    sections/     Hero, Marquee, About, Skills, Study, Projects, Contact
    sun/          geometry.ts → SunGlyph (SVG) + shaders.ts → NoonCanvas (WebGL)
    ui/           Reveal, SectionHeading, ScrubText, Tilt, Magnetic, CountUp, Dashes
    providers/    SmoothScroll (Lenis + Motion), PointerParallax (rings)
  lib/            hooks: active section, tone detection, media queries, scroll-to
  assets/         optimised WebP images (see scripts/optimize-images.mjs)
```

**One sun, many renderers.** `sun/geometry.ts` defines the ray counts, shapes and palettes.
The SVG glyph, favicon, OG image and the GLSL shader are all generated from it, so they can
never drift apart.

**Progressive enhancement.** The server renders a complete, readable page. The hero sun
paints as SVG immediately; three.js and React Three Fiber are only downloaded once the page is
idle (and skipped entirely on data-saver or without WebGL), then cross-fade in. The canvas
stops rendering when it scrolls off-screen.

**Performance.** The images in use went from 7.1 MB of PNG/JPG to 0.52 MB of WebP (and are
served as AVIF/WebP at the right size by `next/image`). Fonts are self-hosted and subset. Every
route is statically prerendered. The WebGL chunk (~240 KB gzipped) is lazy and never blocks
first paint; the initial JavaScript is ~260 KB gzipped (React, Next.js, Motion, Lenis).

## 5. Roadmap — where the visuals can go next

1. **WebGL sunset** — move the footer sun into the shader pipeline: god rays, a real water
   reflection with wave distortion, and twinkling stars in the dusk sky.
2. **Case studies** — `/projects/[slug]` pages (the data model already has slugs) with shared-element
   transitions from the monitor, using React's `<ViewTransition>`.
3. **3D monitor** — replace the CSS monitor with an R3F scene: screenshots as textures, a
   scroll-driven camera orbit, a reflective desk.
4. **Cursor-light** — let the sun "light" the page: a soft spotlight following the cursor that
   subtly brightens the rings and frames.
5. **Time of day** — tint the sky to the visitor's local time (a true sunrise at 6am).
6. **Content** — a resume download, a LinkedIn link, newer projects, testimonials.

## 6. Content to confirm

These were carried over as-is and should be checked by Tayam:

- "21 Year Old" in the hero tagline, and "IT Student — Year 3".
- The contact email (`taeyamfrontend@gmail.com`, taken from the git author config).
- The illustrated avatar in About — swap in a photo or original illustration if preferred.
- Unused assets in the old repo (`baker.png` — Tayam's Bakery, `fin.jpg`, `htmllogo.png`) were
  not carried over; the bakery project could be added to `projects`.
