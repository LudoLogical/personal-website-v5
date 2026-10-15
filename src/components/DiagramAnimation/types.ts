import type { Point } from "orthogonal-path-finding";

export type { Point };

/**
 * One of the four sides of a bounding box.
 */
export enum Side {
  Top = "top",
  Bottom = "bottom",
  Left = "left",
  Right = "right",
}

/**
 * An ArrowEnd located on (but separated from by diagramPadding) one side of
 * the bounding box of the display text in a DiagramAnimation and possessing
 * a connection point located `depth` ems away from its location in the
 * direction of its defining side.
 *
 * The line between an ArrowAnchor's location and its connection point is
 * referred to as its "extension" and rendered as part of the body of its
 * parent Arrow.
 *
 * If an ArrowAnchor is given an end marker by its parent Arrow, its location
 * is the middle of the outer edge of that marker. Otherwise, its location is
 * the relevant end of the body of its parent Arrow (not accounting for that
 * body's round cap).
 */
export type ArrowAnchor = {
  /**
   * The side of the bounding box of the display text in the DiagramAnimation
   * relative to which this ArrowAnchor is defined and directly away from
   * which its extension runs.
   */
  side: Side;

  /**
   * The fraction of the way along the side relative to which this
   * ArrowAnchor is defined at which this ArrowAnchor is located.
   * Not constrained to [0, 1].
   *
   * If the side is Top or Bottom, 0 and 1 are the left and right edges of
   * the bounding box of the display text, respectively. If the side is Left
   * or Right, 0 and 1 are the top and bottom edges of the bounding box of
   * the display text, respectively.
   */
  fractionAlongSide: number;

  /**
   * The length, in ems, of this ArrowAnchor's extension
   * (i.e., the line that runs from its location directly
   * away from its side to its connection point).
   */
  depth: number;
};

/**
 * An ArrowEnd located relative to the upper-left corner of the bounding box
 * of the display text in a DiagramAnimation and possessing a connection point
 * coincident with its location.
 *
 * If an ArrowFreeEnd is given an end marker by its parent Arrow, its location
 * is the center of that marker. Otherwise, its location is the relevant end
 * of the body of its parent Arrow (not accounting for that body's round cap).
 */
export type ArrowFreeEnd = {
  /**
   * The fraction of the way along the width of the
   * bounding box at which this ArrowFreeEnd is located.
   * Not constrained to [0, 1].
   */
  xFraction: number;

  /**
   * The fraction of the way along the height of the
   * bounding box at which this ArrowFreeEnd is located.
   * Not constrained to [0, 1].
   */
  yFraction: number;
};

/**
 * One end of an Arrow.
 *
 * Every ArrowEnd defines a location, which is the Point at which the body of
 * its parent Arrow ends (assuming that Arrow has no corresponding end marker).
 *
 * Every ArrowEnd also has a connection point, which is the Point at which
 * it is algorithmically joined to the other ArrowEnd in its parent Arrow.
 *
 * The connection point of an ArrowFreeEnd is always coincident with
 * its location, so it connects to its partner ArrowEnd directly. However,
 * the connection point of an ArrowAnchor is the far end of its extension
 * (see the documentation for ArrowAnchor), so it connects to its partner
 * ArrowEnd only after running `depth` ems directly away from its side.
 */
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
   * The fraction of the way along the *trimmed* (i.e., after any end markers
   * have been placed) body of the Arrow to which this PathMarker belongs at
   * which it is located. Expected to be within [0, 1] and sufficiently distant
   * from all other markers to avoid causing overlap.
   */
  fractionAlongPath: number;
};

/**
 * A single Arrow in a DiagramAnimation, defined by its two ArrowEnds.
 */
export type Arrow = {
  /**
   * The ArrowEnd at which this Arrow begins. Rendered without an arrowhead.
   */
  from: ArrowEnd;

  /**
   * The ArrowEnd at which this Arrow terminates. Rendered with an arrowhead.
   *
   * Note that the connection point of this ArrowEnd is subject
   * to adjustment during rasterization due to snapping
   * (see the documentation for snapDistance).
   */
  to: ArrowEnd;

  /**
   * The shape of the marker, if any, from which this Arrow originates.
   * If the `from` ArrowEnd is an ArrowFreeEnd, the marker is centered on it.
   * Otherwise, the marker is positioned such that its outer edge aligns with
   * the Point at which the `from` end of this Arrow would be located without
   * the marker (after accounting for the round cap on the Arrow's body).
   */
  fromMarker?: MarkerShape;

  /**
   * The shape of the marker, if any, to which this Arrow points.
   * If the `to` ArrowEnd is an ArrowFreeEnd, the marker is centered on it.
   * Otherwise, the marker is positioned such that its outer edge aligns with
   * the Point at which the `to` end of this Arrow would be located without
   * the marker (after accounting for the round cap on the Arrow's body).
   */
  toMarker?: MarkerShape;

  /**
   * The PathMarkers that appear directly along the path of this Arrow.
   */
  pathMarkers?: PathMarker[];
};

/**
 * An ArrowEnd for which the location and
 * connection point have been converted to pixels.
 */
export type RasterizedArrowEnd = {
  /**
   * The location of this RasterizedArrowEnd, in pixels.
   */
  location: Point;

  /**
   * The connection point of this RasterizedArrowEnd, in pixels.
   * Coincident with its location if rasterized from an ArrowFreeEnd.
   */
  connectionPoint: Point;
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
 * @param side the side of the bounding box of the display text in the
 *             DiagramAnimation along which the new ArrowAnchor should be
 *             located and directly away from which its extension should run
 * @param fraction the fraction of the way along the specified side
 *                 at which the new ArrowAnchor should be located;
 *                 not constrained to [0, 1]
 * @param depth the length, in ems, of the new ArrowAnchor's extension
 * @returns the new ArrowAnchor
 */
export const anchor = (
  side: Side,
  fraction: number,
  depth: number,
): ArrowAnchor => ({
  side,
  fractionAlongSide: fraction,
  depth,
});

/**
 * Creates a new ArrowFreeEnd for a DiagramAnimation.
 * @param xFraction the fraction of the way along the width
 *                  of the display text's bounding box at which
 *                  the new ArrowFreeEnd should be located;
 *                  not constrained to [0, 1]
 * @param yFraction the fraction of the way along the height
 *                  of the display text's bounding box at which
 *                  the new ArrowFreeEnd should be located;
 *                  not constrained to [0, 1]
 * @returns the new ArrowFreeEnd
 */
export const free = (xFraction: number, yFraction: number): ArrowFreeEnd => ({
  xFraction: xFraction,
  yFraction: yFraction,
});

/**
 * Creates a new PathMarker for a DiagramAnimation.
 * @param shape the shape of the new PathMarker
 * @param fraction the fraction of the way along the *trimmed*
 *                 (i.e., after any end markers have been placed)
 *                 body of the Arrow to which the new PathMarker belongs
 *                 at which the new PathMarker should be located; expected
 *                 to be within [0, 1] and sufficiently distant from all
 *                 other markers to avoid causing overlap
 * @returns the new PathMarker
 */
export const along = (
  shape: PathMarkerShape,
  fraction: number,
): PathMarker => ({
  shape,
  fractionAlongPath: fraction,
});
