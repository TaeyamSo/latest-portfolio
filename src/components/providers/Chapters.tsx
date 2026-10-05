"use client";

import { useLenis } from "lenis/react";
import { useEffect, useLayoutEffect, useRef } from "react";

import { CHAPTER_LEAVE, chapterNav, type ChapterLeave, type ChapterOptions } from "@/lib/chapters";

/** One place the page can rest: a chapter, its scroll position and (for a sideways track) which step. */
type Stop = { chapter: HTMLElement; y: number; track?: HTMLElement; shift?: number; step?: number };

const GLIDE = 1.25; // seconds from one chapter to the next — the hour passing
const STEP_MS = 650; // a step along a sideways track
const WHEEL_QUIET = 220; // ms without wheel events before a new gesture can start (trackpad inertia)
const WHEEL_STEP = 24; // px of wheel travel that make a gesture
const SWIPE = 40; // px of finger travel that make a swipe

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

const isTyping = (el: EventTarget | null) =>
  el instanceof HTMLElement && (el.isContentEditable || /^(input|textarea|select)$/i.test(el.tagName));

/**
 * The home page as chapters, one hour of the day each. A small scroll, swipe
 * or key press glides to the next chapter: the current content steps aside,
 * the page glides (so the sky, the sun, the clock and the landscape move with
 * it — they follow the scroll position), and once it rests the new chapter's
 * content builds in (`data-arrived`, styles in globals.css). A chapter with a
 * sideways track (`[data-track]` of `[data-step]`s, inside a
 * `[data-track-view]`) walks through it first — but only if it doesn't fit.
 * A chapter taller than the screen is read in screen-sized steps.
 *
 * The page keeps its real scroll position, so links, the URL, the back button
 * and find-in-page still work; external jumps settle onto the nearest chapter.
 * With reduced motion none of this runs: the page scrolls normally and every
 * chapter's content is simply there.
 */
