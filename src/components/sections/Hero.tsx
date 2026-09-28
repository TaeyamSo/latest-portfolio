import { HeroSun } from "@/components/sun/HeroSun";
import { Dashes } from "@/components/ui/Dashes";
import { profile } from "@/content/site";

type Vars = React.CSSProperties & Record<`--${string}`, string | number>;

/** One line of the name; each letter rises out of the line's mask. */
function NameLine({ text, offset }: { text: string; offset: number }) {
  return (
    <span className="-my-[0.08em] block overflow-hidden py-[0.08em] transition-colors duration-300 hover:text-paper">
      {Array.from(text).map((char, i) => (
        <span key={i} className="intro-letter" style={{ "--i": offset + i } as Vars}>
          {char}
        </span>
      ))}
    </span>
  );
}

export function Hero() {
  return (
    <section
      id="home"
      aria-label="Introduction"
      className="shell relative isolate flex min-h-svh flex-col justify-end pb-[17svh] outline-none lg:justify-center lg:pb-0"
    >
      {/* The sun sits exactly on the rings' centre (see --rings-x / --rings-y). */}
      <div className="pointer-events-none absolute top-(--rings-y) left-(--rings-x) aspect-square w-[min(92vw,50svh)] -translate-1/2 lg:w-[min(41vw,84svh)]">
        <HeroSun />
        <p
          aria-hidden="true"
          className="intro-from-right pointer-events-auto absolute top-1/2 left-[5%] -translate-y-1/2 text-[clamp(1.6rem,3.8vw,4.4rem)] font-black tracking-[0.03em] uppercase transition-colors duration-300 [text-shadow:0_4px_3px_rgb(0_0_0/0.4),0_8px_13px_rgb(0_0_0/0.1),0_18px_23px_rgb(0_0_0/0.1)] hover:text-paper"
        >
          Portfolio
        </p>
      </div>

      <div className="relative z-10">
        <h1 className="text-display font-extrabold uppercase">
          <span className="sr-only">{profile.fullName}</span>
          <span aria-hidden="true">
            <NameLine text={profile.firstName} offset={0} />
            <NameLine text={profile.lastName} offset={profile.firstName.length} />
          </span>
        </h1>
        <Dashes className="mt-7 lg:mt-9" dashClassName="intro-dash" />
        <p
          className="intro-slide mt-7 text-[clamp(1.15rem,1.55vw,1.8rem)] leading-snug font-medium lg:mt-9"
          style={{ "--delay": "700ms" } as Vars}
        >
          <span className="block transition-colors hover:text-paper">{profile.tagline[0]}</span>
          <span className="block transition-colors hover:text-paper">{profile.tagline[1]}</span>
        </p>
      </div>

      <div
        aria-hidden="true"
        className="intro-slide meta absolute bottom-7 flex items-center gap-4 lg:bottom-10"
        style={{ "--delay": "1100ms" } as Vars}
      >
        <span className="relative block h-1 w-14 overflow-hidden rounded-full bg-ink/20">
          <span className="scroll-cue absolute inset-y-0 left-0 w-1/2 rounded-full bg-ink" />
        </span>
        Scroll to explore
      </div>
    </section>
  );
}
