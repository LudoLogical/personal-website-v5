/**
 * One level of depth in the "iceberg" meme format,
 * displayed as a single panel in an IcebergExplainerText.
 * Note that all text must fit on a single line in its panel.
 */
export type Level = {
  /**
   * The name of this Level. Displayed as the heading of its panel.
   */
  name: string;

  /**
   * The question addressed by this Level.
   * Displayed in italics beneath the name.
   */
  question: string;

  /**
   * Examples of things that belong to this Level.
   * Displayed beneath the question as a list delimited by `·`s.
   */
  concepts: string[];

  /**
   * A label for the metaphorical depth of this Level (e.g., "-30 m").
   * Displayed in a small monospace font above the name.
   */
  depth: string;
};

/**
 * The four Levels in an IcebergExplainerText,
 * in order from top (the surface) to bottom (the deepest level).
 * The size is fixed to avoid stretching the iceberg SVG too much.
 */
export type Levels = [Level, Level, Level, Level];

/**
 * The number of Levels in an IcebergExplainerText.
 */
export const NUM_LEVELS: Levels["length"] = 4;

/**
 * The background and text color classes for each Level's panel,
 * in order from top (the surface) to bottom (the deepest level).
 */
export const LEVEL_CLASS_NAMES: [string, string, string, string] = [
  "bg-blue-200 text-blue-950",
  "bg-blue-400 text-blue-950",
  "bg-blue-700 text-blue-50",
  "bg-blue-950 text-blue-100",
];
