import { cn } from "@/lib/cn";

type Props = {
  className?: string;
  /** Classes applied to each dash (e.g. intro animation). */
  dashClassName?: string;
};

/**
 * The signature double-dash from the original site: two offset pills under
 * every heading. They follow `currentColor`, so hover/tone changes carry over.
 */
export function Dashes({ className, dashClassName }: Props) {
  return (
    <span aria-hidden="true" className={cn("flex w-fit flex-col gap-[0.85rem]", className)}>
      <span
        className={cn("block h-1 w-[6.25rem] rounded-full bg-current", dashClassName)}
        style={{ "--delay": "450ms" } as React.CSSProperties}
      />
      <span
        className={cn("ml-[3.45rem] block h-1 w-[6.25rem] rounded-full bg-current", dashClassName)}
        style={{ "--delay": "560ms" } as React.CSSProperties}
      />
    </span>
  );
}
