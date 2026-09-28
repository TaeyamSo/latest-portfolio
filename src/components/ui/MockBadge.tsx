import { cn } from "@/lib/cn";

/** Marks placeholder content while it's visible (development only). */
export function MockBadge({ className }: { className?: string }) {
  return (
    <span
      title="Placeholder content — replace it in src/content/site.ts"
      className={cn(
        "meta inline-flex items-center rounded-full border border-dashed border-current px-2 py-0.5 text-[0.58rem] leading-none tracking-[0.12em]",
        className,
      )}
    >
      Mock
    </span>
  );
}
