import { useId } from "react";
import { NUM_LEVELS } from "./levels";

/*
 * IMPORTANT:
 * The iceberg is drawn on an SVG canvas with fixed, non-pixel units.
 * It is stretched over the entire sliding strip prior to rasterization,
 * meaning that its aspect ratio is NOT preserved.
 */

/** The width of SVG canvas. */
const CANVAS_W = 312;

/** The height, in canvas units, of one IcebergExplainerText panel. */
const PANEL_H = 120;

/** The height of the entire SVG canvas. */
const CANVAS_H = NUM_LEVELS * PANEL_H;

/**
 * The y-coordinate, in canvas units, at which the iceberg was originally
 * drawn to break the surface of the water (as evidenced by the outline
 * vertices that lie exactly on it). Used as a baseline against which the
 * vertical position of the entire iceberg can be dynamically adjusted.
 */
const WATERLINE = 82;

/**
 * The vertices of the iceberg SVG, written in canvas units.
 */
const POINTS: [number, number][] = [
  // Outline, clockwise from the peak
  [228, 16],
  [244, 34],
  [258, 56],
  [272, 82],
  [292, 128],
  [302, 196],
  [296, 268],
  [304, 336],
  [286, 404],
  [256, 450],
  [210, 472],
  [162, 458],
  [122, 420],
  [102, 352],
  [94, 282],
  [110, 206],
  [140, 132],
  [180, 82],
  [194, 54],
  [210, 36],

  // Interior
  [226, 60],
  [230, 112],
  [262, 160],
  [184, 150],
  [222, 212],
  [270, 236],
  [146, 236],
  [196, 290],
  [258, 310],
  [132, 330],
  [216, 372],
  [268, 378],
  [166, 410],
  [214, 432],
];

/**
 * The triangular facets of the iceberg SVG, written as triples of
 * indices in POINTS. Computed as the Delaunay triangulation of POINTS
 * (excluding everything outside of the outline).
 */
const FACETS: [number, number, number][] = [
  [0, 1, 19],
  [2, 3, 20],
  [17, 18, 20],
  [1, 2, 20],
  [19, 1, 20],
  [18, 19, 20],
  [3, 4, 21],
  [17, 20, 21],
  [20, 3, 21],
  [4, 5, 22],
  [21, 4, 22],
  [16, 17, 23],
  [17, 21, 23],
  [15, 16, 23],
  [21, 22, 23],
  [23, 22, 24],
  [5, 6, 25],
  [22, 5, 25],
  [24, 22, 25],
  [14, 15, 26],
  [15, 23, 26],
  [23, 24, 26],
  [24, 25, 27],
  [26, 24, 27],
  [6, 7, 28],
  [25, 6, 28],
  [27, 25, 28],
  [13, 14, 29],
  [14, 26, 29],
  [26, 27, 29],
  [27, 28, 30],
  [29, 27, 30],
  [7, 8, 31],
  [28, 7, 31],
  [30, 28, 31],
  [12, 13, 32],
  [13, 29, 32],
  [11, 12, 32],
  [29, 30, 32],
  [8, 9, 33],
  [31, 8, 33],
  [30, 31, 33],
  [9, 10, 33],
  [32, 30, 33],
  [10, 11, 33],
  [11, 32, 33],
];

/** The x coordinate of the leftmost point of the iceberg. */
const MIN_X = Math.min(...POINTS.map(([x]) => x)); // i.e., [x, _]; 94

/** The x coordinate of the rightmost point of the iceberg. */
const MAX_X = Math.max(...POINTS.map(([x]) => x)); // i.e., [x, _]; 304

/**
 * Rendering information for a single facet of the iceberg SVG.
 */
type FacetShading = {
  /**
   * The facet's vertices, formatted for an SVG `<polygon>`.
   */
  svgPoints: string;

  /**
   * How brightly the facet should be lit based the horizontal position of its
   * centroid, expressed as a number between 0 (darkest) and 1 (brightest).
   */
  brightness: number;

  /**
   * The ratio between the y coordinate of the facet's centroid and CANVAS_H.
   */
  depth: number;
};

/**
 * FacetShading info is static, so it can be pre-computed for every facet.
 *
 * Brightness values assume evenly-distributed lighting from the left side,
 * but include some noise to ensure that neighboring facets appear distinct.
 */
