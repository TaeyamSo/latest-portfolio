import { HeroSun } from "@/components/sun/HeroSun";
import { OrbitText } from "@/components/sun/OrbitText";
import { AccentText } from "@/components/ui/AccentText";
import { Dashes } from "@/components/ui/Dashes";
import { LocalTime } from "@/components/ui/LocalTime";
import { MockBadge } from "@/components/ui/MockBadge";
import { profile } from "@/content/site";
import { kern } from "@/lib/kerning";
import { visible } from "@/lib/mock";

type Vars = React.CSSProperties & Record<`--${string}`, string | number>;

/** Availability + local time, above the name. Hidden until real (non-mock) values exist. */
function Status() {
  const { availability, location } = profile;
  const showAvailability = visible(availability);
  const showLocation = visible(location);
  if (!showAvailability && !showLocation) return null;

  return (
    <p
      className="intro-slide meta mb-7 flex flex-wrap items-center gap-x-5 gap-y-2 lg:mb-9"
      style={{ "--delay": "900ms" } as Vars}
    >
      {showAvailability && (
        <span className="flex items-center gap-2.5">
          <span aria-hidden="true" className="relative flex size-2">
            <span className="absolute inset-0 rounded-full bg-ink/50 motion-safe:animate-ping" />
            <span className="relative size-2 rounded-full bg-ink" />
          </span>
          {availability.text}
        </span>
      )}
      {showLocation && (
        <span>
          {location.city} · <LocalTime timeZone={location.timeZone} />
        </span>
      )}
      {(availability.mock || location.mock) && <MockBadge />}
    </p>
  );
}

/** One line of the name; each letter rises out of the line's mask (kerning restored). */
function NameLine({ text, offset }: { text: string; offset: number }) {
  const letters = Array.from(text);
  return (
    <span className="-my-[0.08em] block overflow-hidden py-[0.08em] transition-colors duration-300 hover:text-paper">
      {letters.map((char, i) => (
        <span
          key={i}
          className="intro-letter"
          style={{ "--i": offset + i, marginLeft: i ? `${kern(letters[i - 1], char)}em` : undefined } as Vars}
        >
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
      {/* The sun's place in the viewport is --sun-x / --sun-y. The WebGL sun starts its
          journey from this box (data-sun-stage). */}
      <div
        data-sun-stage
        className="pointer-events-none absolute top-(--sun-y) left-(--sun-x) aspect-square w-[min(92vw,50svh)] -translate-1/2 lg:w-[min(41vw,84svh)]"
      >
        {/* Desktop only: on narrow screens the ring would run through the header.
            It fades out as the sun leaves (data-sun-orbit). */}
        <div className="intro-sun absolute -inset-[9%] hidden lg:block">
          <div data-sun-orbit className="size-full">
            <OrbitText className="orbit size-full text-ink/80" />
          </div>
        </div>
        <HeroSun />
        <p
          aria-hidden="true"
          className="intro-from-right serif-accent pointer-events-none absolute top-1/2 left-[4%] -translate-y-[58%] text-[clamp(2.6rem,5.6vw,6.6rem)] leading-none"
        >
          portfolio
        </p>
      </div>

      <div className="relative z-10">
        <Status />
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
          {profile.tagline.map((line) => (
            <span key={line} className="block">
              <AccentText text={line} />
            </span>
          ))}
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
