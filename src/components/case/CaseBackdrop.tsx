import { ViewTransition } from "react";

/**
 * The case study's dark page. It shares a view-transition name with the
 * project's card on the home page, so opening a case study grows the card into
 * this backdrop, and leaving shrinks it back.
 */
export function CaseBackdrop({ slug }: { slug: string }) {
  return (
    <ViewTransition name={`case-${slug}`} share="case-open" default="none">
      <div aria-hidden="true" className="fixed inset-0 z-[5] bg-ink" />
    </ViewTransition>
  );
}
