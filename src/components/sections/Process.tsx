import { Statement } from "@/components/ui/Statement";
import { Tilt } from "@/components/ui/Tilt";
import { chapters, steps } from "@/content/site";

type Vars = React.CSSProperties & Record<`--${string}`, string | number>;

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * 16:00, late afternoon, over the highway to the coast. How a project runs, as
 * four framed cards (the About card's frame), each with a small browser showing
 * the same website at that stage: notes on a blank page, a wireframe, half
 * built with the code open, then live. While the chapter is there the pages
 * keep building themselves, card after card, again and again. The cards sit a
 * little higher than the chapter's middle, so the highway below shows clearly
 * (less so on short screens, where the row is also kept narrower to fit).
 * On phones they slide sideways, a card at a time.
 */
export function Process() {
  return (
    <section
      id="process"
      data-chapter
      aria-labelledby="process-title"
      className="chapter shell relative outline-none [--lift:6svh] [@media(max-height:45rem)]:[--lift:1svh]"
      style={{ paddingBottom: "calc(var(--strip) + var(--lift))" }}
    >
      <Statement id="process-title">{chapters.process.statement}</Statement>

      <div data-track-view="" className="-mx-(--gutter) mt-[clamp(1.5rem,5svh,3.5rem)] px-(--gutter)">
        <ol data-track="" className="gap-4 lg:max-w-[max(56rem,155svh)] lg:gap-5">
          {steps.map((step, i) => (
            <Step key={step.title} index={i} count={steps.length} {...step} />
          ))}
        </ol>
      </div>
    </section>
  );
}

type StepProps = {
  title: string;
  stage: string;
  address: string;
  description: string;
  index: number;
  count: number;
};

function Step({ title, stage, address, description, index, count }: StepProps) {
  return (
    // Black cards with bright screens, by day and by night (data-day-ink).
    <li
      data-step=""
      data-build=""
      data-day-ink=""
      style={{ "--b": 1 + index, "--card": index } as Vars}
      className="w-[72vw] shrink-0 sm:w-[42vw] lg:w-auto lg:min-w-0 lg:flex-1 lg:shrink"
    >
      <Tilt max={6} className="h-full">
        <div className="group relative flex h-full flex-col bg-ink p-3 text-paper">
          <span aria-hidden="true" className="step-edge absolute inset-x-0 top-0 h-[3px] bg-sunlight" />
          <Browser index={index} address={address} />
          <h3 className="mt-[clamp(0.6rem,1.6svh,0.9rem)] text-[clamp(1.15rem,1.5vw,1.6rem)] leading-none font-extrabold uppercase">
            {title}
          </h3>
          <p className="mt-1.5 flex-1 text-[clamp(0.82rem,0.92vw,0.95rem)] leading-snug text-paper/80">{description}</p>
          <p className="meta mt-[clamp(0.6rem,1.6svh,0.9rem)] flex justify-between gap-4 text-paper/65">
            <span>
              {pad(index + 1)} / {pad(count)}
            </span>
            <span>{stage}</span>
          </p>
        </div>
      </Tilt>
    </li>
  );
}

const PAGES = [Brief, Wireframe, Code, Live];

/** The card's picture: a paper browser (as on the project cards) with the site at this stage inside. */
function Browser({ index, address }: { index: number; address: string }) {
  const Page = PAGES[index];
  const live = index === PAGES.length - 1;
  return (
    <div aria-hidden="true" className="bg-paper">
      <div className="flex items-center gap-2 px-2.5 py-1.5">
        <span className="flex gap-1">
          <span className="size-1.5 rounded-full bg-flame" />
          <span className="size-1.5 rounded-full bg-amber" />
          <span className="size-1.5 rounded-full bg-sunlight" />
        </span>
        <span className="meta flex-1 truncate rounded-full bg-ink/8 px-2 py-0.5 text-center text-[0.55rem] tracking-[0.06em] text-ink/75 normal-case">
          {address}
        </span>
        {live && (
          <span className="step-pop meta flex items-center gap-1 text-[0.55rem] tracking-[0.1em] text-ink" style={delay(1200)}>
            <span className="size-1.5 rounded-full bg-[#2fbf71]" />
            Live
          </span>
        )}
      </div>
      <div className="relative aspect-[16/9] overflow-hidden border-t border-ink/10">
        <svg viewBox="0 0 400 250" preserveAspectRatio="xMidYMin slice" className="absolute inset-0 size-full">
          <Page id={`process-${index}`} />
        </svg>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   The website, in a 400 × 250 page: a nav, a hero (heading, a line of text, a
   button and a picture) and three cards — as a wireframe or built. Parts
   appear one after another (`.step-pop` in globals.css).
--------------------------------------------------------------------------- */

const delay = (ms: number) => ({ "--d": `${ms}ms` }) as Vars;
const serif = { fontFamily: "var(--font-serif)", fontStyle: "italic" } as const;

function Pop({ d, children }: { d: number; children: React.ReactNode }) {
  return (
    <g className="step-pop" style={delay(d)}>
      {children}
    </g>
  );
}

type Part = { built?: boolean };

function Nav({ built }: Part) {
  return (
    <g>
      <circle cx={30} cy={22} r={7} className={built ? "fill-flame" : "fill-ink/15"} />
      <rect x={44} y={19} width={46} height={6} rx={3} className={built ? "fill-ink" : "fill-ink/12"} />
      <rect x={300} y={19} width={30} height={6} rx={3} className={built ? "fill-ink/50" : "fill-ink/12"} />
      <rect x={342} y={19} width={30} height={6} rx={3} className={built ? "fill-ink/50" : "fill-ink/12"} />
    </g>
  );
}

function HeroText({ built }: Part) {
  return (
    <g>
      <rect x={24} y={56} width={166} height={18} rx={2} className={built ? "fill-ink" : "fill-ink/12"} />
      <rect x={24} y={82} width={120} height={18} rx={2} className={built ? "fill-ink" : "fill-ink/12"} />
      <rect x={24} y={112} width={150} height={7} rx={3.5} className={built ? "fill-ink/30" : "fill-ink/8"} />
      {built ? (
        <rect x={24} y={134} width={78} height={24} rx={12} className="fill-flame" />
      ) : (
        <rect x={24.75} y={134.75} width={76.5} height={22.5} rx={11} fill="none" strokeWidth={1.5} strokeDasharray="4 3" className="stroke-ink/30" />
      )}
    </g>
  );
}

/** The hero picture; `fill` is how much of it is built, from the left (0–1). */
function Picture({ id, fill = 0 }: { id: string; fill?: number }) {
  const [x, y, w, h] = [218, 50, 158, 108];
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={4} className="fill-ink/8" />
      {fill > 0 && (
        <>
          <defs>
            <linearGradient id={`${id}-pic`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="var(--color-gold)" />
              <stop offset="1" stopColor="var(--color-flame)" />
            </linearGradient>
            <clipPath id={`${id}-clip`}>
              <rect x={x} y={y} width={w * fill} height={h} />
            </clipPath>
          </defs>
          <g clipPath={`url(#${id}-clip)`}>
            <rect x={x} y={y} width={w} height={h} rx={4} fill={`url(#${id}-pic)`} />
            <path d={`M${x},${y + 84} L${x + 52},${y + 58} L${x + 96},${y + 80} L${x + w},${y + 54} L${x + w},${y + h} L${x},${y + h} Z`} className="fill-ember" />
          </g>
        </>
      )}
    </g>
  );
}

function Cards({ built }: Part) {
  return (
    <g>
      {[24, 146, 268].map((x) =>
        built ? (
          <rect key={x} x={x} y={180} width={108} height={50} rx={4} className="fill-ink" />
        ) : (
          <rect key={x} x={x + 0.75} y={180.75} width={106.5} height={48.5} rx={4} fill="none" strokeWidth={1.5} strokeDasharray="4 3" className="stroke-ink/25" />
        ),
      )}
    </g>
  );
}

/** The page's parts, appearing top to bottom. */
function Site({ id, built, picture, cards }: { id: string; built: boolean; picture: number; cards: boolean }) {
  return (
    <>
      <Pop d={0}>
        <Nav built={built} />
      </Pop>
      <Pop d={120}>
        <HeroText built={built} />
      </Pop>
      <Pop d={240}>
        <Picture id={id} fill={picture} />
      </Pop>
      <Pop d={360}>
        <Cards built={cards} />
      </Pop>
    </>
  );
}

/** Discover: two notes on an empty page. */
function Brief() {
  return (
    <>
      <Pop d={0}>
        <g transform="translate(140 112) rotate(-6)">
          <rect x={-50} y={-46} width={100} height={92} className="fill-sunlight" />
          <text y={26} textAnchor="middle" fontSize={68} style={serif} className="fill-ink">
            ?
          </text>
        </g>
      </Pop>
      <Pop d={220}>
        <g transform="translate(266 140) rotate(5)">
          <rect x={-50} y={-46} width={100} height={92} className="fill-amber" />
          {[-20, -4, 12].map((y, i) => (
            <rect key={y} x={-32} y={y} width={[64, 48, 56][i]} height={6} rx={3} className="fill-ink/45" />
          ))}
        </g>
      </Pop>
    </>
  );
}

/** Design: the page as a wireframe, with its colours and type. */
function Wireframe({ id }: { id: string }) {
  return (
    <>
      <Site id={id} built={false} picture={0} cards={false} />
      <Pop d={520}>
        <g transform="translate(276 136)">
          <rect width={104} height={76} rx={6} strokeWidth={1} className="fill-paper stroke-ink/20" />
          {["fill-flame", "fill-amber", "fill-ink"].map((fill, i) => (
            <circle key={fill} cx={22 + i * 28} cy={24} r={10} className={fill} />
          ))}
          <text x={14} y={62} fontSize={28} style={serif} className="fill-ink">
            Aa
          </text>
        </g>
      </Pop>
    </>
  );
}

/** Build: the top of the page built, the rest on its way, the code open beside it. */
function Code({ id }: { id: string }) {
  const lines = [
    [0, 64, "fill-flame"],
    [14, 80, "fill-sunlight"],
    [14, 56, "fill-paper/50"],
    [0, 40, "fill-flame"],
  ] as const;
  return (
    <>
      <Site id={id} built picture={0.5} cards={false} />
      <Pop d={480}>
        <g transform="translate(236 116)">
          <rect width={148} height={114} rx={6} className="fill-ink" />
          <text x={16} y={30} fontSize={18} fontWeight={600} style={{ fontFamily: "var(--font-mono)" }} className="fill-sunlight">
            {"</>"}
          </text>
          {lines.map(([indent, width, fill], i) => (
            <rect
              key={i}
              x={16 + indent}
              y={46 + i * 14}
              width={width}
              height={6}
              rx={3}
              className={`step-grow ${fill}`}
              style={delay(700 + i * 160)}
            />
          ))}
        </g>
      </Pop>
    </>
  );
}

/** Launch: the finished page, and a visitor's cursor gliding in to click the button. */
function Live({ id }: { id: string }) {
  return (
    <>
      <Site id={id} built picture={1} cards />
      <g className="step-cursor" style={delay(600)}>
        <path d="M84,148 l0,24 l6,-6 l5,11 l4,-2 l-5,-10 l8,0 Z" strokeWidth={1.5} strokeLinejoin="round" className="fill-ink stroke-paper" />
      </g>
    </>
  );
}
