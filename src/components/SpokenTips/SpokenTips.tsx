"use client";

import {
  type CSSProperties,
  type PointerEvent,
  type ReactNode,
  useRef,
  useState,
} from "react";
import { useTapOutside } from "@/utils/useTapOutside";

export type SpokenTipsProps = {
  /**
   * The ReactNode(s) from which this SpokenTips originates.
   */
  children: ReactNode;

  // Assumed to be circular and to fill the root element of this SpokenTips.

  /**
   * The messages from which the contents of this
   * SpokenTips are chosen at random each time it appears.
   */
  tips: readonly string[];
};

/**
 * An SVG path used as a replacement for daisyUI's native `chat-bubble` tail.
 * Designed to align with the center of a `chat-bubble` instead of the bottom.
 */
const TAIL_PATH = "M13,0 V12 H12 L1.28,7.87 A2,2,0,0,1,1.28,4.13 L12,0 Z";

/**
 * Replaces daisyUI's native `chat-bubble`
 * tail by overriding the mask that it reads.
 */
const tailMask = {
  "--mask-chat": `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="12"><path d="${TAIL_PATH}"/></svg>`,
  )}")`,
} as CSSProperties;

/**
 * Generates a random integer in the range [0, max) that is
 * guaranteed to be distinct from the specified forbiddenValue.
 * @param max the maximum integer that may be generated
 * @param forbiddenValue the integer in [0, max) from which
 *                       the return value must be distinct
 * @returns the randomly generated integer
 */
const randomDistinctInteger = (max: number, forbiddenValue: number | null) => {
  // Base cases
  if (max < 2) return 0;
  if (forbiddenValue === null) return Math.floor(Math.random() * max);

  // Pick from [0, max - 2]
  const index = Math.floor(Math.random() * (max - 1));
  // Keep if in [0, forbiddenValue)
  // Otherwise, increment to produce (forbiddenValue, max - 1]
  return index >= forbiddenValue ? index + 1 : index;
};

/**
 * Renders the specified children and adds an animation which causes those
 * children to swell slightly and a vertically centered speech bubble
 * containing a randomly chosen tip to grow into view on its right side.
 *
 * The animation triggers on hover for mouse users. On mobile devices,
 * it toggles on tap and can be dismissed by tapping anywhere.
 *
 * While active, the root element carries a `data-speaking`
 * attribute so that surrounding content can react.
 */
const SpokenTips = ({ children, tips }: SpokenTipsProps) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  // Initialized on activation instead of during
  // rendering to prevent server-client disagreement
  const [tipIndex, setTipIndex] = useState<number | null>(null);

  const handleStateChange = (shouldBeActive: boolean) => {
    if (shouldBeActive && !active) {
      setTipIndex((previousTipIndex) =>
        randomDistinctInteger(tips.length, previousTipIndex),
      );
    }
    setActive(shouldBeActive);
  };

  useTapOutside(rootRef, active, () => handleStateChange(false));

  const isTouchEvent = (e: PointerEvent) => e.pointerType === "touch";

  return (
    <div
      ref={rootRef}
      data-speaking={active || undefined}
      className={"group/speaker relative"}
      onPointerEnter={(e) => {
        if (!isTouchEvent(e)) handleStateChange(true);
      }}
      onPointerLeave={(e) => {
        if (!isTouchEvent(e)) handleStateChange(false);
      }}
      onPointerUp={(e) => {
        if (isTouchEvent(e)) handleStateChange(!active);
      }}
    >
      {/* Unlike resizing, scaling allows the surrounding layout to stay put;
          the easing curve overshoots slightly to add a bit of bounce */}
      <div className="transition-[scale] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-data-speaking/speaker:scale-105 motion-reduce:transition-none">
        {children}
      </div>
      <div
        aria-hidden={!active}
        className="pointer-events-none absolute chat-start top-1/2 left-full z-30 ml-4 chat w-50 origin-left -translate-y-1/2 scale-50 opacity-0 drop-shadow-lg transition-[opacity,scale] duration-200 ease-out group-data-speaking/speaker:scale-100 group-data-speaking/speaker:opacity-100 motion-reduce:scale-100 xxs:w-60 xs:w-72 sm:w-80"
        style={tailMask}
      >
        {/* daisyUI shifts the mask for its own tail (which is 13px tall)
            up by 1px to fit it into a 12px box, but TAIL_PATH is already
            12px tall; before:mask-position-[0_0] resets daisyUI's shift */}
        <div className="chat-bubble max-w-full rounded-md chat-bubble-secondary px-5 py-4 leading-snug before:top-1/2 before:bottom-auto before:h-3 before:w-3.25 before:-translate-y-1/2 before:mask-position-[0_0]">
          <span className="mb-0.5 block text-xs font-bold tracking-widest text-primary uppercase xs:mb-1 xs:text-sm">
            Tip
          </span>
          <span className="text-sm xs:text-base">
            {tipIndex !== null && tips[tipIndex]}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SpokenTips;
