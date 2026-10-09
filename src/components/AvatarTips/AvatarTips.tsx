"use client";

import { type PointerEvent, type ReactNode, useState } from "react";
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
 * view above and to the right of it, with the bubble's tail touching its
 * edge. The interaction triggers on hover for mouse users and toggles on tap
 * for touch screen users. While active, the root element carries a
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

      {/* Anchored so that the tip of the bubble's tail (at the bottom-left
          corner of the chat) lands on the avatar's edge 60° above its
          horizontal centerline, i.e., at (½ + ½cos 60°, ½ - ½sin 60°) ≈
          (75%, 7%), then nudged toward its center to overlap it slightly.
          Steep enough to keep the bubble clear of most of the adjacent text.
          Grows out of that tail, but only fades if motion is reduced */}
      <div
        aria-hidden={!speaking}
        className="pointer-events-none absolute chat-start bottom-[91%] left-[74%] z-30 chat w-60 origin-bottom-left scale-50 opacity-0 drop-shadow-lg transition-[opacity,scale] duration-200 ease-out group-data-speaking/avatar:scale-100 group-data-speaking/avatar:opacity-100 motion-reduce:scale-100 xs:w-72 md:w-80"
      >
        {/* Matches the avatar's background and glow */}
        <div className="chat-bubble max-w-full chat-bubble-secondary text-sm leading-snug">
          <span className="mb-0.5 block text-xs font-bold tracking-widest text-primary uppercase">
            Tip
          </span>
          {tipIndex !== null && tips[tipIndex]}
        </div>
      </div>
    </div>
  );
};

export default AvatarTips;
