"use client";

import { useEffect, useState, type ReactNode } from "react";
import type { Heading, SectionHeading } from "./types";

/**
 * The distance, in pixels, between the top of the viewport and the line
 * that the top edge of a section must cross for a {@link TableOfContents}
 * to consider that section to be the one being read.
 *
 * Note: This must exceed the `scroll-margin-top` of every section so
 * that following a link to a section makes that section current.
 */
const READING_LINE_OFFSET = 160;

/**
 * Computes the `id`s of the specified {@link SectionHeading}s
 * and all of their `subheadings`, in document order.
 * @param headings the {@link SectionHeading}s whose `id`s are to be collected
 * @returns the collected `id`s
 */
const getIDs = (headings: SectionHeading[]): string[] =>
  headings.flatMap(({ id, subheadings = [] }) => [
    id,
    ...subheadings.map((subheading) => subheading.id),
  ]);

/**
 * Tracks which of the elements with the specified `id`s the user is
 * currently reading, i.e., the last one whose top edge has scrolled above
 * the line defined by {@link READING_LINE_OFFSET}. Updates whenever the
 * page scrolls or the viewport is resized.
 * @param ids the `id`s of the elements to be tracked, in document order
 * @returns the `id` of the element being read, or `null` if
 *          the top edge of none of them has reached the line
 */
const useCurrentSectionID = (ids: string[]): string | null => {
  const [currentSectionID, setCurrentSectionID] = useState<string | null>(null);

  // Keyed by value so receiving an identical copy won't re-run the effect
  const serializedIDs = JSON.stringify(ids);

  useEffect(() => {
    const sections = (JSON.parse(serializedIDs) as string[])
      .map((id) => document.getElementById(id))
      .filter((section) => section !== null);
    let pendingFrameRequestID = 0;

    const handleScroll = () => {
      pendingFrameRequestID = 0;
      const currentSection = sections.findLast(
        (section) => section.getBoundingClientRect().top <= READING_LINE_OFFSET,
      );
      setCurrentSectionID(currentSection?.id ?? null);
    };

    // Throttle to one `handleScroll()` invocation per frame
    const onScroll = () => {
      if (!pendingFrameRequestID) {
        pendingFrameRequestID = requestAnimationFrame(handleScroll);
      }
    };

    onScroll(); // the page may have loaded partway down (e.g., at a hash)
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(pendingFrameRequestID);
    };
  }, [serializedIDs]);

  return currentSectionID;
};

/**
 * Renders a link to the specified {@link Heading}
 * as an item in a daisyUI `menu`.
 * @param heading the {@link Heading} to be linked to
 * @param currentSectionID the `id` of the section that is currently being
 *                         read (which is marked as current), if any
 * @param children the list nested beneath the link, if any
 * @returns the rendered `<li>`
 */
const renderItem = (
  { id, title }: Heading,
  currentSectionID: string | null,
  children?: ReactNode,
) => (
  <li key={id}>
    {/* daisyUI highlights any menu item that carries `aria-current` */}
    <a
      href={`#${id}`}
      aria-current={id === currentSectionID ? "location" : undefined}
    >
      {title}
    </a>
    {children}
  </li>
);

export type TableOfContentsProps = {
  /**
   * The {@link SectionHeading}s to be listed in this
   * {@link TableOfContents}, in document order.
   */
  headings: SectionHeading[];

  /**
   * Classes for the container `<nav>` of this {@link TableOfContents}.
   */
  className?: string;
};

/**
 * Renders links to the specified `headings`, each followed by
 * an indented list of links to its `subheadings` (if any).
 *
 * The link to the section that the user is currently reading (i.e., the
 * last one whose top edge has scrolled near the top of the viewport)
 * is highlighted and marked as the `aria-current` location.
 */
export const TableOfContents = ({
  headings,
  className,
}: TableOfContentsProps) => {
  const currentSectionID = useCurrentSectionID(getIDs(headings));

  return (
    <nav aria-label="Table of contents" className={className}>
      {/* `whitespace-normal` b/c daisyUI keeps nested items from wrapping */}
      <ul className="menu w-full rounded-box border border-base-content/10 bg-base-200 p-2 text-base-content/70 [&_ul]:whitespace-normal">
        {headings.map(({ subheadings, ...heading }) =>
          renderItem(
            heading,
            currentSectionID,
            subheadings && (
              <ul>
                {subheadings.map((subheading) =>
                  renderItem(subheading, currentSectionID),
                )}
              </ul>
            ),
          ),
        )}
      </ul>
    </nav>
  );
};
