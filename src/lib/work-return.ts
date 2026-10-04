/**
 * The case study the visitor is reading. When they head back to the home page
 * (the back button or "All work"), it scrolls straight to that project's card,
 * so the page they left is where they return — and the card can morph back.
 * In memory only: a fresh page load starts clean.
 */
export const workReturn: { slug: string | null } = { slug: null };

/** The card's wrapper on the home page. */
export const workCardId = (slug: string) => `work-${slug}`;
