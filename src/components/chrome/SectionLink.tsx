"use client";

import Link from "next/link";

import { useScrollTo } from "@/lib/use-scroll-to";

type Props = Omit<React.ComponentProps<"a">, "href"> & {
  /** `#id` of a home-page section. */
  hash: string;
  /** On the home page it scrolls smoothly; elsewhere it navigates there. */
  onHome: boolean;
};

/**
 * A link to a section of the home page. Off the home page it's a client-side
 * navigation that leaves scrolling to the home page (see HomeLanding), so the
 * section lands exactly where an in-page link would put it.
 */
export function SectionLink({ hash, onHome, onClick, ...props }: Props) {
  const scrollTo = useScrollTo();
  if (onHome) {
    return (
      <a
        href={hash}
        onClick={(event) => {
          onClick?.(event);
          scrollTo(hash, event);
        }}
        {...props}
      />
    );
  }
  return <Link href={`/${hash}`} scroll={false} onClick={onClick} {...props} />;
}
