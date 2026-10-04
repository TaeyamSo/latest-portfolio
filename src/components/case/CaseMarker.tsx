"use client";

import { useEffect } from "react";

import { workReturn } from "@/lib/work-return";

/** Remembers which case study is open, so the home page can return to its card. */
export function CaseMarker({ slug }: { slug: string }) {
  useEffect(() => {
    workReturn.slug = slug;
  }, [slug]);
  return null;
}
