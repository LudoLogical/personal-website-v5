import { useEffect, useState, type RefObject } from "react";

/**
 * Tracks whether at least 25% of the `Element` assigned to the
 * specified `ref` is visible in the viewport. Updates whenever that
 * threshold starts or stops being met.
 * @param ref a `RefObject` for the `Element` to be observed
 * @returns `true` if the `Element` is in view, `false` otherwise
 */
const useInView = (ref: RefObject<Element | null>): boolean => {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Observations are conducted against the viewport by default
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
