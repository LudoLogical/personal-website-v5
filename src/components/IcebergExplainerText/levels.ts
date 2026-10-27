import type IcebergExplainerText from "./IcebergExplainerText";

/**
 * One level of depth in the "iceberg" meme format,
 * displayed as a single panel in an {@link IcebergExplainerText}.
 * Note that all text must fit on a single line in its panel.
 */
export type Level = {
  /**
   * The name of this {@link Level}. Displayed as the heading of its panel.
   */
  name: string;

  /**
   * The question addressed by this {@link Level}.
   * Displayed in italics beneath the name.
   */
  question: string;

  /**
   * Examples of things that belong to this {@link Level}.
   * Displayed beneath the question as a list delimited by `·`s.
   */
  concepts: string[];

  /**
   * A label for the metaphorical depth of this {@link Level}.
   * Displayed in a small monospace font above the name.
   */
  depth: string;
};

/**
 * The four {@link Level}s in an {@link IcebergExplainerText},
 * in order from top (the surface) to bottom (the deepest level).
 * The size is fixed to avoid stretching the iceberg SVG too much.
 */
export type Levels = [Level, Level, Level, Level];

/**
 * The number of {@link Level}s in an {@link IcebergExplainerText}.
 */
export const NUM_LEVELS: Levels["length"] = 4;
