import { SunsetStage } from "@/components/sun/SunsetStage";
import { Magnetic } from "@/components/ui/Magnetic";
import { Statement } from "@/components/ui/Statement";
import { chapters, profile } from "@/content/site";

import { BackToTop, CopyEmail } from "./ContactActions";

type Vars = React.CSSProperties & Record<`--${string}`, string | number>;

/**
 * 19:30, sunset, at the sea — the last chapter, in the page footer. It rests
 * at the very bottom of the page (`data-rest="end"`), so the glide down from
 * the journey carries the sky through dusk while the sun sets, and the whole
 * evening — the invitation, the email, the sea — fits one screen.
 * `sun-sky` marks the backgrounds the WebGL sun paints itself while it runs
 * (its shader mirrors this gradient), and `sun-legible` the copy it may pass
 * behind on its way down to the sea.
 */
export function Contact() {
  const year = new Date().getFullYear();
  const { statement, highlight } = chapters.contact;

  return (
    <footer
      id="contact"
      data-chapter=""
      data-rest="end"
      aria-labelledby="contact-title"
      className="sun-sky relative z-10 isolate overflow-hidden bg-[linear-gradient(to_bottom,transparent,var(--color-ember)_12svh,var(--color-dusk)_26svh,var(--color-night)_58svh)] pt-[38svh] text-paper outline-none"
    >
      {/* The page's drifting clouds fade out while this first stretch of dusk comes in. */}
      <div data-cloud-fade aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[40svh]" />
      {/* Marks the dark part of the footer so fixed UI can switch to light ink. */}
      <div data-tone="dark" aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-[18svh] bottom-0" />

      <div className="shell relative">
        <Statement id="contact-title" className="sun-legible max-w-[18ch] text-[clamp(2rem,4.2vw,4.4rem)]">
          {statement} <span className="text-gold">{highlight}</span>
        </Statement>

        <div data-build="" style={{ "--b": 1 } as Vars} className="mt-[clamp(1rem,3svh,2rem)] flex flex-wrap items-center gap-x-8 gap-y-4">
          <Magnetic strength={0.12}>
            <a
              href={`mailto:${profile.email}`}
              className="sun-legible group relative text-[clamp(1.25rem,2.8vw,2.8rem)] leading-tight font-medium break-all"
            >
              {profile.email}
              <span
                aria-hidden="true"
                className="absolute -bottom-1 left-0 h-1 w-full origin-left scale-x-[0.18] rounded-full bg-gold transition-transform duration-700 ease-expo group-hover:scale-x-100"
              />
            </a>
          </Magnetic>
          <CopyEmail email={profile.email} />
        </div>

        <ul data-build="" style={{ "--b": 2 } as Vars} className="sun-legible meta mt-[clamp(0.75rem,2.5svh,1.75rem)] flex flex-wrap gap-6 text-paper/75">
          {profile.socials.map((social) => (
            <li key={social.href}>
              <a href={social.href} target="_blank" rel="noopener noreferrer" className="link-dash transition-colors hover:text-paper">
                {social.label} <span aria-hidden="true">↗</span>
              </a>
            </li>
          ))}
        </ul>
      </div>

      <SunsetStage />

      <div className="sun-sky shell meta relative flex flex-col gap-3 bg-(--footer-sea) pt-2 pb-6 text-paper/55 sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {year} {profile.fullName}
        </p>
        <p>Built with Next.js, WebGL &amp; plenty of sunlight</p>
        <BackToTop />
      </div>
    </footer>
  );
}
