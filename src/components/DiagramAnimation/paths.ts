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
  type PathMarker,
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
 *                       which the specified ArrowEnd should be rasterized
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
 * Moves the specified Point toward the specified target Point
 * by the specified distance.
 *
 * If the distance is large enough to cause the point to move past the target,
 * it is snapped to the target instead.
 *
 * If the distance is negative,
 * the point is moved directly *away* from the target Point instead.
 *
 * @param point the Point to be moved
 * @param target the Point toward which the other Point should be moved
 * @param distance the distance, in pixels, by which
 *                 the first Point should be moved
 * @returns a new Point representing the result of the movement
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
 * Places the end marker(s) (if any) of the specified Arrow at the appropriate
 * end(s) of the specified path and then trims that path so that it does not
 * overlap with the marker(s).
 * @param arrow the Arrow whose end markers are to be placed
 * @param pathArray the rasterized path of the specified Arrow
 * @param emSize the size, in pixels, of a single em in the context
 *               relative to which the end markers should be rasterized
 * @param constructionOptions the construction options for
 *                            the associated DiagramAnimation
 * @param appearanceOptions the appearance options for
 *                          the associated DiagramAnimation
 * @returns the RasterizedMarkers and trimmed pathArray
 */
const placeEndMarkers = (
  arrow: Arrow,
  pathArray: Point[],
  emSize: number,
  constructionOptions: DiagramAnimationOptions["construction"],
  appearanceOptions: DiagramAnimationOptions["appearance"],
): { markers: RasterizedMarker[]; trimmedPathArray: Point[] } => {
  const rasterizedMarkerSize = appearanceOptions.markerSize * emSize;
  const rasterizedStroke = appearanceOptions.strokeWidth * emSize;
  const rasterizedMarkerGap = constructionOptions.markerGap * emSize;

  // How far a marker would need to be moved to
  // align its outer edge with an anchor coordinate
  const offset = rasterizedMarkerSize / 2 - rasterizedStroke / 2;
  // How much a path would need to be trimmed to
  // accomodate a marker being placed at one end
  const clearance = rasterizedMarkerSize / 2 + rasterizedMarkerGap;

  const markers: RasterizedMarker[] = [];
  const trimmedPathArray = [...pathArray];

  const placeEndMarker = (
    endIndex: number,
    neighborIndex: number,
    arrowEnd: ArrowEnd,
    shape: MarkerShape,
  ) => {
    // Reads from the original path only so that trimming one end of a path
    // with only two points doesn't affect the trimming of the other end.
    const end = pathArray[endIndex];
    const neighbor = pathArray[neighborIndex];

    // End markers are centered on ArrowFreeEnds, but shifted inward
    // from ArrowAnchors to align their outer edges with the natural
    // ends of their Arrow's body.
    const center = "side" in arrowEnd ? moveToward(end, neighbor, offset) : end;
    markers.push({ ...center, shape });

    // Make way for the new marker
    trimmedPathArray[endIndex] = moveToward(center, neighbor, clearance);
  };

  if (arrow.fromMarker) placeEndMarker(0, 1, arrow.from, arrow.fromMarker);
  if (arrow.toMarker) {
    placeEndMarker(
      pathArray.length - 1,
      pathArray.length - 2,
      arrow.to,
      arrow.toMarker,
    );
  }

  return { markers, trimmedPathArray };
};

/**
 * Computes the positions of the specified PathMarkers along the specified
 * rasterized SVG path.
 * @param body the rasterized SVG path along which
 *             the PathMarkers should be placed
 * @param pathMarkers the PathMarkers to be placed
 * @returns the resulting RasterizedMarkers
 */
const placePathMarkers = (
  body: string,
  pathMarkers: PathMarker[] = [],
): RasterizedMarker[] => {
  if (pathMarkers.length === 0) return [];
  const rawPath = MotionPathPlugin.stringToRawPath(body);
  return pathMarkers.map(({ shape, percentageAlongPath }) => {
    const { x, y } = MotionPathPlugin.getPositionOnPath(
      rawPath,
      percentageAlongPath,
    );
    return { x, y, shape };
  });
};

