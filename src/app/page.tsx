import DiagramAnimation, {
  Side,
  anchor,
  free,
  type Arrow,
} from "@/components/DiagramAnimation";

const arrows: Arrow[] = [
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
