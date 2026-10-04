"use client";

import { useLenis } from "lenis/react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef } from "react";

import { EASE_EXPO } from "@/components/ui/Reveal";
import { profile, sections } from "@/content/site";
import { useScrollTo } from "@/lib/use-scroll-to";

import { SectionLink } from "./SectionLink";

type Props = { open: boolean; onClose: () => void; onHome: boolean };

/** Full-screen menu for small screens; opens like a sunrise from the button. */
export function MobileMenu({ open, onClose, onHome }: Props) {
  const lenis = useLenis();
  const scrollTo = useScrollTo();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    lenis?.stop();
    const panel = panelRef.current;
    const focusables = () => Array.from(panel?.querySelectorAll<HTMLElement>("a[href], button") ?? []);
    focusables()[0]?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab") return;
      const items = focusables();
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      lenis?.start();
    };
  }, [open, lenis, onClose]);

  // On the home page: close first, then glide to the section. Elsewhere the
  // link navigates and the home page takes it from there.
  const go = (hash: string) => (event: React.MouseEvent) => {
    if (!onHome) return onClose();
    event.preventDefault();
    onClose();
    requestAnimationFrame(() => scrollTo(hash));
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={panelRef}
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          data-cursor-tone="light"
          className="pointer-events-auto fixed inset-0 z-[70] flex flex-col bg-ink px-(--gutter) pt-5 pb-8 text-paper lg:hidden"
          initial={{ clipPath: "circle(0% at calc(100% - 2.75rem) 2.6rem)" }}
          animate={{ clipPath: "circle(150% at calc(100% - 2.75rem) 2.6rem)" }}
          exit={{ clipPath: "circle(0% at calc(100% - 2.75rem) 2.6rem)" }}
          transition={{ duration: 0.8, ease: EASE_EXPO }}
        >
          <div className="flex items-center justify-between">
            <span className="meta text-paper/60">Menu</span>
            <button type="button" onClick={onClose} aria-label="Close menu" className="relative -mr-1 size-11">
              <span className="absolute top-1/2 left-1/2 block h-[3px] w-8 -translate-1/2 rotate-45 rounded-full bg-current" />
              <span className="absolute top-1/2 left-1/2 block h-[3px] w-8 -translate-1/2 -rotate-45 rounded-full bg-current" />
            </button>
          </div>

          <nav aria-label="Sections" className="my-auto">
            <ul className="flex flex-col gap-1">
              {sections.map((section, i) => (
                <motion.li
                  key={section.id}
                  initial={{ opacity: 0, x: -40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.9, ease: EASE_EXPO, delay: 0.15 + i * 0.05 }}
                >
                  <SectionLink
                    hash={`#${section.id}`}
                    onHome={false}
                    onClick={go(`#${section.id}`)}
                    className="group flex items-baseline gap-4 py-1 text-[clamp(2.6rem,12vw,4.5rem)] leading-none font-extrabold uppercase"
                  >
                    <span className="meta w-7 text-sunlight">{String(i + 1).padStart(2, "0")}</span>
                    <span className="transition-colors group-hover:text-amber group-focus-visible:text-amber">
                      {section.label}
                    </span>
                  </SectionLink>
                </motion.li>
              ))}
            </ul>
          </nav>

          <div className="meta flex flex-wrap items-center justify-between gap-4 text-paper/70">
            <a href={`mailto:${profile.email}`} className="link-dash tracking-[0.06em] normal-case hover:text-paper">
              {profile.email}
            </a>
            {profile.socials.map((social) => (
              <a
                key={social.href}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="link-dash hover:text-paper"
              >
                {social.label} ↗
              </a>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
