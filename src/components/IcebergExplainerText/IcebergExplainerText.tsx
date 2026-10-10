"use client";

import { useMemo, useRef, useState, type PointerEvent } from "react";
import { twMerge } from "tailwind-merge";
import { useGapMidpoint } from "@/utils/useGapMidpoint";
import Iceberg from "./Iceberg";
import { LEVEL_CLASS_NAMES, NUM_LEVELS, type Levels } from "./levels";

export type IcebergExplainerTextProps = {
  /**
   * The hoverable text in this IcebergExplainerText.
   * Subject to leading-none.
   */
  text: string;

  /**
   * The four Levels in this IcebergExplainerText,
   * in order from top (the surface) to bottom (the deepest level).
   */
  levels: Levels;

  /**
   * Classes for the container `<span>` of this IcebergExplainerText.
   * Inherited by the text and the scrub indicator.
   */
  className?: string;

  /**
   * Classes for the child elements of this IcebergExplainerText.
   * Each is applied after (and so takes precedence over) the element's own.
   */
  childClassNames?: {
    /**
     * Classes for the scrub indicator that appears beneath the hoverable text
     * and marks the bounds of the region that causes the active Level to be
     * displayed.
     */
    scrub?: string;

    /**
     * Classes for the explainer card in which the Levels are displayed.
     * Inherited by the text in every Level panel.
     */
    card?: string;

    /**
     * Classes for the depth marker that slides along the depth
     * rail to indicate which Level is currently displayed.
     */
    marker?: string;

    /**
     * Classes for each of the Level panels.
     * Applied after the panel's background classes.
     */
    panel?: string;

    /**
     * Classes for the text in each of the Level panels.
     */
    text?: {
      /**
       * Classes for the depth text in each of the Level panels.
       */
      depth?: string;

      /**
       * Classes for the name text in each of the Level panels.
       */
      name?: string;

      /**
       * Classes for the question text in each of the Level panels.
       */
      question?: string;

      /**
       * Classes for the concepts text in each of the Level panels.
       */
      concepts?: string;
    };
  };

  /**
   * Optional settings for this IcebergExplainerText.
   * Unspecified values are set according to DEFAULT_OPTIONS.
   */
  options?: {
    /**
     * Optional settings that control how the
     * explainer card and scrub indicator are sized.
     */
    appearance?: {
      /**
       * The width, in pixels, of the explainer
       * card in which the Levels are displayed.
       */
      cardWidth?: number;

      /**
       * The height, in pixels, of the explainer
       * card in which the Levels are displayed.
       * Equivalent to the height of each of the Level panels.
       */
      cardHeight?: number;

      /**
       * The distance, in pixels, between the bottom of the
       * hoverable text and the top of the explainer card.
       */
      cardGap?: number;

      /**
       * The thickness, in ems, of the indicator line that appears beneath
       * the hoverable text and marks the bounds of the region that causes
       * the active Level to be displayed.
       */
      indicatorThickness?: number;
    };

    /**
     * Optional settings that control how the
     * explainer card and scrub indicator are animated.
     */
    animation?: {
      /**
       * The duration, in seconds, over which the explainer card
       * and the scrub indicator should fade into and out of view.
       */
      cardFadeDuration?: number;

      /**
       * The duration, in seconds, over which the explainer card should
       * rise into place as it appears and fall away as it disappears.
       */
      cardRiseDuration?: number;

      /**
       * The duration, in seconds, over which the scrub indicator
       * should slide to the position of the active hoverable region.
       */
      indicatorSlideDuration?: number;

      /**
       * The duration, in seconds, over which the panels and the depth
       * marker should scroll to their respective positions corresponding
       * to the active Level.
       */
      scrollDuration?: number;
    };
  };
};

/**
 * The options prop as a non-optional type in which all groups are required.
 * Exists as a helper type for the declaration that follows.
 */
type Groups = Required<NonNullable<IcebergExplainerTextProps["options"]>>;

/**
 * The options prop after all DEFAULT_OPTIONS have been applied.
 * Defined such that the prop itself, every group within it,
 * and every setting within every group are no longer optional.
 */
export type IcebergExplainerTextOptions = {
  [G in keyof Groups]: Required<Groups[G]>;
};

/**
 * The values used for any settings that are
 * omitted from the IcebergExplainerTextOptions prop.
 */
export const DEFAULT_OPTIONS: IcebergExplainerTextOptions = {
  appearance: {
    cardWidth: 330,
    cardHeight: 120,
    cardGap: 12,
    indicatorThickness: 0.085, // same as other components' strokeWidths
  },
  animation: {
    cardFadeDuration: 0.2,
    cardRiseDuration: 0.25,
    indicatorSlideDuration: 0.22,
    scrollDuration: 0.45,
  },
};

