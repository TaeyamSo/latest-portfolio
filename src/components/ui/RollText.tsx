import { cn } from "@/lib/cn";

/**
 * Text that rolls up to reveal an identical copy on hover / keyboard focus.
 * The parent must carry `group/roll`. The copy is hidden from assistive tech.
 */
export function RollText({ children, className }: { children: string; className?: string }) {
  const line = "block transition-transform duration-500 ease-expo motion-safe:group-hover/roll:-translate-y-full motion-safe:group-focus-visible/roll:-translate-y-full";
  return (
    <span className={cn("relative inline-block overflow-hidden align-bottom", className)}>
      <span className={line}>{children}</span>
      <span aria-hidden="true" className={cn(line, "absolute inset-x-0 top-full select-none")}>
        {children}
      </span>
    </span>
  );
}
