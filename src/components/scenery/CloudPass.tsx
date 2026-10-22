"use client";

import { useEffect, useRef, useState } from "react";

import { DAY } from "@/components/sun/day";
import { CLOUD_PASS, CLOUD_PASS_COVER_MS, CLOUD_PASS_REVEAL_MS, type CloudPassDetail } from "@/lib/chapters";

import { Cloud, CLOUD_PALETTES, type CloudPalette, type CloudShape } from "./Cloud";

type Vars = React.CSSProperties & Record<`--${string}`, string | number>;

/** The clouds take the colours of the hour you arrive at: cream by day, golden late in the day, dusk at the sunset. */
function toneFor(id: string): CloudPalette {
  if (id === "contact") return "dusk";
  const stop = id === "home" ? DAY[0] : DAY.find((day) => day.anchor?.id === id);
  return (stop?.clouds ?? 0) >= 0.5 ? "golden" : "day";
}

/** The sky of the hour you arrive at (the page's own, SkyCycle), so by day the bank is the site's colours; the sunset's ember for the contact. */
function skyFor(id: string): readonly [string, string] {
  if (id === "contact") return ["#b3300c", "#d9531a"];
  const stop = id === "home" ? DAY[0] : DAY.find((day) => day.anchor?.id === id);
  return stop?.sky ?? DAY[0].sky;
}

/** The puffs along each edge of the bank, top to bottom (top in vh, nudged in or out, which shape, mirrored). */
const EDGE: { top: number; nudge: number; shape: CloudShape; flip?: boolean }[] = [
  { top: -12, nudge: 4, shape: "bank" },
  { top: 2, nudge: -3, shape: "puff", flip: true },
  { top: 16, nudge: 6, shape: "bank", flip: true },
  { top: 30, nudge: -2, shape: "puff" },
  { top: 44, nudge: 5, shape: "bank" },
  { top: 58, nudge: -4, shape: "puff", flip: true },
  { top: 72, nudge: 3, shape: "bank", flip: true },
  { top: 86, nudge: -2, shape: "puff" },
];

/** Cloud forms inside the bank (left and top in % of its middle, width in vh), so the covered screen reads as flying through cloud, not a flat sheet. */
const INNER: { left: number; top: number; width: number; shape: CloudShape; flip?: boolean }[] = [
  { left: 4, top: 6, width: 70, shape: "bank" },
  { left: 30, top: 30, width: 90, shape: "puff", flip: true },
  { left: 12, top: 58, width: 80, shape: "bank", flip: true },
  { left: 55, top: 10, width: 75, shape: "puff" },
  { left: 62, top: 50, width: 95, shape: "bank" },
  { left: 40, top: 76, width: 70, shape: "puff", flip: true },
  { left: 82, top: 28, width: 65, shape: "bank", flip: true },
  { left: 85, top: 70, width: 60, shape: "puff" },
];

/**
 * The cloud pass (providers/Chapters.tsx): a long jump between chapters — four
 * or more away, from the side nav, the menu or a link — doesn't race the whole
 * day past. Instead a bank of clouds rolls across the screen (from the right
 * going down the page, from the left going back up), the page jumps to the
 * chapter while it's covered — sky, sun, landscape and clock all settling
 * unseen — and the bank rolls on and away to reveal it, its words building in.
 * The bank is the page's own poster clouds in the colours of the hour you
 * arrive at (moonlit in the night theme): a billowing edge of puffs on either
 * side of a solid middle. Only transforms move. (Chapters are off with reduced
 * motion, so it never plays there.)
 */
export function CloudPass() {
  const [pass, setPass] = useState<{ state: "idle" | "cover" | "reveal"; direction: number; tone: CloudPalette; sky: readonly [string, string] }>({
    state: "idle",
    direction: 1,
    tone: "day",
    sky: DAY[0].sky,
  });
  const timer = useRef(0);

  useEffect(() => {
    const onPass = (event: Event) => {
      const { phase, direction, to } = (event as CustomEvent<CloudPassDetail>).detail;
      window.clearTimeout(timer.current);
      if (phase === "cover") setPass({ state: "cover", direction, tone: toneFor(to), sky: skyFor(to) });
      else {
        setPass((now) => ({ ...now, state: "reveal" }));
        timer.current = window.setTimeout(() => setPass((now) => ({ ...now, state: "idle" })), CLOUD_PASS_REVEAL_MS + 50);
      }
    };
    window.addEventListener(CLOUD_PASS, onPass);
    return () => {
      window.removeEventListener(CLOUD_PASS, onPass);
      window.clearTimeout(timer.current);
    };
  }, []);

  const colors = CLOUD_PALETTES[pass.tone];
  const edge = (side: "lead" | "trail") =>
    EDGE.map((puff, i) => (
      <div
        key={`${side}-${i}`}
        className="cloud-pass-puff"
        style={{ top: `${puff.top}vh`, translate: `${side === "lead" ? puff.nudge : -puff.nudge}vh 0`, scale: puff.flip ? "-1 1" : undefined }}
      >
        <Cloud id={`pass-${side}-${i}`} shape={puff.shape} palette={pass.tone} className="aspect-[100/40] w-full" />
      </div>
    ));

  return (
    <div
      aria-hidden="true"
      className="cloud-pass"
      data-state={pass.state}
      data-direction={pass.direction < 0 ? "up" : "down"}
      style={{ "--cp-cover": `${CLOUD_PASS_COVER_MS}ms`, "--cp-reveal": `${CLOUD_PASS_REVEAL_MS}ms`, "--cp-body": colors.body, "--cp-lit": colors.lit, "--cp-sky-l": pass.sky[0], "--cp-sky-r": pass.sky[1] } as Vars}
    >
      <div className="cloud-pass-bank">
        <div className="cloud-pass-edge cloud-pass-lead">{edge("lead")}</div>
        <div className="cloud-pass-core">
          {INNER.map((cloud, i) => (
            <div
              key={i}
              className="cloud-pass-inner"
              style={{ left: `${cloud.left}%`, top: `${cloud.top}%`, width: `${cloud.width}vh`, scale: cloud.flip ? "-1 1" : undefined }}
            >
              <Cloud id={`pass-inner-${i}`} shape={cloud.shape} palette={pass.tone} light="top" className="aspect-[100/40] w-full" />
            </div>
          ))}
        </div>
        <div className="cloud-pass-edge cloud-pass-trail">{edge("trail")}</div>
      </div>
    </div>
  );
}
