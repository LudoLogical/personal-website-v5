import type { CSSProperties } from "react";
import { twMerge } from "tailwind-merge";

export type CharCodeTextProps = {
  /**
   * The text in this CharCodeText.
   * Subject to whitespace-pre.
   */
  text: string;

  /**
   * Classes for the root element of this CharCodeText.
   */
  className?: string;

  /**
   * Optional settings for this CharCodeText.
   * Unspecified values are set according to DEFAULT_OPTIONS.
   */
  options?: {
    /**
     * The distance, in ems, that a character should rise when hovered.
     */
    liftHeight?: number;

    /**
     * The duration, in seconds, over which a character
     * should rise and change color when hovered.
     */
    liftDuration?: number;

    /**
     * The minimum number of digits with which the binary
     * representation of each character code should be displayed.
     * Shorter representations are zero-padded.
     */
    minBinaryDigits?: number;
  };
};

/**
 * The options prop after all DEFAULT_OPTIONS have been applied.
 */
export type CharCodeTextOptions = Required<
  NonNullable<CharCodeTextProps["options"]>
>;

/**
 * The values used for any settings that are
 * omitted from the CharCodeTextOptions prop.
 */
export const DEFAULT_OPTIONS: CharCodeTextOptions = {
  liftHeight: 0.1,
  liftDuration: 0.2,
  minBinaryDigits: 8,
};

/**
 * Populates all of the settings that were omitted from the specified options
 * prop with the corresponding DEFAULT_OPTIONS.
 * Assumes that missing settings were not simply set to `undefined`.
 * @param options the options to be resolved
 * @returns the resolved CharCodeTextOptions
 */
const resolveOptions = (
  options: CharCodeTextProps["options"],
): CharCodeTextOptions => ({ ...DEFAULT_OPTIONS, ...options });

/**
 * Renders the specified display text such that, when any one of its
 * non-whitespace) characters is hovered, that character is elevated,
 * changes color, and reveals a tooltip containing the decimal,
 * hexadecimal, and binary representations of its codepoint.
 *
 * Animated with CSS hover states alone and thus valid as a server component.
 */
const CharCodeText = ({ text, className, options }: CharCodeTextProps) => {
  const { liftHeight, liftDuration, minBinaryDigits } = resolveOptions(options);

  // Variables injected directly into CSS to avoid introducing client-side JS
  const liftVariables = {
    "--lift-height": `${liftHeight}em`,
    "--lift-duration": `${liftDuration}s`,
  } as CSSProperties;

  return (
    <span
      className={twMerge("flex whitespace-pre", className)}
      style={liftVariables}
    >
      {/* Screen readers ignore aria-label on generic elements like spans, so
          the full text is exposed this way instead of character by character */}
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
            // Apply z-10 on hover to the tooltip floats
            // over any content that might exist below it
            className="tooltip cursor-default leading-none transition-[translate,color] duration-(--lift-duration) ease-out hover:z-10 hover:-translate-y-(--lift-height) hover:text-primary"
          >
            <span className="tooltip-content flex flex-col items-center font-mono text-xs leading-normal shadow-lg">
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
