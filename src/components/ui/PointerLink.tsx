"use client";

import Link from "next/link";
import type { ComponentProps } from "react";

type Props = Omit<ComponentProps<typeof Link>, "tabIndex" | "aria-hidden">;

/**
 * A second way into a page, for the pointer only: a shop window that opens its
 * case study, while the board beside it carries the real link. It is out of the
 * tab order and hidden from screen readers, so it never takes focus either — a
 * click or a tap would otherwise focus it, and the browser blocks (and warns
 * about) focus inside `aria-hidden`. The click itself still goes through.
 */
export function PointerLink({ onMouseDown, ...props }: Props) {
  return (
    <Link
      {...props}
      tabIndex={-1}
      aria-hidden="true"
      onMouseDown={(event) => {
        event.preventDefault();
        onMouseDown?.(event);
      }}
    />
  );
}
