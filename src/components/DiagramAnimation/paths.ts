import { orthogonalPathFinding } from "orthogonal-path-finding";
import { roundCorners } from "svg-round-corners";
import { type TextDimensions } from "@/utils/useTextDimensions";
import {
  CORNER_RADIUS,
  HEAD_LENGTH,
  HEAD_SPREAD,
  OVERLAY_PADDING,
  PATH_PRECISION,
  SNAP_DISTANCE,
} from "./config";
import {
  Side,
  type Arrow,
  type ArrowEnd,
  type Point,
  type RasterizedArrowEnd,
} from "./types";

/**
 * Rasterizes the specified ArrowEnd by computing the pixel values of its
 * coordinates and depth. Note that the rasterized depth is NOT applied
 * to the rasterized coordinates.
 * @param end the ArrowEnd to be rasterized
 * @param textDimensions the TextDimensions of the display text against
 *                       which the specified ArrowEnd is to be rasterized
 * @returns the RasterizedArrowEnd
 */
const rasterizeArrowEnd = (
  end: ArrowEnd,
  textDimensions: TextDimensions,
): RasterizedArrowEnd => {
  if (!("side" in end)) {
    // i.e., if it's an ArrowFreeEnd
    return {
      x: textDimensions.width * end.xPercentage,
      y: textDimensions.height * end.yPercentage,
      side: Side.Top, // side is irrelevant when depth is 0
      depth: 0,
    };
  }

  const rasterizedPadding = OVERLAY_PADDING * textDimensions.em;
  return {
    x:
      end.side === Side.Left
        ? -rasterizedPadding
        : end.side === Side.Right
          ? textDimensions.width + rasterizedPadding
          : textDimensions.width * end.percentageAlongSide,
    y:
      end.side === Side.Top
        ? -rasterizedPadding
        : end.side === Side.Bottom
          ? textDimensions.height + rasterizedPadding
          : textDimensions.height * end.percentageAlongSide,
    side: end.side,
    depth: end.depth * textDimensions.em,
  };
};

// Helper Record for getConnectionPoint
const OUTWARD_UNIT_VECTORS: Record<Side, Point> = {
  [Side.Top]: { x: 0, y: -1 },
  [Side.Bottom]: { x: 0, y: 1 },
  [Side.Left]: { x: -1, y: 0 },
  [Side.Right]: { x: 1, y: 0 },
};

/**
 * Computes the Point at which the specified RasterizedArrowEnd
 * should be connected to its partner to form a complete Arrow path.
 * @param end the RasterizedArrowEnd to find the connection point for
 * @returns the connection Point for the specified RasterizedArrowEnd
 */
const getConnectionPoint = (end: RasterizedArrowEnd): Point => ({
  x: end.x + OUTWARD_UNIT_VECTORS[end.side].x * end.depth,
  y: end.y + OUTWARD_UNIT_VECTORS[end.side].y * end.depth,
});

/**
 * Independently snaps each coordinate of the specified RasterizedArrowEnd
 * to that of the specified Point if the difference between the two is
 * less than the specified epsilon value.
 * @param end the RasterizedArrowEnd whose coordinate(s) may be snapped
 * @param point the Point to which the coordinate(s) of the specified
 *              RasterizedArrowEnd may be snapped
 * @param epsilon the distance below which a coordinate of the specified
 *                RasterizedArrowEnd must be from the corresponding coordinate
 *                of the specified Point in order to be snapped to that
 *                coordinate of that Point
 * @returns the (potentially adjusted) RasterizedArrowEnd
 */
const alignIfClose = (
  end: RasterizedArrowEnd,
  point: Point,
  epsilon: number,
): RasterizedArrowEnd => {
  return {
    ...end,
    x: Math.abs(end.x - point.x) < epsilon ? point.x : end.x,
    y: Math.abs(end.y - point.y) < epsilon ? point.y : end.y,
  };
};

/**
 * Removes repeated Points and Points that lie in the midddle of a straight
 * line from the specified path. Exists to filter all non-corner vertices
 * prior to calling roundCorners().
 * @param path The path whose constituent Points are to be pruned
 * @returns The pruned path
 */
const simplifyPath = (path: Point[]) => {
  const unqiuePoints = path.filter(
    (point, i) =>
      i === 0 || // The first Point is trivially unique
      // At least one coordinate must differ from the previous Point
      point.x !== path[i - 1].x ||
      point.y !== path[i - 1].y,
  );

  const uniqueVertices = unqiuePoints.filter((point, i) => {
    const prev = unqiuePoints[i - 1];
    const next = unqiuePoints[i + 1];
    // The first and last Points are trivially vertices
    if (!prev || !next) return true;
    // No Point can lie directly between both of its adjacent Points
    return !(
      (prev.x === point.x && point.x === next.x) ||
      (prev.y === point.y && point.y === next.y)
    );
  });

  return uniqueVertices;
};

/**
 * Converts the specified Arrow into a rasterized SVG path.
 * @param arrow the Arrow convert into a rasterized SVG patha
 * @param textDimensions the TextDimensions of the display text against
 *                       which the specified Arrow should be rasterized
 * @returns the rasterized SVG path
 */
export const arrowToPath = (
  arrow: Arrow,
  textDimensions: TextDimensions,
): string => {
  // Resolve origin points
  const fromArrowEnd = rasterizeArrowEnd(arrow.from, textDimensions);
  const fromConnectionPoint = getConnectionPoint(fromArrowEnd);

  // Resolve destination points
  const toArrowEnd = alignIfClose(
    rasterizeArrowEnd(arrow.to, textDimensions),
    fromConnectionPoint,
    SNAP_DISTANCE * textDimensions.em,
  );
  const toConnectionPoint = getConnectionPoint(toArrowEnd);

  const displayTextBoundingBox = {
    x: 0,
    y: 0,
    width: textDimensions.width,
    height: textDimensions.height,
  };

  // Resolve connection between origin and destination
  const connection = orthogonalPathFinding(
    fromConnectionPoint,
    toConnectionPoint,
    [displayTextBoundingBox],
    {
      padding: 0, // overrides default of 5px
    },
  ).path ?? [fromConnectionPoint, toConnectionPoint]; // default on failure

  // Join points into path and perform post-processing
  const pathArray = simplifyPath([fromArrowEnd, ...connection, toArrowEnd]);
  return roundCorners(
    pathArray.map(({ x, y }, i) => `${i ? "L" : "M"}${x} ${y}`).join(" "),
    CORNER_RADIUS * textDimensions.em,
    PATH_PRECISION,
  ).path;
};

/**
 * Creates the rasterized SVG path for an arrowhead pointing
 * in the positive x direction with its tip at the origin.
 * The size of the arrowhead is based on the specified TextDimensions.
 * @param textDimensions the TextDimensions of the display text against
 *                       which the arrowhead should be rasterized
 * @returns the rasterized SVG path
 */
export const getArrowheadPath = (textDimensions: TextDimensions): string => {
  const rasterizedHeadLength = HEAD_LENGTH * textDimensions.em;
  const rasterizedHeadSpread = HEAD_SPREAD * rasterizedHeadLength;
  return [
    // Outer tip of one arm
    `M${-rasterizedHeadLength} ${-rasterizedHeadSpread}`,
    // Tip of the arrowhead
    "L0 0",
    // Outer tip of the other arm
    `L${-rasterizedHeadLength} ${rasterizedHeadSpread}`,
  ].join(" ");
};
