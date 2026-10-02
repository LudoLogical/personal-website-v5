import { useEffect, useState, type RefObject } from "react";

/**
 * Information about the rasterized size of a text Element.
 */
export type TextDimensions = {
  /** The width, in pixels, of the rasterized text. */
  width: number;

  /** The height, in pixels, of the rasterized text. */
  height: number;

  /**
   * The font size, in pixels, of the rasterized text.
   * Definitionally equivalent to exactly 1 em.
   */
  em: number;
};

/**
 * Tracks the width, height, and font size of the HTMLElement assigned to the
 * specified targetRef. Updates whenever the dimensions of the HTMLElement
 * change (which includes when web fonts finish loading).
 * @param ref a RefObject for the HTMLElement to be measured  
 * @returns the TextDimensions of the HMTLElement, or null if ref is null
 */
export const useTextDimensions = (
  ref: RefObject<HTMLElement | null>,
): TextDimensions | null => {
  const [textDims, setTextDims] = useState<TextDimensions | null>(null);

  useEffect(() => {
    const target = ref.current;
    if (!target) return;

    const readTextDims = () => {
      const rect = target.getBoundingClientRect();
      setTextDims({
        width: rect.width,
        height: rect.height,
        em: parseFloat(getComputedStyle(target).fontSize),
      });
    };

    const observer = new ResizeObserver(readTextDims);
    observer.observe(target); // Get the initial values
    return () => observer.disconnect(); // Destroy observer on cleanup
  }, [ref]);

  return textDims;
};
