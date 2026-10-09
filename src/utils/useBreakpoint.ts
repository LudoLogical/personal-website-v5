import { useSyncExternalStore } from "react";
import { BREAKPOINTS, type Breakpoint } from "./breakpoints";

/**
 * A MediaQueryList for each breakpoint that globals.css defines, in order from
 * narrowest to widest. Built on first use because the breakpoint values are
 * read from the :root CSS variables, which only exist in the browser.
 */
let mediaQueryLists: { name: Breakpoint; list: MediaQueryList }[] | null = null;

const getMediaQueryLists = () => {
  if (mediaQueryLists) return mediaQueryLists;
  const rootStyle = getComputedStyle(document.documentElement);
  mediaQueryLists = BREAKPOINTS.flatMap((name) => {
    const width = rootStyle.getPropertyValue(`--breakpoint-${name}`).trim();
    // Skip any breakpoint whose variable is missing
    return width ? [{ name, list: matchMedia(`(min-width: ${width})`) }] : [];
  });
  return mediaQueryLists;
};

const subscribe = (onChange: () => void) => {
  const lists = getMediaQueryLists().map(({ list }) => list);
  for (const list of lists) list.addEventListener("change", onChange);
  return () => {
    for (const list of lists) list.removeEventListener("change", onChange);
  };
};

const getSnapshot = () =>
  getMediaQueryLists().findLast(({ list }) => list.matches)?.name ?? null;

// The server can't know the viewport, so it assumes the narrowest one
const getServerSnapshot = () => null;

/**
 * Tracks the widest breakpoint (as defined in globals.css) at or above which
 * the viewport currently sits. Updates whenever the viewport crosses one.
 * @returns the widest active Breakpoint, or null if the viewport is narrower
 *          than every breakpoint (always the case during server rendering)
 */
export const useBreakpoint = (): Breakpoint | null =>
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
