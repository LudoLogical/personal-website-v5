import { useEffect, useState } from "react";

/**
 * The minimum distance, in pixels, by which the page must be scrolled
 * in one direction before the `useHideOnScrollDown()` state is changed.
 * Exists to prevent jitter.
 */
const SCROLL_THRESHOLD = 8;

/**
 * Computes the current vertical scroll position and clamps it to the
 * scrollable range so that overscroll bounces (e.g., on iOS) are not
 * mistaken for scrolling.
 */
const getClampedScrollY = () => {
  const maxScrollY = document.documentElement.scrollHeight - window.innerHeight;
  return Math.min(Math.max(window.scrollY, 0), Math.max(maxScrollY, 0));
};

/**
 * Tracks whether an element that hides on scroll should be hidden,
 * which is the case after the user scrolls down by any meaningful amount.
 * Scrolling up by any meaningful amount reveals it again.
 * @returns `true` if the element should be hidden, `false` otherwise
 */
const useHideOnScrollDown = (): boolean => {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let lastScrollY = getClampedScrollY();
    let pendingFrameRequestID = 0;

    const handleScroll = () => {
      pendingFrameRequestID = 0;
      const scrollY = getClampedScrollY();
      const delta = scrollY - lastScrollY;

      // Let small movements accumulate until they surpass `SCROLL_THRESHOLD`
      if (Math.abs(delta) < SCROLL_THRESHOLD) return;

      setHidden(delta > 0);
      lastScrollY = scrollY;
    };

    // Throttle to one `handleScroll()` invocation per frame
    const onScroll = () => {
      if (!pendingFrameRequestID) {
        pendingFrameRequestID = requestAnimationFrame(handleScroll);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(pendingFrameRequestID);
    };
  }, []);

  return hidden;
};

export default useHideOnScrollDown;
