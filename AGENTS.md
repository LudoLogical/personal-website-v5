<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Conventions

- Component-specific custom CSS (keyframes, descendant/parent-state selectors, effects that only one component uses) lives in a CSS module colocated with its component, and a component with a module lives in its own folder with an `index.ts` barrel (e.g., `WaveText/`). This keeps components decoupled and reusable. Ordinary styling stays in Tailwind utilities. `globals.css` holds only shared tokens (the daisyUI theme, breakpoints, font) and generic utilities meant to be shared.
  - When callers need to tune a component per breakpoint, expose the tunable as a CSS variable that the module reads with a `var()` fallback, and have callers set it with an arbitrary property (e.g., `sm:[--wave-height:0.15em]`).
  - Pitfall: a module rule and a Tailwind utility of equal specificity resolve by stylesheet order, which follows import order (e.g., `layout.tsx` imports components before `globals.css`). Don't let both set the same property on the same element. For the same reason, give caller-settable variables their defaults as `var()` fallbacks rather than declaring them in the module.
- Before adding or replacing any organization logo in `public/logos/` (shown on `/resume`), read and follow `agents/logos.md`, which covers the spec, sourcing, processing, and provenance of every logo.
- A doc comment may `{@link}` a name that its file doesn't otherwise use. Bring that name into scope with an `import type` (a JSDoc `@import` has no effect in `.ts`/`.tsx` files). `jsdoc/no-undefined-types` counts such imports as used and flags `{@link}`s to names that aren't in scope.
  - Pitfall: TypeScript resolves member links only one level deep (`Type.member`), so for deeper targets, link the deepest resolvable member and name the rest in a code span (e.g., `` `snapDistance` in {@link DiagramAnimationOptions.precision} ``).