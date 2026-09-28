"use client";

import { motion, useMotionValue, useSpring } from "motion/react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/cn";
import { useMediaQuery, useReducedMotionSafe } from "@/lib/use-media-query";

const TARGETS = "a[href], button, [role='tab'], [data-cursor]";

type Look = { visible: boolean; active: boolean; label: string; light: boolean };
const HIDDEN: Look = { visible: false, active: false, label: "", light: false };

/**
 * A dot that sits exactly on the pointer and a ring that trails it. The ring
 * grows over interactive elements and shows a label from `data-cursor`; it turns
 * light over `[data-cursor-tone="light"]` surfaces. Mouse only — the native
 * cursor returns for touch/pen, forced colours and reduced motion.
 */
export function Cursor() {
  const fine = useMediaQuery("(hover: hover) and (pointer: fine)");
  const still = useReducedMotionSafe();
  return fine && !still ? <Follower /> : null;
}

function Follower() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 420, damping: 34, mass: 0.5 });
  const ringY = useSpring(y, { stiffness: 420, damping: 34, mass: 0.5 });
  const [look, setLook] = useState<Look>(HIDDEN);

  useEffect(() => {
    const root = document.documentElement;
    let current = HIDDEN;

    const update = (next: Partial<Look>) => {
      const merged = { ...current, ...next };
      if (
        merged.visible === current.visible &&
        merged.active === current.active &&
        merged.label === current.label &&
        merged.light === current.light
      ) {
        return;
      }
      current = merged;
      setLook(merged);
    };

    const hide = () => {
      root.classList.remove("has-cursor");
      update({ visible: false });
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return hide();
      x.set(event.clientX);
      y.set(event.clientY);
      if (!current.visible) {
        // Appear on the pointer instead of flying in from the last position.
        ringX.jump(event.clientX);
        ringY.jump(event.clientY);
        root.classList.add("has-cursor");
        update({ visible: true });
      }
    };

    const onOver = (event: PointerEvent) => {
      if (!(event.target instanceof Element)) return;
      const target = event.target.closest(TARGETS);
      const tone = event.target.closest("[data-cursor-tone]")?.getAttribute("data-cursor-tone");
      update({
        active: Boolean(target),
        label: target?.getAttribute("data-cursor") ?? "",
        light: tone === "light",
      });
    };

    const onDown = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") hide();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    root.addEventListener("pointerleave", hide);
    window.addEventListener("blur", hide);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      document.removeEventListener("pointerover", onOver);
      root.removeEventListener("pointerleave", hide);
      window.removeEventListener("blur", hide);
      root.classList.remove("has-cursor");
    };
  }, [x, y, ringX, ringY]);

  return (
    <div
      aria-hidden="true"
      className={cn(
        "cursor pointer-events-none fixed inset-0 z-[95] transition-opacity duration-300",
        look.visible ? "opacity-100" : "opacity-0",
        look.light ? "text-paper" : "text-ink",
      )}
    >
      <motion.div className="absolute top-0 left-0" style={{ x: ringX, y: ringY }}>
        <motion.div
          className={cn(
            "flex size-24 -translate-1/2 items-center justify-center rounded-full border-[3px] border-current transition-colors duration-300",
            look.label && "bg-current",
          )}
          animate={{ scale: look.label ? 1 : look.active ? 0.5 : 0.34 }}
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        >
          <span
            className={cn(
              "meta transition-opacity duration-200",
              look.label ? "opacity-100" : "opacity-0",
              look.light ? "text-ink" : "text-paper",
            )}
          >
            {look.label}
          </span>
        </motion.div>
      </motion.div>
      <motion.div className="absolute top-0 left-0" style={{ x, y }}>
        <span
          className={cn(
            "block size-1.5 -translate-1/2 rounded-full bg-current transition-transform duration-300",
            look.active && "scale-0",
          )}
        />
      </motion.div>
    </div>
  );
}
