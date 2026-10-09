"use client";

import { useMemo, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import { useDots } from "./dots";
import { getTransitions } from "./timing";

export type ConnectingDotsTextProps = {
  /**
   * The text in this ConnectingDotsText.
   * Subject to leading-none and whitespace-nowrap.
   */
  text: string;

  /**
   * The vertical positions, in ems from the top of the bounding box of this
   * ConnectingDotsText, of the dots that will appear over each non-whitespace
   * character in the specified text, in order from left to right.
   *
   * Because the text is subject to leading-none, it is exactly 1 em tall,
   * so all values should be between 0 (top) and 1 (bottom).
   *
   * If there are fewer position values than there are non-whitespace
   * characters in the specified text, then the supplied position values are
   * reused cyclically.
   *
   * If this prop is omitted or the array is empty,
   * then the position values are generated randomly.
   */
  dotPositions?: number[];

  /**
   * Classes for the container `<span>` of this ConnectingDotsText.
   * Inherited by both the text and the animation elements
   * (i.e., the dots and the line).
   */
  className?: string;

  /**
   * Optional settings for this ConnectingDotsText.
   * Unspecified values are set according to DEFAULT_OPTIONS.
   */
  options?: {
    /**
     * Optional settings that control how the dots and line are rendered.
     */
    appearance?: {
      /**
       * The width, in ems, of the line that connects the dots.
       */
      strokeWidth?: number;

      /**
       * The diameter, in ems, of the dots.
       */
      dotSize?: number;

      /**
       * The color of both the dots and the line that connects them.
       * Can be any CSS color value.
       */
      accentColor?: string;

      /**
       * The fraction of its full opacity to which the text should be reduced
       * to make way for the dots and line at the start of the animation.
       */
      fadedTextOpacity?: number;
    };

    /**
     * Optional settings that control how the dots and line are animated.
     */
    animation?: {
      /**
       * The duration, in seconds, over which the opacity of the text should
       * be reduced when the animation is triggered.
       */
      textFadeOutDuration?: number;

      /**
       * The duration, in seconds, over which the opacity of the text should
       * be restored after the dots and line have disappeared.
       */
      textFadeInDuration?: number;

      /**
       * The duration, in seconds, over which each
       * individual dot should grow into view.
       */
      dotEntranceDuration?: number;

      /**
       * The duration, in seconds, over which each
       * individual dot should shrink out of view.
       */
      dotExitDuration?: number;

      /**
       * The amount of time, in seconds, between the moments when the first
       * (leftmost) and the last (rightmost) dots begin to grow into view.
       * The duration between neighboring dot appearances is derived by
       * simply dividing this number by the total number of dots.
       */
      dotEntranceSpread?: number;

      /**
       * The amount of time, in seconds, between the moments when the first
       * (rightmost) and the last (leftmost) dots begin to shrink out of view.
       * The duration between neighboring dot disappearances is derived by
       * simply dividing this number by the total number of dots.
       */
      dotExitSpread?: number;

      /**
       * The duration, in seconds, over which
       * the line should draw itself into view.
       */
      lineDrawDuration?: number;

      /**
       * The duration, in seconds, over which the
       * line should retract itself out of view.
       */
      lineRetractDuration?: number;
    };
  };
};

/**
 * The options prop as a non-optional type in which all groups are required.
 * Exists as a helper type for the declaration that follows.
 */
type Groups = Required<NonNullable<ConnectingDotsTextProps["options"]>>;

/**
 * The options prop after all DEFAULT_OPTIONS have been applied.
 * Defined such that the prop itself, every group within it,
 * and every setting within every group are no longer optional.
 */
export type ConnectingDotsTextOptions = {
  [G in keyof Groups]: Required<Groups[G]>;
};

/**
 * The values used for any settings that are
 * omitted from the ConnectingDotsTextOptions prop.
 */
export const DEFAULT_OPTIONS: ConnectingDotsTextOptions = {
  appearance: {
    strokeWidth: 0.085, // matches DiagramAnimation
    dotSize: 0.24,
    accentColor: "var(--color-primary)",
    fadedTextOpacity: 0.15,
  },
  animation: {
    textFadeOutDuration: 0.15,
    textFadeInDuration: 0.4,
    dotEntranceDuration: 0.24,
    dotExitDuration: 0.18,
    dotEntranceSpread: 0.3,
    dotExitSpread: 0.25,
    lineDrawDuration: 0.9,
    lineRetractDuration: 0.45,
  },
};

/**
 * Populates all of the settings that were omitted from the specified options
 * prop with the corresponding DEFAULT_OPTIONS.
 * Assumes that missing settings were not simply set to `undefined`.
 * @param options the options to be resolved
 * @returns the resolved ConnectingDotsTextOptions
 */
const resolveOptions = (
  options: ConnectingDotsTextProps["options"],
): ConnectingDotsTextOptions => ({
  appearance: { ...DEFAULT_OPTIONS.appearance, ...options?.appearance },
  animation: { ...DEFAULT_OPTIONS.animation, ...options?.animation },
});

/**
 * Renders the specified text and adds an animation which causes that text
 * to fade partially out of view, at which point a series of dots (one for
 * each non-whitespace character in the text) grow into view and become
 * connected by a line that draws itself into view shortly after.
 *
 * The animation triggers on both hover and focus. Once it is no longer
 * triggered, all of its effects are reversed in order from last to first
 * (i.e., first the line begins to retract, then the dots start to vanish,
 * and finally the text returns to the foreground).
 */
const ConnectingDotsText = ({
  text,
  dotPositions,
  className,
  options,
}: ConnectingDotsTextProps) => {
  const containerRef = useRef<HTMLSpanElement>(null);

  // Keyed after serialization so that changes are only registered when the
  // actual values differ to guard against the caller simply passing a new but
  // identical object. Also drops any settings explicitly set to undefined.
  const serializedOptions = JSON.stringify(options ?? {});
  const { appearance, animation } = useMemo(
    () => resolveOptions(JSON.parse(serializedOptions)),
    [serializedOptions],
  );

  const [active, setActive] = useState(false);

  // Used to keep randomly generated dots inside of the text's bounding box
  const dotMargin = Math.max(appearance.dotSize, appearance.strokeWidth) / 2;

  const { characters, points, setLetterRef, textDimensions } = useDots(
    containerRef,
    text,
    dotPositions ?? [],
    dotMargin,
  );

  // Note: points.length may not update instantly when the text changes
  const transitions = getTransitions(active, points.length, animation);

  return (
    <span
      ref={containerRef}
      tabIndex={0}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      onFocus={() => setActive(true)}
      onBlur={() => setActive(false)}
      className={twMerge(
        "relative inline-block cursor-default outline-none",
        className,
      )}
    >
      {/* Screen readers ignore aria-label on generic elements like spans, so
          the full text is exposed this way instead of character by character */}
      <span className="sr-only">{text}</span>
      {/* Applying leading-none here prevents the
          class from being overridden via twMerge() */}
      <span
        aria-hidden="true"
        className="block leading-none whitespace-nowrap motion-reduce:transition-none!"
        style={{
          color: "currentColor",
          opacity: active ? appearance.fadedTextOpacity : 1,
          transition: transitions.text,
        }}
      >
        {characters.map(({ char, dotIndex }, i) => (
          <span
            key={i}
            ref={
              dotIndex === null
                ? undefined
                : (spanElement) => setLetterRef(dotIndex, spanElement)
            }
          >
            {char}
          </span>
        ))}
      </span>
      <svg
        aria-hidden="true"
        width={textDimensions?.width ?? 0}
        height={textDimensions?.em ?? 0}
        className="pointer-events-none absolute top-0 left-0 overflow-visible"
      >
        <polyline
          points={points.map(({ x, y }) => `${x},${y}`).join(" ")}
          pathLength={1}
          fill="none"
          stroke={appearance.accentColor}
          strokeWidth={appearance.strokeWidth * (textDimensions?.em ?? 0)}
          strokeLinejoin="round"
          strokeLinecap="round"
          strokeDasharray={1}
          strokeDashoffset={active ? 0 : 1}
          className="motion-reduce:transition-none!"
          style={{ transition: transitions.line }}
        />
        {points.map(({ x, y }, i) => (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={(appearance.dotSize / 2) * (textDimensions?.em ?? 0)}
            fill={appearance.accentColor}
            className="motion-reduce:transition-none!"
            style={{
              transformBox: "fill-box",
              transformOrigin: "center",
              transform: active ? "scale(1)" : "scale(0)",
              transition: transitions.dot(i),
            }}
          />
        ))}
      </svg>
    </span>
  );
};

export default ConnectingDotsText;
