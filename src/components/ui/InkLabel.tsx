import { cn } from "@/lib/cn";

type Props = {
  text: string;
  className?: string;
  /** A chapter can use it as its title. */
  as?: "p" | "h2";
  id?: string;
};

/**
 * A line of copy set on ink bands, one per wrapped line, like a poster
 * caption — so it stays crisp over the sun and the clouds. When its chapter
 * arrives the bands sweep in from the left, then the words appear on them
 * (`.ink-label` in globals.css).
 */
export function InkLabel({ text, className, as: Tag = "p", id }: Props) {
  return (
    <Tag id={id} tabIndex={Tag === "h2" ? -1 : undefined} className={cn("leading-[1.6] outline-none", className)}>
      <span className="ink-label">{text}</span>
    </Tag>
  );
}
