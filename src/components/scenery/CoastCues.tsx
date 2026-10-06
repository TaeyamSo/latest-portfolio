"use client";

import { useEffect, useRef } from "react";

import { CHAPTER_ARRIVE, CHAPTER_LEAVE, type ChapterArrive, type ChapterLeave } from "@/lib/chapters";

/** A gull's squawk, synthesised: two short falling cries. */
function squawk(audio: AudioContext) {
  const now = audio.currentTime;
  const out = audio.createGain();
  out.gain.value = 0.035;
  out.connect(audio.destination);
  for (const start of [0, 0.2]) {
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(1350, now + start);
    osc.frequency.exponentialRampToValueAtTime(720, now + start + 0.16);
    gain.gain.setValueAtTime(0, now + start);
    gain.gain.linearRampToValueAtTime(1, now + start + 0.02);
    gain.gain.linearRampToValueAtTime(0, now + start + 0.17);
    osc.connect(gain).connect(out);
    osc.start(now + start);
    osc.stop(now + start + 0.19);
  }
}

/**
 * Tells the coast (Coast.tsx) when the journey is the chapter — `data-open`:
 * the sun's path opens on the water, the sailboat glides in, the gulls come —
 * and lets you play with it. The coast sits under the page, so the pointer is
 * checked against the gulls and the sailboat (only on pointer events, only
 * while the coast is up): a gull you point at flies off with a squawk and
 * comes back a little later; the sailboat rocks.
 */
export function CoastCues() {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const coast = ref.current?.closest<HTMLElement>("[data-scene]");
    if (!coast) return;
    const gulls = Array.from(coast.querySelectorAll<HTMLElement>(".coast-gull"));
    const sail = coast.querySelector<HTMLElement>(".coast-sail-rock");
    const away = new Set<HTMLElement>();
    let audio: AudioContext | null = null;
    let over: Element | null = null;
    let lastRock = 0;

    const open = (on: boolean) => {
      coast.toggleAttribute("data-open", on);
      if (!on) over = null;
    };

    const scare = (gull: HTMLElement) => {
      if (away.has(gull)) return;
      away.add(gull);
      const flight = gull.animate(
        [
          { transform: "translate3d(0, 0, 0)", opacity: 1 },
          { transform: "translate3d(900%, -2200%, 0)", opacity: 1, offset: 0.7 },
          { transform: "translate3d(1300%, -3000%, 0)", opacity: 0 },
        ],
        { duration: 1600, easing: "cubic-bezier(0.3, 0, 0.6, 1)", fill: "forwards" },
      );
      gull.classList.add("is-flapping");
      flight.finished
        .then(() => {
          // A little later it glides back to its circle.
          const back = gull.animate(
            [
              { transform: "translate3d(-1400%, -1800%, 0)", opacity: 0 },
              { transform: "translate3d(-500%, -500%, 0)", opacity: 1, offset: 0.5 },
              { transform: "translate3d(0, 0, 0)", opacity: 1 },
            ],
            { duration: 2600, delay: 3000, easing: "cubic-bezier(0.2, 0.6, 0.3, 1)", fill: "backwards" },
          );
          flight.cancel();
          return back.finished;
        })
        .then(() => {
          gull.classList.remove("is-flapping");
          away.delete(gull);
        })
        .catch(() => {
          away.delete(gull);
        });
      try {
        audio ??= new AudioContext();
        if (audio.state === "suspended") void audio.resume();
        squawk(audio);
      } catch {
        // No sound here; the gull still flies.
      }
    };

    const rock = () => {
      const now = performance.now();
      if (!sail || now - lastRock < 1200) return;
      lastRock = now;
      sail.animate([{ rotate: "0deg" }, { rotate: "-9deg" }, { rotate: "7deg" }, { rotate: "-4deg" }, { rotate: "0deg" }], {
        duration: 1200,
        easing: "ease-in-out",
      });
    };

    const hitAt = (x: number, y: number): Element | null => {
      if (!coast.hasAttribute("data-open")) return null;
      const inside = (el: Element, pad: number) => {
        const r = el.getBoundingClientRect();
        return x >= r.left - pad && x <= r.right + pad && y >= r.top - pad && y <= r.bottom + pad;
      };
      return gulls.find((gull) => !away.has(gull) && inside(gull, 10)) ?? (sail && inside(sail, 4) ? sail : null);
    };
    const act = (target: Element) => (target === sail ? rock() : scare(target as HTMLElement));
    const onMove = (event: PointerEvent) => {
      const target = hitAt(event.clientX, event.clientY);
      if (target && target !== over && event.pointerType === "mouse") act(target);
      over = target;
    };
    const onDown = (event: PointerEvent) => {
      const target = hitAt(event.clientX, event.clientY);
      if (target) act(target);
    };

    const onArrive = (event: Event) => open((event as CustomEvent<ChapterArrive>).detail.id === "journey");
    const onLeave = (event: Event) => {
      if ((event as CustomEvent<ChapterLeave>).detail.from === "journey") open(false);
    };

    open(Boolean(document.getElementById("journey")?.hasAttribute("data-arrived")));
    window.addEventListener(CHAPTER_ARRIVE, onArrive);
    window.addEventListener(CHAPTER_LEAVE, onLeave);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    return () => {
      window.removeEventListener(CHAPTER_ARRIVE, onArrive);
      window.removeEventListener(CHAPTER_LEAVE, onLeave);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      void audio?.close();
    };
  }, []);

  return <span ref={ref} hidden />;
}
