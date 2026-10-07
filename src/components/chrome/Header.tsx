"use client";

import { useMotionValueEvent, useScroll } from "motion/react";
import { useCallback, useRef, useState } from "react";

import { MoonGlyph } from "@/components/sun/MoonGlyph";
import { SunGlyph } from "@/components/sun/SunGlyph";
import { Magnetic } from "@/components/ui/Magnetic";
import { RollText } from "@/components/ui/RollText";
import { profile } from "@/content/site";
import { cn } from "@/lib/cn";
import { useTheme } from "@/lib/theme";
import { useDarkAt } from "@/lib/use-dark-at";
import { useMediaQuery } from "@/lib/use-media-query";

import { MobileMenu } from "./MobileMenu";
import { SectionLink } from "./SectionLink";
import { ThemeToggle } from "./ThemeToggle";

/**
 * `onHome` is false on other routes (case studies, 404), where links lead back
 * to the home page's sections. The header keeps a fixed view-transition name,
 * so it stays put while pages morph underneath it. On the home page it has the
 * day/night switch (the night only dresses the home page).
 */
export function Header({ onHome = true }: { onHome?: boolean }) {
  // Over a dark surface (the footer) the bar turns light. At night the page's
  // ink is already light (globals.css), so it stays as it is.
  const night = useTheme() === "night" && onHome;
  const dark = useDarkAt(0.05) && !night;
  const desktop = useMediaQuery("(min-width: 64rem)");
  const [open, setOpen] = useState(false);
  const [tucked, setTucked] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Get out of the way while reading (scrolling down), come back on the way up.
  // The home page's chapters are one screen each, so there it stays.
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (y) => {
    const chapters = document.documentElement.classList.contains("chapters");
    setTucked(!chapters && y > 160 && y > (scrollY.getPrevious() ?? 0));
  });

  const close = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 [view-transition-name:site-header]">
      {/* The bar slides; the menu stays outside it, because a transformed
          ancestor would trap the menu's fixed positioning. */}
      <div
        data-night-ink={onHome ? "" : undefined}
        className={cn(
          "flex items-center justify-between px-(--gutter) pt-5 transition-[color,translate] duration-500 ease-expo focus-within:translate-y-0 lg:pt-8",
          dark ? "text-paper" : "text-ink",
          tucked && !open && "-translate-y-[140%]",
        )}
      >
        <SectionLink
          hash="#home"
          onHome={onHome}
          className="intro-slide group pointer-events-auto flex items-center gap-2.5 text-[1.05rem] font-semibold tracking-[0.06em]"
        >
          <SunGlyph
            id="logo-sun"
            spin
            className={cn("size-7 transition-transform duration-700 ease-expo group-hover:rotate-90", night && "hidden")}
          />
          {night && <MoonGlyph id="logo-moon" className="size-7 transition-transform duration-700 ease-expo group-hover:-rotate-12" />}
          {profile.fullName}
        </SectionLink>

        <div className="flex items-center gap-1 lg:gap-4">
          {onHome && (
            <ThemeToggle className="intro-slide pointer-events-auto transition-colors duration-300 hover:bg-current/10" />
          )}

          <div className="intro-slide pointer-events-auto hidden lg:block">
            <Magnetic>
              <SectionLink
                hash="#contact"
                onHome={onHome}
                className={cn(
                  "group/roll flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium tracking-wide transition-colors duration-300",
                  dark ? "bg-paper text-ink hover:bg-sunlight" : "bg-ink text-paper hover:bg-paper hover:text-ink",
                )}
              >
                <RollText>Let&apos;s talk</RollText> <span aria-hidden="true">→</span>
              </SectionLink>
            </Magnetic>
          </div>

          <button
            ref={triggerRef}
            type="button"
            onClick={() => setOpen(true)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label="Open menu"
            className="pointer-events-auto -mr-1 flex size-11 flex-col items-end justify-center gap-2 lg:hidden"
          >
            <span className="block h-[3px] w-9 rounded-full bg-current" />
            <span className="block h-[3px] w-6 rounded-full bg-current" />
          </button>
        </div>
      </div>

      {/* The menu is mobile-only; treat it as closed on wide screens (e.g. a rotated tablet). */}
      <MobileMenu open={open && !desktop} onClose={close} onHome={onHome} />
    </header>
  );
}
