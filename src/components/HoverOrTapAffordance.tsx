"use client";

import {
  useEffect,
  useRef,
  useState,
  type PointerEvent,
  type ReactNode,
} from "react";
import { twMerge } from "tailwind-merge";
import useTapOutside from "@/utils/useTapOutside";

/**
 * The minimum duration, in milliseconds, for which a single hover
 * must last before a {@link HoverOrTapAffordance} is marked as visited.
 */
const VISIT_DWELL_TIME = 500;

/**
 * The duration, in seconds, over which the affordance in a
 * {@link HoverOrTapAffordance} fades out when hovered or tapped and
 * fades back in when no longer hovered or tapped again.
 */
const FADE_DURATION = 0.25;

export type HoverOrTapAffordanceProps = {
  /**
   * The shape of the affordance in this {@link HoverOrTapAffordance}.
   * Defaults to `"underline"`.
   */
  shape?: "underline" | "circle";

  /**
   * The delay, in seconds, after which the affordance in this
   * {@link HoverOrTapAffordance} should start to fade back in once it is no longer
   * hovered (or, on touch screens, when appropriate based on the values of
   * `fadeInOnTapOutside` and `fadeInOnTapInside`). Defaults to 0.
   */
  fadeInDelay?: number;

  /**
   * `true` if, while the affordance in this {@link HoverOrTapAffordance} is faded out,
   * tapping anywhere *inside* of the content to which it corresponds should
   * cause it to fade back in; `false` otherwise. Defaults to `true`.
   *
   * Note: this prop should always be set to `false` (and `fadeInOnTapOutside` set
   * to `true` instead) when the content follows `:hover` directly because touch
   * screens preserve an element's `:hover` state across repeated taps on it.
   */
  fadeInOnTapInside?: boolean;

  /**
   * `true` if, while the affordance in this {@link HoverOrTapAffordance} is faded out,
   * tapping anywhere *outside* of the content to which it corresponds should
   * cause it to fade back in; `false` otherwise (and by default).
   */
  fadeInOnTapOutside?: boolean;

  /**
   * `true` if the root element of this {@link HoverOrTapAffordance} should be a `<span>`
   * (so that it can exist inside of a `<p>`, `<h1>`, `<a>`, etc.), `false` if
   * it should be a `<div>` so that it can contain block-level content (and by default).
   */
  inline?: boolean;

  /**
   * Classes for the root element of this {@link HoverOrTapAffordance}.
   *
   * Note: the children (i.e., content) are wrapped in a `z-10` stacking
   * context, so if any of them must overlap subsequent siblings of this
   * {@link HoverOrTapAffordance}'s root element, a z-index above `z-10` must be
   * set here.
   */
  className?: string;

  /**
   * Classes for the affordance (i.e.,
   * dashed line) in this {@link HoverOrTapAffordance}.
   *
   * The underline variant is rendered as the top border of a zero-height
   * element, so its thickness should be set using top-only classes.
   *
   * The circle variant is rendered as the border of a `rounded-full`
   * element that extends past the root element on all sides, so its
   * thickness should be set using classes that apply to every side
   * and the gap between it and the content should be set with negative
   * inset classes.
   */
  affordanceClassName?: string;

  /**
   * The content for which this {@link HoverOrTapAffordance} should afford interaction.
   */
  children: ReactNode;
};

/**
 * Renders the specified content above a dashed underline (or within a
 * dashed circle) that fades out of view while the content is hovered and
 * fades back into view (after a delay) once the content is no longer hovered.
 *
 * If a single hover lasts for at least half a second, the line
 * (or circle) is dimmed until this component unmounts to indicate
 * that it has been visited.
 *
 * On touch screens, the visibility of the line (or circle)
 * toggles on tap and the first tap always counts as a visit.
 */
const HoverOrTapAffordance = ({
  shape = "underline",
  fadeInDelay = 0,
  fadeInOnTapInside = true,
  fadeInOnTapOutside = false,
  inline = false,
  className,
  affordanceClassName,
  children,
}: HoverOrTapAffordanceProps) => {
  const rootRef = useRef<HTMLDivElement & HTMLSpanElement>(null);
  const [active, setActive] = useState(false);
  const [visited, setVisited] = useState(false);

  const dwellTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);
  const clearDwellTimeout = () => clearTimeout(dwellTimeout.current);
  // Ensures that an active `dwellTimeout` does not
  // outlive the component instance that created it
  useEffect(() => clearDwellTimeout, []);

  useTapOutside(rootRef, fadeInOnTapOutside && active, () => setActive(false));

  const isTouchEvent = (e: PointerEvent) => e.pointerType === "touch";

  const Root = inline ? "span" : "div";

  return (
    <Root
      ref={rootRef}
      className={twMerge("relative inline-block", className)}
      onPointerEnter={(e) => {
        if (isTouchEvent(e)) return;
        setActive(true);
        if (!visited) {
          dwellTimeout.current = setTimeout(
            () => setVisited(true),
            VISIT_DWELL_TIME,
          );
        }
      }}
      onPointerLeave={(e) => {
        if (isTouchEvent(e)) return;
        setActive(false);
        clearDwellTimeout();
      }}
      onPointerUp={(e) => {
        if (!isTouchEvent(e)) return;
        setActive(fadeInOnTapInside ? !active : true);
        setVisited(true);
      }}
    >
      {/* Raised above the underline so that text descenders cross over it.
          This traps the children's z-indices in its stacking context(!) */}
      <Root className="relative z-10 block">{children}</Root>
      {/* Using a separate element for the affordance
          allows it to fade without affecting the children. */}
      <span
        aria-hidden
        className={twMerge(
          "pointer-events-none absolute border-dashed border-secondary transition-opacity",
          shape === "circle"
            ? "-inset-1 rounded-full border-2"
            : "inset-x-0 top-full border-t-2",
          affordanceClassName,
          active ? "opacity-0" : visited ? "opacity-50" : "opacity-100",
        )}
        style={{
          transitionDuration: `${FADE_DURATION}s`,
          transitionDelay: active ? "0s" : `${fadeInDelay}s`,
        }}
      />
    </Root>
  );
};

export default HoverOrTapAffordance;
