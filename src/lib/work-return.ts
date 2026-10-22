/**
 * The case study the visitor is reading. When they head back to the home page
 * (the back button or "All work"), it scrolls straight to that project's store
 * on the high street, so the page they left is where they return — and the
 * store can morph back. In memory only: a fresh page load starts clean.
 */
export const workReturn: { slug: string | null } = { slug: null };

/** A project's own store on the home page (the UAE sites share `UAE_STORE_ID`). */
export const workCardId = (slug: string) => `work-${slug}`;
export const UAE_STORE_ID = "work-uae";
