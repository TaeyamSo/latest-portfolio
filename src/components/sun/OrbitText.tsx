import { profile } from "@/content/site";

const RADIUS = 46; // in a 100×100 viewBox
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * A ring of mono text orbiting the hero sun. `textLength` pins it to the exact
 * circumference, so the loop stays seamless even while the web font swaps in.
 */
export function OrbitText({ className }: { className?: string }) {
  const phrase = `Portfolio • ${profile.role} • ${profile.fullName} • ${new Date().getFullYear()} • `;
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" focusable="false" className={className}>
      <defs>
        <path
          id="orbit-path"
          d={`M ${50 - RADIUS},50 a ${RADIUS},${RADIUS} 0 1,1 ${RADIUS * 2},0 a ${RADIUS},${RADIUS} 0 1,1 -${RADIUS * 2},0`}
        />
      </defs>
      <text className="fill-current font-mono text-[2px] font-medium tracking-[0.2em] uppercase">
        <textPath href="#orbit-path" textLength={CIRCUMFERENCE} lengthAdjust="spacing">
          {phrase.repeat(3)}
        </textPath>
      </text>
    </svg>
  );
}
