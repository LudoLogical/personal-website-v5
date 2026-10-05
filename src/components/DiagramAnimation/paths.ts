import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { orthogonalPathFinding } from "orthogonal-path-finding";
import { roundCorners } from "svg-round-corners";
import { type TextDimensions } from "@/utils/useTextDimensions";
import { type DiagramAnimationOptions } from "./DiagramAnimation";
import {
  MarkerShape,
  Side,
  type Arrow,
  type ArrowEnd,
  type Point,
  type RasterizedArrow,
  type RasterizedArrowEnd,
  type RasterizedMarker,
} from "./types";

/**
 * Rasterizes the specified ArrowEnd by computing the pixel values of its
 * coordinates and depth. Note that the rasterized depth is NOT applied
 * to the rasterized coordinates.
 * @param end the ArrowEnd to be rasterized
 * @param textDimensions the TextDimensions of the display text against
 *                       which the specified ArrowEnd is to be rasterized
 * @param padding the amount of padding, in ems, that should be applied to
 *                the specified ArrowEnd if and only if it is an ArrowAnchor
 * @returns the RasterizedArrowEnd
 */
const rasterizeArrowEnd = (
  end: ArrowEnd,
  textDimensions: TextDimensions,
  padding: number,
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

  const rasterizedPadding = padding * textDimensions.em;
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
 * Moves the specified Point toward the specified target Point by the
 * specified distance, without moving it past the target Point.
 * A negative distance moves the Point directly away from the target Point.
 * @param point the Point to be moved
 * @param target the Point toward which the specified Point should be moved
 * @param distance the distance, in pixels, by which the Point should be moved
 * @returns the moved Point
 */
const moveToward = (point: Point, target: Point, distance: number): Point => {
  const dx = target.x - point.x;
  const dy = target.y - point.y;
  const length = Math.hypot(dx, dy);
  if (!length) return point;
  const fraction = Math.min(distance / length, 1);
  return { x: point.x + dx * fraction, y: point.y + dy * fraction };
};

/**
 * Converts the specified Arrow into a rasterized SVG path and computes
 * the positions of the centers of the markers that belong to it.
 * @param arrow the Arrow to be rasterized
 * @param textDimensions the TextDimensions of the display text against
 *                       which the specified Arrow should be rasterized
 * @param options the construction options for the associated DiagramAnimation
 * @param appearance the appearance options for the associated DiagramAnimation
 * @returns the RasterizedArrow
 */
export const rasterizeArrow = (
  arrow: Arrow,
  textDimensions: TextDimensions,
  options: DiagramAnimationOptions["construction"],
  appearance: DiagramAnimationOptions["appearance"],
): RasterizedArrow => {
  // Resolve origin points
  const fromArrowEnd = rasterizeArrowEnd(
    arrow.from,
    textDimensions,
    options.diagramPadding,
  );
  const fromConnectionPoint = getConnectionPoint(fromArrowEnd);

  // Resolve destination points
  const toArrowEnd = alignIfClose(
    rasterizeArrowEnd(arrow.to, textDimensions, options.diagramPadding),
    fromConnectionPoint,
    options.snapDistance * textDimensions.em,
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

  // Join points into path
  const pathArray = simplifyPath([fromArrowEnd, ...connection, toArrowEnd]);

  // Extend ArrowFreeEnds that have markers outward along the path by the
  // same distance that their markers are about to be shifted inward (see
  // below) so that those markers end up centered on the ArrowFreeEnds
  const markerSize = appearance.markerSize * textDimensions.em;
  const halfStroke = (appearance.strokeWidth * textDimensions.em) / 2;
  const markerOffset = markerSize / 2 - halfStroke;
  if (arrow.fromMarker && !("side" in arrow.from)) {
    pathArray[0] = moveToward(pathArray[0], pathArray[1], -markerOffset);
  }
  if (arrow.toMarker && !("side" in arrow.to)) {
    pathArray[pathArray.length - 1] = moveToward(
      pathArray[pathArray.length - 1],
      pathArray[pathArray.length - 2],
      -markerOffset,
    );
  }

  const first = pathArray[0];
  const second = pathArray[1];
  const last = pathArray[pathArray.length - 1];
  const penultimate = pathArray[pathArray.length - 2];

  // Shift end markers inward along the path so that their outer edges align
  // with the round caps (or arrowhead tips) that would otherwise be rendered
  // at the ends of the path, keeping all Arrow ends aligned with each other
  const markers: RasterizedMarker[] = [];
  if (arrow.fromMarker) {
    const center = moveToward(first, second, markerOffset);
    markers.push({ ...center, shape: arrow.fromMarker });
  }
  if (arrow.toMarker) {
    const center = moveToward(last, penultimate, markerOffset);
    markers.push({ ...center, shape: arrow.toMarker });
  }

  // Trim the path so that it stops short of the inner edges of any end markers
  const trim = markerSize - halfStroke + options.markerGap * textDimensions.em;
  if (arrow.fromMarker) pathArray[0] = moveToward(first, second, trim);
  if (arrow.toMarker) {
    pathArray[pathArray.length - 1] = moveToward(last, penultimate, trim);
  }

  // Perform post-processing
  const body = roundCorners(
    pathArray.map(({ x, y }, i) => `${i ? "L" : "M"}${x} ${y}`).join(" "),
    options.cornerRadius * textDimensions.em,
    options.pathPrecision,
  ).path;

  // Place path markers along the visible (i.e., trimmed) path
  if (arrow.pathMarkers?.length) {
    const rawPath = MotionPathPlugin.stringToRawPath(body);
    for (const { shape, percentageAlongPath } of arrow.pathMarkers) {
      const { x, y } = MotionPathPlugin.getPositionOnPath(
        rawPath,
        percentageAlongPath,
      );
      markers.push({ x, y, shape });
    }
  }

  return { body, markers };
};

/**
 * Creates the rasterized SVG path for an arrowhead pointing
 * in the positive x direction with its tip at the origin.
 * The size of the arrowhead is based on the specified TextDimensions.
 * @param textDimensions the TextDimensions of the display text against
 *                       which the arrowhead should be rasterized
 * @param options the appearance options for the associated DiagramAnimation
 * @returns the rasterized SVG path
 */
export const getArrowheadPath = (
  textDimensions: TextDimensions,
  options: DiagramAnimationOptions["appearance"],
): string => {
  const rasterizedHeadLength = options.headLength * textDimensions.em;
  const rasterizedHeadSpread = options.headSpread * rasterizedHeadLength;
  return [
    // Outer tip of one arm
    `M${-rasterizedHeadLength} ${-rasterizedHeadSpread}`,
    // Tip of the arrowhead
    "L0 0",
    // Outer tip of the other arm
    `L${-rasterizedHeadLength} ${rasterizedHeadSpread}`,
  ].join(" ");
};

/**
 * Creates the rasterized SVG paths for each MarkerShape, centered on the
 * origin. Every path fits within a square whose sides are the markerSize
 * (accounting for the strokeWidth where applicable).
 * The size of each path is based on the specified TextDimensions.
 * @param textDimensions the TextDimensions of the display text against
 *                       which the paths should be rasterized
 * @param options the appearance options for the associated DiagramAnimation
 * @returns the rasterized SVG paths, keyed by MarkerShape
 */
export const getMarkerPaths = (
  textDimensions: TextDimensions,
  options: DiagramAnimationOptions["appearance"],
): Record<MarkerShape, string> => {
  const halfSize = (options.markerSize * textDimensions.em) / 2;
  const halfStroke = (options.strokeWidth * textDimensions.em) / 2;
  const circle = (r: number) =>
    `M${r} 0 A${r} ${r} 0 1 0 ${-r} 0 A${r} ${r} 0 1 0 ${r} 0 Z`;
  const armLength = halfSize - halfStroke; // round caps extend by halfStroke
  return {
    // Filled circles are rendered without a stroke
    [MarkerShape.FilledCircle]: circle(halfSize),
    // Outlined circles' strokes are centered on their radii
    [MarkerShape.OutlinedCircle]: circle(halfSize - halfStroke),
    [MarkerShape.X]: [
      `M${-armLength} ${-armLength} L${armLength} ${armLength}`,
      `M${-armLength} ${armLength} L${armLength} ${-armLength}`,
    ].join(" "),
  };
};
