import { useEffect, useEffectEvent, type RefObject } from "react";

/**
 * While enabled, invokes the specified callback whenever the user taps
 * (on a touch screen) anywhere outside of the `Element` assigned to the
 * specified `ref`. Touch gestures that scroll the page are ignored.
 * @param ref a `RefObject` for the `Element` outside
 *            of which taps must be observed
 * @param enabled `true` if `useTapOutside()` should currently
 *                be listening for taps, `false` otherwise
 * @param onTapOutside the callback be invoked on each appropriate tap
 */
const useTapOutside = (
  ref: RefObject<Element | null>,
  enabled: boolean,
  onTapOutside: () => void,
) => {
  const onTap = useEffectEvent(onTapOutside);

  useEffect(() => {
    if (!enabled) return;

    // Scrolling is ignored because it ends in a `pointercancel`, not a `pointerup`
    const onPointerUp = (e: PointerEvent) => {
      if (e.pointerType !== "touch") return;
      if (ref.current?.contains(e.target as Node)) return;
      onTap();
    };

    document.addEventListener("pointerup", onPointerUp);
    return () => document.removeEventListener("pointerup", onPointerUp);
  }, [ref, enabled]);
};

export default useTapOutside;
