/**
 * The names of the breakpoints defined in globals.css,
 * in order from narrowest to widest.
 */
export const BREAKPOINTS = ["xxs", "xs", "sm", "md", "lg", "xl"] as const;

/**
 * The name of a breakpoint defined in globals.css.
 */
export type Breakpoint = (typeof BREAKPOINTS)[number];

/**
 * A value that is either fixed or varies by breakpoint. Mobile-first, like
 * Tailwind's variants: `base` applies below the narrowest specified breakpoint,
 * and each breakpoint's value applies at or above that breakpoint until it is
 * overridden by the value of a wider one.
 */
export type Responsive<T> = T | ({ base: T } & Partial<Record<Breakpoint, T>>);

/**
 * Resolves the specified Responsive value at the specified breakpoint.
 * Any value that is not an object with a `base` key is returned as-is,
 * so T must not itself be such an object.
 * @param value the Responsive value to be resolved
 * @param breakpoint the widest active breakpoint, or null if the viewport
 *                   is narrower than every breakpoint
 * @returns the value that applies at the specified breakpoint
 */
export const resolveResponsive = <T>(
  value: Responsive<T>,
  breakpoint: Breakpoint | null,
): T => {
  if (typeof value !== "object" || value === null || !("base" in value)) {
    return value;
  }
  // Fall back through narrower breakpoints until one has a value
  const end = breakpoint === null ? 0 : BREAKPOINTS.indexOf(breakpoint) + 1;
  for (const name of BREAKPOINTS.slice(0, end).reverse()) {
    const valueAtBreakpoint = value[name];
    if (valueAtBreakpoint !== undefined) return valueAtBreakpoint;
  }
  return value.base;
};