/**
 * Populates all of the settings that were omitted from the specified options
 * prop with the corresponding DEFAULT_OPTIONS.
 * Assumes that missing settings were not simply set to `undefined`.
 * @param options the options to be resolved
 * @returns the resolved IcebergExplainerTextOptions
 */
const resolveOptions = (
  options: IcebergExplainerTextProps["options"],
): IcebergExplainerTextOptions => ({
  appearance: { ...DEFAULT_OPTIONS.appearance, ...options?.appearance },
  animation: { ...DEFAULT_OPTIONS.animation, ...options?.animation },
});

/**
 * The distance, in pixels, that the explainer
 * card traverses as it rises into place.
 */
const CARD_RISE_DISTANCE = 6;

/**
 * The minimum distance, in pixels, that the explainer card
 * keeps from either edge of the viewport whenever it fits.
 */
const CARD_VIEWPORT_MARGIN = 16;

/**
 * Determines how far the explainer card must be shifted horizontally from its
 * default position (centered beneath the hoverable text) so that it stays
 * CARD_VIEWPORT_MARGIN away from both edges of the viewport. If the viewport
 * is too narrow for that, the card is centered within the viewport instead.
 * @param textRect the bounding rectangle of the hoverable text
 * @param cardWidth the width, in pixels, of the explainer card
 * @returns the horizontal shift, in pixels
 */
const getCardShift = (textRect: DOMRect, cardWidth: number) => {
  const viewportWidth = document.documentElement.clientWidth;
  const centeredLeft = textRect.left + (textRect.width - cardWidth) / 2;
  const minLeft = CARD_VIEWPORT_MARGIN;
  const maxLeft = viewportWidth - CARD_VIEWPORT_MARGIN - cardWidth;
  const left =
    minLeft <= maxLeft
      ? Math.min(Math.max(centeredLeft, minLeft), maxLeft)
      : (viewportWidth - cardWidth) / 2;
  return left - centeredLeft;
};

/**
 * The distance, in pixels, between each end of the depth rail's
 * track and the corresponding edge of the explainer card.
 * Also used as the inset for the depth marker at both extrema.
 */
const DEPTH_RAIL_INSET = 10;

/**
 * The diameter, in pixels, of the depth marker.
 */
const DEPTH_MARKER_SIZE = 8;

/**
 * The easing curve according to which the panels and
 * the depth marker scroll to their target positions.
 */
const SCROLL_CURVE = "cubic-bezier(.4,0,.2,1)";

/** The easing curve according to which the
 * scrub indicator slides to its target position.
 */
const SCRUB_CURVE = "cubic-bezier(.2,.7,.2,1)";

/**
 * Renders the specified text and, while that text is hovered, adds a card
 * beneath it that explains a concept at four different levels of depth using
 * an "iceberg" model. Scrubbing horizontally across the display text causes
 * the card to "descend" through the specified Levels, each of which takes up
 * the full card when displayed. A single low-poly iceberg SVG spans the
 * backgrounds of all four Levels, the backgrounds of which get progressively
 * darker from top to bottom.
 */