export function Chapters() {
  const lenis = useLenis();
  const lenisRef = useRef(lenis);
  useEffect(() => {
    lenisRef.current = lenis;
  }, [lenis]);

  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = document.documentElement;
    root.classList.add("chapters");

    let stops: Stop[] = [];
    let at = 0;
    let busy = false;
    let queued = 0;
    let lastWheel = 0;
    let wheelTravel = 0;
    let gestureOpen = true;
    let settleTimer = 0;
    let doneTimer = 0;
    let touch: { x: number; y: number } | null = null;

    const chapters = () => Array.from(document.querySelectorAll<HTMLElement>("[data-chapter]"));

    /** Where a track can rest: the left edge of each step, until the last step is fully in view. */
    const trackShifts = (track: HTMLElement) => {
      const view = track.closest<HTMLElement>("[data-track-view]") ?? track.parentElement!;
      const steps = Array.from(track.querySelectorAll<HTMLElement>(":scope > [data-step]"));
      const max = track.scrollWidth - view.clientWidth;
      if (max <= 4 || !steps.length) return [0];
      const first = steps[0].offsetLeft;
      const shifts: number[] = [];
      for (const step of steps) {
        const shift = Math.min(max, Math.max(0, step.offsetLeft - first));
        if (!shifts.length || shift - shifts[shifts.length - 1] > 4) shifts.push(shift);
        if (shift >= max) break;
      }
      return shifts;
    };

    const measure = () => {
      const vh = window.innerHeight;
      const sy = window.scrollY;
      const max = Math.max(0, root.scrollHeight - vh);
      const list: Stop[] = [];
      for (const chapter of chapters()) {
        const rect = chapter.getBoundingClientRect();
        const top = Math.min(max, rect.top + sy);
        const bottom = rect.bottom + sy;
        if (chapter.dataset.rest === "end") {
          list.push({ chapter, y: Math.min(max, Math.max(top, bottom - vh)) });
          continue;
        }
        const track = Array.from(chapter.querySelectorAll<HTMLElement>("[data-track]")).find((el) => el.getClientRects().length);
        if (track) {
          trackShifts(track).forEach((shift, step) => list.push({ chapter, y: top, track, shift, step }));
          continue;
        }
        if (bottom - top <= vh + 4) {
          list.push({ chapter, y: top });
          continue;
        }
        // Taller than the screen (small or zoomed screens): read it a screen at a time.
        for (let y = top; ; y += vh * 0.85) {
          const end = Math.min(max, bottom - vh);
          list.push({ chapter, y: Math.min(y, end) });
          if (y >= end) break;
        }
      }
      stops = list;
    };

    const nearest = (y: number) => {
      const current = stops[at];
      let best = 0;
      for (let i = 1; i < stops.length; i++) {
        if (Math.abs(stops[i].y - y) < Math.abs(stops[best].y - y) - 1) best = i;
      }
      // Several stops share a position on a track: stay on the current step there.
      if (current && Math.abs(current.y - stops[best].y) < 2 && current.chapter === stops[best].chapter) return at;
      return best;
    };

    const placeTrack = (stop: Stop, immediate: boolean) => {
      if (!stop.track) return;
      const { track } = stop;
      if (immediate) track.style.transition = "none";
      track.style.transform = `translate3d(${-(stop.shift ?? 0)}px, 0, 0)`;
      // The step the track rests on comes forward (the others dim, see globals.css).
      const steps = Array.from(track.querySelectorAll<HTMLElement>(":scope > [data-step]"));
      const shift = stop.shift ?? 0;
      const offsets = steps.map((el) => el.offsetLeft - steps[0].offsetLeft);
      const active = offsets.reduce((best, offset, i) => (Math.abs(offset - shift) < Math.abs(offsets[best] - shift) ? i : best), 0);
      steps.forEach((el, i) => el.toggleAttribute("data-active", i === active));
      if (immediate) {
        void track.offsetWidth; // apply without the transition, then hand it back
        track.style.transition = "";
      }
    };

    const arrive = (chapter: HTMLElement) => {
      for (const other of chapters()) if (other !== chapter) other.removeAttribute("data-arrived");
      chapter.setAttribute("data-arrived", "");
    };

    const focusTitle = (chapter: HTMLElement) => {
      const title = chapter.querySelector<HTMLElement>("h1, h2");
      if (!title) return;
      if (!title.hasAttribute("tabindex")) title.setAttribute("tabindex", "-1");
      title.focus({ preventScroll: true });
    };

    const go = (index: number, { immediate = false, focus = false }: { immediate?: boolean; focus?: boolean } = {}) => {
      const to = stops[Math.max(0, Math.min(stops.length - 1, index))];
      if (!to) return;
      const from = stops[at];
      at = stops.indexOf(to);
      const changing = from?.chapter !== to.chapter;
      if (changing && !immediate && from) {
        from.chapter.removeAttribute("data-arrived"); // the content steps aside first
        const detail: ChapterLeave = { from: from.chapter.id, to: to.chapter.id };
        window.dispatchEvent(new CustomEvent(CHAPTER_LEAVE, { detail }));
      }
      placeTrack(to, immediate);

      const done = () => {
        window.clearTimeout(doneTimer);
        busy = false;
        arrive(to.chapter);
        if (focus) focusTitle(to.chapter);
        const hash = to.chapter.id && to.chapter.id !== "home" ? `#${to.chapter.id}` : "";
        if (location.hash !== hash) history.replaceState(history.state, "", `${location.pathname}${location.search}${hash}`);
        if (queued) {
          const direction = queued;
          queued = 0;
          step(direction);
        }
      };

      const distance = Math.abs(window.scrollY - to.y);
      if (immediate) {
        window.scrollTo({ top: to.y, behavior: "instant" });
        lenisRef.current?.scrollTo(to.y, { immediate: true, force: true });
        done();
        return;
      }
      busy = true;
      if (distance < 2) {
        doneTimer = window.setTimeout(done, changing ? 0 : STEP_MS);
        return;
      }
      const lenis = lenisRef.current;
      if (lenis) {
        lenis.scrollTo(to.y, { duration: GLIDE, easing: easeInOut, lock: true, force: true, onComplete: done });
        doneTimer = window.setTimeout(done, GLIDE * 1000 + 400); // in case the glide is interrupted
      } else {
        window.scrollTo({ top: to.y, behavior: "smooth" });
        doneTimer = window.setTimeout(done, GLIDE * 1000);
      }
    };

    const step = (direction: number) => {
      if (busy) {
        queued = direction;
        return;
      }
      const next = at + direction;
      if (next < 0 || next >= stops.length) return;
      go(next);
    };

    // --- Input ------------------------------------------------------------
    const free = () => lenisRef.current?.isStopped || root.dataset.menu === "open";

    const onWheel = (event: WheelEvent) => {
      if (free() || event.ctrlKey) return; // the mobile menu is open, or a pinch-zoom
      event.preventDefault();
      event.stopPropagation();
      const now = performance.now();
      if (now - lastWheel > WHEEL_QUIET) {
        wheelTravel = 0;
        gestureOpen = true;
      }
      lastWheel = now;
      if (!gestureOpen) return;
      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      wheelTravel += event.deltaMode === 1 ? delta * 16 : delta;
      if (Math.abs(wheelTravel) >= WHEEL_STEP) {
        gestureOpen = false;
        step(Math.sign(wheelTravel));
      }
    };

    const onTouchStart = (event: TouchEvent) => {
      touch = event.touches.length === 1 && !free() ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null;
    };
    const onTouchMove = (event: TouchEvent) => {
      if (!touch || event.touches.length > 1) return;
      event.preventDefault(); // the page only moves a chapter at a time
    };
    const onTouchEnd = (event: TouchEvent) => {
      if (!touch) return;
      const dx = event.changedTouches[0].clientX - touch.x;
      const dy = event.changedTouches[0].clientY - touch.y;
      touch = null;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE) return;
      if (Math.abs(dx) > Math.abs(dy)) {
        if (stops[at]?.track) step(dx < 0 ? 1 : -1); // sideways only walks a track
      } else {
        step(dy < 0 ? 1 : -1);
      }
    };

    const onKey = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || free() || isTyping(event.target)) return;
      const onControl = event.target instanceof HTMLElement && event.target.closest("a, button, summary, [role='button']");
      const track = Boolean(stops[at]?.track);
      let handled = true;
      switch (event.key) {
        case "ArrowDown":
        case "PageDown":
          step(1);
          break;
        case "ArrowUp":
        case "PageUp":
          step(-1);
          break;
        case " ":
          if (onControl) return;
          step(event.shiftKey ? -1 : 1);
          break;
        case "ArrowRight":
          if (track) step(1);
          else handled = false;
          break;
        case "ArrowLeft":
          if (track) step(-1);
          else handled = false;
          break;
        case "Home":
          go(0, { focus: true });
          break;
        case "End":
          go(stops.length - 1, { focus: true });
          break;
        default:
          handled = false;
      }
      if (handled) event.preventDefault();
    };

    // Tabbing into another chapter (or another shop) glides there.
    const onFocusIn = (event: FocusEvent) => {
      if (busy) return;
      const target = event.target as HTMLElement;
      const chapter = target.closest<HTMLElement>("[data-chapter]");
      if (!chapter) return;
      let index = -1;
      stops.forEach((stop, i) => {
        if (stop.chapter !== chapter) return;
        if (index === -1) {
          index = i;
          return;
        }
        if (!stop.track) return;
        const steps = Array.from(stop.track.querySelectorAll<HTMLElement>(":scope > [data-step]"));
        const own = steps.find((el) => el.contains(target));
        if (own && own.offsetLeft - steps[0].offsetLeft >= (stop.shift ?? 0) - 4) index = i;
      });
      if (index !== -1 && index !== at) go(index);
    };

    // Jumps from elsewhere (links, the scrollbar, find-in-page, a resize) settle onto a chapter.
    const onScroll = () => {
      if (busy) return;
      window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(() => {
        if (busy || lenisRef.current?.isScrolling) return;
        const index = nearest(window.scrollY);
        if (index !== at || Math.abs(window.scrollY - stops[index].y) > 2) go(index);
      }, 160);
    };

    const onResize = () => {
      const chapter = stops[at]?.chapter;
      const stepNow = stops[at]?.step ?? 0;
      measure();
      if (busy) return; // a glide is under way; it settles when it ends
      const same = stops.findIndex((stop) => stop.chapter === chapter && (stop.step ?? 0) === stepNow);
      const index = same !== -1 ? same : stops.findIndex((stop) => stop.chapter === chapter);
      if (index !== -1 && (index !== at || Math.abs(window.scrollY - stops[index].y) > 2)) go(index, { immediate: true });
      else if (index !== -1) placeTrack(stops[index], true);
    };

    chapterNav.current = {
      goTo(id, options: ChapterOptions = {}) {
        if (!stops.length) measure();
        const first = stops.findIndex((stop) => stop.chapter.id === id);
        if (first === -1) return false;
        let index = first;
        if (options.step) {
          const wanted = stops.findIndex((stop) => stop.chapter.id === id && stop.step === options.step);
          index = wanted !== -1 ? wanted : first;
        }
        if (busy && !options.immediate) {
          queued = 0;
          busy = false;
        }
        go(index, { immediate: options.immediate, focus: options.focus });
        return true;
      },
    };

    // A #section typed into the address bar (or the browser's own anchor jump).
    const onHash = () => {
      const id = location.hash.slice(1) || "home";
      const index = stops.findIndex((stop) => stop.chapter.id === id);
      if (index !== -1 && stops[index].chapter !== stops[at]?.chapter) go(index, { focus: true });
    };

    // Where the page is now — and on a track, the step it already shows (a
    // return from a case study may have placed it before we started).
    const initial = () => {
      let index = nearest(window.scrollY);
      const stop = stops[index];
      if (stop?.track) {
        const shown = -(parseFloat(stop.track.style.transform.replace("translate3d(", "")) || 0);
        const match = stops.findIndex((other) => other.track === stop.track && Math.abs((other.shift ?? 0) - shown) < 2);
        if (match !== -1) index = match;
      }
      return index;
    };

    measure();
    at = initial();
    go(at, { immediate: true });

    const observer = new ResizeObserver(onResize);
    observer.observe(document.body);
    window.addEventListener("wheel", onWheel, { passive: false, capture: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("focusin", onFocusIn);
    window.addEventListener("hashchange", onHash);

    return () => {
      chapterNav.current = null;
      observer.disconnect();
      window.removeEventListener("wheel", onWheel, { capture: true });
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("focusin", onFocusIn);
      window.removeEventListener("hashchange", onHash);
      window.clearTimeout(settleTimer);
      window.clearTimeout(doneTimer);
      root.classList.remove("chapters");
      for (const chapter of chapters()) chapter.removeAttribute("data-arrived");
    };
  }, []);

  return null;
}
