import { Side, type Arrow, type ArrowAnchor, type ArrowFreeEnd } from "./types";

// Helper construcor for ArrowAnchor objects
const anchor = (side: Side, percent: number, depth: number): ArrowAnchor => ({
  side,
  percentageAlongSide: percent,
  depth,
});

// Helper constructor for ArrowFreeEnd objects
const free = (xPercentage: number, yPercentage: number): ArrowFreeEnd => ({
  xPercentage,
  yPercentage,
});

/**
 * The Arrows that comprise the DigramAnimation instance.
 */
export const ARROWS: Arrow[] = [
  // Daniel -> "Ludo"
  { from: anchor(Side.Top, 0.15, 0.6), to: anchor(Side.Top, 0.35, 0.6) },
  // DeAnda -> "Ludo"
  { from: anchor(Side.Top, 0.75, 0.6), to: anchor(Side.Top, 0.55, 0.6) },
  // DeAnda -> (Right)
  { from: anchor(Side.Top, 0.95, 0.6), to: free(1.15, -0.6) },

  // Daniel -> (Left)
  { from: anchor(Side.Bottom, 0.05, 0.6), to: free(-0.15, 1.6) },
  // "Ludo" -> DeAnda
  { from: anchor(Side.Bottom, 0.45, 0.6), to: anchor(Side.Bottom, 0.65, 0.6) },
  // DeAnda -> Daniel
  { from: anchor(Side.Bottom, 0.85, 1.2), to: anchor(Side.Bottom, 0.25, 1.2) },

  // Daniel -> (Up, Left)
  { from: anchor(Side.Left, 0.5, 0.5), to: free(-0.15, -0.6) },

  // DeAnda -> (Down, Right)
  { from: anchor(Side.Right, 0.5, 0.5), to: free(1.15, 1.6) },
];

// OPTIONS

// CONSTRUCTION

/**
 * The amount of space, in ems, between the text at the center
 * of a DiagramAnimation and the baseline positions for the
 * diagram elements that surround it.
 */
export const OVERLAY_PADDING = 0.18;

/**
 * The radius, in ems, of the corners of the Arrows in a DiagramAnimation.
 */
export const CORNER_RADIUS = 0.3;

/**
 * The distance, in ems, between two like-dimension coordinates at or below
 * which those coordinates should be made to perfectly align with each other.
 * Exists to prevent rounding errors that would cause orthogonalPathFinding()
 * to introduce tiny imperfections in the paths that it creates.
 */
export const SNAP_DISTANCE = 0.05;

/**
 * The number of decimal places to which path values
 * should be approximated when applying rounded corners.
 */
export const PATH_PRECISION = 2;

// APPEARANCE

/**
 * The width, in ems, of the lines in a DiagramAnimation.
 */
export const STROKE_WIDTH = 0.085;

/**
 * The distance, in ems, between (a) the tips of the arms that form the heads
 * of the Arrows in a DiagramAnimation and (b) the bodies of those Arrows.
 */
export const HEAD_LENGTH = 0.22;

/**
 * The distance away from the body of an Arrow to which the outer tips
 * of the arms that form the head of that Arrow should extend,
 * expressed as a fraction of the HEAD_LENGTH.
 */
export const HEAD_SPREAD = 0.7;

// ANIMATION

/**
 * The duration, in seconds, over which the elements
 * of a DiagramAnimation should grow.
 */
export const FORWARD_DURATION = 0.5;

/**
 * The number of times faster at which the elements
 * of a DiagramAnimation should shrink.
 */
export const BACKWARD_SPEEDUP = 1.8;

/**
 * The duration, in seconds, over which the elements
 * of a DiagramAnimation should fade into view.
 */
export const FADE_IN_DURATION = 0.05;

/**
 * The fraction of the overall duration of a DiagramAnimation over which
 * the arrowheads in that DiagramAnimation should grow into view.
 */
export const HEAD_GROW = 0.5;
