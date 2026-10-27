import type { CSSProperties } from "react";
import { twMerge } from "tailwind-merge";
import styles from "./WaveText.module.css";

export type WaveTextProps = {
  /**
   * The text in this {@link WaveText}. Subject to `whitespace-pre`.
   */
  text: string;

  /**
   * Classes for the container `<span>` of this {@link WaveText},
   * including the following CSS variables used to control its behavior:
   *
   * - `--wave-height`: the distance that each character travels between
   *                    its lowest and highest point; defaults to 0.1em
   * - `--wave-period`: the duration over which each character completes
   *                    a full cycle of rising and falling; defaults to 2s
   * - `--wave-stagger`: the delay between the starting points of the
   *                     animations of adjacent characters; defaults to 0.1s
   *
   * Note that variants (e.g., `sm:[--wave-height:0.15em]`) can also be set.
   */
  className?: string;
};

/**
 * Renders the specified `text` such that its (non-whitespace) characters
 * gently move up and down in a continuous wave that appears to travel
 * from left to right. Motionless if the user `prefers-reduced-motion`.
 *
 * Animated using CSS alone and thus valid as a server component.
 */
const WaveText = ({ text, className }: WaveTextProps) => (
  <span className={twMerge("inline-flex whitespace-pre", className)}>
    {/* Screen readers ignore `aria-label` on generic elements
        like spans, so the text is exposed this way instead */}
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
          className={twMerge("inline-block", styles.char)}
          // Subtracting `chars.length` keeps every `animation-delay` negative,
          // which ensures that none of the characters are motionless at first
          // (i.e., while they wait for the wave effect to "reach" them)
          style={{ "--wave-offset": i - chars.length } as CSSProperties}
        >
          {char}
        </span>
      );
    })}
  </span>
);

export default WaveText;
