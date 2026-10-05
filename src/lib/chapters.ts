/**
 * The home page reads as chapters (providers/Chapters.tsx). This is the small
 * handle other code uses to move between them — links, the side nav, coming
 * back from a case study. When chapters are off (reduced motion, other pages)
 * nothing is registered and callers fall back to ordinary scrolling.
 */
export type ChapterOptions = {
  /** Which step of the chapter's sideways track to land on (the high street's shops). */
  step?: number;
  /** Jump there without the glide (arriving from another page). */
  immediate?: boolean;
  /** Move keyboard focus to the chapter's title once there. */
  focus?: boolean;
};

type Navigator = { goTo: (id: string, options?: ChapterOptions) => boolean };

/**
 * Fired on `window` when a glide from one chapter to another begins — the life
 * in the sky (scenery/Life.tsx) plays its moments on these. Not fired for
 * instant jumps (arriving from another page).
 */
export const CHAPTER_LEAVE = "chapter:leave";
export type ChapterLeave = { from: string; to: string };

export const chapterNav: { current: Navigator | null } = { current: null };

/** Go to a chapter by its section id. False when chapters aren't running. */
export function goToChapter(id: string, options?: ChapterOptions) {
  return chapterNav.current?.goTo(id.replace(/^#/, ""), options) ?? false;
}
