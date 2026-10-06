"use client";

import { useMemo, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import { useDotPoints } from "./points";
import { getTransitions } from "./timing";

export type ConnectingDotsTextProps = {
  /**
   * The display text for this ConnectingDotsText.
   * Subject to leading-none and whitespace-nowrap.
   */
  text: string;

  /**
   * The vertical position, in ems from the top of the line, of the dot over
   * each non-whitespace character in the display text, from left to right.
   * Values should lie between 0 and 1. If fewer positions than dots are
   * specified, the positions are reused cyclically. If omitted (or empty),
   * the positions are generated randomly.
   */
  dotPositions?: number[];

  /**
   * Classes for the container `<span>` of this ConnectingDotsText.
   * Inherited by both the text and the dot-to-dot elements.
   */
  className?: string;

  /**
   * Optional settings for this ConnectingDotsText.
   * Unspecified values are set according to DEFAULT_OPTIONS.
   */
  options?: {
    /**
     * Optional settings that control how the dot-to-dot elements are rendered.
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
       * The opacity, from 0 to 1, of the display text while it is faded
       * into the background to make way for the dot-to-dot elements.
       */
      fadedTextOpacity?: number;
    };

    /**
     * Optional settings that control how the dot-to-dot elements are animated.
     */
    animation?: {
      /**
       * The duration, in seconds, over which the display text
       * should fade into the background upon activation.
       */
      textFadeOutDuration?: number;

      /**
       * The duration, in seconds, over which the display text should fade
       * back into the foreground once the dot-to-dot elements are gone.
       */
      textFadeInDuration?: number;

      /**
       * The duration, in seconds, over which the line
       * should draw itself through all of the dots.
       */
      lineDrawDuration?: number;

      /**
       * The duration, in seconds, over which the line
       * should retract back to its starting point.
       */
      lineRetractDuration?: number;

      /**
       * The duration, in seconds, over which each individual dot
       * should pop into view.
       */
      dotEntranceDuration?: number;

      /**
       * The duration, in seconds, over which each individual dot
       * should shrink out of view.
       */
      dotExitDuration?: number;

      /**
       * The time, in seconds, between the first (leftmost) and the last
       * (rightmost) dot beginning to pop into view. Divided evenly among the
       * dots so that the sweep takes the same amount of time (and stays in
       * step with the line) regardless of the length of the display text.
       */
      dotEntranceSpread?: number;

      /**
       * The time, in seconds, between the first (rightmost) and the last
       * (leftmost) dot beginning to shrink out of view. Divided evenly among
       * the dots so that the sweep takes the same amount of time regardless
       * of the length of the display text.
       */
      dotExitSpread?: number;
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
    fadedTextOpacity: 0.15,
  },
  animation: {
    textFadeOutDuration: 0.15,
    textFadeInDuration: 0.4,
    lineDrawDuration: 0.9,
    lineRetractDuration: 0.45,
    dotEntranceDuration: 0.24,
    dotExitDuration: 0.18,
    dotEntranceSpread: 0.3,
    dotExitSpread: 0.25,
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

/** The color of the display text while inactive. */
const INK = "var(--color-base-content)";

/** The color of the dot-to-dot elements. */
const ACCENT = "var(--color-primary)";

/**
 * Renders the specified display text and adds an animation which turns that
 * display text into a dot-to-dot puzzle that solves itself. The animation
 * triggers on hover and on focus. When activated, the display text fades
 * into the background, a dot pops up over each of its characters from left
 * to right, and a line draws itself through all of the dots. When
 * deactivated, the line retracts, the dots vanish from right to left,
 * and the display text fades back into the foreground.
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

  // Keeps the dots and the line from poking out of the top or bottom of the line
  const dotMargin = Math.max(appearance.dotSize, appearance.strokeWidth) / 2;
  const { characters, dotCount, points, setLetterRef, textDimensions } =
    useDotPoints(containerRef, text, dotPositions, dotMargin);
  const em = textDimensions?.em ?? 0;

  const transitions = getTransitions(active, dotCount, animation);
  const fadedInk = `color-mix(in oklch, ${INK} ${appearance.fadedTextOpacity * 100}%, transparent)`;

  return (
    <span
      ref={containerRef}
      tabIndex={0}
      aria-label={text}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      onFocus={() => setActive(true)}
      onBlur={() => setActive(false)}
      className={twMerge(
        "relative inline-block cursor-default outline-none",
        className,
      )}
    >
      {/* Leading set here so a caller's text-* class can't override it via twMerge */}
      <span
        aria-hidden="true"
        className="block leading-none whitespace-nowrap motion-reduce:transition-none!"
        style={{
          color: active ? fadedInk : INK,
          transition: transitions.text,
        }}
      >
        {characters.map(({ char, dotIndex }, i) => (
          <span
            key={i}
            ref={
              dotIndex === null ? undefined : (el) => setLetterRef(dotIndex, el)
            }
          >
            {char}
          </span>
        ))}
      </span>

      <svg
        aria-hidden="true"
        width={textDimensions?.width ?? 0}
        height={em}
        className="pointer-events-none absolute top-0 left-0 overflow-visible"
      >
        <polyline
          points={points.map(({ x, y }) => `${x},${y}`).join(" ")}
          pathLength={1}
          fill="none"
          stroke={ACCENT}
          strokeWidth={appearance.strokeWidth * em}
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
            r={(appearance.dotSize / 2) * em}
            fill={ACCENT}
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
