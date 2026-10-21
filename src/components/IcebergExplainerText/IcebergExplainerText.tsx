"use client";

import { useMemo, useRef, useState, type PointerEvent } from "react";
import { twMerge } from "tailwind-merge";
import { useTapOutside } from "@/utils/useTapOutside";
import LevelPanels from "./LevelPanels";
import { NUM_LEVELS, type Levels } from "./levels";

export type IcebergExplainerTextProps = {
  /**
   * The hoverable text in this IcebergExplainerText. Subject to leading-none.
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
     * Inherited by the text in every Level panel. Sets the card's width,
     * which defaults to `w-82.5` (330px).
     */
    card?: string;

    /**
     * Classes for the depth marker that slides along the depth
     * rail to indicate which Level is currently displayed.
     */
    marker?: string;

    /**
     * Classes for each of the Level panels.
     * Applied after the panel's background classes. The card is exactly as
     * tall as a single panel, so vertical padding here sets its height.
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
 * The values used for any settings that are omitted from the options prop.
 */
export const DEFAULT_OPTIONS: IcebergExplainerTextOptions = {
  appearance: {
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
 * backgrounds of all four Levels, which get progressively darker from top
 * to bottom. Motionless if the user `prefers-reduced-motion`.
 *
 * On touch screens, tapping a region of the text displays the corresponding
 * Level, dragging horizontally across the text scrubs through the Levels,
 * and tapping anywhere else dismisses the card.
 */
const IcebergExplainerText = ({
  text,
  levels,
  className,
  childClassNames,
  options,
}: IcebergExplainerTextProps) => {
  // Keyed by value so receiving an identical copy won't re-run the memo
  const serializedOptions = JSON.stringify(options ?? {});
  const { appearance, animation } = useMemo(() => {
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

  const rootRef = useRef<HTMLSpanElement>(null);
  const cardRef = useRef<HTMLSpanElement>(null);

  const [currentLevel, setCurrentLevel] = useState<number | null>(null);
  const [cardShift, setCardShift] = useState(0);

  useTapOutside(rootRef, currentLevel !== null, () => setCurrentLevel(null));

  const isTouchEvent = (e: PointerEvent) => e.pointerType === "touch";

  const scrubTo = (event: PointerEvent<HTMLSpanElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    // The width of the hoverable text is divided evenly among the Levels
    const xFraction = (event.clientX - rect.left) / rect.width;
    const targetLevel = Math.floor(
      // Clamp xFraction to [0, 1) so that right edge maps to 3 and not 4
      Math.min(0.999, Math.max(0, xFraction)) * NUM_LEVELS,
    );
    if (targetLevel === currentLevel) return;
    // Measured as the card appears to keep it from hanging off the viewport
    if (currentLevel === null) {
      setCardShift(getCardShift(rect, cardRef.current?.offsetWidth ?? 0));
    }
    setCurrentLevel(targetLevel);
  };

  const scrollTransition = `${animation.scrollDuration}s ${SCROLL_CURVE}`;

  // The top edge of depth marker belongs markerTopPercent of the way down
  // the depth rail, plus markerTopOffset, so we use CSS `calc()` later
  const markerProgress = (currentLevel ?? 0) / (NUM_LEVELS - 1);
  const markerTopPercent = markerProgress * 100;
  const markerTopOffset =
    DEPTH_RAIL_INSET -
    markerProgress * (2 * DEPTH_RAIL_INSET + DEPTH_MARKER_SIZE);

  // Using spans allows this component to exist inside of an h1, p, a, etc.
  // touch-pan-y lets horizontal drags scrub (rather than pan) on touch
  // screens. Touch pointers are captured by the text, so drags that stray
  // off of it keep scrubbing (clamped) and don't count as taps outside of it
  return (
    <span
      ref={rootRef}
      onPointerMove={scrubTo}
      onPointerUp={(e) => {
        if (isTouchEvent(e)) scrubTo(e);
      }}
      // Touch pointers leave once lifted, which shouldn't dismiss the card
      onPointerLeave={(e) => {
        if (!isTouchEvent(e)) setCurrentLevel(null);
      }}
      className={twMerge(
        "relative z-20 inline-block cursor-default touch-pan-y",
        className,
      )}
    >
      <span className="block leading-none">{text}</span>

      {/* Scrub indicator */}
      <span
        aria-hidden
        className={twMerge(
          "absolute -bottom-0.5 rounded-full bg-primary motion-reduce:transition-none!",
          childClassNames?.scrub,
        )}
        style={{
          width: `${100 / NUM_LEVELS}%`,
          height: `${appearance.indicatorThickness}em`,
          left: `${((currentLevel ?? 0) * 100) / NUM_LEVELS}%`,
          opacity: currentLevel === null ? 0 : 1,
          // Fades in step with the card
          transition: [
            `left ${animation.indicatorSlideDuration}s ${SCRUB_CURVE}`,
            `opacity ${animation.cardFadeDuration}s ease`,
          ].join(", "),
        }}
      />

      {/* Explainer card */}
      <span
        ref={cardRef}
        aria-hidden
        className={twMerge(
          "pointer-events-none absolute left-1/2 flex w-82.5 overflow-hidden rounded-lg border border-base-300 bg-base-200 text-base font-normal shadow-lg motion-reduce:transition-none!",
          childClassNames?.card,
        )}
        style={{
          top: `calc(100% + ${appearance.cardGap}px)`,
          opacity: currentLevel === null ? 0 : 1,
          transform: `translate(calc(-50% + ${cardShift}px), ${currentLevel === null ? -CARD_RISE_DISTANCE : 0}px)`,
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
              "absolute left-1/2 -translate-x-1/2 rounded-full bg-primary motion-reduce:transition-none!",
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

        <LevelPanels
          levels={levels}
          currentLevel={currentLevel ?? 0}
          scrollTransition={scrollTransition}
          panelClassName={childClassNames?.panel}
          textClassNames={childClassNames?.text}
        />
      </span>
    </span>
  );
};

export default IcebergExplainerText;
