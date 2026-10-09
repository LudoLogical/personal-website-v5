import { ArrowDown } from "lucide-react";
import Image from "next/image";
import { twMerge } from "tailwind-merge";
import { loadingTips } from "@/app/loadingTips";
import AvatarTips from "@/components/AvatarTips";
import CharCodeText from "@/components/CharCodeText";
import ConnectingDotsText from "@/components/ConnectingDotsText";
import DiagramAnimation, {
  MarkerShape,
  Side,
  along,
  anchor,
  free,
  type Arrow,
} from "@/components/DiagramAnimation";
import IcebergExplainerText, {
  type Levels,
} from "@/components/IcebergExplainerText";
import WaveText from "@/components/WaveText";

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

// Ordered from the surface to the deepest level
const levels: Levels = [
  {
    name: "Events",
    question: "What happened?",
    concepts: ["confused users", "site crashes", "dev slowdowns"],
    depth: "0 m",
  },
  {
    name: "Patterns",
    question: "Why do those events keep happening?",
    concepts: ["unwieldy UI", "traffic spikes", "technical debt"],
    depth: "-30 m",
  },
  {
    name: "Structures",
    question: "What bolsters those patterns?",
    concepts: ["design systems", "tech stacks", "policies", "practices"],
    depth: "-90 m",
  },
  {
    name: "Mental Models",
    question: "Why are those structures in place?",
    concepts: ["assumptions", "values", "heuristics", "instincts"],
    depth: "-200 m",
  },
];

// Hand-tuned so that the dots zig-zag across "Sense-Maker"
const dotPositions = [30, 12, 36, 18, 28, 40, 8, 24, 14, 34, 20].map(
  (y) => y / 48,
);

// Applied to everything in the intro but the name itself
const fadeWhileDiagramActive =
  "transition-opacity duration-300 group-has-data-active/intro:pointer-events-none group-has-data-active/intro:opacity-15";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col overflow-hidden">
      {/* Fills the viewport (plus the page's rounded bottom corners) so that
          everything below starts out of view; the extra bottom padding offsets
          the corners to keep the lockup centered with respect to the viewport */}
      <section className="flex min-h-[calc(100svh+var(--radius-paper))] items-center justify-center px-6 pt-24 pb-[calc(--spacing(24)+var(--radius-paper))]">
        {/* Everything but the name fades out while its diagram is active.
            The avatar and intro text grow in steps at each breakpoint, sized
            so that everything (including the diagram, which extends past the
            text while active) fits within the narrowest viewport of each */}
        <div className="group/intro flex flex-col items-start gap-8 md:flex-row md:items-center md:gap-14 lg:gap-16 xl:gap-20">
          <div className={twMerge("shrink-0", fadeWhileDiagramActive)}>
            <AvatarTips tips={loadingTips}>
              <Image
                src="/avatar.png"
                alt='Illustrated portrait of Daniel "Ludo" DeAnda'
                width={288}
                height={288}
                sizes="(min-width: 1152px) 320px, (min-width: 896px) 272px, (min-width: 768px) 240px, (min-width: 640px) 96px, (min-width: 512px) 80px, 64px"
                preload
                className="block size-16 rounded-full glow-secondary [--glow-strength:3] xs:size-20 sm:size-24 md:size-60 lg:size-68 xl:size-80"
              />
            </AvatarTips>
          </div>
          <div className="flex flex-col items-start gap-8 md:gap-6 xl:gap-8">
            <div className="flex flex-col gap-2 text-xl leading-none font-bold whitespace-nowrap xxs:text-2xl xs:text-3xl sm:text-4xl md:text-3xl lg:text-4xl xl:text-5xl">
              <p
                className={twMerge(
                  "text-sm font-normal xs:text-base lg:text-lg",
                  fadeWhileDiagramActive,
                )}
              >
                <WaveText
                  text="Hello, my name is"
                  className="sm:wave-height-[0.15em] lg:wave-height-[0.2em]"
                />
              </p>
              <div className="my-1 flex flex-col gap-2">
                <DiagramAnimation
                  text='Daniel "Ludo" DeAnda.'
                  arrows={arrows}
                  className="w-fit text-primary"
                />
                <div
                  className={twMerge(
                    "flex flex-col gap-2",
                    fadeWhileDiagramActive,
                  )}
                >
                  <div className="flex flex-nowrap">
                    <span className="opacity-50">I&apos;m a&nbsp;</span>
                    <CharCodeText text="Software Engineer" />
                    <span className="opacity-50">,</span>
                  </div>
                  <div className="flex flex-nowrap">
                    <IcebergExplainerText
                      text="Systems Thinker"
                      levels={levels}
                    />
                    <span className="opacity-50">, and</span>
                  </div>
                  <div className="flex flex-nowrap">
                    <ConnectingDotsText
                      text="Sense-Maker"
                      dotPositions={dotPositions}
                    />
                    <span className="opacity-50">.</span>
                  </div>
                </div>
              </div>
            </div>
            {/* Kept separate from the button so that its transitions remain */}
            <div className={fadeWhileDiagramActive}>
              <a
                href="#wonderful"
                className="btn rounded-lg glow-primary btn-primary btn-sm [--glow-strength:1] xs:btn-md xl:btn-lg"
              >
                Show me something wonderful
                <ArrowDown
                  aria-hidden
                  className="size-3 xs:ml-0.5 xs:size-4 xl:ml-1 xl:size-5"
                />
              </a>
            </div>
          </div>
        </div>
      </section>
      {/* Future sections go here; the call to action scrolls to this point */}
      <div id="wonderful" />
    </main>
  );
}
