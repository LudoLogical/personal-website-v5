"use client";

import {
  type PointerEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { twMerge } from "tailwind-merge";

/**
 * The shapes that a HoverOrTapAffordance's dashed line can take.
 */
export type HoverOrTapAffordanceShape = "underline" | "circle";

export type HoverOrTapAffordanceProps = {
  /**
   * The content to be underlined or circled.
   */
  children: ReactNode;

  /**
   * Whether the dashed line should underline the content or circle it.
   * A circle assumes that the root element is square (e.g., because it is
   * filled by a circular avatar) and surrounds it with a small gap.
   * Defaults to `"underline"`.
   */
  shape?: HoverOrTapAffordanceShape;

  /**
   * Classes for the root element of this HoverOrTapAffordance.
   * The children are wrapped in a `z-10` stacking context, so if any of them
   * must overlap later siblings (e.g., a popover), set a z-index above `z-10`
   * here (e.g., `z-20`).
   */
  className?: string;

  /**
   * Classes for the dashed line. For an underline, the line is the top border
   * of a zero-height element, so set its thickness with top-only classes
   * (e.g., `border-t-3`) rather than ones that apply to every side
   * (e.g., `border-3`). Defaults to `border-t-2` (2px). For a circle, the
   * line is the border of a rounded element that extends past the root
   * element on every side, so set its thickness with classes that apply to
   * every side (e.g., `border-3`) and its gap with negative inset classes
   * (e.g., `-inset-2`). Defaults to `border-2` (2px) and `-inset-1` (4px).
   */
  lineClassName?: string;

  /**
   * The duration, in seconds, over which the line
   * should fade out when hovered or tapped (and back in).
   */
  fadeDuration?: number | undefined;

  /**
   * The delay, in seconds, after which the line should
   * start to fade back in once no longer hovered or tapped.
   */
  fadeInDelay?: number | undefined;

  /**
   * Whether the root element should be a span (so that this
   * HoverOrTapAffordance can exist inside of a p, h1, a, etc.)
   * rather than a div (so that it can contain block-level content).
   */
  inline?: boolean;
};

/**
 * The duration, in milliseconds, for which a mouse
 * user must hover before the affordance counts as visited.
 */
const VISIT_DWELL_TIME = 500;

/**
 * The default classes that position and size the line for each shape.
 */
const shapeClassNames: Record<HoverOrTapAffordanceShape, string> = {
  underline: "inset-x-0 top-full border-t-2",
  circle: "-inset-1 rounded-full border-2",
};

/**
 * Renders the specified content above a dashed underline (or within a dashed
 * circle) that fades out while the content is hovered and fades back in (after
 * a delay) once it isn't.
 * Once the content has been hovered for long enough, the line is dimmed
 * for the rest of the session (that is, until this component unmounts) to
 * indicate that it has been visited. The interaction triggers on hover for
 * mouse users and toggles on tap for touch screen users, for whom the first
 * tap counts as a visit.
 */
const HoverOrTapAffordance = ({
  children,
  shape = "underline",
  className,
  lineClassName,
  fadeDuration = 0.25,
  fadeInDelay = 0,
  inline = false,
}: HoverOrTapAffordanceProps) => {
  const [active, setActive] = useState(false);
  const [visited, setVisited] = useState(false);
  const dwellTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  const clearDwellTimeout = () => clearTimeout(dwellTimeout.current);

  // Don't let a pending timeout outlive the component
  useEffect(() => clearDwellTimeout, []);

  const isTouchEvent = (e: PointerEvent) => e.pointerType === "touch";

  const Root = inline ? "span" : "div";

  return (
    <Root
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
        setActive(!active);
        setVisited(true);
      }}
    >
      {/* Raised above the underline so that descenders cross over it.
          Traps the children's z-indices in its stacking context */}
      <Root className="relative z-10 block">{children}</Root>
      {/* A separate element (rather than a text decoration or border on the
          root) so that it can fade without affecting the children. Fades out
          right away, but only fades back in after the delay */}
      <span
        aria-hidden
        className={twMerge(
          "pointer-events-none absolute border-dashed border-secondary transition-opacity",
          shapeClassNames[shape],
          lineClassName,
          active ? "opacity-0" : visited ? "opacity-50" : "opacity-100",
        )}
        style={{
          transitionDuration: `${fadeDuration}s`,
          transitionDelay: active ? "0s" : `${fadeInDelay}s`,
        }}
      />
    </Root>
  );
};

export default HoverOrTapAffordance;
