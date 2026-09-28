import Link from "next/link";

import { Header } from "@/components/chrome/Header";
import { SunGlyph } from "@/components/sun/SunGlyph";

export default function NotFound() {
  return (
    <>
      <Header onHome={false} />
      <main id="main" className="shell relative z-10 flex min-h-svh flex-col justify-center py-32">
        <p className="meta">(404) — Page not found</p>
        <h1 className="mt-4 text-[clamp(7rem,24vw,20rem)] leading-none font-extrabold">
          <span className="sr-only">404</span>
          <span aria-hidden="true" className="flex items-center">
            4
            <SunGlyph id="not-found-sun" spin className="mx-[0.03em] size-[0.78em]" />4
          </span>
        </h1>
        <p className="mt-6 max-w-md text-lead">The sun hasn&apos;t risen on this page yet.</p>
        <Link
          href="/"
          className="mt-10 w-fit rounded-full bg-ink px-6 py-3 font-medium text-paper transition-colors hover:bg-paper hover:text-ink"
        >
          Back to the homepage →
        </Link>
      </main>
    </>
  );
}
