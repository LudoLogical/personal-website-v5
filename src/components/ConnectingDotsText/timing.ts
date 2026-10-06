import { type ConnectingDotsTextOptions } from "./ConnectingDotsText";

/**
 * The delay, in seconds, between the display text finishing fading out
 * and the line beginning to draw itself. Gives the first few dots a head
 * start so that the line has something to connect.
 */
const LINE_DRAW_DELAY = 0.12;

/**
 * The delay, in seconds, between deactivation and the first dot beginning
 * to shrink. Lets the line retract partway before the dots follow it.
 */
const DOT_EXIT_DELAY = 0.15;

/**
 * The delay, in seconds, between the dot-to-dot elements disappearing
 * completely and the display text beginning to fade back in.
 */
const TEXT_FADE_IN_BUFFER = 0.07;

/** The easing curve with which the line draws and retracts. */
const LINE_EASE = "cubic-bezier(.65,0,.25,1)";

/**
 * The easing curve with which each dot pops into view.
 * Overshoots for a springy feel.
 */
const DOT_ENTRANCE_EASE = "cubic-bezier(.3,1.6,.5,1)";

/**
 * The easing curve with which each dot shrinks out of view.
 * Must not overshoot, or the dot would grow past scale(0)
 * and linger as a 1px speck.
 */
const DOT_EXIT_EASE = "cubic-bezier(.5,0,.75,0)";

/**
 * The CSS transitions for each of the elements in a ConnectingDotsText.
 */
export type Transitions = {
  /**
   * The transition for the color of the display text.
   */
  text: string;

  /**
   * The transition for the stroke-dashoffset of the line.
   */
  line: string;

  /**
   * Computes the transition for the transform of the dot at the
   * specified index, counting from the leftmost dot.
   */
  dot: (index: number) => string;
};

/**
 * Computes the delay between successive dots required for a sweep across
 * the specified number of dots to take the specified amount of time.
 * @param spread the time, in seconds, between the first and last dots
 * @param dotCount the number of dots in the sweep
 * @returns the delay, in seconds, between successive dots
 */
const getStagger = (spread: number, dotCount: number) =>
  dotCount > 1 ? spread / (dotCount - 1) : 0;

/**
 * Computes the CSS transitions that choreograph the animation of a
 * ConnectingDotsText in the specified direction. Because CSS applies the
 * transition of the state being entered, the activation transitions animate
 * everything in and the deactivation transitions animate everything out.
 * @param active whether the ConnectingDotsText is being activated (true)
 *               or deactivated (false)
 * @param dotCount the number of dots in the ConnectingDotsText
 * @param animationOptions the animation options for
 *                         the associated ConnectingDotsText
 * @returns the Transitions for the specified direction
 */
export const getTransitions = (
  active: boolean,
  dotCount: number,
  animationOptions: ConnectingDotsTextOptions["animation"],
): Transitions => {
  const {
    textFadeOutDuration,
    textFadeInDuration,
    lineDrawDuration,
    lineRetractDuration,
    dotEntranceDuration,
    dotExitDuration,
    dotEntranceSpread,
    dotExitSpread,
  } = animationOptions;

  if (active) {
    const dotStagger = getStagger(dotEntranceSpread, dotCount);
    return {
      // Fade out immediately
      text: `color ${textFadeOutDuration}s ease-out 0s`,
      // Draw once the text has faded out and the first dots have appeared
      line: `stroke-dashoffset ${lineDrawDuration}s ${LINE_EASE} ${textFadeOutDuration + LINE_DRAW_DELAY}s`,
      // Pop in from left to right once the text has faded out
      dot: (index) =>
        `transform ${dotEntranceDuration}s ${DOT_ENTRANCE_EASE} ${textFadeOutDuration + index * dotStagger}s`,
    };
  }

  const dotStagger = getStagger(dotExitSpread, dotCount);
  // Fade back in only once both the line and the dots are gone
  const textFadeInDelay =
    Math.max(
      lineRetractDuration,
      DOT_EXIT_DELAY + dotExitSpread + dotExitDuration,
    ) + TEXT_FADE_IN_BUFFER;
  return {
    text: `color ${textFadeInDuration}s ease-out ${textFadeInDelay}s`,
    // Retract immediately
    line: `stroke-dashoffset ${lineRetractDuration}s ${LINE_EASE} 0s`,
    // Shrink from right to left shortly after the line starts retracting
    dot: (index) =>
      `transform ${dotExitDuration}s ${DOT_EXIT_EASE} ${DOT_EXIT_DELAY + (dotCount - 1 - index) * dotStagger}s`,
  };
};
