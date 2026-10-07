import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import {
  useTextDimensions,
  type TextDimensions,
} from "@/utils/useTextDimensions";

/**
 * The position, in pixels, of the center of a dot
 * relative to the upper-left corner of a ConnectingDotsText.
 */
export type Point = { x: number; y: number };

/**
 * A single character of the text in a ConnectingDotsText.
 */
export type Character = {
  /**
   * The character itself.
   */
  char: string;

  /**
   * The index of the Dot that appears over this Character,
   * or null if no dot appears over it (i.e., because it is whitespace).
   */
  dotIndex: number | null;
};

/**
 * Everything necessary to render the dots in a ConnectingDotsText.
 */
export type Dots = {
  /**
   * The Characters that comprise the text in the ConnectingDotsText.
   */
  characters: Character[];

  /**
   * The Points at which the Dots should be centered, in order
   * from left to right. Empty until textDimensions is non-null.
   */
  points: Point[];

  /**
   * Registers the rendered HTMLSpanElement for the Character that corresponds
   * with the dot at the specified index so that its position  can be measured.
   * Intended to be called from within a ref callback.
   */
  setLetterRef: (dotIndex: number, element: HTMLSpanElement | null) => void;

  /**
   * The TextDimensions of the text in the ConnectingDotsText,
   * or null if said text has not yet measured.
   */
  textDimensions: TextDimensions | null;
};

/**
 * Generates random vertical positions for the specified number of Dots.
 * @param count the number of positions to be generated
 * @param margin the minimum distance, in ems, between each position and both
 *               horizontal edges of the bounding box of the ConnectingDotsText
 *               to which the Dots will be assigned.
 * @returns the generated positions, in ems from the top of the bounding box
 */
const generateDotPositions = (count: number, margin: number): number[] =>
  Array.from(
    { length: count },
    // The text is 1 em tall by definition, so just subtract the total margin
    () => margin + Math.random() * (1 - 2 * margin),
  );

/**
 * Rasterizes (and randomly generates, if necessary) the position of one dot
 * for every non-whitespace character of the specified text.
 *
 * Horizontally, each dot is centered over its corresponding character.
 * Vertically, each dot is positioned according to the specified dotPositions,
 * or randomly if dotPositions are not specified.
 *
 * Updates whenever the rendered text in the specified containerRef changes,
 * but preserves randomly-generated dot positions unless the total number
 * of dots or the specified dotMargin changes.
 * @param text the text over which the dots should be placed
 * @param containerRef a RefObject for the HTMLElement
 *                     containing the specified text
 * @param dotPositions the vertical position, in ems from the top of the
 *                     HTMLElement in the specified containerRef, of each dot;
 *                     positions are reused cyclically if there are too few,
 *                     and are generated randomly if there are none
 * @param dotMargin the minimum distance, in ems, between each randomly
 *                  generated position and both horizontal edges of the
 *                  bounding box of the HTMLElement in the specified
 *                  containerRef; unused unless dotPositions is empty
 * @returns the rasterized Dots
 */
export const useDots = (
  containerRef: RefObject<HTMLElement | null>,
  text: string,
  dotPositions: number[],
  dotMargin: number,
): Dots => {
  const letterRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const randomDotPositions = useRef<{ margin: number; positions: number[] }>({
    margin: 0,
    positions: [],
  }); // caching circumvents regeneration on every resize

  const [points, setPoints] = useState<Point[]>([]);
  const textDimensions = useTextDimensions(containerRef);

  // Construct and cache characters array
  const { characters, dotCount } = useMemo(() => {
    let dotCount = 0;
    const characters: Character[] = [...text].map((char) => ({
      char,
      dotIndex: /\s/.test(char) ? null : dotCount++,
    }));
    return { characters, dotCount };
  }, [text]);

  useEffect(() => {
    // Wait until the TextDimensions can be determined
    if (!textDimensions) return;

    // Randomly generate the dotPositions if necessary
    let positions = dotPositions;
    if (!positions?.length) {
      const cache = randomDotPositions.current;
      // Only regenerate on dotCount or dotMargin change
      if (cache.positions.length !== dotCount || cache.margin !== dotMargin) {
        randomDotPositions.current = {
          margin: dotMargin,
          positions: generateDotPositions(dotCount, dotMargin),
        };
      }
      positions = randomDotPositions.current.positions;
    }

    setPoints(
      // Ignore any refs left over from any longer text rendered previously
      letterRefs.current.slice(0, dotCount).map((el, i) => ({
        x: el ? Math.round(el.offsetLeft + el.offsetWidth / 2) : 0,
        y: positions[i % positions.length] * textDimensions.em,
      })),
    );
  }, [textDimensions, text, dotPositions, dotCount, dotMargin]);

  const setLetterRef = (dotIndex: number, element: HTMLSpanElement | null) => {
    letterRefs.current[dotIndex] = element;
  };

  return { characters, points, setLetterRef, textDimensions };
};
