import type { CSSProperties, ElementType } from "react";
import { twMerge } from "tailwind-merge";

export type CharCodeTextProps = {
  /**
   * The display text for this CharCodeText.
   * Subject to whitespace-pre.
   */
  text: string;

  /**
   * The element type used to render the root of this CharCodeText.
   * Defaults to `h1`.
   */
  as?: ElementType;

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
     * The distance, in ems, by which a hovered character should rise.
     */
    liftHeight?: number;

    /**
     * The duration, in seconds, over which a hovered character
     * should rise and change color.
     */
    liftDuration?: number;

    /**
     * The minimum number of digits to display in the binary representation
     * of a character code. Shorter representations are zero-padded.
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
 * Formats the specified character code in decimal, hexadecimal, and binary.
 * @param code the character code to be formatted
 * @param minBinaryDigits the minimum number of digits in the binary format
 * @returns the decimal, hexadecimal, and binary representations of the code
 */
const formatCharCode = (code: number, minBinaryDigits: number) => ({
  decimal: code.toString(),
  hexadecimal: `0x${code.toString(16).toUpperCase()}`,
  binary: code.toString(2).padStart(minBinaryDigits, "0"),
});

/**
 * Renders the specified display text such that hovering over any of its
 * characters lifts that character and reveals a tooltip containing its
 * character code in decimal, hexadecimal, and binary. Implemented with pure
 * CSS hover states, so it requires no client JS and works as a Server
 * Component.
 */
const CharCodeText = ({
  text,
  as: Tag = "h1",
  className,
  options,
}: CharCodeTextProps) => {
  const { liftHeight, liftDuration, minBinaryDigits } = resolveOptions(options);

  // Exposed as CSS variables so that the hover styles below stay pure CSS
  const style = {
    "--lift-height": `${liftHeight}em`,
    "--lift-duration": `${liftDuration}s`,
  } as CSSProperties;

  return (
    <Tag
      aria-label={text}
      className={twMerge("flex whitespace-pre", className)}
      style={style}
    >
      {/* Spreading iterates by code point, so astral characters stay whole */}
      {[...text].map((char, i) => {
        if (/\s/.test(char)) {
          return (
            <span key={i} aria-hidden className="leading-none">
              {char}
            </span>
          );
        }

        const { decimal, hexadecimal, binary } = formatCharCode(
          char.codePointAt(0)!,
          minBinaryDigits,
        );
        return (
          <span
            key={i}
            aria-hidden
            // z-10 on hover so the tooltip floats over whatever sits above
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
    </Tag>
  );
};

export default CharCodeText;
