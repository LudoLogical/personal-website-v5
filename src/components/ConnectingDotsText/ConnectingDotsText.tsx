"use client";

import { useMemo, useRef, useState, type PointerEvent } from "react";
import useTapOutside from "@/utils/useTapOutside";
import { useDots } from "./dots";
import { getTransitions } from "./timing";

export type ConnectingDotsTextProps = {
  /**
   * The text in this {@link ConnectingDotsText}.
   * Subject to `leading-none` and `whitespace-nowrap`.
   */
  text: string;

  /**
   * The vertical positions, in ems from the top of the bounding box of
   * this {@link ConnectingDotsText}, of the dots that will appear over
   * each non-whitespace character in the specified `text`, in order from
   * left to right.
   *
   * Because the text is subject to `leading-none`, it is exactly 1 em tall,
   * so all values should be between 0 (top) and 1 (bottom), though values
   * close to either extreme should account for the dotSize to prevent them
   * from sticking out of the bounding box of this {@link ConnectingDotsText}.
   *
   * If there are fewer position values than there are non-whitespace
   * characters in the specified `text`, then the supplied position
   * values are reused cyclically.
   *
   * If this prop is omitted or the array is empty,
   * then the position values are generated randomly.
   */
  dotPositions?: number[];

  /**
   * Optional settings for this {@link ConnectingDotsText}.
   * Unspecified values are set according to {@link DEFAULT_OPTIONS}.
   */
  options?: {
    /**
     * Optional settings that control how the contents
     * of this {@link ConnectingDotsText} are rendered.
     */
    appearance?: {
      /**
       * The color of both the dots and the line that connects them.
       * Can be any CSS color value.
       */
      accentColor?: string;

      /**
       * The diameter, in ems, of the dots.
       */
      dotSize?: number;

      /**
       * The width, in ems, of the line that connects the dots.
       */
      strokeWidth?: number;

      /**
       * The fraction of its full opacity to which the text should be reduced
       * to make way for the dots and line at the start of the animation.
       */
      fadedTextOpacity?: number;
    };

    /**
     * Optional settings that control how the contents
     * of this {@link ConnectingDotsText} are animated.
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
       * The delay between neighboring dot entrances is always the same.
       */
      dotEntranceSpread?: number;

      /**
       * The amount of time, in seconds, between the moments when the first
       * (rightmost) and the last (leftmost) dots begin to shrink out of view.
       * The delay between neighboring dot exits is always the same.
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
 * The `options` prop as a non-optional type in which all groups are required.
 * Exists as a helper type for the declaration that follows.
 */
type Groups = Required<NonNullable<ConnectingDotsTextProps["options"]>>;

/**
 * The `options` prop after all {@link DEFAULT_OPTIONS} have been applied.
 * Defined such that the prop itself, every group within it,
 * and every setting within every group are no longer optional.
 */
export type ConnectingDotsTextOptions = {
  [G in keyof Groups]: Required<Groups[G]>;
};

/**
 * The values used for any settings that are omitted from the `options` prop.
 */
export const DEFAULT_OPTIONS: ConnectingDotsTextOptions = {
  appearance: {
    accentColor: "var(--color-primary)",
    dotSize: 0.24,
    strokeWidth: 0.085, // matches `DiagramAnimation`
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
 * Renders the specified `text` and adds an animation which causes that text
 * to fade partially out of view, at which point a series of dots (one for
 * each non-whitespace character in the text) grow into view and become
 * connected by a line that draws itself into view shortly after.
 * Motionless if the user `prefers-reduced-motion`.
 *
 * The animation triggers on hover, except on touch screens, for which it
 * toggles on tap and can be dismissed by tapping anywhere.
 *
 * Once it is no longer triggered, all of the animation's effects are reversed
 * in order from last to first (i.e., first the line begins to retract, then
 * the dots start to vanish, and finally the text returns to the foreground).
 */
const ConnectingDotsText = ({
  text,
  dotPositions,
  options,
}: ConnectingDotsTextProps) => {
  const containerRef = useRef<HTMLSpanElement>(null);

  // Keyed by value so receiving an identical copy won't re-run the memo
  const serializedOptions = JSON.stringify(options ?? {});
  const resolvedOptions = useMemo(() => {
    const deserializedOptions = JSON.parse(serializedOptions);
    return {
      appearance: {
        ...DEFAULT_OPTIONS.appearance,
        ...deserializedOptions?.appearance,
      },
      animation: {
        ...DEFAULT_OPTIONS.animation,
        ...deserializedOptions?.animation,
      },
    };
  }, [serializedOptions]);

  const [active, setActive] = useState(false);

  useTapOutside(containerRef, active, () => setActive(false));

  const isTouchEvent = (e: PointerEvent) => e.pointerType === "touch";

  // Used to keep randomly generated dots (and the line that joins them,
  // if that line is thick enough) inside the text's bounding box
  const dotMargin =
    Math.max(
      resolvedOptions.appearance.dotSize,
      resolvedOptions.appearance.strokeWidth,
    ) / 2;

  const { characters, points, setLetterRef, textDimensions } = useDots(
    text,
    containerRef,
    dotPositions,
    dotMargin,
  );

  const transitions = getTransitions(
    active,
    points.length,
    resolvedOptions.animation,
  );

  return (
    <span
      ref={containerRef}
      onPointerEnter={(e) => {
        if (!isTouchEvent(e)) setActive(true);
      }}
      onPointerLeave={(e) => {
        if (!isTouchEvent(e)) setActive(false);
      }}
      onPointerUp={(e) => {
        if (isTouchEvent(e)) setActive(!active);
      }}
      className="relative inline-block cursor-default"
    >
      {/* Screen readers ignore `aria-label` on generic elements
          like spans, so the text is exposed this way instead */}
      <span className="sr-only">{text}</span>
      <span
        aria-hidden="true"
        className="block leading-none whitespace-nowrap motion-reduce:transition-none!"
        style={{
          color: "currentColor",
          opacity: active ? resolvedOptions.appearance.fadedTextOpacity : 1,
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
          stroke={resolvedOptions.appearance.accentColor}
          strokeWidth={
            resolvedOptions.appearance.strokeWidth * (textDimensions?.em ?? 0)
          }
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
            r={
              (resolvedOptions.appearance.dotSize / 2) *
              (textDimensions?.em ?? 0)
            }
            fill={resolvedOptions.appearance.accentColor}
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
