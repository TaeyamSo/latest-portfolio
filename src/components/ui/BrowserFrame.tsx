import { cn } from "@/lib/cn";

const displayUrl = (url: string) => url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

type Props = {
  url: string;
  children: React.ReactNode;
  className?: string;
};

/** The paper browser window the project screenshots sit in: three dots and the site's address. */
export function BrowserFrame({ url, children, className }: Props) {
  return (
    <div className={cn("bg-paper p-2 shadow-[0_40px_80px_-40px_rgb(0_0_0/0.9)] sm:p-3", className)}>
      <div className="flex items-center gap-3 px-1.5 pb-2 sm:pb-2.5">
        <span aria-hidden="true" className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-flame" />
          <span className="size-2.5 rounded-full bg-amber" />
          <span className="size-2.5 rounded-full bg-sunlight" />
        </span>
        <span className="meta flex-1 truncate rounded-full bg-ink/8 px-3 py-1 text-center text-[0.6rem] tracking-[0.08em] text-ink/80 normal-case">
          {displayUrl(url)}
        </span>
      </div>
      {children}
    </div>
  );
}
