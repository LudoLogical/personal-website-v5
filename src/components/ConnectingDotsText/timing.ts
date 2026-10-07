import { type ConnectingDotsTextOptions } from "./ConnectingDotsText";

/**
 * The delay, in seconds, between the moment when the text in a
 * ConnectingDotsText finishes fading out and the moment when the line
 * in that ConnectingDotsText begins to draw itself. Exists to give the
 * first few dots a head start so that the line has something to connect.
 */
const LINE_GROW_DELAY = 0.12;

/**
 * The delay, in seconds, between the moment when a ConnectingDotsText is
 * deactivated and hte moment when its first dot begins to shrink. Exists to
 * allow the line to begin retracting before the dots follow suit.
 */
const DOT_SHRINK_DELAY = 0.15;

/**
 * The delay, in seconds, between the moment when the dots in a
 * ConnectingDotsText finish disappearing completely and the moment
 * when the text in that ConnectingDotsText begins to fade back in.
 */
const TEXT_FADE_IN_BUFFER = 0.07;

/** The easing curve according to which the line draws and retracts. */
const LINE_GROW_SHRINK_CURVE = "cubic-bezier(.65,0,.25,1)";

/**
 * The easing curve according to which each dot grows into view.
 * Overshoots to achieve a springy effect.
 */
const DOT_GROW_CURVE = "cubic-bezier(.3,1.6,.5,1)";

/**
 * The easing curve according to which each dot shrinks out of view.
 * Does not overshoot to ensure that dots do not shrink past scale(0)
 * and momentarily reappear as tiny specks.
 */
const DOT_SHRINK_CURVE = "cubic-bezier(.5,0,.75,0)";

/**
 * The CSS transitions for each of the elements in a ConnectingDotsText.
 */
export type ConnectingDotsTransitions = {
  /**
   * The transition for the opacity of the text.
   */
  text: string;

  /**
   * The transition for the stroke-dashoffset of the line.
   */
  line: string;

  /**
   * Creates the transition for the transform of the i-th dot.
   */
  dot: (i: number) => string;
};

/**
 * Creates the CSS transitions that orchestrate the animation
 * of a ConnectingDotsText based on the specified active state.
 * "Activation" means animating the dots and line *into* view.
 * @param active true if the ConnectingDotsText is being activated;
 *               false if it is being deactivated
 * @param dotCount the number of dots in the ConnectingDotsText
 * @param animationOptions the animation options for
 *                         the ConnectingDotsText
 * @returns the ConnectingDotsTransitions for the specified state
 */
export const getTransitions = (
  active: boolean,
  dotCount: number,
  animationOptions: ConnectingDotsTextOptions["animation"],
): ConnectingDotsTransitions => {
  const {
    textFadeOutDuration,
    textFadeInDuration,
    dotEntranceDuration,
    dotExitDuration,
    dotEntranceSpread,
    dotExitSpread,
    lineDrawDuration,
    lineRetractDuration,
  } = animationOptions;

  // How long to wait between animation start times for neighboring dots
  const getStagger = (spread: number) =>
    dotCount > 1 ? spread / (dotCount - 1) : 0;

  if (active) {
    const dotStagger = getStagger(dotEntranceSpread);
    return {
      // Fade out immediately
      text: `opacity ${textFadeOutDuration}s ease-out 0s`,
      // Draw after the first dots have appeared
      line: `stroke-dashoffset ${lineDrawDuration}s ${LINE_GROW_SHRINK_CURVE} ${textFadeOutDuration + LINE_GROW_DELAY}s`,
      // Grow into view from left to right after the text has faded
      dot: (index) =>
        `transform ${dotEntranceDuration}s ${DOT_GROW_CURVE} ${textFadeOutDuration + index * dotStagger}s`,
    };
  }

  const dotStagger = getStagger(dotExitSpread);
  // Wait until both the line and the dots are completely gone
  const textFadeInDelay =
    Math.max(
      lineRetractDuration,
      DOT_SHRINK_DELAY + dotExitSpread + dotExitDuration,
    ) + TEXT_FADE_IN_BUFFER;
  return {
    text: `opacity ${textFadeInDuration}s ease-out ${textFadeInDelay}s`,
    // Retract immediately
    line: `stroke-dashoffset ${lineRetractDuration}s ${LINE_GROW_SHRINK_CURVE} 0s`,
    // Shrink out of view shortly after the line starts retracting
    dot: (i) =>
      `transform ${dotExitDuration}s ${DOT_SHRINK_CURVE} ${DOT_SHRINK_DELAY + (dotCount - 1 - i) * dotStagger}s`,
  };
};
