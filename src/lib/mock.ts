/**
 * Placeholder content (`mock: true` in site.ts) renders in development so the
 * design can be reviewed, but never in a production build — no fake
 * testimonials or status can ship by accident. Set NEXT_PUBLIC_SHOW_MOCKS=true
 * to show it anyway (e.g. on a preview deploy).
 */
export const showMocks =
  process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_SHOW_MOCKS === "true";

/** Whether a single piece of content may render. */
export const visible = (item: { mock?: boolean }) => showMocks || !item.mock;

/** Items that may render. */
export const visibleItems = <T extends { mock?: boolean }>(items: readonly T[]) => items.filter(visible);
