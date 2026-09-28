import { Fragment } from "react";

import { splitAccentWords } from "@/lib/accent";

/** Renders copy with `*accent*` words set in the serif italic. */
export function AccentText({ text }: { text: string }) {
  return splitAccentWords(text).map((pieces, i) => (
    <Fragment key={i}>
      {i > 0 && " "}
      {pieces.map((piece, j) =>
        piece.accent ? (
          <span key={j} className="serif-accent">
            {piece.text}
          </span>
        ) : (
          <Fragment key={j}>{piece.text}</Fragment>
        ),
      )}
    </Fragment>
  ));
}
