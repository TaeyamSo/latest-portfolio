/** Day or night (lib/theme.ts). Kept apart so the root layout can read it on the server. */
export type Theme = "day" | "night";

export const THEME_KEY = "theme";

/** Runs in <head> before the first paint: puts the saved night, if any, on <html>. */
export const THEME_SCRIPT = `(function(){try{if(localStorage.getItem("${THEME_KEY}")==="night")document.documentElement.setAttribute("data-theme","night")}catch(e){}})()`;
