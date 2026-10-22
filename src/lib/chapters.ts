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

/**
 * Fired on `window` when a chapter is reached and its content builds in —
 * after a glide or an instant jump, once per visit (not for steps along a
 * sideways track). The noon cloud (scenery/CloudLayer.tsx) starts on these.
 */
export const CHAPTER_ARRIVE = "chapter:arrive";
export type ChapterArrive = { id: string };

/**
 * How long after a chapter arrives its scene below wakes up (the scenery cues:
 * the town's shops opening, the windmill, the road, the coast's lights) — so
 * the first thing that moves, and the first thing read, is the chapter's own
 * text, which has built in by then.
 */
export const SCENE_AFTER_TEXT_MS = 900;

/**
 * The cloud pass (scenery/CloudPass.tsx): a jump of CLOUD_PASS_MIN chapters or
 * more goes through the clouds instead of racing the day past — fired on
 * `window` when the bank starts to cover the screen ("cover", going `direction`
 * 1 down the page or -1 up it, to chapter `to`) and when it rolls away ("reveal").
 */
export const CLOUD_PASS = "chapter:cloud-pass";
export type CloudPassDetail = { phase: "cover" | "reveal"; direction: number; to: string };
export const CLOUD_PASS_MIN = 4;
/** The bank rolling in until the screen is covered; how long it stays (the page jumps under it); rolling away. */
export const CLOUD_PASS_COVER_MS = 650;
export const CLOUD_PASS_HOLD_MS = 250;
export const CLOUD_PASS_REVEAL_MS = 800;

export const chapterNav: { current: Navigator | null } = { current: null };

/** Go to a chapter by its section id. False when chapters aren't running. */
export function goToChapter(id: string, options?: ChapterOptions) {
  return chapterNav.current?.goTo(id.replace(/^#/, ""), options) ?? false;
}
