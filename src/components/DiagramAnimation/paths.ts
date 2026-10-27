import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { orthogonalPathFinding } from "orthogonal-path-finding";
import { roundCorners } from "svg-round-corners";
import type { TextDimensions } from "@/utils/useTextDimensions";
import type {
  default as DiagramAnimation,
  DiagramAnimationOptions,
} from "./DiagramAnimation";
import {
  MarkerShape,
  Side,
  type Arrow,
  type ArrowAnchor,
  type ArrowEnd,
  type PathMarker,
  type Point,
  type RasterizedArrow,
  type RasterizedArrowEnd,
  type RasterizedMarker,
} from "./types";

// Helper Record for rasterizeArrowEnd
const OUTWARD_UNIT_VECTORS: Record<Side, Point> = {
  [Side.Top]: { x: 0, y: -1 },
  [Side.Bottom]: { x: 0, y: 1 },
  [Side.Left]: { x: -1, y: 0 },
  [Side.Right]: { x: 1, y: 0 },
};

/**
 * Rasterizes the specified {@link ArrowEnd} by computing
 * the pixel values of its location and connection point.
 * @param end the {@link ArrowEnd} to be rasterized
 * @param textDimensions the {@link TextDimensions} of the display text against which
 *                       the specified {@link ArrowEnd} should be rasterized
 * @param padding the amount of padding, in ems, that should be applied to
 *                the location of the specified {@link ArrowEnd} iff it is
 *                an {@link ArrowAnchor}
 * @returns the {@link RasterizedArrowEnd}
 */
const rasterizeArrowEnd = (
  end: ArrowEnd,
  textDimensions: TextDimensions,
  padding: number,
): RasterizedArrowEnd => {
  if (!("side" in end)) {
    // i.e., if it's an `ArrowFreeEnd`
    const x = textDimensions.width * end.xFraction;
    const y = textDimensions.height * end.yFraction;
    // Separate objects so each can be modified independently
    return { location: { x, y }, connectionPoint: { x, y } };
  }

  const rasterizedPadding = padding * textDimensions.em;
  const location = {
    x:
      end.side === Side.Left
        ? -rasterizedPadding
        : end.side === Side.Right
          ? textDimensions.width + rasterizedPadding
          : textDimensions.width * end.fractionAlongSide,
    y:
      end.side === Side.Top
        ? -rasterizedPadding
        : end.side === Side.Bottom
          ? textDimensions.height + rasterizedPadding
          : textDimensions.height * end.fractionAlongSide,
  };
  const rasterizedDepth = end.depth * textDimensions.em;
  const connectionPoint = {
    x: location.x + OUTWARD_UNIT_VECTORS[end.side].x * rasterizedDepth,
    y: location.y + OUTWARD_UNIT_VECTORS[end.side].y * rasterizedDepth,
  };
  return { location, connectionPoint };
};

/**
 * Removes repeated and unnecessary co-linear {@link Point}s from the
 * specified `path`. Exists to filter all non-corner vertices prior to
 * calling `roundCorners()`.
 * @param path the path whose constituent {@link Point}s are to be pruned
 * @returns the pruned path
 */
const simplifyPath = (path: Point[]) => {
  const uniquePoints = path.filter(
    (point, i) =>
      i === 0 || // The first `Point` is trivially unique
      // At least one coordinate must differ from the previous `Point`
      point.x !== path[i - 1].x ||
      point.y !== path[i - 1].y,
  );

  const uniqueVertices = uniquePoints.filter((point, i) => {
    const prev = uniquePoints[i - 1];
    const next = uniquePoints[i + 1];
    // The first and last `Point`s are trivially vertices
    if (!prev || !next) return true;
    // No `Point` can be horizontally or vertically
    // co-linear with both of its adjacent `Point`s
    return !(
      (prev.x === point.x && point.x === next.x) ||
      (prev.y === point.y && point.y === next.y)
    );
  });

  return uniqueVertices;
};

/**
 * Moves the specified {@link Point} toward the specified
 * `target` {@link Point} by the specified `distance`.
 *
 * If the distance is large enough to cause the {@link Point} to move past
 * the target, it is snapped to the target instead. If the distance is
 * negative the {@link Point} is moved directly *away* from the target
 * {@link Point} instead.
 *
 * @param point the {@link Point} to be moved
 * @param target the {@link Point} toward which the
 *               other {@link Point} should be moved
 * @param distance the distance, in pixels, by which the
 *                 first {@link Point} should be moved
 * @returns a new {@link Point} representing the result of the movement,
 *          or the original one if it is coincident with the target
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
 * The rasterized dimensions used to render the end and path markers.
 */
