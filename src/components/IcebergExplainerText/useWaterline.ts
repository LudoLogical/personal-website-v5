import { useEffect, useState, type RefObject } from "react";

/**
 * Tracks the vertical position of the midpoint of the gap between the
 * bottom of the HTMLElement assigned to the specified upperRef and the top
 * of the HTMLElement assigned to the specified lowerRef. Updates whenever
 * the size of either HTMLElement or of any of their siblings changes (which
 * includes when web fonts finish loading and when text wraps differently).
 * Both HTMLElements must share the same offsetParent.
 * @param upperRef a RefObject for the HTMLElement above the gap
 * @param lowerRef a RefObject for the HTMLElement below the gap
 * @returns the position, in pixels from the top of the shared offsetParent,
 *          of the midpoint of the gap, or null if it has yet to be measured
 */
export const useWaterline = (
  upperRef: RefObject<HTMLElement | null>,
  lowerRef: RefObject<HTMLElement | null>,
): number | null => {
  const [waterline, setWaterline] = useState<number | null>(null);

  useEffect(() => {
    const upper = upperRef.current;
    const lower = lowerRef.current;
    if (!upper || !lower) return;

    const readWaterline = () => {
      const upperBottom = upper.offsetTop + upper.offsetHeight;
      setWaterline((upperBottom + lower.offsetTop) / 2);
    };

    const observer = new ResizeObserver(readWaterline);
    // Siblings are observed too, since resizing any of them can shift the gap
    const siblings = new Set([
      ...(upper.parentElement?.children ?? []),
      ...(lower.parentElement?.children ?? []),
    ]);
    for (const element of siblings) observer.observe(element); // Get the initial value
    return () => observer.disconnect(); // Destroy observer on cleanup
  }, [upperRef, lowerRef]);

  return waterline;
};
