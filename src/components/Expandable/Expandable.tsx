"use client";

import { ChevronDown } from "lucide-react";
import { type ReactNode, useId, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { twMerge } from "tailwind-merge";
import styles from "./Expandable.module.css";

export type ExpandableProps = {
  /**
   * The content of this Expandable. Any descendant that carries a
   * `data-extra` attribute stays hidden until this Expandable is expanded,
   * so extra content can be interleaved with the content that's always
   * visible (e.g., to keep a list in chronological order). Since extra
   * elements fade in via their `transition` property, avoid setting one on
   * them directly (wrap them instead).
   */
  children: ReactNode;

  /**
   * The labels for the toggle button while collapsed (e.g., "Show 2 more")
   * and while expanded (e.g., "Show fewer"), or undefined to omit the toggle
   * button (e.g., because there's no extra content to show).
   */
  labels?: { expand: string; collapse: string };

  /**
   * Classes for the root element of this Expandable, which
   * contains the content followed by the toggle button.
   */
  className?: string;

  /**
   * Classes for the toggle button.
   */
  buttonClassName?: string;
};

/**
 * Renders the specified content, with all of its extra elements hidden,
 * above a button that toggles whether they are visible.
 *
 * Since the extra elements are hidden with CSS, their content can be rendered
 * by server components and passed in as children.
 */
const Expandable = ({
  children,
  labels,
  className,
  buttonClassName,
}: ExpandableProps) => {
  const [expanded, setExpanded] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const contentId = useId();

  const toggle = () => {
    const button = buttonRef.current;
    const topBefore = button?.getBoundingClientRect().top;
    flushSync(() => setExpanded(!expanded));
    // Collapsing removes content from above the button, which would otherwise
    // leave the user stranded further down the page, so the page is scrolled
    // to keep the button right where it was
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
      <div id={contentId} className="w-full">
        {children}
      </div>
      {labels && (
        <button
          ref={buttonRef}
          type="button"
          aria-expanded={expanded}
          aria-controls={contentId}
          onClick={toggle}
          className={twMerge("btn gap-1.5 btn-soft btn-sm", buttonClassName)}
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