/**
 * Converts the specified Arrow into a rasterized SVG path and computes
 * the positions of the centers of the markers that belong to it.
 * @param arrow the Arrow to be rasterized
 * @param textDimensions the TextDimensions of the display text against
 *                       which the specified Arrow should be rasterized
 * @param constructionOptions the construction options for
 *                            the associated DiagramAnimation
 * @param appearanceOptions the appearance options for
 *                          the associated DiagramAnimation
 * @returns the resulting RasterizedArrow
 */
export const rasterizeArrow = (
  arrow: Arrow,
  textDimensions: TextDimensions,
  constructionOptions: DiagramAnimationOptions["construction"],
  appearanceOptions: DiagramAnimationOptions["appearance"],
): RasterizedArrow => {
  // Resolve origin points
  const fromArrowEnd = rasterizeArrowEnd(
    arrow.from,
    textDimensions,
    constructionOptions.diagramPadding,
  );
  const fromConnectionPoint = getConnectionPoint(fromArrowEnd);

  // Resolve destination points
  const toArrowEnd = alignIfClose(
    rasterizeArrowEnd(
      arrow.to,
      textDimensions,
      constructionOptions.diagramPadding,
    ),
    fromConnectionPoint,
    constructionOptions.snapDistance * textDimensions.em,
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

  // Join all resolved points into an initial body path
  const pathArray = simplifyPath([fromArrowEnd, ...connection, toArrowEnd]);

  // Place end markers and trim the body path to make room for them as needed
  const { markers, trimmedPathArray } = placeEndMarkers(
    arrow,
    pathArray,
    textDimensions.em,
    constructionOptions,
    appearanceOptions,
  );

  // Finalize the body path by rounding its corners
  const body = roundCorners(
    trimmedPathArray
      .map(({ x, y }, i) => `${i ? "L" : "M"}${x} ${y}`)
      .join(" "),
    constructionOptions.cornerRadius * textDimensions.em,
    constructionOptions.pathPrecision,
  ).path;

  // Place any path markers along the finalized body path
  markers.push(...placePathMarkers(body, arrow.pathMarkers));

  return { body, markers };
};

/**
 * Creates the rasterized SVG path for an arrowhead pointing
 * in the positive x direction with its tip at the origin.
 * The size of the arrowhead is based on the specified TextDimensions.
 * @param emSize the size, in pixels, of a single em in the context
 *               relative to which the end markers should be rasterized
 * @param appearanceOptions the appearance options for
 *                          the associated DiagramAnimation
 * @returns the rasterized SVG path
 */
export const getArrowheadPath = (
  emSize: number,
  appearanceOptions: DiagramAnimationOptions["appearance"],
): string => {
  const rasterizedHeadLength = appearanceOptions.headLength * emSize;
  const rasterizedHeadSpread =
    appearanceOptions.headSpread * rasterizedHeadLength;
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
 * Creates the rasterized SVG paths for each MarkerShape.
 * Every path is centered on the origin and fits perfectly
 * within a square sized according to the specified emSize
 * and the markerSize in the specified appearanceOptions.
 * @param emSize the size, in pixels, of a single em in the context
 *               relative to which the end markers should be rasterized
 * @param appearanceOptions the appearance options for
 *                          the associated DiagramAnimation
 * @returns a Record keyed by MarkerShape containing the rasterized SVG paths
 */
export const getMarkerPaths = (
  emSize: number,
  appearanceOptions: DiagramAnimationOptions["appearance"],
): Record<MarkerShape, string> => {
  const rasterizedHalfSize = (appearanceOptions.markerSize * emSize) / 2;
  const rasterizedHalfStroke = (appearanceOptions.strokeWidth * emSize) / 2;
  const circle = (r: number) =>
    `M${r} 0 A${r} ${r} 0 1 0 ${-r} 0 A${r} ${r} 0 1 0 ${r} 0 Z`;
  // Round caps extend armLength by rasterizedHalfStroke
  const armLength = rasterizedHalfSize - rasterizedHalfStroke;
  return {
    // Filled circle has no stroke
    [MarkerShape.FilledCircle]: circle(rasterizedHalfSize),
    // Outlined circle has a stroke centered on its radius
    [MarkerShape.OutlinedCircle]: circle(
      rasterizedHalfSize - rasterizedHalfStroke,
    ),
    [MarkerShape.X]: [
      `M${-armLength} ${-armLength} L${armLength} ${armLength}`,
      `M${-armLength} ${armLength} L${armLength} ${-armLength}`,
    ].join(" "),
  };
};
