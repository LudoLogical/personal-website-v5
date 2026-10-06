"use client";

import { useMemo, useRef, useState, type PointerEvent } from "react";
import { twMerge } from "tailwind-merge";
import Iceberg from "./Iceberg";
import { TIER_COUNT, type Tiers } from "./types";
import { useWaterline } from "./useWaterline";

export type IcebergExplainerTextProps = {
  /**
   * The display text for this IcebergExplainerText.
   * Subject to leading-none.
   */
  text: string;

  /**
   * The Tiers explained by this IcebergExplainerText,
   * from the surface to the deepest level.
   */
  tiers: Tiers;

  /**
   * Classes for the container `<span>` of this IcebergExplainerText.
   * Inherited by the display text and the scrub indicator.
   */
  className?: string;

  /**
   * Optional settings for this IcebergExplainerText.
   * Unspecified values are set according to DEFAULT_OPTIONS.
   */
  options?: {
    /**
     * Optional settings that control how the explainer elements are sized.
     */
    appearance?: {
      /**
       * The width, in pixels, of the card in which the Tiers are displayed.
       */
      cardWidth?: number;

      /**
       * The height, in pixels, of the panel in which each Tier is displayed.
       * Also the height of the card, which shows one panel at a time.
       */
      panelHeight?: number;

      /**
       * The distance, in pixels, between the bottom
       * of the display text and the top of the card.
       */
      cardGap?: number;

      /**
       * The thickness, in ems, of the indicator beneath the display text
       * that marks which Tier is currently being displayed.
       */
      indicatorThickness?: number;
    };

    /**
     * Optional settings that control how the explainer elements are animated.
     */
    animation?: {
      /**
       * The duration, in seconds, over which the card and
       * the scrub indicator should fade into and out of view.
       */
      cardFadeDuration?: number;

      /**
       * The duration, in seconds, over which the card should
       * rise into place as it appears and fall away as it disappears.
       */
      cardRiseDuration?: number;

      /**
       * The duration, in seconds, over which the scrub
       * indicator should slide to the position of a new Tier.
       */
      indicatorSlideDuration?: number;

      /**
       * The duration, in seconds, over which the panels and the depth
       * marker should scroll to the position of a new Tier.
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
    panelHeight: 120,
    cardGap: 12,
    indicatorThickness: 0.085, // matches DiagramAnimation's strokeWidth
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
 * The background and text color classes for each panel,
 * from the surface to the deepest level.
 */
const TIER_CLASS_NAMES: [string, string, string, string] = [
  "bg-blue-200 text-blue-950",
  "bg-blue-400 text-blue-950",
  "bg-blue-700 text-blue-50",
  "bg-blue-950 text-blue-100",
];

/**
 * The distance, in pixels, from which the card rises into place.
 */
const CARD_RISE_DISTANCE = 6;

/**
 * The distance, in pixels, between each end of the depth rail's track
 * and the corresponding edge of the card.
 */
const DEPTH_RAIL_INSET = 10;

/**
 * The diameter, in pixels, of the depth marker. Keep in sync with its
 * size-1.75 class. Its top edge travels from DEPTH_RAIL_INSET at the first
 * Tier to DEPTH_RAIL_INSET + DEPTH_MARKER_SIZE from the bottom at the last.
 */
const DEPTH_MARKER_SIZE = 7;

/** The easing curve with which the panels and the depth marker scroll. */
const SCROLL_EASE = "cubic-bezier(.4,0,.2,1)";

/** The easing curve with which the scrub indicator slides. */
const INDICATOR_EASE = "cubic-bezier(.2,.7,.2,1)";

/**
 * Determines which Tier corresponds to the horizontal position of the
 * specified PointerEvent. The width of the element that the event was
 * attached to is divided evenly among the Tiers, from left to right.
 * @param event the PointerEvent to be located
 * @returns the index of the corresponding Tier
 */
const getLevelAtPointer = (event: PointerEvent<HTMLElement>): number => {
  const rect = event.currentTarget.getBoundingClientRect();
  const fraction = (event.clientX - rect.left) / rect.width;
  // Clamped below 1 so that the right edge maps to the last Tier
  return Math.floor(Math.min(0.999, Math.max(0, fraction)) * TIER_COUNT);
};

/**
 * Renders the specified display text and adds a card beneath it that
 * explains the iceberg model of systems thinking. Scrubbing the pointer
 * horizontally across the display text descends through the specified
 * Tiers, from the surface on the left to the deepest level on the right,
 * past an illustrated iceberg that spans all of them. The card appears
 * while the pointer is over the display text.
 */
const IcebergExplainerText = ({
  text,
  tiers,
  className,
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
  const active = level !== null;
  const displayedLevel = level ?? 0;

  // The waterline sits between the first Tier's question and items
  const questionRef = useRef<HTMLSpanElement>(null);
  const itemsRef = useRef<HTMLSpanElement>(null);
  const waterline = useWaterline(questionRef, itemsRef);

  const handlePointerMove = (event: PointerEvent<HTMLSpanElement>) => {
    const nextLevel = getLevelAtPointer(event);
    if (nextLevel !== level) setLevel(nextLevel);
  };

  const scrollTransition = `${animation.scrollDuration}s ${SCROLL_EASE}`;

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
        className="absolute bottom-px rounded-full bg-primary"
        style={{
          width: `${100 / TIER_COUNT}%`,
          height: `${appearance.indicatorThickness}em`,
          left: `${(displayedLevel * 100) / TIER_COUNT}%`,
          opacity: active ? 1 : 0,
          // Fades in step with the card
          transition: [
            `left ${animation.indicatorSlideDuration}s ${INDICATOR_EASE}`,
            `opacity ${animation.cardFadeDuration}s ease`,
          ].join(", "),
        }}
      />

      {/* Porthole card */}
      <span
        aria-hidden
        className="pointer-events-none absolute left-1/2 flex overflow-hidden rounded-box border border-base-300 bg-base-200 text-base font-normal shadow-lg"
        style={{
          top: `calc(100% + ${appearance.cardGap}px)`,
          width: appearance.cardWidth,
          height: appearance.panelHeight,
          opacity: active ? 1 : 0,
          transform: `translate(-50%, ${active ? 0 : -CARD_RISE_DISTANCE}px)`,
          transition: [
            `opacity ${animation.cardFadeDuration}s ease`,
            `transform ${animation.cardRiseDuration}s ease`,
          ].join(", "),
        }}
      >
        {/* Depth rail */}
        <span className="relative w-4 flex-none border-r border-base-300 bg-neutral">
          {/* Track, centered beneath the marker */}
          <span
            className="absolute left-1.75 w-px bg-base-content/20"
            style={{ top: DEPTH_RAIL_INSET, bottom: DEPTH_RAIL_INSET }}
          />
          {/* Marker */}
          <span
            className="absolute left-1 size-1.75 rounded-full bg-primary"
            style={{
              top: `calc(${DEPTH_RAIL_INSET}px + ${displayedLevel} * (100% - ${2 * DEPTH_RAIL_INSET + DEPTH_MARKER_SIZE}px) / ${TIER_COUNT - 1})`,
              transition: `top ${scrollTransition}`,
            }}
          />
        </span>

        {/* Sliding strip */}
        <span className="flex-1 overflow-hidden">
          <span
            className="relative flex flex-col"
            style={{
              transform: `translateY(${-displayedLevel * appearance.panelHeight}px)`,
              transition: `transform ${scrollTransition}`,
            }}
          >
            <Iceberg
              height={TIER_COUNT * appearance.panelHeight}
              waterline={waterline}
            />
            {tiers.map((tier, i) => (
              <span
                key={i}
                className={twMerge(
                  // Children positioned so they paint above the iceberg
                  "flex flex-none flex-col gap-1 px-4 py-3 *:relative",
                  TIER_CLASS_NAMES[i],
                )}
                style={{ height: appearance.panelHeight }}
              >
                <span className="font-mono text-[10px]">{tier.depth}</span>
                <span className="text-lg font-bold">{tier.name}</span>
                <span
                  ref={i === 0 ? questionRef : undefined}
                  className="text-xs italic"
                >
                  {tier.question}
                </span>
                <span ref={i === 0 ? itemsRef : undefined} className="text-xs">
                  {tier.items.join(" · ")}
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
