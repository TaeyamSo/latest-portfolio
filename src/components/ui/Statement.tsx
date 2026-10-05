import { cn } from "@/lib/cn";

type Props = {
  id: string;
  children: React.ReactNode;
  className?: string;
};

/**
 * A chapter's title: one plain sentence that says what the chapter is about —
 * no section number, no italic accent word. It's the first thing to build in
 * when the chapter arrives (`data-build`, see globals.css).
 */
export function Statement({ id, children, className }: Props) {
  return (
    <h2
      id={id}
      tabIndex={-1}
      data-build=""
      style={{ "--b": 0 } as React.CSSProperties}
      className={cn(
        "max-w-[24ch] text-[clamp(1.85rem,3.3vw,3.5rem)] leading-[1.06] font-semibold tracking-[-0.015em] text-balance outline-none",
        className,
      )}
    >
      {children}
    </h2>
  );
}
