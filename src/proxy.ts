import { NextResponse, type NextRequest } from "next/server";

import { WELCOME_FULL_COOKIE } from "@/lib/welcome";

/**
 * A hard refresh (Ctrl+Shift+R, Ctrl+F5, Cmd+Shift+R) is the one load the
 * browser asks for with `Cache-Control: no-cache` (or `Pragma: no-cache`); a
 * normal reload sends `max-age=0`, a normal visit nothing. On a hard refresh of
 * a page, this leaves a short-lived cookie that tells the welcome screen to
 * play in full again (lib/welcome.ts) instead of its short version.
 */
export function proxy(request: NextRequest) {
  const headers = request.headers;
  const page = headers.get("sec-fetch-dest") === "document" || (headers.get("accept") ?? "").includes("text/html");
  const hard = /no-cache/i.test(headers.get("cache-control") ?? "") || /no-cache/i.test(headers.get("pragma") ?? "");
  const response = NextResponse.next();
  if (page && hard && !headers.has("rsc")) {
    response.cookies.set(WELCOME_FULL_COOKIE, "1", { path: "/", maxAge: 30, sameSite: "lax" });
  }
  return response;
}

export const config = {
  // Pages only: not Next's own files, the image optimiser, or anything with a file extension.
  matcher: ["/((?!_next/|api/|.*\\..*).*)"],
};
