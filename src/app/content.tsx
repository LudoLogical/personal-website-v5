import {
  Arrow,
  free,
  MarkerShape,
  along,
  anchor,
  Side,
} from "@/components/DiagramAnimation";
import { Levels } from "@/components/IcebergExplainerText";

// General order: highest -> lowest, leftmost -> rightmost
export const arrows: Arrow[] = [
  // (Left) -> (Top)
  {
    from: free(-0.2, 0.5),
    to: free(0.15, -2.2),
    fromMarker: MarkerShape.OutlinedCircle,
  },
  // (Top) -> (Top)
  {
    from: free(0.25, -2.2),
    to: free(0.75, -2.2),
    fromMarker: MarkerShape.OutlinedCircle,
    pathMarkers: [
      along(MarkerShape.FilledCircle, 0.3),
      along(MarkerShape.FilledCircle, 0.65),
    ],
  },
  // DeAnda -> (Up, Right, Down)
  {
    from: anchor(Side.Top, 0.85, 2),
    to: anchor(Side.Top, 1.2, 0),
    toMarker: MarkerShape.FilledCircle,
  },
  // Daniel -> Daniel
  {
    from: anchor(Side.Left, 0.35, 0.9),
    to: anchor(Side.Top, 0.25, 0.9),
    fromMarker: MarkerShape.X,
    pathMarkers: [along(MarkerShape.FilledCircle, 0.575)],
  },
  // DeAnda -> (Up, Left)
  {
    from: anchor(Side.Top, 0.7, 0.9),
    to: free(0.375, -1.1),
    toMarker: MarkerShape.OutlinedCircle,
  },
  // DeAnda -> (Up, Right)
  {
    from: anchor(Side.Top, 0.95, 0.9),
    to: free(1.1, -1.1),
    toMarker: MarkerShape.X,
  },
  // Daniel -> (Down, Left)
  {
    from: anchor(Side.Bottom, 0.05, 0.9),
    to: free(-0.1, 2.1),
    toMarker: MarkerShape.FilledCircle,
  },
  // DeAnda -> "Ludo"
  {
    from: anchor(Side.Bottom, 0.85, 0.9),
    to: anchor(Side.Bottom, 0.45, 0.9),
    pathMarkers: [along(MarkerShape.X, 0.5)],
  },
  // (Bottom Right) -> DeAnda
  {
    from: free(1.1, 2.1),
    to: anchor(Side.Bottom, 0.95, 0.9),
    fromMarker: MarkerShape.OutlinedCircle,
  },
  // Daniel -> (Down, Left, Up)
  {
    from: anchor(Side.Bottom, 0.2, 2),
    to: anchor(Side.Bottom, -0.2, 2),
  },
  // "Ludo" -> (Bottom)
  {
    from: anchor(Side.Bottom, 0.325, 2),
    to: free(0.65, 3.2),
    toMarker: MarkerShape.OutlinedCircle,
    pathMarkers: [along(MarkerShape.FilledCircle, 0.65)],
  },
  // DeAnda -> (Right, Down, Left)
  {
    from: anchor(Side.Right, 0.7, 2),
    to: free(0.75, 3.2),
    fromMarker: MarkerShape.FilledCircle,
    pathMarkers: [along(MarkerShape.FilledCircle, 0.75)],
  },
];

// Ordered from the surface to the deepest level
export const levels: Levels = [
  {
    name: "Events",
    question: "What happened?",
    concepts: ["confused users", "site crashes", "dev slowdowns"],
    depth: "Lv. 1",
  },
  {
    name: "Patterns",
    question: "Why do those events keep happening?",
    concepts: ["unwieldy UI", "traffic spikes", "technical debt"],
    depth: "Lv. 2",
  },
  {
    name: "Structures",
    question: "What bolsters those patterns?",
    concepts: ["design systems", "tech stacks", "policies", "practices"],
    depth: "Lv. 3",
  },
  {
    name: "Mental Models",
    question: "Why are those structures in place?",
    concepts: ["assumptions", "values", "heuristics", "instincts"],
    depth: "Lv. 4",
  },
];

// Tuned to appear visually pleasing against "Sense-Maker"
export const dotPositions = [30, 12, 36, 18, 28, 40, 8, 24, 14, 34, 20].map(
  (y) => y / 48,
);
