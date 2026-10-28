"use client";

import { useMemo, useRef, useState, type PointerEvent } from "react";
import { twMerge } from "tailwind-merge";
import useTapOutside from "@/utils/useTapOutside";
import useTextDimensions from "@/utils/useTextDimensions";
import { getArrowheadPath, getMarkerPaths, rasterizeArrow } from "./paths";
import { useDiagramAnimationTimeline } from "./timeline";
import {
  MarkerShape,
  type Arrow,
  type ArrowAnchor,
  type ArrowEnd,
} from "./types";

export type DiagramAnimationProps = {
  /**
   * The display text for this {@link DiagramAnimation}.
   * Subject to `leading-none` and `whitespace-nowrap`.
   */
  text: string;

  /**
   * The {@link Arrow}s that comprise this {@link DiagramAnimation}.
   */
  arrows: Arrow[];

  /**
   * Optional settings for this {@link DiagramAnimation}.
   * Unspecified values are set according to {@link DEFAULT_OPTIONS}.
   */
  options?: {
    /**
     * Optional settings that control the
     * size and shape of the diagram elements.
     */
    appearance?: {
      /**
       * The radius, in ems, of the corners
       * of the {@link Arrow}s in this {@link DiagramAnimation}.
       */
      cornerRadius?: number;

      /**
       * The amount of space, in ems, between the bounding box of
       * the text at the center of this {@link DiagramAnimation} and
       * the locations of any {@link ArrowAnchor}s that surround it.
       */
      diagramPadding?: number;

      /**
       * The distance, in ems, between the tips of the arrowheads in this
       * {@link DiagramAnimation} and the tips of the arms of those arrowheads,
       * measured parallel to the ends of the bodies of the {@link Arrow}s to
       * which they correspond.
       */
      headLength?: number;

      /**
       * The distance away from the body of an {@link Arrow} to which the
       * outer tips of the arms that form the head of that {@link Arrow}
       * should extend, expressed as a fraction of the `headLength`.
       */
      headSpread?: number;

      /**
       * The visible distance, in ems, between an end of the body of an
       * {@link Arrow} in this {@link DiagramAnimation} and the nearest
       * part of a marker located at that end.
       * Identical for every {@link MarkerShape}.
       *
       * @remarks
       *
       * "Visible distance" means that things like stroke
       * width and rounded line caps are accounted for.
       */
      markerGap?: number;

      /**
       * The side length, in ems, of the bounding box according to which
       * the markers in this {@link DiagramAnimation} should be sized.
       */
      markerSize?: number;

      /**
       * The width, in ems, of the lines in this {@link DiagramAnimation}.
       */
      strokeWidth?: number;
    };

    /**
     * Optional settings that control the numerical tolerances
     * used when constructing SVG paths for the diagram elements.
     */
    precision?: {
      /**
       * The number of decimal places to which path values
       * should be approximated when applying rounded corners.
       */
      pathPrecision?: number;

      /**
       * The distance, in ems, between two like-dimension coordinates of
       * the connection points of the `from` and `to` {@link ArrowEnd}s of
       * an {@link Arrow} below which those coordinates should be made to
       * perfectly align with each other. If snapping occurs, only the `to`
       * {@link ArrowEnd} is actually moved.
       *
       * @remarks
       *
       * Exists to circumvent rounding errors that would otherwise cause
       * `orthogonal-path-finding` to introduce tiny imperfections in the
       * paths that it creates.
       */
      snapDistance?: number;
    };

    /**
     * Optional settings that control how the diagram elements are animated.
     */
    animation?: {
      /**
       * The duration, in seconds, over which the elements
       * in this {@link DiagramAnimation} should appear.
       */
      forwardDuration?: number;

      /**
       * The number of times faster than the `forwardDuration` at which
       * the elements in this {@link DiagramAnimation} should disappear.
       */
      backwardSpeedup?: number;

      /**
       * The duration, in seconds, over which the elements
       * in this {@link DiagramAnimation} should fade into view.
       */
      fadeInDuration?: number;

      /**
       * The fraction of the `forwardDuration` over which the arrowheads
       * in this {@link DiagramAnimation} should grow into view.
       */
      headGrowthDuration?: number;
    };
  };

  /**
   * Classes for the container `<div>` of this {@link DiagramAnimation}.
   * Color is inherited by both the text (which also inherits font) and
   * the diagram elements.
   */
  className?: string;
};

