import { useEffect, useState, type RefObject } from "react";

/**
 * The minimum distance, in pixels, that the page must scroll in one
 * direction before the hidden state is reevaluated. Prevents jitter.
 */
const SCROLL_THRESHOLD = 8;

/**
 * Gets the current vertical scroll position, clamped to the scrollable range
 * so that overscroll bounces (e.g., on iOS) are not mistaken for scrolling.
 */
const getClampedScrollY = () => {
  const maxScrollY = document.documentElement.scrollHeight - window.innerHeight;
  return Math.min(Math.max(window.scrollY, 0), Math.max(maxScrollY, 0));
};

/**
 * Tracks whether the HTMLElement assigned to the specified ref should be
 * hidden, which is the case after the user scrolls down past its height.
 * Scrolling up by any meaningful amount reveals it again.
 *
 * @param ref a RefObject for the HTMLElement to hide
 * @returns true if the HTMLElement should be hidden, false otherwise
 */
export const useHideOnScrollDown = (
  ref: RefObject<HTMLElement | null>,
): boolean => {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let lastScrollY = getClampedScrollY();
    let frame = 0;

    const update = () => {
      frame = 0;
      const scrollY = getClampedScrollY();
      const delta = scrollY - lastScrollY;

      // Let small movements accumulate until they cross the threshold
      if (Math.abs(delta) < SCROLL_THRESHOLD) return;

      const height = ref.current?.offsetHeight ?? 0;
      setHidden(delta > 0 && scrollY > height);
      lastScrollY = scrollY;
    };

    // Throttled to one update per frame
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [ref]);

  return hidden;
};
