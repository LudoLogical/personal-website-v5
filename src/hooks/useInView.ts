import { useEffect, useState, type RefObject } from "react";

/**
 * Tracks whether a meaningful portion of the `Element` assigned to the
 * specified `ref` is visible in the viewport. Updates whenever that
 * `Element` scrolls (or is otherwise brought) into or out of view.
 * @param ref a `RefObject` for the `Element` to be observed
 * @returns `true` if the `Element` is in view, `false` otherwise
 */
const useInView = (ref: RefObject<Element | null>): boolean => {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.25 },
    );
    observer.observe(element);
    return () => observer.disconnect(); // destroy `observer` on cleanup
  }, [ref]);

  return inView;
};

export default useInView;
