import { useEffect, useState, type RefObject } from "react";

/**
 * Tracks the vertical position of the midpoint of the gap between
 * the bottom of the HTMLElement assigned to the specified upperRef
 * and the top of the HTMLElement assigned to the specified lowerRef.
 * Both HTMLElements must share the same offsetParent.
 *
 * Updates whenever the size of either HTMLElement or any of their
 * siblings changes.
 *
 * @param upperRef a RefObject for the HTMLElement above the gap
 * @param lowerRef a RefObject for the HTMLElement below the gap
 * @returns the vertical position, in pixels from the top of the
 *          shared offsetParent, of the midpoint of the gap,
 *          or null if that position cannot be measured yet
 */
export const useGapMidpoint = (
  upperRef: RefObject<HTMLElement | null>,
  lowerRef: RefObject<HTMLElement | null>,
): number | null => {
  const [midpoint, setMidpoint] = useState<number | null>(null);

  useEffect(() => {
    const upperElement = upperRef.current;
    const lowerElement = lowerRef.current;

    // Wait until the gap is measurable
    if (!upperElement || !lowerElement) return;

    const readMidpoint = () => {
      const bottomOfUpperElement =
        upperElement.offsetTop + upperElement.offsetHeight;
      setMidpoint((bottomOfUpperElement + lowerElement.offsetTop) / 2);
    };

    const observer = new ResizeObserver(readMidpoint);

    // Resizing siblings can change the size of the gap,
    // so they must be observed too
    const siblings = new Set([
      ...(upperElement.parentElement?.children ?? []),
      ...(lowerElement.parentElement?.children ?? []),
    ]);

    // Get the initial values
    for (const element of siblings) observer.observe(element);
    return () => observer.disconnect(); // Destroy observer on cleanup
  }, [upperRef, lowerRef]);

  return midpoint;
};
