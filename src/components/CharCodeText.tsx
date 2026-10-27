import type { CSSProperties } from "react";

export type CharCodeTextProps = {
  /**
   * The text in this {@link CharCodeText}. Subject to `whitespace-pre`.
   */
  text: string;

  /**
   * Optional settings for this {@link CharCodeText}.
   * Unspecified values are set according to {@link DEFAULT_OPTIONS}.
   */
  options?: {
    /**
     * The duration, in seconds, over which a character
     * should rise and change color when hovered.
     */
    liftDuration?: number;

    /**
     * The distance, in ems, that a character should rise when hovered.
     */
    liftHeight?: number;

    /**
     * The minimum number of digits with which the binary
     * representation of each character code should be displayed.
     * Shorter representations are zero-padded.
     */
    minBinaryDigits?: number;
  };
};

/**
 * The `options` prop after all {@link DEFAULT_OPTIONS} have been applied.
 */
type CharCodeTextOptions = Required<NonNullable<CharCodeTextProps["options"]>>;

/**
 * The values used for any settings that are omitted from the `options` prop.
 */
export const DEFAULT_OPTIONS: CharCodeTextOptions = {
  liftDuration: 0.2,
  liftHeight: 0.1,
  minBinaryDigits: 8,
};

/**
 * Renders the specified display text such that, when any one of its
 * (non-whitespace) characters is hovered, that character is elevated,
 * changes color, and reveals a tooltip containing the decimal,
 * hexadecimal, and binary representations of its code point.
 * Motionless if the user `prefers-reduced-motion`.
 *
 * Animated using CSS alone and thus valid as a server component.
 */
const CharCodeText = ({ text, options }: CharCodeTextProps) => {
  const { liftDuration, liftHeight, minBinaryDigits } = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  // Variables injected directly into CSS to avoid introducing client-side JS
  const liftVariables = {
    "--lift-duration": `${liftDuration}s`,
    "--lift-height": `${liftHeight}em`,
  } as CSSProperties;

  return (
    <span className="flex whitespace-pre" style={liftVariables}>
      {/* Screen readers ignore `aria-label` on generic elements
          like spans, so the text is exposed this way instead */}
      <span className="sr-only">{text}</span>
      {/* Spreading iterates by code point, so "astral"
          characters like emoji aren't split up! */}
      {[...text].map((char, i) => {
        // Ignore whitespace characters
        if (/\s/.test(char)) {
          return (
            <span key={i} aria-hidden className="leading-none">
              {char}
            </span>
          );
        }

        const code = char.codePointAt(0)!;
        const decimal = code.toString();
        const hexadecimal = `0x${code.toString(16).toUpperCase()}`;
        const binary = code.toString(2).padStart(minBinaryDigits, "0");

        return (
          <span
            key={i}
            aria-hidden
            // Apply `z-10` on hover so the tooltip floats
            // over any content that might exist below it;
            // use `base-hover:` instead of `hover:` so that the lift
            // and color follow the tooltip on touch screens too
            className="tooltip cursor-default leading-none transition-[translate,color] duration-(--lift-duration) ease-out motion-reduce:transition-none base-hover:z-10 base-hover:-translate-y-(--lift-height) base-hover:text-primary"
          >
            <span className="tooltip-content flex flex-col items-center font-mono text-xs leading-normal shadow-lg xs:text-sm">
              <span className="font-bold">{decimal}</span>
              <span className="text-neutral-content/60">{hexadecimal}</span>
              <span className="text-neutral-content/60">{binary}</span>
            </span>
            {char}
          </span>
        );
      })}
    </span>
  );
};

export default CharCodeText;
