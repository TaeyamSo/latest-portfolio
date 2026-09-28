"use client";

import { useSyncExternalStore } from "react";

const formatters = new Map<string, Intl.DateTimeFormat>();

function timeIn(timeZone: string) {
  let format = formatters.get(timeZone);
  if (!format) {
    format = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone, timeZoneName: "shortOffset" });
    formatters.set(timeZone, format);
  }
  return format.format(new Date());
}

const subscribe = (onChange: () => void) => {
  const id = setInterval(onChange, 15_000);
  return () => clearInterval(id);
};

/** The current time in `timeZone`, e.g. "14:32 GMT+4". Renders "--:--" on the server. */
export function LocalTime({ timeZone }: { timeZone: string }) {
  const time = useSyncExternalStore(subscribe, () => timeIn(timeZone), () => "--:--");
  return <time className="tabular-nums">{time}</time>;
}
