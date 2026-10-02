"use client";

import { useMemo, useRef, type PointerEvent } from "react";
import { twMerge } from "tailwind-merge";
import { useTextDimensions } from "@/utils/useTextDimensions";
import { arrowToPath, getArrowheadPath } from "./paths";
import { ARROWS, STROKE_WIDTH } from "./config";
import { useDiagramAnimationTimeline } from "./timeline";

type DiagramAnimationProps = {
  /**
   * The display text for this DiagramAnimation.
   * Subject to whitespace-nowrap.
   */
  text: string;

  /**
   * Classes for the container `<div>`.
   * Inherited by both the text and the arrows.
   */
  className?: string;
};

/**
 * Renders the specified display text and adds an animation which causes
 * that display text to become surrounded by diagram elements that "draw"
 * themselves into view. The animation triggers on hover for mouse users
 * and toggles on tap for touch screen users.
 */
const DiagramAnimation = ({ text, className }: DiagramAnimationProps) => {
  const textRef = useRef<HTMLHeadingElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const textDimensions = useTextDimensions(textRef);
  const paths = useMemo(
    () =>
      textDimensions
        ? ARROWS.map((arrow) => arrowToPath(arrow, textDimensions))
        : [],
    [textDimensions],
  );
  const animation = useDiagramAnimationTimeline(svgRef, textDimensions);

  const isTouchEvent = (e: PointerEvent) => e.pointerType === "touch";

  return (
    <div className={twMerge("relative", className)}>
      {/* Tight leading brings bounding box closer to the letters */}
      <h1
        ref={textRef}
        className="leading-tight whitespace-nowrap"
        onPointerEnter={(e) => {
          if (!isTouchEvent(e)) animation.setActive(true);
        }}
        onPointerLeave={(e) => {
          if (!isTouchEvent(e)) animation.setActive(false);
        }}
        onPointerUp={(e) => {
          if (isTouchEvent(e)) animation.toggleActive();
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
        strokeWidth={STROKE_WIDTH * (textDimensions?.em ?? 0)}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {paths.map((d, i) => (
          <g key={i} data-arrow opacity={0}>
            <path data-body d={d} />
            <g data-tip>
              <path
                data-head
                d={textDimensions ? getArrowheadPath(textDimensions) : ""}
              />
            </g>
          </g>
        ))}
      </svg>
    </div>
  );
};

export default DiagramAnimation;