const IcebergExplainerText = ({
  text,
  levels,
  className,
  childClassNames,
  options,
}: IcebergExplainerTextProps) => {
  // Keyed after serialization so that changes are only registered when the
  // actual values differ to guard against the caller simply passing a new but
  // identical object. Also drops any settings explicitly set to undefined.
  const serializedOptions = JSON.stringify(options ?? {});
  const { appearance, animation } = useMemo(
    () => resolveOptions(JSON.parse(serializedOptions)),
    [serializedOptions],
  );

  const [level, setLevel] = useState<number | null>(null);
  const [cardShift, setCardShift] = useState(0);

  // Position the waterline exactly halfway between the question and concepts
  const questionRef = useRef<HTMLSpanElement>(null);
  const conceptsRef = useRef<HTMLSpanElement>(null);
  const waterline = useGapMidpoint(questionRef, conceptsRef);

  const handlePointerMove = (event: PointerEvent<HTMLSpanElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    // The width of the hoverable text is divided evenly among the Levels
    const xFraction = (event.clientX - rect.left) / rect.width;
    const targetLevel = Math.floor(
      // Clamp xFraction within [0, 1) so that right edge maps to 3 and not 4
      Math.min(0.999, Math.max(0, xFraction)) * NUM_LEVELS,
    );
    if (targetLevel === level) return;
    // Measured as the card appears to keep it from hanging off the viewport
    if (level === null) setCardShift(getCardShift(rect, appearance.cardWidth));
    setLevel(targetLevel);
  };

  const scrollTransition = `${animation.scrollDuration}s ${SCROLL_CURVE}`;

  // The top edge of depth marker belongs markerTopPercent of the way down
  // the depth rail, plus markerTopOffset, so we use CSS `calc()` later
  const markerProgress = (level ?? 0) / (NUM_LEVELS - 1);
  const markerTopPercent = markerProgress * 100;
  const markerTopOffset =
    DEPTH_RAIL_INSET -
    markerProgress * (2 * DEPTH_RAIL_INSET + DEPTH_MARKER_SIZE);

  // Using spans allows this component to exist inside of an h1, p, a, etc.
  return (
    <span
      onPointerMove={handlePointerMove}
      onPointerLeave={() => setLevel(null)}
      className={twMerge(
        "relative z-20 inline-block cursor-default",
        className,
      )}
    >
      <span className="block leading-none">{text}</span>

      {/* Scrub indicator */}
      <span
        aria-hidden
        className={twMerge(
          "absolute -bottom-0.5 rounded-full bg-primary",
          childClassNames?.scrub,
        )}
        style={{
          width: `${100 / NUM_LEVELS}%`,
          height: `${appearance.indicatorThickness}em`,
          left: `${((level ?? 0) * 100) / NUM_LEVELS}%`,
          opacity: level === null ? 0 : 1,
          // Fades in step with the card
          transition: [
            `left ${animation.indicatorSlideDuration}s ${SCRUB_CURVE}`,
            `opacity ${animation.cardFadeDuration}s ease`,
          ].join(", "),
        }}
      />

      {/* Explainer card */}
      <span
        aria-hidden
        className={twMerge(
          "pointer-events-none absolute left-1/2 flex overflow-hidden rounded-lg border border-base-300 bg-base-200 text-base font-normal shadow-lg",
          childClassNames?.card,
        )}
        style={{
          top: `calc(100% + ${appearance.cardGap}px)`,
          width: appearance.cardWidth,
          height: appearance.cardHeight,
          opacity: level === null ? 0 : 1,
          transform: `translate(calc(-50% + ${cardShift}px), ${level === null ? -CARD_RISE_DISTANCE : 0}px)`,
          transition: [
            `opacity ${animation.cardFadeDuration}s ease`,
            `transform ${animation.cardRiseDuration}s ease`,
          ].join(", "),
        }}
      >
        {/* Depth rail */}
        <span className="relative box-content w-4 flex-none border-r border-base-300 bg-neutral">
          {/* Track */}
          <span
            className="absolute left-1/2 w-0.5 -translate-x-1/2 bg-base-content/20"
            style={{ top: DEPTH_RAIL_INSET, bottom: DEPTH_RAIL_INSET }}
          />
          {/* Marker */}
          <span
            className={twMerge(
              "absolute left-1/2 -translate-x-1/2 rounded-full bg-primary",
              childClassNames?.marker,
            )}
            style={{
              width: DEPTH_MARKER_SIZE,
              height: DEPTH_MARKER_SIZE,
              top: `calc(${markerTopPercent}% + ${markerTopOffset}px)`,
              transition: `top ${scrollTransition}`,
            }}
          />
        </span>

        {/* Sliding strip of Level panels */}
        <span className="flex-1 overflow-hidden">
          <span
            className="relative flex flex-col"
            style={{
              transform: `translateY(${-(level ?? 0) * appearance.cardHeight}px)`,
              transition: `transform ${scrollTransition}`,
            }}
          >
            <Iceberg
              height={NUM_LEVELS * appearance.cardHeight}
              waterline={waterline}
            />
            {levels.map(({ depth, name, question, concepts }, i) => (
              <span
                key={i}
                className={twMerge(
                  // *:relative lets children go above the iceberg
                  "flex flex-none flex-col gap-1 px-4 py-3 whitespace-nowrap *:relative",
                  LEVEL_CLASS_NAMES[i],
                  childClassNames?.panel,
                )}
                style={{ height: appearance.cardHeight }}
              >
                <span
                  className={twMerge(
                    "font-mono text-[10px]",
                    childClassNames?.text?.depth,
                  )}
                >
                  {depth}
                </span>
                <span
                  className={twMerge(
                    "text-lg font-bold",
                    childClassNames?.text?.name,
                  )}
                >
                  {name}
                </span>
                {/* Refs go on the first panel only */}
                <span
                  ref={i === 0 ? questionRef : undefined}
                  className={twMerge(
                    "text-xs italic",
                    childClassNames?.text?.question,
                  )}
                >
                  {question}
                </span>
                <span
                  ref={i === 0 ? conceptsRef : undefined}
                  className={twMerge(
                    "text-xs",
                    childClassNames?.text?.concepts,
                  )}
                >
                  {concepts.join(" · ")}
                </span>
              </span>
            ))}
          </span>
        </span>
      </span>
    </span>
  );
};

export default IcebergExplainerText;
