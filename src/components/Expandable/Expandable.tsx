"use client";

import { ChevronDown } from "lucide-react";
import { type ReactNode, useId, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { twMerge } from "tailwind-merge";
import styles from "./Expandable.module.css";

export type ExpandableProps = {
  /**
   * The labels for the toggle button in this {@link Expandable}; omit
   * if the toggle button should be omitted (e.g., because there is no
   * extra content to show).
   */
  labels?: {
    /**
     * The label for the toggle button in this {@link Expandable} when its
     * `data-extra` descendants are hidden (meaning that clicking
     * on the button would expand this {@link Expandable}).
     */
    expand: string;
    /**
     * The label for the toggle button in this {@link Expandable} when its
     * `data-extra` descendants are visible (meaning that clicking
     * on the button would collapse this {@link Expandable}).
     */
    collapse: string;
  };

  /**
   * Classes for the container `<div>` of this {@link Expandable}.
   */
  className?: string;

  /**
   * The content of this {@link Expandable}. Any descendant bearing the `data-extra`
   * attribute stays hidden until this {@link Expandable} is expanded, so `data-extra`
   * and always-visible content can be interwoven (e.g., to keep a list in
   * chronological order).
   *
   * Note: `data-extra` elements use their `transition` property to fade into
   * view, so avoid overriding that property by wrapping them if necessary.
   */
  children: ReactNode;
};

/**
 * Renders its children above a button that toggles whether descendants
 * bearing a `data-extra` attribute (which are hidden by default) are visible.
 *
 * Because `data-extra` elements are hidden through CSS,
 * their content can be rendered by server components.
 */
const Expandable = ({ labels, className, children }: ExpandableProps) => {
  const [expanded, setExpanded] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const contentID = useId();

  const toggle = () => {
    const button = buttonRef.current;
    const topBefore = button?.getBoundingClientRect().top;
    flushSync(() => setExpanded(!expanded));

    // Scroll the page on collapse to compensate for the content that was
    // removed so the user is not suddenly shunted further down than they were
    if (expanded && button && topBefore !== undefined) {
      const topAfter = button.getBoundingClientRect().top;
      window.scrollBy({ top: topAfter - topBefore, behavior: "instant" });
    }
  };

  return (
    <div
      data-expanded={expanded || undefined}
      className={twMerge(styles.root, "flex flex-col items-start", className)}
    >
      <div id={contentID} className="w-full">
        {children}
      </div>
      {labels && (
        <button
          ref={buttonRef}
          type="button"
          aria-expanded={expanded}
          aria-controls={contentID}
          onClick={toggle}
          className="btn gap-1.5 btn-soft btn-sm"
        >
          <ChevronDown
            aria-hidden
            className={twMerge(
              "size-4 transition-transform duration-200 motion-reduce:transition-none",
              expanded && "rotate-180",
            )}
          />
          {expanded ? labels.collapse : labels.expand}
        </button>
      )}
    </div>
  );
};

export default Expandable;
