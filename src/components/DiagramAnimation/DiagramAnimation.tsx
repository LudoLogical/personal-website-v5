"use client";

import { useMemo, useRef, useState, type PointerEvent } from "react";
import { twMerge } from "tailwind-merge";
import { useTextDimensions } from "@/utils/useTextDimensions";
import { getArrowheadPath, getMarkerPaths, rasterizeArrow } from "./paths";
import { useDiagramAnimationTimeline } from "./timeline";
import { MarkerShape, type Arrow } from "./types";

export type DiagramAnimationProps = {
  /**
   * The display text for this DiagramAnimation.
   * Subject to leading-none and whitespace-nowrap.
   */
  text: string;

  /**
   * The Arrows that comprise this DiagramAnimation.
   */
  arrows: Arrow[];

  /**
   * Classes for the container `<div>` of this DiagramAnimation.
   * Inherited by both the text and the diagram elements.
   */
  className?: string;

  /**
   * Optional settings for this DiagramAnimation.
   * Unspecified values are set according to DEFAULT_OPTIONS.
   */
  options?: {
    /**
     * Optional settings that control how the diagram elements are constructed.
     */
    construction?: {
      /**
       * The amount of space, in ems, between the text at the center
       * of this DiagramAnimation and the baseline positions for any
       * indirectly positioned diagram elements that surround it.
       */
      diagramPadding?: number;

      /**
       * The radius, in ems, of the corners
       * of the Arrows in this DiagramAnimation.
       */
      cornerRadius?: number;

      /**
       * The distance, in ems, between two like-dimension coordinates at or
       * below which those coordinates should be made to perfectly align with
       * each other.
       *
       * Exists to prevent rounding errors that would cause
       * orthogonal-path-finding to introduce tiny imperfections in the paths
       * that it creates.
       */
      snapDistance?: number;

      /**
       * The number of decimal places to which path values
       * should be approximated when applying rounded corners.
       */
      pathPrecision?: number;

      /**
       * The distance, in ems, between the edge of a marker at the end of an
       * Arrow in this DiagramAnimation and the end of the body of that Arrow.
       */
      markerGap?: number;
    };

    /**
     * Optional settings that control how the diagram elements are rasterized.
     */
    appearance?: {
      /**
       * The width, in ems, of the lines in this DiagramAnimation.
       */
      strokeWidth?: number;

      /**
       * The distance, in ems, between (a) the tips of the arms that form the heads
       * of the Arrows in this DiagramAnimation and (b) the bodies of those Arrows.
       */
      headLength?: number;

      /**
       * The distance away from the body of an Arrow to which the outer tips
       * of the arms that form the head of that Arrow should extend,
       * expressed as a fraction of the headLength.
       */
      headSpread?: number;

      /**
       * The diameter, in ems, of the markers in this DiagramAnimation.
       */
      markerSize?: number;
    };

    /**
     * Optional settings that control how the diagram elements are animated.
     */
    animation?: {
      /**
       * The duration, in seconds, over which the elements
       * in this DiagramAnimation should appear.
       */
      forwardDuration?: number;

      /**
       * The number of times faster at which the elements
       * of this DiagramAnimation should disappear.
       */
      backwardSpeedup?: number;

      /**
       * The duration, in seconds, over which the elements
       * of this DiagramAnimation should fade into view.
       */
      fadeInDuration?: number;

      /**
       * The fraction of the overall duration of this DiagramAnimation
       * over which its arrowheads should grow into view.
       */
      headGrow?: number;
    };
  };
};

/**
 * The options prop as a non-optional type in which all groups are required.
 * Exists as a helper type for the declaration that follows.
 */
type Groups = Required<NonNullable<DiagramAnimationProps["options"]>>;

/**
 * The options prop after all DEFAULT_OPTIONS have been applied.
 * Defined such that the prop itself, every group within it,
 * and every setting within every group are no longer optional.
 */
export type DiagramAnimationOptions = {
  [G in keyof Groups]: Required<Groups[G]>;
};

/**
 * The values used for any settings that are
 * omitted from the DiagramAnimationOptions prop.
 */
export const DEFAULT_OPTIONS: DiagramAnimationOptions = {
  construction: {
    diagramPadding: 0.18,
    cornerRadius: 0.3,
    snapDistance: 0.05,
    pathPrecision: 2,
    markerGap: 0.18,
  },
  appearance: {
    strokeWidth: 0.085,
    headLength: 0.22,
    headSpread: 0.7,
    markerSize: 0.4,
  },
  animation: {
    forwardDuration: 0.5,
    backwardSpeedup: 1.8,
    fadeInDuration: 0.05,
    headGrow: 0.5,
  },
};