type MarkerDimensions = {
  /**
   * Half of the `options.appearance.markerSize`, in pixels.
   */
  halfSize: number;

  /**
   * Half of the `options.appearance.strokeWidth`, in pixels.
   */
  halfStroke: number;

  /**
   * The distance, in pixels, along each axis from the center of an X marker
   * to the center of the round cap at each tip of each of its arms.
   */
  armReach: number;
};

/**
 * Computes the {@link MarkerDimensions} for the
 * specified `emSize` and `appearanceOptions`.
 * @param emSize the size, in pixels, of a single em in the context
 *               relative to which the markers should be rasterized
 * @param appearanceOptions the `options.appearance` for the
 *                          associated {@link DiagramAnimation}
 * @returns the (rasterized) {@link MarkerDimensions}
 */
const getMarkerDimensions = (
  emSize: number,
  appearanceOptions: DiagramAnimationOptions["appearance"],
): MarkerDimensions => {
  const halfSize = (appearanceOptions.markerSize * emSize) / 2;
  const halfStroke = (appearanceOptions.strokeWidth * emSize) / 2;
  // The X's arms run diagonally from and to (+/- `armReach`, +/- `armReach`).
  // Round caps extend those arms by `halfStroke`, so insetting by that amount
  // on both axes keeps the X exactly within the square.
  const armReach = halfSize - halfStroke;
  return { halfSize, halfStroke, armReach };
};

/**
 * Places the end marker(s) (if any) of the specified {@link Arrow} at the
 * appropriate end(s) of the specified `pathArray` and then trims that `pathArray` to create
 * a visible gap (the size of which is given by `appearanceOptions.markerGap`)
 * between it and each placed end marker.
 * @param arrow the {@link Arrow} whose end markers are to be placed
 * @param pathArray the {@link Point}s of the rasterized
 *                  path of the specified {@link Arrow}
 * @param emSize the size, in pixels, of a single em in the context
 *               relative to which the end markers should be rasterized
 * @param appearanceOptions the `options.appearance` for the
 *                          associated {@link DiagramAnimation}
 * @returns the {@link RasterizedMarker}s and trimmed pathArray
 */
