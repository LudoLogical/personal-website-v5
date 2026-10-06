/**
 * One level of depth in the iceberg model of systems thinking,
 * displayed as a single panel in an IcebergExplainerText.
 * All of the text in a Tier should fit within the height of its panel.
 */
export type Tier = {
  /**
   * The name of this Tier (e.g., "Events").
   * Displayed prominently as the heading of its panel.
   */
  name: string;

  /**
   * The question that this Tier answers (e.g., "What happened?").
   * Displayed in italics beneath the name.
   */
  question: string;

  /**
   * Examples of things that belong to this Tier.
   * Displayed beneath the question as a single, dot-separated list.
   */
  items: string[];

  /**
   * A label for the depth at which this Tier lies (e.g., "-30 m").
   * Displayed in a small monospace font above the name.
   */
  depth: string;
};

/**
 * The Tiers of an IcebergExplainerText, from the surface to the deepest level.
 * Fixed at four because the iceberg illustration is drawn for four panels.
 */
export type Tiers = [Tier, Tier, Tier, Tier];

/**
 * The number of Tiers in an IcebergExplainerText.
 */
export const TIER_COUNT: Tiers["length"] = 4;
