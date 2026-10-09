"use client";

import {
  type CSSProperties,
  type PointerEvent,
  type ReactNode,
  useState,
} from "react";
import { twMerge } from "tailwind-merge";

export type AvatarTipsProps = {
  /**
   * The avatar from which the speech bubble originates.
   * Assumed to be circular and to fill the root element of this AvatarTips.
   */
  children: ReactNode;

  /**
   * The messages from which the speech bubble's
   * contents are chosen at random each time it appears.
   */
  tips: readonly string[];

  /**
   * Classes for the root element of this AvatarTips.
   */
  className?: string;
};

/**
 * The outline of a vertically symmetrical replacement for the tail of
 * daisyUI's chat bubble, whose flat bottom is instead designed to line up with
 * the bottom of an avatar. Drawn in a 13×12 box: two straight sides run from
 * the corners of its right edge to an arc (centered at (2, 6) with a radius of
 * 2) that rounds off its tip at the middle of its left edge, with each side
 * meeting the arc at a tangent so that the tip stays blunt rather than spiky.
 * Its rightmost column is solid so that it can overlap the bubble's body by
 * 1px without leaving a seam.
 */
const TAIL_PATH = "M13 0V12H12L1.28 7.87A2 2 0 0 1 1.28 4.13L12 0Z";

/**
 * Replaces daisyUI's tail by overriding the mask that it reads.
 */
const tailMask = {
  "--mask-chat": `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="12"><path d="${TAIL_PATH}"/></svg>`,
  )}")`,
} as CSSProperties;

/**
 * Picks a random index into a list of the specified length, skipping over
 * the previously picked index (if any) so that no tip appears twice in a row.
 * @param length the length of the list
 * @param previous the previously picked index, if any
 * @returns the picked index
 */
const pickIndex = (length: number, previous: number | null) => {
  if (previous === null || length < 2) {
    return Math.floor(Math.random() * length);
  }
  const index = Math.floor(Math.random() * (length - 1));
  return index >= previous ? index + 1 : index;
};

/**
 * Renders the specified avatar such that, while it is hovered, it swells
 * slightly and a speech bubble containing a randomly chosen tip pops into
 * view beside it (centered on it), with the bubble's tail touching its edge.
 * The interaction triggers on hover for mouse users and toggles on tap for
 * touch screen users. While active, the root element carries a
 * `data-speaking` attribute so that surrounding content can react.
 */
const AvatarTips = ({ children, tips, className }: AvatarTipsProps) => {
  const [speaking, setSpeaking] = useState(false);

  // Picked when the bubble appears rather than during
  // rendering so that the server and client always agree
  const [tipIndex, setTipIndex] = useState<number | null>(null);

  const speak = (value: boolean) => {
    if (value && !speaking) {
      setTipIndex((previous) => pickIndex(tips.length, previous));
    }
    setSpeaking(value);
  };

  const isTouchEvent = (e: PointerEvent) => e.pointerType === "touch";

  return (
    <div
      data-speaking={speaking || undefined}
      className={twMerge("group/avatar relative", className)}
      onPointerEnter={(e) => {
        if (!isTouchEvent(e)) speak(true);
      }}
      onPointerLeave={(e) => {
        if (!isTouchEvent(e)) speak(false);
      }}
      onPointerUp={(e) => {
        if (isTouchEvent(e)) speak(!speaking);
      }}
    >
      {/* Scaled rather than resized so that the surrounding layout stays put;
          the easing curve overshoots slightly to give the swell some bounce */}
      <div className="transition-[scale] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-data-speaking/avatar:scale-105 motion-reduce:transition-none">
        {children}
      </div>

      {/* Centered on the avatar and anchored so that the tip of the bubble's
          tail (at the left edge of the chat) points at the avatar's rightmost
          point from 1rem away, leaving a small gap that narrows (but doesn't
          close) as the avatar swells. Sized to fit between the avatar and the
          page's gutter at the narrowest viewport of each breakpoint. Grows out
          of the tail, but only fades if motion is reduced */}
      <div
        aria-hidden={!speaking}
        className="pointer-events-none absolute chat-start top-1/2 left-full z-30 ml-4 chat w-50 origin-left -translate-y-1/2 scale-50 opacity-0 drop-shadow-lg transition-[opacity,scale] duration-200 ease-out group-data-speaking/avatar:scale-100 group-data-speaking/avatar:opacity-100 motion-reduce:scale-100 xxs:w-60 xs:w-72 sm:w-80"
        style={tailMask}
      >
        {/* Matches the avatar's background and glow. The tail is centered
            vertically (rather than sitting at the bottom), so the corner that
            daisyUI squares off to meet it is rounded like the others */}
        <div className="chat-bubble max-w-full rounded-es-(--radius-field) chat-bubble-secondary px-5 py-4 text-sm leading-snug before:top-1/2 before:bottom-auto before:h-3 before:w-3.25 before:-translate-y-1/2 before:mask-size-[100%_100%] before:mask-position-[0_0] xs:text-base">
          <span className="mb-0.5 block text-xs font-bold tracking-widest text-primary uppercase xs:mb-1 xs:text-sm">
            Tip
          </span>
          {tipIndex !== null && tips[tipIndex]}
        </div>
      </div>
    </div>
  );
};

export default AvatarTips;
