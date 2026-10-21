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
   * Classes for the child elements of this IcebergExplainerText.
   * Applied after (and thus take precedence over) internal defaults.
   */
  childClassNames?: {
    /**
     * Classes for the scrub indicator that appears beneath the hoverable text
     * and marks the bounds of the hovered region that causes the active Level
     * to be displayed.
     */
    scrub?: string;

    /**
     * Classes for the explainer card in which the Levels are displayed.
     * Inherited by the text in every Level panel. May be used to set the
     * width of the card (defaults to 330px).
     */
    card?: string;

    /**
     * Classes for the depth marker that slides along the rail
     * on the left side of the explainer card to indicate which
     * Level is currently being displayed.
     */
    marker?: string;

    /**
     * Classes for each of the Level panels.
     * Vertical padding here changes the height of the explainer card.
     */
    panel?: string;

    /**
     * Classes for the text in each of the Levels.
     */
    text?: {
      /**
       * Classes for the depth text in each of the Levels.
       */
      depth?: string;

      /**
       * Classes for the name text in each of the Levels.
       */
      name?: string;

      /**
       * Classes for the question text in each of the Levels.
       */
      question?: string;

      /**
       * Classes for the concepts text in each of the Levels.
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
       * The duration, in seconds, over which the Level panels and the depth
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
 * The minimum distance, in pixels, that should be maintained between
 * the explainer card and both edges of the viewport whenever possible.
 */
const CARD_VIEWPORT_MARGIN = 16;

/**
 * Calculates the distance by which the explainer card must be shifted
 * horizontally from its default position (centered beneath the hoverable text)
 * to ensure that it remains at least CARD_VIEWPORT_MARGIN pixels away from
 * both edges of the viewport. If the viewport is too narrow to support that
 * margin, the horizontal shift centers the card within the viewport instead.
 * @param textRect the bounding rectangle of the hoverable text
 * @param cardWidth the width, in pixels, of the explainer card
 * @returns the horizontal shift, in pixels
 */
const getCardShift = (textRect: DOMRect, cardWidth: number) => {
  const viewportWidth = document.documentElement.clientWidth;
  // The default position of the left edge of the explainer card
  const centeredLeft = textRect.left + (textRect.width - cardWidth) / 2;
  const minLeft = CARD_VIEWPORT_MARGIN;
  const maxLeft = viewportWidth - CARD_VIEWPORT_MARGIN - cardWidth;
  const clampedLeft =
    minLeft <= maxLeft
      ? Math.min(Math.max(centeredLeft, minLeft), maxLeft)
      : (viewportWidth - cardWidth) / 2;
  return clampedLeft - centeredLeft;
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
 * On touch screens, tapping a region of the text displays the card and the
 * corresponding Level, dragging horizontally across the text scrubs through
 * the Levels, and tapping anywhere else dismisses the card.
 */
const IcebergExplainerText = ({
  text,
  levels,
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
    if (currentLevel === null) {
      // It's okay to getCardShift only when the card appears because the
      // viewport almost certainly won't be resized while the card is visible
      setCardShift(getCardShift(rect, cardRef.current?.offsetWidth ?? 0));
    }
    setCurrentLevel(targetLevel);
  };

  const scrollTransition = `${animation.scrollDuration}s ${SCROLL_CURVE}`;

  // The top edge of depth marker belongs markerTopPercent of the way down
  // the depth rail *plus* markerTopOffset, so we use CSS `calc()` later
  const markerProgress = (currentLevel ?? 0) / (NUM_LEVELS - 1);
  const markerTopPercent = markerProgress * 100;
  const markerTopOffset =
    DEPTH_RAIL_INSET -
    markerProgress * (2 * DEPTH_RAIL_INSET + DEPTH_MARKER_SIZE);

  // Using spans allows this component to exist inside of an h1, p, a, etc.
  return (
    <span
      ref={rootRef}
      onPointerMove={scrubTo}
      onPointerUp={(e) => {
        if (isTouchEvent(e)) scrubTo(e);
      }}
      onPointerLeave={(e) => {
        // Merely finishing a tap shouldn't dismiss the card
        if (!isTouchEvent(e)) setCurrentLevel(null);
      }}
      // touch-pan-y so touch screen users can scrub by dragging horizontally
      className="relative z-20 inline-block cursor-default touch-pan-y"
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
          transition: [
            `left ${animation.indicatorSlideDuration}s ${SCRUB_CURVE}`,
            // Fades in step with the explainer card
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
