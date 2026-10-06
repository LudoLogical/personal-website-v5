import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import {
  useTextDimensions,
  type TextDimensions,
} from "@/utils/useTextDimensions";

/**
 * The position, in pixels, of the center of a dot
 * relative to the upper-left corner of the display text.
 */
export type Point = { x: number; y: number };

/**
 * A single character of the display text in a ConnectingDotsText.
 */
export type DisplayCharacter = {
  /**
   * The character itself.
   */
  char: string;

  /**
   * The index of the dot that appears over this DisplayCharacter,
   * or null if no dot appears over it (i.e., if it is whitespace).
   */
  dotIndex: number | null;
};

/**
 * Everything needed to render the dots of a ConnectingDotsText.
 */
export type DotPoints = {
  /**
   * The DisplayCharacters that comprise the display text.
   */
  characters: DisplayCharacter[];

  /**
   * The number of dots, which is the number of non-whitespace characters.
   */
  dotCount: number;

  /**
   * The Points at which the dots should be centered, from left to right.
   * Empty until the display text has been measured.
   */
  points: Point[];

  /**
   * Registers the rendered element for the DisplayCharacter beneath the dot
   * at the specified index so that its position can be measured.
   * Intended to be called from a ref callback.
   */
  setLetterRef: (dotIndex: number, element: HTMLSpanElement | null) => void;

  /**
   * The TextDimensions of the display text, or null if not yet measured.
   */
  textDimensions: TextDimensions | null;
};

/**
 * Generates random vertical positions for the specified number of dots.
 * @param count the number of positions to be generated
 * @param margin the minimum distance, in ems, between each position and
 *               both the top and the bottom of the line
 * @returns the generated positions, in ems from the top of the line
 */
const generateDotPositions = (count: number, margin: number): number[] =>
  Array.from(
    { length: count },
    () => margin + Math.random() * (1 - 2 * margin),
  );

/**
 * Places one dot over each non-whitespace character of the specified display
 * text. Horizontally, each dot is centered over its character. Vertically,
 * each dot is placed according to the specified dotPositions, or randomly if
 * none are specified. Re-measures whenever the rendered text changes size
 * (font load, viewport resize, clamp() breakpoints), but random positions
 * are only regenerated when the number of dots or the margin changes.
 * @param containerRef a RefObject for the HTMLElement containing the
 *                     display text, against which the dots are measured
 * @param text the display text over which the dots should be placed
 * @param dotPositions the vertical position, in ems from the top of the line,
 *                     of each dot, reused cyclically if there are too few;
 *                     generated randomly if undefined or empty
 * @param dotMargin the minimum distance, in ems, between each randomly
 *                  generated position and both the top and the bottom
 *                  of the line
 * @returns the DotPoints for the specified display text
 */
export const useDotPoints = (
  containerRef: RefObject<HTMLElement | null>,
  text: string,
  dotPositions: number[] | undefined,
  dotMargin: number,
): DotPoints => {
  const letterRefs = useRef<(HTMLSpanElement | null)[]>([]);
  // Cached so that re-measuring the text doesn't reshuffle the dots
  const randomDotPositions = useRef<{ margin: number; positions: number[] }>({
    margin: 0,
    positions: [],
  });

  const [points, setPoints] = useState<Point[]>([]);
  const textDimensions = useTextDimensions(containerRef);

  // Every non-whitespace character gets a dot; whitespace characters don't
  const characters = useMemo(() => {
    let dotCount = 0;
    return [...text].map((char) => ({
      char,
      dotIndex: /\s/.test(char) ? null : dotCount++,
    }));
  }, [text]);
  const dotCount = characters.filter(
    ({ dotIndex }) => dotIndex !== null,
  ).length;

  useEffect(() => {
    if (!textDimensions) return;

    let positions = dotPositions;
    if (!positions?.length) {
      const cache = randomDotPositions.current;
      if (cache.positions.length !== dotCount || cache.margin !== dotMargin) {
        randomDotPositions.current = {
          margin: dotMargin,
          positions: generateDotPositions(dotCount, dotMargin),
        };
      }
      positions = randomDotPositions.current.positions;
    }

    setPoints(
      // Ignores refs left over from any longer text rendered previously
      letterRefs.current.slice(0, dotCount).map((el, i) => ({
        x: el ? Math.round(el.offsetLeft + el.offsetWidth / 2) : 0,
        y: positions[i % positions.length] * textDimensions.em,
      })),
    );
  }, [textDimensions, text, dotPositions, dotCount, dotMargin]);

  const setLetterRef = (dotIndex: number, element: HTMLSpanElement | null) => {
    letterRefs.current[dotIndex] = element;
  };

  return { characters, dotCount, points, setLetterRef, textDimensions };
};
