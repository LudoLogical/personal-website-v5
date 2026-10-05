import DiagramAnimation, {
  MarkerShape,
  Side,
  along,
  anchor,
  free,
  type Arrow,
} from "@/components/DiagramAnimation";

// General order: highest -> lowest, leftmost -> rightmost
const arrows: Arrow[] = [
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

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-48 overflow-hidden py-24">
      <DiagramAnimation
        text='Daniel "Ludo" DeAnda'
        arrows={arrows}
        className="text-[clamp(1.5rem,6vw,3rem)] font-bold text-primary"
      />
    </main>
  );
}