/**
 * Populates all of the settings that were omitted from the specified options
 * prop with the corresponding DEFAULT_OPTIONS.
 * Assumes that missing settings were not simply set to `undefined`.
 * @param options the options to be resolved
 * @returns the resolved DiagramAnimationOptions
 */
const resolveOptions = (
  options: DiagramAnimationProps["options"],
): DiagramAnimationOptions => ({
  construction: { ...DEFAULT_OPTIONS.construction, ...options?.construction },
  appearance: { ...DEFAULT_OPTIONS.appearance, ...options?.appearance },
  animation: { ...DEFAULT_OPTIONS.animation, ...options?.animation },
});

/**
 * Renders the specified display text and adds an animation which causes
 * that display text to become surrounded by diagram elements that "draw"
 * themselves into view. The animation triggers on hover for mouse users
 * and toggles on tap for touch screen users. While active, the root element
 * carries a `data-active` attribute so that surrounding content can react.
 */
const DiagramAnimation = ({
  text,
  arrows,
  className,
  options,
}: DiagramAnimationProps) => {
  const textRef = useRef<HTMLHeadingElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Keyed after serialization so that changes are only registered when the
  // actual values differ to guard against the caller simply passing a new but
  // identical object. Also drops any settings explicitly set to undefined.
  const serializedOptions = JSON.stringify(options ?? {});
  const resolvedOptions = useMemo(
    () => resolveOptions(JSON.parse(serializedOptions)),
    [serializedOptions],
  );

  const textDimensions = useTextDimensions(textRef);

  const arrowhead = useMemo(
    () =>
      textDimensions &&
      getArrowheadPath(textDimensions.em, resolvedOptions.appearance),
    [textDimensions, resolvedOptions.appearance],
  );
  const markerPaths = useMemo(
    () =>
      textDimensions &&
      getMarkerPaths(textDimensions.em, resolvedOptions.appearance),
    [textDimensions, resolvedOptions.appearance],
  );
  const rasterizedArrows = useMemo(
    () =>
      textDimensions &&
      arrows.map((arrow) =>
        rasterizeArrow(
          arrow,
          textDimensions,
          resolvedOptions.construction,
          resolvedOptions.appearance,
        ),
      ),
    [
      arrows,
      textDimensions,
      resolvedOptions.construction,
      resolvedOptions.appearance,
    ],
  );

  const animation = useDiagramAnimationTimeline(
    svgRef,
    arrowhead,
    rasterizedArrows,
    markerPaths,
    resolvedOptions.animation,
  );

  // Mirrors the timeline's state so it can be exposed via data-active
  const [active, setActive] = useState(false);
  const activate = (value: boolean) => {
    setActive(value);
    animation.setActive(value);
  };

  const isTouchEvent = (e: PointerEvent) => e.pointerType === "touch";
  const strokeWidth =
    resolvedOptions.appearance.strokeWidth * (textDimensions?.em ?? 0);

  return (
    <div
      data-active={active || undefined}
      className={twMerge("relative", className)}
    >
      {/* Removing leading brings bounding box closer to the letters */}
      <h1
        ref={textRef}
        className="leading-none whitespace-nowrap"
        onPointerEnter={(e) => {
          if (!isTouchEvent(e)) activate(true);
        }}
        onPointerLeave={(e) => {
          if (!isTouchEvent(e)) activate(false);
        }}
        onPointerUp={(e) => {
          if (isTouchEvent(e)) activate(!active);
        }}
      >
        {text}
      </h1>
      <svg
        ref={svgRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {arrowhead &&
          markerPaths &&
          rasterizedArrows?.map(({ body, markers }, i) => (
            <g key={i} data-arrow opacity={0}>
              <path data-body d={body} />
              {markers.map(({ x, y, shape }, j) => (
                // Positioned here, scaled during path creation
                <g key={j} transform={`translate(${x} ${y})`}>
                  <path
                    data-marker
                    d={markerPaths[shape]}
                    {...(shape === MarkerShape.FilledCircle && {
                      fill: "currentColor",
                      stroke: "none",
                    })}
                  />
                </g>
              ))}
              <g data-tip>
                <path data-head d={arrowhead} />
              </g>
            </g>
          ))}
      </svg>
    </div>
  );
};

export default DiagramAnimation;
