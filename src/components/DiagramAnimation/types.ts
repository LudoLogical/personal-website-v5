import type { Point } from "orthogonal-path-finding";
import type {
  default as DiagramAnimation,
  DiagramAnimationOptions,
} from "./DiagramAnimation";

export type { Point };

/**
 * One of the four edges of a bounding box.
 */
export enum Side {
  Top = "top",
  Bottom = "bottom",
  Left = "left",
  Right = "right",
}

/**
 * An {@link ArrowEnd} located on (but separated by `diagramPadding` from)
 * one {@link Side} of the bounding box of the display text in a
 * {@link DiagramAnimation} and possessing a connection point located `depth`
 * ems away from its location in the direction of its defining {@link Side}.
 *
 * The line between an `ArrowAnchor`'s location and its connection point is
 * referred to as its "extension" and rendered as part of the body of its
 * parent {@link Arrow}.
 *
 * If an `ArrowAnchor` is given an end marker by its parent {@link Arrow},
 * its location is the middle of the outer edge of that marker.
 * Otherwise, its location is the relevant end of the body of its
 * parent {@link Arrow} (not accounting for that body's round cap).
 */
export type ArrowAnchor = {
  /**
   * The {@link Side} of the bounding box of the display text in the
   * {@link DiagramAnimation} relative to which this {@link ArrowAnchor}
   * is defined and directly away from which its extension runs.
   */
  side: Side;

  /**
   * The fraction of the way along the {@link Side} relative to which
   * this {@link ArrowAnchor} is defined at which this {@link ArrowAnchor}
   * is located. Not constrained to [0, 1].
   *
   * If the {@link Side} is `Top` or `Bottom`, 0 and 1 are the left and right
   * edges of the bounding box of the display text, respectively.
   * If the {@link Side} is `Left` or `Right`, 0 and 1 are the top and bottom
   * edges of the bounding box of the display text, respectively.
   */
  fractionAlongSide: number;

  /**
   * The length, in ems, of this {@link ArrowAnchor}'s extension (i.e., the
   * line that runs from its location directly away from its {@link Side} to
   * its connection point).
   */
  depth: number;
};

/**
 * An {@link ArrowEnd} located relative to the upper-left corner of the
 * bounding box of the display text in a {@link DiagramAnimation} and
 * possessing a connection point coincident with its location.
 *
 * If an `ArrowFreeEnd` is given an end marker by its parent
 * {@link Arrow}, its location is the center of that marker.
 * Otherwise, its location is the relevant end of the body of its
 * parent {@link Arrow} (not accounting for that body's round cap).
 */
export type ArrowFreeEnd = {
  /**
   * The fraction of the way along the width of the bounding box at which
   * this {@link ArrowFreeEnd} is located. Not constrained to [0, 1].
   */
  xFraction: number;

  /**
   * The fraction of the way along the height of the bounding box at which
   * this {@link ArrowFreeEnd} is located. Not constrained to [0, 1].
   */
  yFraction: number;
};

/**
 * One end of an {@link Arrow}.
 *
 * Every `ArrowEnd` defines a location, which is the {@link Point} at which
 * the body of its parent {@link Arrow} ends (assuming that {@link Arrow}
 * has no corresponding end marker).
 *
 * Every `ArrowEnd` also has a connection point, which is the {@link Point}
 * at which it is algorithmically joined to the other `ArrowEnd` in its
 * parent {@link Arrow}.
 *
 * The connection point of an {@link ArrowFreeEnd} is always coincident
 * with its location, so it connects to its partner `ArrowEnd` directly.
 * However, the connection point of an {@link ArrowAnchor} is the far end
 * of its extension, so it connects to its partner `ArrowEnd` only after
 * running `depth` ems directly away from its {@link Side}.
 */
export type ArrowEnd = ArrowAnchor | ArrowFreeEnd;

/**
 * One of the shapes that a marker in a {@link DiagramAnimation} can take.
 */
export enum MarkerShape {
  FilledCircle = "filled-circle",
  OutlinedCircle = "outlined-circle",
  X = "x",
}

/**
 * One of the {@link MarkerShape}s that a {@link PathMarker} can take.
 */
export type PathMarkerShape = MarkerShape.FilledCircle | MarkerShape.X;

/**
 * A marker that appears directly along the path of an {@link Arrow}.
 */
export type PathMarker = {
  /**
   * The shape of this {@link PathMarker}.
   */
  shape: PathMarkerShape;

  /**
   * The fraction of the way along the *trimmed* (i.e., after any end
   * markers have been placed) body of the {@link Arrow} to which this
   * {@link PathMarker} belongs at which it is located. Expected to be
   * within [0, 1] and sufficiently distant from all other markers to
   * avoid causing overlap.
   */
  fractionAlongPath: number;
};

