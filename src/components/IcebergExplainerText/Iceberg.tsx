import { useId } from "react";
import { TIER_COUNT } from "./types";

// The iceberg is drawn in a fixed "art space" whose units are NOT pixels.
// The SVG stretches that space over the entire sliding strip without
// preserving its aspect ratio, so the art always spans every panel exactly.

/** The width of the art space, in art units. */
const ICE_W = 312;

/** The height of one panel in the art space, in art units. */
const ICE_PANEL_H = 120;

/** The height of the art space, in art units. Spans every panel. */
const ICE_H = TIER_COUNT * ICE_PANEL_H;

/**
 * The y-coordinate, in art units, at which the iceberg was drawn to break
 * the surface of the water. Note the outline vertices that lie exactly on it.
 * The iceberg is shifted vertically so that this line meets the actual
 * waterline.
 */
const ICE_WATERLINE = 82;

/**
 * The vertices of the low-poly iceberg, in art units.
 * The tip pokes above the waterline in the first panel,
 * and the bulk sinks through the rest.
 */
const ICE_POINTS: [number, number][] = [
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
 * The triangular facets of the iceberg, as triples of indices into ICE_POINTS.
 * Computed as the Delaunay triangulation of ICE_POINTS, clipped to the outline.
 */
const ICE_FACETS: [number, number, number][] = [
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

/** The x-coordinate, in art units, of the leftmost point of the iceberg. */
const ICE_MIN_X = Math.min(...ICE_POINTS.map(([x]) => x));

/** The x-coordinate, in art units, of the rightmost point of the iceberg. */
const ICE_MAX_X = Math.max(...ICE_POINTS.map(([x]) => x));

/**
 * The precomputed rendering information for each facet of the iceberg.
 * Shading fakes lighting from the upper left, plus a little per-facet jitter
 * so that neighbouring facets read as distinct planes.
 */
const ICE_FACET_SHADING = ICE_FACETS.map((facet, i) => {
  const [centroidX, centroidY] = facet
    .map((vertex) => ICE_POINTS[vertex])
    .reduce(([ax, ay], [bx, by]) => [ax + bx / 3, ay + by / 3], [0, 0]);
  const lit = 1 - (centroidX - ICE_MIN_X) / (ICE_MAX_X - ICE_MIN_X);
  const jitter = ((i * 37) % 11) / 10;
  return {
    /** The facet's vertices, formatted for an SVG `<polygon>`. */
    points: facet.map((vertex) => ICE_POINTS[vertex].join(",")).join(" "),
    /** How brightly lit the facet is, from 0 (darkest) to 1 (brightest). */
    shade: 0.6 * lit + 0.4 * jitter,
    /** How deep the facet lies, from 0 (top) to 1 (bottom). */
    depth: centroidY / ICE_H,
  };
});

type FacetShading = (typeof ICE_FACET_SHADING)[number];

type IcebergProps = {
  /**
   * The height, in pixels, of the sliding strip that the iceberg spans.
   */
  height: number;

  /**
   * The position, in pixels from the top of the sliding strip, of the
   * surface of the water, or null to use the position at which the iceberg
   * was originally drawn to break the surface.
   */
  waterline: number | null;
};

/**
 * Renders a low-poly iceberg that spans the entire sliding strip of an
 * IcebergExplainerText. Above the waterline, the ice is solid. Below it,
 * the ice is translucent and fades with depth.
 */
const Iceberg = ({ height, waterline }: IcebergProps) => {
  const id = useId();

  // Converted from pixels into art units
  const waterlineY =
    waterline === null ? ICE_WATERLINE : (waterline / height) * ICE_H;
  const shift = waterlineY - ICE_WATERLINE;

  /**
   * Renders every facet of the iceberg, clipped to the specified region.
   * @param clip the suffix of the ID of the clipPath to be applied
   * @param fill computes the fill color of the specified facet
   * @param opacity computes the fill opacity of the specified facet
   * @returns the rendered facets
   */
  const renderFacets = (
    clip: "above" | "below",
    fill: (facet: FacetShading) => string,
    opacity: (facet: FacetShading) => number,
  ) => (
    <g clipPath={`url(#${id}-${clip})`}>
      {/* Shifted separately so that the clipPath stays put */}
      <g transform={`translate(0 ${shift})`}>
        {ICE_FACET_SHADING.map((facet) => (
          <polygon
            key={facet.points}
            points={facet.points}
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

  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${ICE_W} ${ICE_H}`}
      preserveAspectRatio="none"
      className="absolute inset-x-0 top-0 w-full"
      style={{ height }}
    >
      <defs>
        <clipPath id={`${id}-above`}>
          <rect width={ICE_W} height={waterlineY} />
        </clipPath>
        <clipPath id={`${id}-below`}>
          <rect y={waterlineY} width={ICE_W} height={ICE_H - waterlineY} />
        </clipPath>
      </defs>
      {/* Water between the waterline and the bottom of the first panel */}
      <rect
        y={waterlineY}
        width={ICE_W}
        height={Math.max(0, ICE_PANEL_H - waterlineY)}
        fill="var(--color-blue-400)"
        fillOpacity={0.45}
      />
      {/* Solid ice above water, shadowed facets tinted blue */}
      {renderFacets(
        "above",
        ({ shade }) =>
          `color-mix(in oklch, var(--color-blue-300) ${Math.round((1 - shade) * 40)}%, white)`,
        () => 1,
      )}
      {/* Submerged ice: translucent, fading with depth */}
      {renderFacets(
        "below",
        () => "white",
        ({ shade, depth }) => (0.06 + 0.2 * shade) * (1 - 0.6 * depth),
      )}
      {/* Surface of the water */}
      <line
        x1={0}
        x2={ICE_W}
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
