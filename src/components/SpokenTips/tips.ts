// Shown one at a time (and at random) in the speech bubble that appears while
// the avatar on the home page is hovered, in the style of loading screen tips
const tipsByCategory = {
  // Could have come straight from a real video game
  authentic: [
    "Blocking at the last possible moment staggers most enemies, leaving them open to a counterattack.",
    "Some walls look a little different from the rest. Try interacting with them.",
    "Resting at a campfire restores your health, but it also respawns most of the enemies in the area.",
    "Selling items you don't need is a quick way to earn gold early on. Check your inventory often!",
    "Headshots deal double damage, but armored enemies may still take a few extra hits.",
    "Your companions remember the choices you make. Choose wisely.",
  ],

  // Solid advice about the real world
  practical: [
    "Back up anything you can't afford to lose. Then check that the backup actually works.",
    "Stuck on a hard problem? Explaining it out loud, even to a rubber duck, often reveals the answer.",
    "Compound interest rewards those who start early. Even small contributions add up over time.",
    "A short walk can do more for your focus than another cup of coffee.",
    "Write down why you made a decision, not just what you decided. Future you will thank you.",
    "Sleep is a stat multiplier. Skipping it debuffs everything else.",
  ],

  // Ridiculous parodies of real video game tips
  parody: [
    "Enemies can't hurt you while the game is paused. Consider never unpausing.",
    "Crouching repeatedly in front of other players is a universal sign of respect.",
    "If a room has full ammo, full health, and a save point, everything is fine. Nothing bad is about to happen.",
    "Hoarding every potion until the final boss is a valid strategy. Actually using them is not.",
    "You can carry 47 swords, 300 cabbages, and a wardrobe, but not one more rock.",
    "Talk to every villager twice to hear their second line of dialogue, which is the same as their first.",
  ],

  // Ridiculous "advice" about the real world
  absurd: [
    "Doors marked PUSH are merely suggestions. Pulling harder shows initiative.",
    "Can't find your keys? Try reloading your last save from before you lost them.",
    "Forgetting why you walked into a room means you've entered a new area. Wait for its title to appear.",
    "Vegetables restore 5 HP. An entire cake restores morale, which is far more important.",
    "To fall asleep faster, simply skip the night by interacting with your bed.",
    "Houseplants grow faster if you whisper encouraging patch notes to them.",
  ],

  // Genuine hints about this website's microinteractions
  hints: [
    "Hover over (or tap) my name to see how all of its pieces connect.",
    "Every letter in “Software Engineer” hides a secret number. Hover over each one to reveal it.",
    "Slowly scrub across “Systems Thinker” to dive deeper below the surface.",
    "Hover over “Sense-Maker” (or Tab to it with your keyboard) to connect the dots.",
    "The navigation bar ducks out of the way as you scroll down. Scroll back up to summon it.",
    "Scroll to the very bottom of the page to find what's engraved beneath it.",
    "Leave and come back to hear another tip. There are plenty more where this came from!",
  ],
};

export const tips = Object.values(tipsByCategory).flat();
