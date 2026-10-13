import { useEffect, useEffectEvent, type RefObject } from "react";

/**
 * While enabled, calls the specified callback whenever the user taps (on a
 * touch screen) anywhere outside of the Element assigned to the specified
 * ref. Gestures that scroll the page end in a pointercancel rather than a
 * pointerup and so are ignored.
 *
 * @param ref a RefObject for the Element to tap outside of
 * @param enabled whether taps should currently be listened for
 * @param onTapOutside the callback to call upon each tap outside
 */
export const useTapOutside = (
  ref: RefObject<Element | null>,
  enabled: boolean,
  onTapOutside: () => void,
) => {
  const onTap = useEffectEvent(onTapOutside);

  useEffect(() => {
    if (!enabled) return;

    const onPointerUp = (e: PointerEvent) => {
      if (e.pointerType !== "touch") return;
      if (ref.current?.contains(e.target as Node)) return;
      onTap();
    };

    document.addEventListener("pointerup", onPointerUp);
    return () => document.removeEventListener("pointerup", onPointerUp);
  }, [ref, enabled]);
};
