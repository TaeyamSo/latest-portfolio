"use client";

import { useCallback, useRef, useState } from "react";

import { SunGlyph } from "@/components/sun/SunGlyph";
import { Magnetic } from "@/components/ui/Magnetic";
import { profile } from "@/content/site";
import { cn } from "@/lib/cn";
import { useDarkAt } from "@/lib/use-dark-at";
import { useMediaQuery } from "@/lib/use-media-query";
import { useScrollTo } from "@/lib/use-scroll-to";

import { MobileMenu } from "./MobileMenu";

/** `onHome` is false on other routes (e.g. 404), where links point back to "/". */
export function Header({ onHome = true }: { onHome?: boolean }) {
  const dark = useDarkAt(0.05);
  const scrollTo = useScrollTo();
  const desktop = useMediaQuery("(min-width: 64rem)");
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const href = (hash: string) => (onHome ? hash : `/${hash}`);
  const onLink = (hash: string) => (event: React.MouseEvent) => onHome && scrollTo(hash, event);

  const close = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  return (
    <header
      className={cn(
        "pointer-events-none fixed inset-x-0 top-0 z-50 flex items-center justify-between px-(--gutter) pt-5 transition-colors duration-500 lg:pt-8",
        dark ? "text-paper" : "text-ink",
      )}
    >
      <a
        href={href("#home")}
        onClick={onLink("#home")}
        className="intro-slide group pointer-events-auto flex items-center gap-2.5 text-[1.05rem] font-semibold tracking-[0.06em]"
      >
        <SunGlyph id="logo-sun" spin className="size-7 transition-transform duration-700 ease-(--ease-expo) group-hover:rotate-90" />
        {profile.fullName}
      </a>

      <div className="intro-slide pointer-events-auto hidden lg:block">
        <Magnetic>
        <a
          href={href("#contact")}
          onClick={onLink("#contact")}
          className={cn(
            "flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium tracking-wide transition-colors duration-300",
            dark ? "bg-paper text-ink hover:bg-sunlight" : "bg-ink text-paper hover:bg-paper hover:text-ink",
          )}
        >
          Let&apos;s talk <span aria-hidden="true">→</span>
        </a>
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

      {/* The menu is mobile-only; treat it as closed on wide screens (e.g. a rotated tablet). */}
      <MobileMenu open={open && !desktop} onClose={close} onHome={onHome} />
    </header>
  );
}
