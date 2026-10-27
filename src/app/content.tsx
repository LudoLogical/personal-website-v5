import {
  along,
  anchor,
  free,
  MarkerShape,
  Side,
  type Arrow,
} from "@/components/DiagramAnimation";
import type { Levels } from "@/components/IcebergExplainerText";

// TODO: Replace AI-generated tips with hand-written ones
export const TIPS = [
  // Genuine (video games)
  "Blocking at the last possible moment staggers most enemies, leaving them open to a counterattack.",
  "Some walls look a little different from the rest. Try interacting with them.",
  "Resting at a campfire restores your health, but it also respawns most of the enemies in the area.",
  "Selling items you don't need is a quick way to earn gold early on. Check your inventory often!",
  "Headshots deal double damage, but armored enemies may still take a few extra hits.",
  "Your companions remember the choices you make. Choose wisely.",

  // Genuine (real world)
  "Back up anything you can't afford to lose. Then check that the backup actually works.",
  "Stuck on a hard problem? Explaining it out loud, even to a rubber duck, often reveals the answer.",
  "Compound interest rewards those who start early. Even small contributions add up over time.",
  "A short walk can do more for your focus than another cup of coffee.",
  "Write down why you made a decision, not just what you decided. Future you will thank you.",
  "Sleep is a stat multiplier. Skipping it debuffs everything else.",

  // Absurd (video games)
  "Enemies can't hurt you while the game is paused. Consider never unpausing.",
  "Crouching repeatedly in front of other players is a universal sign of respect.",
  "If a room has full ammo, full health, and a save point, everything is fine. Nothing bad is about to happen.",
  "Hoarding every potion until the final boss is a valid strategy. Actually using them is not.",
  "You can carry 47 swords, 300 cabbages, and a wardrobe, but not one more rock.",
  "Talk to every villager twice to hear their second line of dialogue, which is the same as their first.",

  // Absurd (real world)
  "Doors marked PUSH are merely suggestions. Pulling harder shows initiative.",
  "Can't find your keys? Try reloading your last save from before you lost them.",
  "Forgetting why you walked into a room means you've entered a new area. Wait for its title to appear.",
  "Vegetables restore 5 HP. An entire cake restores morale, which is far more important.",
  "To fall asleep faster, simply skip the night by interacting with your bed.",
  "Houseplants grow faster if you whisper encouraging patch notes to them.",

  // Hints about microinteractions
  "Hover over (or tap) my name to see how all of its pieces connect.",
  'Every letter in "Software Engineer" hides a secret number. Hover over each one to reveal it.',
  'Slowly scrub across "Systems Thinker" to dive deeper below the surface.',
  'Hover over "Sense-Maker" (or Tab to it with your keyboard) to connect the dots.',
  "The navigation bar ducks out of the way as you scroll down. Scroll back up to summon it.",
  "Scroll to the very bottom of the page to find what's engraved beneath it.",
  "Leave and come back to hear another tip. There are plenty more where this came from!",
];

// General order: highest -> lowest, leftmost -> rightmost
export const ARROWS: Arrow[] = [
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
export const LEVELS: Levels = [
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
export const DOT_POSITIONS = [30, 12, 36, 18, 28, 40, 8, 24, 14, 34, 20].map(
  (y) => y / 48,
);