/**
 * The `options` prop as a non-optional type in which all groups are required.
 * Exists as a helper type for the declaration that follows.
 */
type Groups = Required<NonNullable<DiagramAnimationProps["options"]>>;

/**
 * The `options` prop after all {@link DEFAULT_OPTIONS} have been applied.
 * Defined such that the prop itself, every group within it,
 * and every setting within every group are no longer optional.
 */
export type DiagramAnimationOptions = {
  [G in keyof Groups]: Required<Groups[G]>;
};

/**
 * The values used for any settings that are omitted from the `options` prop.
 */
export const DEFAULT_OPTIONS: DiagramAnimationOptions = {
  appearance: {
    cornerRadius: 0.3,
    diagramPadding: 0.18,
    headLength: 0.22,
    headSpread: 0.7,
    markerGap: 0.18,
    markerSize: 0.4,
    strokeWidth: 0.085, // matches `ConnectingDotsText`
  },
  precision: {
    pathPrecision: 2,
    snapDistance: 0.05,
  },
  animation: {
    forwardDuration: 0.5,
    backwardSpeedup: 1.8,
    fadeInDuration: 0.05,
    headGrowthDuration: 0.5,
  },
};

/**
 * Renders the specified display text and adds an animation which causes
 * that display text to become surrounded by diagram elements that "draw"
 * themselves into view. Motionless if the user `prefers-reduced-motion`.
 *
 * The animation triggers on hover, except on touch screens, for which it
 * toggles on tap and can be dismissed by tapping anywhere.
 *
 * While active, the root element carries a `data-active`
 * attribute so that surrounding content can react.
 */
const DiagramAnimation = ({
  text,
  arrows,
  options,
  className,
}: DiagramAnimationProps) => {
  const textRef = useRef<HTMLHeadingElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Keyed by value so receiving an identical copy won't re-run the memo
  const serializedOptions = JSON.stringify(options ?? {});
  const resolvedOptions = useMemo(() => {
    const deserializedOptions = JSON.parse(serializedOptions);
    return {
      appearance: {
        ...DEFAULT_OPTIONS.appearance,
        ...deserializedOptions?.appearance,
      },
      precision: {
        ...DEFAULT_OPTIONS.precision,
        ...deserializedOptions?.precision,
      },
      animation: {
        ...DEFAULT_OPTIONS.animation,
        ...deserializedOptions?.animation,
      },
    };
  }, [serializedOptions]);

  const textDimensions = useTextDimensions(textRef);

  const arrowheadPath = useMemo(
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
          resolvedOptions.appearance,
          resolvedOptions.precision,
        ),
      ),
    [
      arrows,
      textDimensions,
      resolvedOptions.appearance,
      resolvedOptions.precision,
    ],
  );

  const animation = useDiagramAnimationTimeline(
    svgRef,
    arrowheadPath,
    rasterizedArrows,
    markerPaths,
    resolvedOptions.animation,
  );

  // Mirrors the state of the timeline; exposed through `data-active`
  const [active, setActive] = useState(false);
  const activate = (value: boolean) => {
    setActive(value);
    animation.setActive(value);
  };

  useTapOutside(textRef, active, () => activate(false));

  const isTouchEvent = (e: PointerEvent) => e.pointerType === "touch";
  const strokeWidth =
    resolvedOptions.appearance.strokeWidth * (textDimensions?.em ?? 0);

  return (
    <div
      data-active={active || undefined}
      className={twMerge("relative", className)}
    >
      {/* Applying `leading-none` brings the bounding box closer to
          the letters; doing so here prevents the class from being
          overridden via `twMerge()` */}
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
        {arrowheadPath &&
          markerPaths &&
          rasterizedArrows?.map(({ body, markers }, i) => (
            <g key={i} data-arrow opacity={0}>
              <path data-body d={body} />
              {markers.map(({ x, y, shape }, j) => (
                // Translated using a wrapper so that the GSAP scale
                // transform on the path below doesn't override it
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
              {/* Wrapper exists to keep the GSAP `motionPath`
                  transform separate from the arrowhead scaling */}
              <g data-carrier>
                <path data-arrowhead d={arrowheadPath} />
              </g>
            </g>
          ))}
      </svg>
    </div>
  );
};

export default DiagramAnimation;
