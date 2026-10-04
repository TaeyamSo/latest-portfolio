import { SunsetStage } from "@/components/sun/SunsetStage";
import { Magnetic } from "@/components/ui/Magnetic";
import { Reveal, RevealWords } from "@/components/ui/Reveal";
import { profile, sectionNumber } from "@/content/site";

import { BackToTop, CopyEmail } from "./ContactActions";

/**
 * Contact lives in the page footer — the day ends at sunset. The top of the
 * footer fades from the orange page into dusk, so there's no hard edge.
 * `sun-sky` marks the backgrounds the WebGL sun paints itself while it runs
 * (its shader mirrors this gradient), and `sun-legible` the copy it may pass
 * behind on its way down to the sea.
 */
export function Contact() {
  const year = new Date().getFullYear();

  return (
    <footer
      id="contact"
      aria-labelledby="contact-title"
      data-cursor-tone="light"
      className="sun-sky relative z-10 isolate overflow-hidden bg-[linear-gradient(to_bottom,transparent,var(--color-ember)_12svh,var(--color-dusk)_26svh,var(--color-night)_58svh)] pt-[38svh] text-paper outline-none"
    >
      {/* The page's drifting clouds fade out while this first stretch of dusk comes in. */}
      <div data-cloud-fade aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[40svh]" />
      {/* Marks the dark part of the footer so fixed UI can switch to light ink. */}
      <div data-tone="dark" aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-[18svh] bottom-0" />

      <div data-scroll-anchor data-scroll-offset="0.16" className="shell relative">
        <Reveal>
          <p className="meta mb-6 flex items-center gap-3 text-paper/70">
            <span>({sectionNumber("contact")})</span>
            <span aria-hidden="true" className="h-px w-10 bg-current" />
            <span>Contact</span>
          </p>
        </Reveal>
        {/* Three short lines keep the right of the sky clear for the setting sun. */}
        <h2 id="contact-title" className="sun-legible text-title font-extrabold uppercase">
          <RevealWords text="Let's build" />
          <br />
          <RevealWords text="something" delay={0.12} />
          <br />
          <span className="text-gold">
            <RevealWords text="*bright.*" delay={0.2} />
          </span>
        </h2>

        <Reveal delay={0.15} className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-5">
          <Magnetic strength={0.12}>
            <a
              href={`mailto:${profile.email}`}
              className="sun-legible group relative text-[clamp(1.35rem,3.6vw,3.4rem)] leading-tight font-medium break-all"
            >
              {profile.email}
              <span
                aria-hidden="true"
                className="absolute -bottom-1 left-0 h-1 w-full origin-left scale-x-[0.18] rounded-full bg-gold transition-transform duration-700 ease-expo group-hover:scale-x-100"
              />
            </a>
          </Magnetic>
          <CopyEmail email={profile.email} />
        </Reveal>

        <Reveal delay={0.25}>
          <ul className="sun-legible meta mt-10 flex flex-wrap gap-6 text-paper/75">
            {profile.socials.map((social) => (
              <li key={social.href}>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-dash transition-colors hover:text-paper"
                >
                  {social.label} <span aria-hidden="true">↗</span>
                </a>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>

      <SunsetStage />

      <div className="sun-sky shell meta relative flex flex-col gap-3 bg-[#0a0403] pt-2 pb-8 text-paper/55 sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {year} {profile.fullName}
        </p>
        <p>Built with Next.js, WebGL &amp; plenty of sunlight</p>
        <BackToTop />
      </div>
    </footer>
  );
}
