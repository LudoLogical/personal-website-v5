import type { Point } from "orthogonal-path-finding";

export type { Point };

/**
 * One of the four sides of a Rectangle.
 */
export enum Side {
  Top = "top",
  Bottom = "bottom",
  Left = "left",
  Right = "right",
}

/**
 * A Point defined relative to one side of the
 * bounding box of the display text in a DiagramAnimation.
 */
export type ArrowAnchor = {
  /**
   * The side of the bounding box of the display text in the
   * DiagramAnimation relative to which this ArrowAnchor is defined.
   */
  side: Side;

  /**
   * The percentage of the way along the side relative to which this
   * ArrowAnchor is defined at which this ArrowAnchor is located.
   */
  percentageAlongSide: number;

  /**
   * The number of ems away from the side relative to which this
   * ArrowAnchor is defined at which this ArrowAnchor is located.
   */
  depth: number;
};

/**
 * A Point defined relative to the upper-left corner of the
 * bounding box of the display text in a DiagramAnimation.
 */
export type ArrowFreeEnd = {
  /**
   * The percentage of the way along the x-axis of the
   * bounding box at which this ArrowFreeEnd is located.
   */
  xPercentage: number;

  /**
   * The percentage of the way along the y-axis of the
   * bounding box at which this ArrowFreeEnd is located.
   */
  yPercentage: number;
};

/** One end of an Arrow, defined using scalable ratios. */
export type ArrowEnd = ArrowAnchor | ArrowFreeEnd;

/**
 * A single Arrow in an ArrowAnimation, defined by its two ArrowEnds.
 */
export type Arrow = {
  /**
   * The ArrowEnd at which this Arrow begins. Rendered without an arrowhead.
   */
  from: ArrowEnd;

  /**
   * The ArrowEnd at which this arrow terminates. Rendered with an arrowhead.
   */
  to: ArrowEnd;
};

/**
 * An ArrowEnd for which all values have been converted to pixels.
 * Note that the x and y coordinates DO NOT account for depth.
 */
export type RasterizedArrowEnd = Point & {
  /**
   * The side of the bounding box of the display text in the
   * DiagramAnimation relative to which this RasterizedArrowEnd is defined.
   */
  side: Side;

  /**
   * The number of pixels away from the side relative to which this
   * RasterizedArrowEnd is defined at which this RasterizedArrowEnd
   * is located.
   */
  depth: number;
};

/**
 * Creates a new ArrowAnchor for a DiagramAnimation.
 * @param side the side of the bounding box of the display text
 *             in the DiagramAnimation relative to which the new
 *             ArrowAnchor should be defined
 * @param percent the percentage of the way along the specified side
 *                at which the new ArrowAnchor should be located
 * @param depth the number of ems away from the specified side at
 *              which the new ArrowAnchor should be located
 * @returns the new ArrowAnchor
 */
export const anchor = (
  side: Side,
  percent: number,
  depth: number,
): ArrowAnchor => ({
  side,
  percentageAlongSide: percent,
  depth,
});

/**
 * Creates a new ArrowFreeEnd for a DiagramAnimation.
 * @param xPercentage the percentage of the way along the x-axis
 *                    of the display text's bounding box at which
 *                    the new ArrowFreeEnd should be located
 * @param yPercentage the percentage of the way along the y-axis
 *                    of the display text's bounding box at which
 *                    the new ArrowFreeEnd should be located
 * @returns the new ArrowFreeEnd
 */
export const free = (
  xPercentage: number,
  yPercentage: number,
): ArrowFreeEnd => ({
  xPercentage,
  yPercentage,
});
