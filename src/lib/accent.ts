/**
 * Copy can mark accent words with asterisks: "About *me*", "something *bright.*",
 * "feel *alive*.". Accents may span several words; an unmatched `*` stays literal.
 */
export type AccentPiece = { text: string; accent: boolean };

/** Split into words; each word is one or more pieces (e.g. `*alive*.` → "alive" + "."). */
export function splitAccentWords(text: string): AccentPiece[][] {
  const words: AccentPiece[][] = [];
  let word: AccentPiece[] = [];

  for (const run of text.split(/(\*[^*]+\*)/)) {
    if (!run) continue;
    const accent = run.length > 2 && run.startsWith("*") && run.endsWith("*");
    const body = accent ? run.slice(1, -1) : run;

    for (const part of body.split(/(\s+)/)) {
      if (!part) continue;
      if (/^\s+$/.test(part)) {
        if (word.length) words.push(word);
        word = [];
      } else {
        word.push({ text: part, accent });
      }
    }
  }

  if (word.length) words.push(word);
  return words;
}

/** The same text without markers — for labels, alt text and search engines. */
export const stripAccents = (text: string) => text.replace(/\*([^*]+)\*/g, "$1");
