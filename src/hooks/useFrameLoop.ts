import { useEffect, useEffectEvent } from "react";

/**
 * The longest duration, in milliseconds, that {@link useFrameLoop} will ever
 * report as having elapsed between two animation frames. This cap exists to
 * prevent unexpected leaps forward in time after long gaps between animation
 * frames (caused by, e.g., the user switching to another tab for a while).
 */
const MAX_FRAME_DURATION = 100;

/**
 * While enabled, invokes the specified callback once per animation frame.
 * @param enabled `true` if `useFrameLoop()` should currently be
 *                requesting animation frames, `false` otherwise
 * @param onFrame the callback to be invoked on each animation frame;
 *                receives the duration, in milliseconds, of the frame
 *                that just ended (capped by {@link MAX_FRAME_DURATION})
 */
const useFrameLoop = (
  enabled: boolean,
  onFrame: (frameDuration: number) => void,
) => {
  // Treat `onFrame` as a non-reactive event handler
  const onTick = useEffectEvent(onFrame);

  useEffect(() => {
    if (!enabled) return;

    let previousTime = performance.now();
    let pendingFrameRequestID = 0;

    const handleFrame = (time: number) => {
      // The first frame's timestamp might slightly precede `previousTime`
      // b/c `performance.now()` and `requestAnimationFrame()` are independent
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
