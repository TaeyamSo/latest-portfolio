"use client";

import { useEffect, useRef } from "react";

import { marquee } from "@/content/site";
import { CHAPTER_LEAVE, type ChapterLeave } from "@/lib/chapters";

/** A bird in flight, as a simple silhouette; its wings beat while it flies (globals.css). */
function Bird({ size }: { size: number }) {
  return (
    <svg viewBox="-14 -9 28 12" width={28 * size} height={12 * size} className="block overflow-visible">
      <path
        className="bird-wings"
        d="M-12,1 C-8,-7 -3,-5 0,0 C3,-5 8,-7 12,1"
        fill="none"
        stroke="#3b1409"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type Point = readonly [x: number, y: number];

/** Sunrise: the flock lifts off the hero's ridge and flies up over the morning (vw, vh). */
const TAKEOFF: { from: Point; mid: Point; to: Point; size: number; delay: number }[] = [
  { from: [68, 66], mid: [50, 34], to: [6, -10], size: 1.15, delay: 0 },
  { from: [72, 64], mid: [55, 31], to: [12, -12], size: 1, delay: 120 },
  { from: [64, 69], mid: [47, 39], to: [2, -4], size: 0.95, delay: 260 },
  { from: [76, 67], mid: [60, 36], to: [18, -8], size: 0.85, delay: 380 },
  { from: [70, 70], mid: [52, 42], to: [9, 0], size: 0.8, delay: 520 },
  { from: [79, 63], mid: [64, 30], to: [24, -14], size: 0.75, delay: 640 },
  { from: [66, 63], mid: [46, 28], to: [-2, -14], size: 0.7, delay: 760 },
];

/** Golden hour: a V of birds flies home towards the low sun, shrinking into the distance (px from the leader). */
const FORMATION: { offset: Point; size: number }[] = [
  { offset: [0, 0], size: 1.1 },
  { offset: [-30, 15], size: 1 },
  { offset: [-60, 30], size: 0.95 },
  { offset: [-90, 45], size: 0.9 },
  { offset: [-30, -15], size: 1 },
  { offset: [-60, -30], size: 0.95 },
  { offset: [-90, -45], size: 0.9 },
];

const at = ([x, y]: Point, scale: number, dx = 0, dy = 0) =>
  `translate(calc(${x}vw + ${dx}px), calc(${y}vh + ${dy}px)) scale(${scale})`;

/**
 * Life in the sky, played as the day moves on (one moment per glide, when the
 * chapter controller announces it): at sunrise a flock lifts off the
 * mountains; between morning and noon a small plane crosses the sky towing a
 * banner with what Tayam does; at golden hour a V of birds flies home towards
 * the sun. Time-based, transform-only animations on a fixed layer just above
 * the clouds; nothing runs between the moments, and nothing at all without
 * chapters (reduced motion).
 */
export function Life() {
  const takeoff = useRef<HTMLDivElement>(null);
  const home = useRef<HTMLDivElement>(null);
  const plane = useRef<HTMLDivElement>(null);

  useEffect(() => {
    /** Play a group's flights: wings beat only while they're in the air. */
    const play = (group: HTMLElement | null, flights: (bird: HTMLElement, i: number) => Animation) => {
      if (!group) return;
      const birds = Array.from(group.children) as HTMLElement[];
      birds.forEach((bird) => bird.getAnimations().forEach((animation) => animation.cancel()));
      group.classList.add("flying");
      const running = birds.map(flights);
      Promise.all(running.map((animation) => animation.finished))
        .then(() => group.classList.remove("flying"))
        .catch(() => {}); // cancelled by the next flight
    };

    const lift = () =>
      play(takeoff.current, (bird, i) => {
        const { from, mid, to, size, delay } = TAKEOFF[i];
        return bird.animate(
          [
            { transform: at(from, 0.7 * size), opacity: 0 },
            { opacity: 1, offset: 0.06 },
            { transform: at(mid, size), offset: 0.5 },
            { transform: at(to, 1.1 * size), opacity: 1 },
          ],
          { duration: 3600, delay, easing: "cubic-bezier(0.35, 0, 0.65, 1)", fill: "backwards" },
        );
      });

    const homeward = () =>
      play(home.current, (bird, i) => {
        const { offset, size } = FORMATION[i];
        const [dx, dy] = offset;
        return bird.animate(
          // High over the copy, then down towards the sun as they reach it.
          [
            { transform: at([-12, 15], size, dx, dy), opacity: 1 },
            { transform: at([42, 11], 0.75 * size, dx * 0.75, dy * 0.75), offset: 0.55 },
            { transform: at([78, 24], 0.3 * size, dx * 0.3, dy * 0.3), opacity: 1, offset: 0.9 },
            { transform: at([82, 27], 0.2 * size, dx * 0.2, dy * 0.2), opacity: 0 },
          ],
          { duration: 7200, delay: 400 + Math.abs(dx) * 3, easing: "cubic-bezier(0.25, 0, 0.5, 1)", fill: "backwards" },
        );
      });

    const banner = () =>
      play(plane.current?.parentElement ?? null, () =>
        plane.current!.animate(
          [{ transform: "translate(105vw, 13vh)" }, { transform: "translate(calc(-100% - 4vw), 11vh)" }],
          { duration: 9500, easing: "linear", fill: "backwards" },
        ),
      );

    const onLeave = (event: Event) => {
      const { from, to } = (event as CustomEvent<ChapterLeave>).detail;
      if (from === "home" && to === "about") lift();
      else if (from === "about" && to === "services") banner();
      else if (from === "process" && to === "journey") homeward();
    };
    window.addEventListener(CHAPTER_LEAVE, onLeave);
    return () => window.removeEventListener(CHAPTER_LEAVE, onLeave);
  }, []);

  return (
    <div aria-hidden="true" className="scenery pointer-events-none fixed inset-0 z-[3] overflow-hidden">
      <div ref={takeoff}>
        {TAKEOFF.map(({ size }, i) => (
          <span key={i} className="absolute top-0 left-0 opacity-0" style={{ "--beat": `${0.32 + (i % 3) * 0.05}s` } as React.CSSProperties}>
            <Bird size={size} />
          </span>
        ))}
      </div>

      <div>
        {/* The plane, flying left, with the banner trailing behind it on a rope. */}
        <div ref={plane} className="absolute top-0 left-0 flex items-center" style={{ transform: "translate(105vw, 13vh)" }}>
          <svg viewBox="-28 -16 62 32" className="block h-[clamp(1.6rem,3vw,2.4rem)] w-auto" fill="#3b1409">
            <path d="M-24,0 Q-26,-3 -20,-4 L16,-4 L26,-14 L31,-14 L27,-2 Q30,0 27,2 L-20,3 Q-26,3 -24,0 Z" />
            <path d="M-2,-2 L10,-2 L-6,14 L-12,14 Z" />
          </svg>
          <span className="h-px w-[clamp(1.5rem,3vw,3rem)] bg-[#3b1409]/70" />
          <span className="banner meta border-2 border-ink bg-paper px-[clamp(0.6rem,1vw,1rem)] py-1.5 text-[clamp(0.6rem,0.8vw,0.75rem)] whitespace-nowrap text-ink">
            {marquee.slice(0, 5).join(" · ")}
          </span>
        </div>
      </div>

      <div ref={home}>
        {FORMATION.map(({ size }, i) => (
          <span key={i} className="absolute top-0 left-0 opacity-0" style={{ "--beat": `${0.4 + (i % 2) * 0.06}s` } as React.CSSProperties}>
            <Bird size={size} />
          </span>
        ))}
      </div>
    </div>
  );
}
