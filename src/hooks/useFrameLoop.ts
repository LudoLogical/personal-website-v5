import { useEffect, useEffectEvent } from "react";

/**
 * The longest duration, in milliseconds, that `useFrameLoop()` reports
 * for a single frame. Exists to prevent whatever a frame's duration
 * advances from skipping ahead when frames resume after a long gap
 * (e.g., a switch between tabs).
 */
const MAX_FRAME_DURATION = 100;

/**
 * While enabled, invokes the specified callback once per animation frame.
 * @param enabled `true` if `useFrameLoop()` should currently
 *                be requesting frames, `false` otherwise
 * @param onFrame the callback to be invoked on each frame; receives the
 *                duration, in milliseconds, of the frame that just ended
 *                (which never exceeds {@link MAX_FRAME_DURATION})
 */
const useFrameLoop = (
  enabled: boolean,
  onFrame: (frameDuration: number) => void,
) => {
  const onTick = useEffectEvent(onFrame);

  useEffect(() => {
    if (!enabled) return;

    let previousTime = performance.now();
    let pendingFrameRequestID = 0;

    const handleFrame = (time: number) => {
      // The first frame's timestamp can slightly precede `previousTime`
      const frameDuration = Math.max(time - previousTime, 0);
      previousTime = time;
      onTick(Math.min(frameDuration, MAX_FRAME_DURATION));
      pendingFrameRequestID = requestAnimationFrame(handleFrame);
    };

    pendingFrameRequestID = requestAnimationFrame(handleFrame);
    return () => cancelAnimationFrame(pendingFrameRequestID);
  }, [enabled]);
};

export default useFrameLoop;
