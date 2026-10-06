"use client";

import { useEffect, useRef } from "react";

import { CHAPTER_ARRIVE, CHAPTER_LEAVE, type ChapterArrive, type ChapterLeave } from "@/lib/chapters";

/** A friendly double "beep-beep", synthesised. */
function honk(audio: AudioContext) {
  const now = audio.currentTime;
  const out = audio.createGain();
  out.gain.value = 0.06;
  out.connect(audio.destination);
  for (const start of [0, 0.17]) {
    for (const freq of [466, 587]) {
      const osc = audio.createOscillator();
      const gain = audio.createGain();
      osc.type = "triangle";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, now + start);
      gain.gain.linearRampToValueAtTime(1, now + start + 0.01);
      gain.gain.setValueAtTime(1, now + start + 0.1);
      gain.gain.linearRampToValueAtTime(0, now + start + 0.13);
      osc.connect(gain).connect(out);
      osc.start(now + start);
      osc.stop(now + start + 0.15);
    }
  }
}

/**
 * Tells the highway (Highway.tsx) when the process is the chapter —
 * `data-open`: the centre line paints in — and makes
 * its cars honk. The road sits under the page, so the pointer is checked
 * against the cars (only on pointer events, only while the road is up): each
 * time it comes onto one, or a tap lands on it, that car bounces, flashes its
 * lights and goes "beep-beep".
 */
export function HighwayCues() {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const road = ref.current?.closest<HTMLElement>("[data-scene]");
    if (!road) return;
    const cars = Array.from(road.querySelectorAll<HTMLElement>(".hw-car"));
    const last = new Map<HTMLElement, number>();
    let audio: AudioContext | null = null;
    let over: HTMLElement | null = null;

    const open = (on: boolean) => {
      road.toggleAttribute("data-open", on);
      if (!on) over = null;
    };

    const toot = (car: HTMLElement) => {
      const now = performance.now();
      if (now - (last.get(car) ?? 0) < 700) return;
      last.set(car, now);
      car.querySelector(".hw-car-body")?.animate(
        [{ translate: "0 0" }, { translate: "0 -18%" }, { translate: "0 0" }, { translate: "0 -8%" }, { translate: "0 0" }],
        { duration: 520, easing: "ease-out" },
      );
      car.querySelector(".hw-lights")?.animate([{ opacity: 0 }, { opacity: 1 }, { opacity: 0 }, { opacity: 1 }, { opacity: 0 }], { duration: 520 });
      try {
        audio ??= new AudioContext();
        if (audio.state === "suspended") void audio.resume();
        honk(audio);
      } catch {
        // No sound here; the car still bounces and flashes.
      }
    };

    const carAt = (x: number, y: number) => {
      if (!road.hasAttribute("data-open")) return null;
      return (
        cars.find((car) => {
          const r = car.getBoundingClientRect();
          return x >= r.left && x <= r.right && y >= r.top - 4 && y <= r.bottom + 4;
        }) ?? null
      );
    };
    const onMove = (event: PointerEvent) => {
      const car = carAt(event.clientX, event.clientY);
      if (car && car !== over && event.pointerType === "mouse") toot(car);
      over = car;
    };
    const onDown = (event: PointerEvent) => {
      const car = carAt(event.clientX, event.clientY);
      if (car) toot(car);
    };

    const onArrive = (event: Event) => open((event as CustomEvent<ChapterArrive>).detail.id === "process");
    const onLeave = (event: Event) => {
      if ((event as CustomEvent<ChapterLeave>).detail.from === "process") open(false);
    };

    open(Boolean(document.getElementById("process")?.hasAttribute("data-arrived")));
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
