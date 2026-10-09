import type { CSSProperties } from "react";
import { twMerge } from "tailwind-merge";

export type WaveTextProps = {
  /**
   * The text in this WaveText.
   * Subject to whitespace-pre.
   */
  text: string;

  /**
   * Classes for the root element of this WaveText.
   * Accepts the wave-* utilities described on WaveText itself.
   */
  className?: string;
};

/**
 * Renders the specified display text such that its (non-whitespace)
 * characters gently bob up and down in a continuous wave that travels
 * from its start to its end. Motionless if the user prefers reduced motion.
 *
 * The wave is customized via the following utilities (defined in
 * WaveText.css), which can be passed through className alongside any variants:
 * - `wave-height-[<length>]`: the distance between the lowest and highest
 *   points that each character reaches (defaults to 0.1em)
 * - `wave-period-[<time>]`: the duration of one full rise and fall of each
 *   character (defaults to 2s)
 * - `wave-stagger-[<time>]`: the delay between the movements of adjacent
 *   characters (defaults to 0.1s)
 *
 * Animated with CSS keyframes alone and thus valid as a server component.
 */
const WaveText = ({ text, className }: WaveTextProps) => (
  <span className={twMerge("inline-flex whitespace-pre", className)}>
    {/* Screen readers ignore aria-label on generic elements like spans, so
        the full text is exposed this way instead of character by character */}
    <span className="sr-only">{text}</span>
    {/* Spreading iterates by code point, so "astral"
        characters like emoji aren't split up! */}
    {[...text].map((char, i, chars) => {
      // Ignore whitespace characters
      if (/\s/.test(char)) {
        return (
          <span key={i} aria-hidden>
            {char}
          </span>
        );
      }

      return (
        <span
          key={i}
          aria-hidden
          className="inline-block motion-safe:animate-wave"
          // Each character lags the one before it by the stagger so that the
          // wave travels forward. Offsetting every delay by the full length
          // keeps them all negative, which starts each character mid-wave
          // rather than leaving later ones motionless while the wave arrives
          style={{ "--wave-offset": i - chars.length } as CSSProperties}
        >
          {char}
        </span>
      );
    })}
  </span>
);

export default WaveText;
