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
 * If the associated Arrow has a marker at this ArrowFreeEnd, this Point is
 * the center of that marker. Otherwise, it is the end of the Arrow's body.
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
 * One of the shapes that a marker in a DiagramAnimation can take.
 */
export enum MarkerShape {
  FilledCircle = "filled-circle",
  OutlinedCircle = "outlined-circle",
  X = "x",
}

/**
 * One of the MarkerShapes that a PathMarker can take.
 */
export type PathMarkerShape = MarkerShape.FilledCircle | MarkerShape.X;

/**
 * A marker that appears directly along the path of an Arrow.
 */
export type PathMarker = {
  /**
   * The shape of this PathMarker.
   */
  shape: PathMarkerShape;

  /**
   * The percentage of the way along the path of the Arrow
   * to which this PathMarker belongs at which it is located.
   */
  percentageAlongPath: number;
};

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

  /**
   * The shape of the marker, if any, from which this Arrow originates.
   * If the `from` ArrowEnd is an ArrowFreeEnd, the marker is centered on it.
   * Otherwise, the marker is placed just inside the `from` ArrowAnchor such
   * that its outer edge aligns with where the end of this Arrow would be
   * without it.
   */
  fromMarker?: MarkerShape;

  /**
   * The shape of the marker, if any, to which this Arrow points.
   * If the `to` ArrowEnd is an ArrowFreeEnd, the marker is centered on it.
   * Otherwise, the marker is placed just inside the `to` ArrowAnchor such
   * that its outer edge aligns with where the end of this Arrow would be
   * without it.
   */
  toMarker?: MarkerShape;

  /**
   * The PathMarkers that appear directly along the path of this Arrow.
   */
  pathMarkers?: PathMarker[];
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
 * A marker for which the position of the center has been converted to pixels.
 */
export type RasterizedMarker = Point & {
  /**
   * The shape of this RasterizedMarker.
   */
  shape: MarkerShape;
};

/**
 * An Arrow for which all values have been converted to pixels.
 */
export type RasterizedArrow = {
  /**
   * The rasterized SVG path for the body of this RasterizedArrow.
   */
  body: string;

  /**
   * The RasterizedMarkers that belong to this RasterizedArrow.
   */
  markers: RasterizedMarker[];
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

/**
 * Creates a new PathMarker for a DiagramAnimation.
 * @param shape the shape of the new PathMarker
 * @param percent the percentage of the way along the path of the Arrow
 *                to which the new PathMarker belongs at which the new
 *                PathMarker should be located
 * @returns the new PathMarker
 */
export const along = (shape: PathMarkerShape, percent: number): PathMarker => ({
  shape,
  percentageAlongPath: percent,
});
