import { useCallback, useSyncExternalStore } from "react";

/**
 * Subscribe to a media query. `serverValue` is used during SSR and hydration,
 * so the first client render always matches the server markup.
 */
export function useMediaQuery(query: string, serverValue = false) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    [query],
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => serverValue,
  );
}

/** True until the client confirms the user is fine with motion. */
export const useReducedMotionSafe = () => useMediaQuery("(prefers-reduced-motion: reduce)", true);
