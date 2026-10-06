"use client";

import { useEffect, useRef } from "react";

import { CHAPTER_ARRIVE, CHAPTER_LEAVE, type ChapterArrive, type ChapterLeave } from "@/lib/chapters";

/** A bell's strike, synthesised: a few inharmonic partials that ring and fade. */
function strike(audio: AudioContext) {
  const now = audio.currentTime;
  const out = audio.createGain();
  out.gain.value = 0.18;
  out.connect(audio.destination);
  for (const [ratio, level, decay] of [
    [1, 1, 2.4],
    [2.0, 0.5, 1.6],
    [2.76, 0.35, 1.1],
    [5.4, 0.2, 0.6],
  ] as const) {
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = "sine";
    osc.frequency.value = 660 * ratio;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(level, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + decay);
    osc.connect(gain).connect(out);
    osc.start(now);
    osc.stop(now + decay + 0.05);
  }
}

/**
 * Tells the town (Town.tsx) when the services are the chapter — `data-open`,
 * which its CSS reacts to: the shops open, the bell rings, the pigeons lift
 * off. And the bell can be rung: the town sits under the page, so the pointer
 * is checked against the belfry — each time it comes onto the bell (or a tap
 * lands on it), the bell swings and chimes.
 */
export function TownCues() {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const town = ref.current?.closest<HTMLElement>("[data-scene]");
    const bell = town?.querySelector<SVGSVGElement>(".town-bell");
    const services = document.getElementById("services");
    if (!town || !bell || !services) return;
    let audio: AudioContext | null = null;
    let over = false;
    let area: DOMRect | null = null;

    const open = (on: boolean) => {
      town.toggleAttribute("data-open", on);
      area = null;
      if (!on) leave();
    };

    const ring = () => {
      bell.animate(
        [{ rotate: "0deg" }, { rotate: "22deg" }, { rotate: "-18deg" }, { rotate: "12deg" }, { rotate: "-6deg" }, { rotate: "0deg" }],
        { duration: 1300, easing: "ease-out" },
      );
      try {
        audio ??= new AudioContext();
        if (audio.state === "suspended") void audio.resume();
        strike(audio);
      } catch {
        // No sound available; the bell still swings.
      }
    };

    /** The belfry, with a little room around it: the bell is small. */
    const hit = (x: number, y: number) => {
      if (!town.hasAttribute("data-open")) return false;
      area ??= bell.getBoundingClientRect();
      const pad = Math.max(10, area.width * 0.6);
      return x >= area.left - pad && x <= area.right + pad && y >= area.top - pad && y <= area.bottom + pad;
    };
    const leave = () => {
      over = false;
    };
    const onMove = (event: PointerEvent) => {
      const now = hit(event.clientX, event.clientY);
      if (now && !over) {
        over = true;
        if (event.pointerType === "mouse") ring();
      } else if (!now && over) leave();
    };
    const onDown = (event: PointerEvent) => {
      if (hit(event.clientX, event.clientY)) ring();
    };
    const onResize = () => (area = null);

    const onArrive = (event: Event) => open((event as CustomEvent<ChapterArrive>).detail.id === "services");
    const onLeave = (event: Event) => {
      if ((event as CustomEvent<ChapterLeave>).detail.from === "services") open(false);
    };

    open(services.hasAttribute("data-arrived"));
    window.addEventListener(CHAPTER_ARRIVE, onArrive);
    window.addEventListener(CHAPTER_LEAVE, onLeave);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener(CHAPTER_ARRIVE, onArrive);
      window.removeEventListener(CHAPTER_LEAVE, onLeave);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("resize", onResize);
      void audio?.close();
    };
  }, []);

  return <span ref={ref} hidden />;
}
