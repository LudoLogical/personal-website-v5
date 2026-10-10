@AGENTS.md

# Conventions

- Every external link uses `@/components/ExternalLink`, which annotates it with an outbound-arrow icon.
- Component-specific custom CSS (keyframes, descendant/parent-state selectors, effects that only one component uses) lives in a CSS module colocated with its component, and a component with a module lives in its own folder with an `index.ts` barrel (e.g., `WaveText/`). This keeps components decoupled and reusable. Ordinary styling stays in Tailwind utilities. `globals.css` holds only shared tokens (the daisyUI theme, breakpoints, font) and generic utilities meant to be shared.
  - When callers need to tune a component per breakpoint, expose the tunable as a CSS variable that the module reads with a `var()` fallback, and have callers set it with an arbitrary property (e.g., `sm:[--wave-height:0.15em]`).
  - Pitfall: a module rule and a Tailwind utility of equal specificity resolve by stylesheet order, which follows import order (e.g., `layout.tsx` imports components before `globals.css`). Don't let both set the same property on the same element. For the same reason, give caller-settable variables their defaults as `var()` fallbacks rather than declaring them in the module.
  