/**
 * A single arrow in a {@link DiagramAnimation},
 * defined by its two {@link ArrowEnd}s.
 */
export type Arrow = {
  /**
   * The {@link ArrowEnd} at which this {@link Arrow} begins.
   * Rendered without an arrowhead.
   */
  from: ArrowEnd;

  /**
   * The {@link ArrowEnd} at which this {@link Arrow} terminates.
   * Rendered with an arrowhead.
   *
   * Note that the connection point of this {@link ArrowEnd} is
   * subject to adjustment during rasterization due to snapping.
   *
   * @see `snapDistance` in {@link DiagramAnimationOptions.precision}
   */
  to: ArrowEnd;

  /**
   * The shape of the marker, if any, from which this {@link Arrow} originates.
   * If the `from` {@link ArrowEnd} is an {@link ArrowFreeEnd}, the marker is
   * centered on it. Otherwise, the marker is positioned such that its outer
   * edge aligns with the {@link Point} at which the `from` end of this
   * {@link Arrow} would be located without the marker (after accounting for
   * the round cap on the {@link Arrow}'s body).
   */
  fromMarker?: MarkerShape;

  /**
   * The shape of the marker, if any, to which this {@link Arrow} points.
   * If the `to` {@link ArrowEnd} is an {@link ArrowFreeEnd}, the marker is
   * centered on it. Otherwise, the marker is positioned such that its outer
   * edge aligns with the {@link Point} at which the `to` end of this
   * {@link Arrow} would be located without the marker (after accounting for
   * the round cap on the {@link Arrow}'s body).
   */
  toMarker?: MarkerShape;

  /**
   * The {@link PathMarker}s that appear
   * directly along the path of this {@link Arrow}.
   */
  pathMarkers?: PathMarker[];
};

/**
 * An {@link ArrowEnd} for which the location and
 * connection point have been converted to pixels.
 */
export type RasterizedArrowEnd = {
  /**
   * The location of this {@link RasterizedArrowEnd}, in pixels.
   */
  location: Point;

  /**
   * The connection point of this {@link RasterizedArrowEnd}, in pixels.
   * Coincident with its location if rasterized from an {@link ArrowFreeEnd}.
   */
  connectionPoint: Point;
};

/**
 * A marker for which the position of the center has been converted to pixels.
 */
export type RasterizedMarker = Point & {
  /**
   * The shape of this {@link RasterizedMarker}.
   */
  shape: MarkerShape;
};

/**
 * An {@link Arrow} for which all values have been converted to pixels.
 */
export type RasterizedArrow = {
  /**
   * The rasterized SVG path for the body of this {@link RasterizedArrow}.
   */
  body: string;

  /**
   * The {@link RasterizedMarker}s that belong to this {@link RasterizedArrow}.
   */
  markers: RasterizedMarker[];
};

/**
 * Creates a new {@link ArrowAnchor} for a {@link DiagramAnimation}.
 * @param side the {@link Side} of the bounding box of the display text in the
 *             {@link DiagramAnimation} along which the new {@link ArrowAnchor}
 *             should be located and directly away from which its extension
 *             should run
 * @param fraction the fraction of the way along the specified {@link Side}
 *                 at which the new {@link ArrowAnchor} should be located;
 *                 not constrained to [0, 1]
 * @param depth the length, in ems, of the new {@link ArrowAnchor}'s extension
 * @returns the new {@link ArrowAnchor}
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
 * Creates a new {@link ArrowFreeEnd} for a {@link DiagramAnimation}.
 * @param xFraction the fraction of the way along the width of the display
 *                  text's bounding box at which the new {@link ArrowFreeEnd}
 *                  should be located; not constrained to [0, 1]
 * @param yFraction the fraction of the way along the height of the display
 *                  text's bounding box at which the new {@link ArrowFreeEnd}
 *                  should be located; not constrained to [0, 1]
 * @returns the new {@link ArrowFreeEnd}
 */
export const free = (xFraction: number, yFraction: number): ArrowFreeEnd => ({
  xFraction: xFraction,
  yFraction: yFraction,
});

/**
 * Creates a new {@link PathMarker} for a {@link DiagramAnimation}.
 * @param shape the shape of the new {@link PathMarker}
 * @param fraction the fraction of the way along the *trimmed* (i.e., after any
 *                 end markers have been placed) body of the {@link Arrow} to
 *                 which the new {@link PathMarker} belongs at which the new
 *                 {@link PathMarker} should be located; expected to be within
 *                 [0, 1] and sufficiently distant from all other markers to
 *                 avoid causing overlap
 * @returns the new {@link PathMarker}
 */
export const along = (
  shape: PathMarkerShape,
  fraction: number,
): PathMarker => ({
  shape,
  fractionAlongPath: fraction,
});
