import type { CSSProperties } from "react";

/** Inline style with CSS custom properties (the Work chapter's `--b`, `--trim`). */
export type Vars = CSSProperties & Record<`--${string}`, string | number>;

/**
 * Every store takes about half the screen, so the one you're at and the next
 * are all you see. From laptops up (and on phones on their side) a store is a
 * proper shopfront: the display window on the left, the board beside it like
 * a sign by the door — wide rather than tall, so the street fits under the title.
 */
export const STORE = "w-[84vw] shrink-0 md:w-[min(48vw,120svh)] short:w-[100svh]";
/** The workshop's board of notes, a little narrower on phones on their side. */
export const WORKSHOP = "w-[84vw] shrink-0 md:w-[min(48vw,120svh)] short:w-[70svh]";

/** A shop's name on its sign. */
export const SIGN = "text-[clamp(1.05rem,1.75vw,1.75rem)] leading-tight font-extrabold tracking-[0.04em] text-(--trim) uppercase";