const placeEndMarkers = (
  arrow: Arrow,
  pathArray: Point[],
  emSize: number,
  appearanceOptions: DiagramAnimationOptions["appearance"],
): { markers: RasterizedMarker[]; trimmedPathArray: Point[] } => {
  const {
    halfSize: rasterizedHalfSize,
    halfStroke: rasterizedHalfStroke,
    armReach,
  } = getMarkerDimensions(emSize, appearanceOptions);
  const rasterizedMarkerGap = appearanceOptions.markerGap * emSize;

  // How far an ArrowEnd must be from the center of a marker for the visible
  // tip of the former (including its round cap) to align with the outer edge
  // of the latter.
  const offset = rasterizedHalfSize - rasterizedHalfStroke;

  // How far an ArrowEnd must be from the center line of each arm of an
  // X marker for the size of the visible gap between the ArrowEnd and
  // each arm to be given by rasterizedMarkerGap
  const requiredDistanceFromArm =
    rasterizedMarkerGap + 2 * rasterizedHalfStroke;

  // How far an ArrowEnd must be from the center of a marker for the size
  // of the visible gap beween the two to be given by rasterizedMarkerGap
  const distancesToBodyEnd: Record<MarkerShape, number> = {
    [MarkerShape.FilledCircle]:
      rasterizedHalfSize + rasterizedMarkerGap + rasterizedHalfStroke,
    [MarkerShape.OutlinedCircle]:
      rasterizedHalfSize + rasterizedMarkerGap + rasterizedHalfStroke,
    [MarkerShape.X]:
      // Imagine an isosceles triangle in which one side connects two
      // unconnected tips of an X (not accounting for its round caps) and the
      // other two (congruent) sides connect the points at either end of the
      // first side to the (potential) location of an ArrowEnd. The unique side
      // must be of length 2 * armReach. Assume that the lengths of the
      // congruent sides are equal to requiredDistanceFromArm. If the congruent
      // angles are equal to 45 degrees, then the three points of the triangle
      // form a perfect square when combined with the center of the X. Above
      // this 45 degree threshold, the points on the X closest to the ArrowEnd
      // must be its tips; below that threshold, those points must lie partway
      // along the arms of the X instead (and the ArrowEnd must be closer to
      // the X than initially assumed). The threshold is exceeded iff the
      // condition below is false.
      requiredDistanceFromArm * Math.SQRT2 <= 2 * armReach
        ? // The ArrowEnd must be closer to the X than initially assumed.
          // Define a new 45-45-90 triangle such that the lengths congruent
          // sides are still equal to requiredDistanceFromArm and derive the
          // length of the hypotenuse. (This works because the arms of the X
          // and their normals both form 45 degrees with the hypothetical line
          // joining the ArrowEnd and the origin of the X.)
          requiredDistanceFromArm * Math.SQRT2
        : // The tips of the X are closest. Start with armReach and use the
          // Pythagorean theorem to find the amount of extra distance to add.
          armReach + Math.sqrt(requiredDistanceFromArm ** 2 - armReach ** 2),
  };

  const markers: RasterizedMarker[] = [];
  const trimmedPathArray = [...pathArray];

  const placeEndMarker = (
    endIndex: number,
    neighborIndex: number,
    arrowEnd: ArrowEnd,
    shape: MarkerShape,
  ) => {
    // Reads from the original pathArray only so that trimming one end of a
    // path with only two points doesn't affect the trimming of the other end.
    const end = pathArray[endIndex];
    const neighbor = pathArray[neighborIndex];

    // End markers are centered on ArrowFreeEnds, but not on ArrowAnchors.
    // Instead, when an end marker is colocated with an ArrowAnchor, it is
    // shifted such that its outer edge is aligned with the natural end of
    // the body of its parent Arrow.
    const center = "side" in arrowEnd ? moveToward(end, neighbor, offset) : end;
    markers.push({ ...center, shape });

    // Make way for the new marker
    trimmedPathArray[endIndex] = moveToward(
      center,
      neighbor,
      distancesToBodyEnd[shape],
    );
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
 * Computes the positions of the specified {@link PathMarker}s
 * along the specified rasterized SVG path.
 * @param body the rasterized SVG path along which
 *             the {@link PathMarker}s should be placed
 * @param pathMarkers the {@link PathMarker}s to be placed
 * @returns the resulting {@link RasterizedMarker}s
 */
const placePathMarkers = (
  body: string,
  pathMarkers: PathMarker[] = [],
): RasterizedMarker[] => {
  if (pathMarkers.length === 0) return [];
  const rawPath = MotionPathPlugin.stringToRawPath(body);
  return pathMarkers.map(({ shape, fractionAlongPath }) => {
    const { x, y } = MotionPathPlugin.getPositionOnPath(
      rawPath,
      fractionAlongPath,
    );
    return { x, y, shape };
  });
};

/**
 * Converts the specified {@link Arrow} into a rasterized SVG path and
 * computes the positions of the centers of the markers that belong to it.
 * @param arrow the {@link Arrow} to be rasterized
 * @param textDimensions the {@link TextDimensions} of the display text against which
 *                       the specified {@link Arrow} should be rasterized
 * @param appearanceOptions the `options.appearance` for the
 *                          associated {@link DiagramAnimation}
 * @param precisionOptions the `options.precision` for the
 *                         associated {@link DiagramAnimation}
 * @returns the resulting {@link RasterizedArrow}
 */
export const rasterizeArrow = (
  arrow: Arrow,
  textDimensions: TextDimensions,
  appearanceOptions: DiagramAnimationOptions["appearance"],
  precisionOptions: DiagramAnimationOptions["precision"],
): RasterizedArrow => {
  const fromEnd = rasterizeArrowEnd(
    arrow.from,
    textDimensions,
    appearanceOptions.diagramPadding,
  );
  const toEnd = rasterizeArrowEnd(
    arrow.to,
    textDimensions,
    appearanceOptions.diagramPadding,
  );

  // Conditionally snap toEnd.connectionPoint to
  // fromEnd.connectionPoint on each axis independently
  const epsilon = precisionOptions.snapDistance * textDimensions.em;
  const snappedToConnectionPoint = {
    x:
      Math.abs(toEnd.connectionPoint.x - fromEnd.connectionPoint.x) < epsilon
        ? fromEnd.connectionPoint.x
        : toEnd.connectionPoint.x,
    y:
      Math.abs(toEnd.connectionPoint.y - fromEnd.connectionPoint.y) < epsilon
        ? fromEnd.connectionPoint.y
        : toEnd.connectionPoint.y,
  };

  // Preserve pre-existing alignment between the toEnd.location
  // and toEnd.connectionPoint while allowing the snap to change
  // the length of its extension
  if (toEnd.location.x === toEnd.connectionPoint.x) {
    toEnd.location.x = snappedToConnectionPoint.x;
  }
  if (toEnd.location.y === toEnd.connectionPoint.y) {
    toEnd.location.y = snappedToConnectionPoint.y;
  }

  const displayTextBoundingBox = {
    x: 0,
    y: 0,
    width: textDimensions.width,
    height: textDimensions.height,
  };

  // Connect the two connection points
  let route = orthogonalPathFinding(
    fromEnd.connectionPoint,
    snappedToConnectionPoint,
    [displayTextBoundingBox],
    {
      padding: 0, // overrides default of 5px
    },
  ).path;

  // Fall back to a direct connection on failure
  if (route.length === 0) {
    route = [fromEnd.connectionPoint, snappedToConnectionPoint];
  }

  // Join the RasterizedArrowEnd locations and
  // connection route into an initial body path
  const pathArray = simplifyPath([fromEnd.location, ...route, toEnd.location]);

  // Place end markers and trim the body path to make room for them as needed
  const { markers, trimmedPathArray } = placeEndMarkers(
    arrow,
    pathArray,
    textDimensions.em,
    appearanceOptions,
  );

  // Finalize the body path by rounding its corners
  const body = roundCorners(
    trimmedPathArray
      .map(({ x, y }, i) => `${i ? "L" : "M"}${x} ${y}`)
      .join(" "),
    appearanceOptions.cornerRadius * textDimensions.em,
    precisionOptions.pathPrecision,
  ).path;

  // Place any path markers along the finalized body path
  markers.push(...placePathMarkers(body, arrow.pathMarkers));

  return { body, markers };
};

/**
 * Creates the rasterized SVG path for an arrowhead pointing
 * in the positive x direction with its tip at the origin.
 * @param emSize the size, in pixels, of a single em in the context
 *               relative to which the arrowhead should be rasterized
 * @param appearanceOptions the `options.appearance` for the
 *                          associated {@link DiagramAnimation}
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
 * Creates the rasterized SVG paths for each {@link MarkerShape}.
 * Every path is centered on the origin and fits perfectly within
 * a square sized according to the `emSize` and `markerSize` in the
 * specified `appearanceOptions`.
 * @param emSize the size, in pixels, of a single em in the context
 *               relative to which the markers should be rasterized
 * @param appearanceOptions the `options.appearance` for the
 *                          associated {@link DiagramAnimation}
 * @returns a `Record` keyed by {@link MarkerShape}
 *          containing the rasterized SVG paths
 */
export const getMarkerPaths = (
  emSize: number,
  appearanceOptions: DiagramAnimationOptions["appearance"],
): Record<MarkerShape, string> => {
  const {
    halfSize: rasterizedHalfSize,
    halfStroke: rasterizedHalfStroke,
    armReach,
  } = getMarkerDimensions(emSize, appearanceOptions);
  const circle = (r: number) =>
    `M${r} 0 A${r} ${r} 0 1 0 ${-r} 0 A${r} ${r} 0 1 0 ${r} 0 Z`;
  return {
    // Filled circle has no stroke
    [MarkerShape.FilledCircle]: circle(rasterizedHalfSize),
    // Outlined circle has a stroke centered on its radius
    [MarkerShape.OutlinedCircle]: circle(
      rasterizedHalfSize - rasterizedHalfStroke,
    ),
    [MarkerShape.X]: [
      `M${-armReach} ${-armReach} L${armReach} ${armReach}`,
      `M${-armReach} ${armReach} L${armReach} ${-armReach}`,
    ].join(" "),
  };
};
