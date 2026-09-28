"use client";

import { useEffect, useRef, useState } from "react";

import { RollText } from "@/components/ui/RollText";
import { useScrollTo } from "@/lib/use-scroll-to";

export function CopyEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2200);
    } catch {
      window.location.href = `mailto:${email}`;
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      data-cursor="Copy"
      data-cursor-tone="dark"
      className="group/roll meta rounded-full border border-paper/35 px-4 py-2 transition-colors duration-300 hover:border-paper hover:bg-paper hover:text-ink"
    >
      <span aria-live="polite">
        <RollText>{copied ? "Copied ✓" : "Copy email"}</RollText>
      </span>
    </button>
  );
}

export function BackToTop() {
  const scrollTo = useScrollTo();
  return (
    <a
      href="#home"
      onClick={(event) => scrollTo("#home", event)}
      data-cursor="Rise"
      className="group group/roll inline-flex items-center gap-2 transition-colors hover:text-paper"
    >
      <RollText>Back to sunrise</RollText>
      <span aria-hidden="true" className="transition-transform duration-300 group-hover:-translate-y-0.5">
        ↑
      </span>
    </a>
  );
}
