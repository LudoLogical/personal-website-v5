import { useSyncExternalStore } from "react";

/**
 * The media query that matches iff the user `prefers-reduced-motion`.
 */
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Registers the specified callback as a listener for changes
 * to whether {@link REDUCED_MOTION_QUERY} matches.
 * @param onChange the callback to be invoked on each change
 * @returns a function that removes the listener
 */
const subscribeToReducedMotion = (onChange: () => void): (() => void) => {
  const mediaQueryList = matchMedia(REDUCED_MOTION_QUERY);
  mediaQueryList.addEventListener("change", onChange);
  return () => mediaQueryList.removeEventListener("change", onChange);
};

/**
 * Tracks whether the user `prefers-reduced-motion`.
 * Updates whenever that preference changes.
 * @returns `true` if the user `prefers-reduced-motion`, `false` otherwise
 *          (and during server rendering)
 */
const usePrefersReducedMotion = (): boolean =>
  useSyncExternalStore(
    subscribeToReducedMotion,
    () => matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false,
  );

export default usePrefersReducedMotion;