const ALL_FACET_SHADING: FacetShading[] = FACETS.map((facet, i) => {
  const [centroidX, centroidY] = facet
    // De-reference the vertices
    .map((vertex) => POINTS[vertex])
    // Compute the average x and y coordinates
    .reduce(([accX, accY], [x, y]) => [accX + x / 3, accY + y / 3], [0, 0]);
  const lighting = 1 - (centroidX - MIN_X) / (MAX_X - MIN_X);
  const noise = ((i * 37) % 11) / 10; // Context: MAX_X - MIN_X is 210
  return {
    svgPoints: facet.map((vertex) => POINTS[vertex].join(",")).join(" "),
    brightness: 0.6 * lighting + 0.4 * noise,
    depth: centroidY / CANVAS_H,
  };
});

type IcebergProps = {
  /**
   * The height, in pixels, of the entire sliding strip that the iceberg spans.
   */
  height: number;

  /**
   * The position, in pixels from the top of the sliding strip, of the
   * surface of the water. Used to shift the vertical position of the entire
   * iceberg so that it aligns with the waterline as it was originally drawn
   * to do. If null, the original positioning is used without any shifting.
   */
  waterline: number | null;
};

/**
 * Renders an SVG of a low-poly iceberg that spans the entire sliding strip
 * of an IcebergExplainerText. The facets above the waterline are fully opaque,
 * but those below it become more and more translucent (i.e., fade) with depth.
 */
const Iceberg = ({ height, waterline }: IcebergProps) => {
  // Necessary b/c there could be more than one Iceberg instance on a page
  // and inline SVG IDs apply to the entire page on which they appear
  const id = useId();

  // The specified waterline must be converted to canvas units
  const waterlineY =
    waterline === null ? WATERLINE : (waterline / height) * CANVAS_H;
  const shift = waterlineY - WATERLINE;

  // Renders the entire iceberg, but clips it to the specified region
  const renderFacets = (
    region: "surface" | "submerged",
    fill: (facet: FacetShading) => string, // Formula varies by region
    opacity: (facet: FacetShading) => number, // Formula varies by region
  ) => (
    <g clipPath={`url(#${id}-${region})`}>
      {/* Shifted separately so the clipPath doesn't move */}
      <g transform={`translate(0 ${shift})`}>
        {ALL_FACET_SHADING.map((facet) => (
          <polygon
            key={facet.svgPoints}
            points={facet.svgPoints}
            fill={fill(facet)}
            fillOpacity={opacity(facet)}
            stroke="white"
            strokeOpacity={0.15}
            strokeWidth={0.75}
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </g>
    </g>
  );

  // Shadowed facets above the water are tints of color-blue-300
  const surfaceFill = ({ brightness }: FacetShading) => {
    const percentBlue = Math.round((1 - brightness) * 40);
    return `color-mix(in oklch, var(--color-blue-300) ${percentBlue}%, white)`;
  };

  // Submerged facets are translucent and fade with depth
  const submergedOpacity = ({ brightness, depth }: FacetShading) =>
    (0.06 + 0.2 * brightness) * (1 - 0.6 * depth);

  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
      preserveAspectRatio="none"
      className="absolute inset-x-0 top-0 w-full"
      style={{ height }}
    >
      <defs>
        <clipPath id={`${id}-surface`}>
          <rect width={CANVAS_W} height={waterlineY} />
        </clipPath>
        <clipPath id={`${id}-submerged`}>
          <rect
            y={waterlineY}
            width={CANVAS_W}
            height={CANVAS_H - waterlineY}
          />
        </clipPath>
      </defs>
      {/* The water between the waterline and the bottom of the first panel */}
      <rect
        y={waterlineY}
        width={CANVAS_W}
        height={Math.max(0, PANEL_H - waterlineY)}
        fill="var(--color-blue-400)"
        fillOpacity={0.45}
      />
      {renderFacets("surface", surfaceFill, () => 1)}
      {renderFacets("submerged", () => "white", submergedOpacity)}
      <line
        x1={0}
        x2={CANVAS_W}
        y1={waterlineY}
        y2={waterlineY}
        stroke="white"
        strokeOpacity={0.8}
        strokeWidth={1}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
};

export default Iceberg;
