"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { NoBlending, Vector2, type ShaderMaterial } from "three";

import { useMediaQuery } from "@/lib/use-media-query";

import { NOON_SCALE, fullscreenVertex, noonFragment } from "./shaders";

type Props = {
  className?: string;
  /** Called once the first frame has been painted. */
  onReady: () => void;
  /** Set `.current = 1` to fire a solar flare; it decays on its own. */
  flareRef: React.RefObject<number>;
};

/** WebGL hero sun. Lazy-loaded; only renders while on screen. */
export default function NoonCanvas({ className, onReady, flareRef }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={className} aria-hidden="true">
      <Canvas
        frameloop={visible && !reduced ? "always" : "demand"}
        dpr={[1, 2]}
        flat
        linear
        gl={{ alpha: true, antialias: false, premultipliedAlpha: true, powerPreference: "high-performance" }}
        style={{ pointerEvents: "none" }}
      >
        <NoonSun onReady={onReady} flareRef={flareRef} animate={!reduced} />
      </Canvas>
    </div>
  );
}

function NoonSun({ onReady, flareRef, animate }: Omit<Props, "className"> & { animate: boolean }) {
  const material = useRef<ShaderMaterial>(null);
  const gl = useThree((state) => state.gl);
  const pointer = useRef({ x: 0, y: 0, present: false });
  const [uniforms] = useState(() => ({
    uTime: { value: 8 },
    uRes: { value: new Vector2(1, 1) },
    uPointer: { value: new Vector2(0, 0) },
    uHover: { value: 0 },
    uFlare: { value: 0 },
  }));

  // Track the cursor relative to the sun, in disc radii.
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const onMove = (event: PointerEvent) => {
      const rect = gl.domElement.getBoundingClientRect();
      const unit = Math.min(rect.width, rect.height) / 2 / NOON_SCALE;
      pointer.current.x = (event.clientX - rect.left - rect.width / 2) / unit;
      pointer.current.y = (event.clientY - rect.top - rect.height / 2) / unit;
      pointer.current.present = true;
    };
    const onLeave = () => {
      pointer.current.present = false;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [gl]);

  // Two frames in, the canvas has painted — safe to cross-fade from the SVG.
  useEffect(() => {
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(onReady);
    });
    return () => cancelAnimationFrame(frame);
  }, [onReady]);

  useFrame((state, delta) => {
    const u = material.current?.uniforms;
    if (!u) return;
    const dt = Math.min(delta, 1 / 20);
    const ease = 1 - Math.exp(-dt * 5);
    const target = pointer.current;

    if (animate) u.uTime.value += dt;
    state.gl.getDrawingBufferSize(u.uRes.value);
    u.uPointer.value.x += (target.x - u.uPointer.value.x) * ease;
    u.uPointer.value.y += (target.y - u.uPointer.value.y) * ease;
    u.uHover.value += ((target.present ? 1 : 0) - u.uHover.value) * ease;
    u.uFlare.value = flareRef.current;
    flareRef.current *= Math.exp(-dt * 1.8);
  });

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={material}
        vertexShader={fullscreenVertex}
        fragmentShader={noonFragment}
        uniforms={uniforms}
        blending={NoBlending}
        depthTest={false}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}
