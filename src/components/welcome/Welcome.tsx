import { NightStars } from "@/components/scenery/NightStars";
import { DAY, NIGHT } from "@/components/sun/day";
import { cn } from "@/lib/cn";
import { kern } from "@/lib/kerning";
import { WELCOME_RELEASE_MS, WELCOME_SHAPES } from "@/lib/welcome";

import { WelcomeGuard } from "./WelcomeGuard";

type Vars = React.CSSProperties & Record<`--${string}`, string | number>;

const WORD = "TAYAM";

/** The page's own sky (as SkyCycle paints it), so the screen's colours are the site's. */
const sky = ({ sky: [left, right] }: { sky: readonly [string, string] }) => `linear-gradient(90deg, ${left}, ${right} 49%)`;

/**
 * TAYAM, set like the hero's name (Kanit ExtraBold, its kerning restored). The
 * first copy rises in letter by letter through its mask, the hero's motion;
 * the copies on the sun and night halves are already in place.
 */
function Word({ tone, rise }: { tone: "ink" | "white"; rise?: boolean }) {
  const letters = Array.from(WORD);
  return (
    <div className={cn("w-word", tone === "white" ? "w-word-white" : "w-word-ink")}>
      <span className="w-mask">
        {letters.map((char, i) => (
          <span
            key={i}
            className={rise ? "w-letter" : undefined}
            style={{ "--i": i, marginLeft: i ? `${kern(letters[i - 1], char)}em` : undefined } as Vars}
          >
            {char}
          </span>
        ))}
      </span>
    </div>
  );
}

/**
 * The welcome screen, over everything on every full page load. Black, with
 * TAYAM in white; a thin wiggly line draws itself down through the Y; then the
 * sun's sky fills the left half from the left edge (the letters there turn
 * black) and the night's sky the right half from the right edge (the letters
 * stay white), so the Y ends up split along the line. Then the line fades,
 * the sun's sky sweeps on across the night's (the letters turn black again) —
 * or, in the night theme, the night's across the sun's (they turn white) —
 * the word slides up out of sight and the screen fades into the page, whose
 * sky is the same one.
 *
 * Each half is a window with the line for an edge that slides in, while what's
 * inside it slides back by the same amount — so the colour sweeps in and the
 * letters change exactly where its edge passes, all with transforms (smooth
 * while the page loads underneath). Pure CSS from the first paint
 * (globals.css, "Welcome"); lib/welcome.ts has the line and the hand-over.
 */
export function Welcome() {
  return (
    <div id="welcome" className="welcome" aria-hidden="true" style={{ "--w-release": `${WELCOME_RELEASE_MS}ms` } as Vars}>
      <Word tone="white" rise />

      <div className="w-panel w-night" style={{ clipPath: WELCOME_SHAPES.night }}>
        <div className="w-pin">
          <div className="w-frame" style={{ background: sky(NIGHT[0]) }}>
            <NightStars />
            <Word tone="white" />
          </div>
        </div>
      </div>

      <div className="w-panel w-sun" style={{ clipPath: WELCOME_SHAPES.sun }}>
        <div className="w-pin">
          <div className="w-frame" style={{ background: sky(DAY[0]) }}>
            <Word tone="ink" />
          </div>
        </div>
      </div>

      <div className="w-line-window">
        <div className="w-line-pin">
          <div className="w-line" style={{ clipPath: WELCOME_SHAPES.line }} />
        </div>
      </div>

      <WelcomeGuard />
    </div>
  );
}
