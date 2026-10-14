import {
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import {
  useTextDimensions,
  type TextDimensions,
} from "@/utils/useTextDimensions";

/**
 * The position, in pixels, of the center of a dot
 * relative to the upper-left corner of a ConnectingDotsText.
 * (This holds because the root element has `position: relative`.)
 */
export type Point = { x: number; y: number };

/**
 * A single code point from the text in a ConnectingDotsText.
 */
export type Character = {
  /**
   * The character itself.
   */
  char: string;

  /**
   * The index of the dot that appears over this Character,
   * or null if no dot appears over it (because it is whitespace).
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
   * The Points at which the dots should be centered, in order
   * from left to right. Empty until textDimensions is non-null.
   */
  points: Point[];

  /**
   * Registers the rendered HTMLSpanElement for the Character that corresponds
   * to the dot at the specified index so that its position can be measured.
   * Intended to be called from within a ref callback.
   */
  setLetterRef: (dotIndex: number, element: HTMLSpanElement | null) => void;

  /**
   * The TextDimensions of the text in the ConnectingDotsText,
   * or null if said text has not yet been measured.
   */
  textDimensions: TextDimensions | null;
};

/**
 * Generates random vertical positions for the specified number of dots.
 * @param count the number of positions to be generated
 * @param margin the minimum vertical distance, in ems, between each position
 *               and the edges of the bounding box of the ConnectingDotsText
 *               to which the dots will be assigned
 * @returns the generated positions, in ems from the top of the bounding box
 */
const generateDotPositions = (count: number, margin: number): number[] =>
  Array.from(
    { length: count },
    // The text is exactly 1 em tall due to leading-none,
    // so just subtract the total margin
    () => margin + Math.random() * (1 - 2 * margin),
  );

/**
 * Computes (and randomly generates, if necessary) the position of one dot
 * for every non-whitespace code point in the specified text.
 *
 * Horizontally, each dot is centered over its corresponding character.
 * Vertically, each dot is positioned according to the specified dotPositions,
 * or randomly if dotPositions is empty or unspecified.
 *
 * Updates whenever the specified text, the TextDimensions of the
 * specified containerRef, the specified dotPositions, or the specified
 * dotMargin changes, but preserves randomly generated dot positions unless
 * the total number of dots or the dotMargin changes.
 * @param text the text over which the dots should be placed
 * @param containerRef a RefObject for the HTMLElement
 *                     containing the specified text
 * @param dotPositions the vertical position, in ems from the top of the
 *                     HTMLElement in the specified containerRef, of each dot;
 *                     extra positions are ignored if there are too many,
 *                     positions are reused cyclically if there are too few,
 *                     and positions are generated randomly if there are none
 * @param dotMargin the minimum vertical distance, in ems, between each
 *                  randomly generated position and the edges of the bounding
 *                  box of the the bounding box of the ConnectingDotsText
 *                  to which the computed Dots will be assigned;
 *                  unused unless dotPositions is empty or unspecified
 * @returns the computed Dots
 */
export const useDots = (
  text: string,
  containerRef: RefObject<HTMLElement | null>,
  dotPositions: number[] | undefined,
  dotMargin: number,
): Dots => {
  const letterRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const randomDotPositions = useRef<{ margin: number; positions: number[] }>({
    margin: 0,
    positions: [],
  }); // caching prevents regeneration on every resize

  const [points, setPoints] = useState<Point[]>([]);

  // Will be (at least) one frame (i.e., paint) out of
  // date if the size of the text's container changes
  // (because useTextDimensions updates asynchronously)
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

  // Serialized so the effect below evaluates this dependency by value;
  // prevents an identical copy of dotPositions from re-triggering the effect
  const serializedDotPositions = JSON.stringify(dotPositions ?? []);

  // useLayoutEffect instead of useEffect to ensure that, when the specified
  // text, dotPositions, or dotMargin changes, the returned points can reflect
  // the new letter offsets in time for the next paint.
  useLayoutEffect(() => {
    // Wait until the TextDimensions can be determined
    if (!textDimensions) return;

    // Randomly generate the dotPositions if necessary
    let positions: number[] = JSON.parse(serializedDotPositions);
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
  }, [text, textDimensions, serializedDotPositions, dotCount, dotMargin]);

  const setLetterRef = (dotIndex: number, element: HTMLSpanElement | null) => {
    letterRefs.current[dotIndex] = element;
  };

  return { characters, points, setLetterRef, textDimensions };
};
