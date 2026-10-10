@AGENTS.md

# Conventions

- Every external link uses `@/components/ExternalLink`, which annotates it with an outbound-arrow icon.

# Planned migration to CSS modules

Component-specific custom CSS should live in a CSS module colocated with its component (e.g., `AnimatedLogo/AnimatedLogo.module.css`) rather than in `globals.css` or a stylesheet that `globals.css` imports, so that components stay decoupled and reusable. `AnimatedLogo` already follows this; migrate everything else when asked. Keep Tailwind utilities for ordinary styling, and use modules for what Tailwind can't express cleanly (keyframes, descendant/parent-state selectors).

- Candidates (as of 2026-10-10): `WaveText.css` (its `wave-*` utilities are a public API that `page.tsx` uses with responsive variants, so they need a replacement such as an `options` prop), and in `globals.css`, `bob` (only `page.tsx`), `glow-*` (only `page.tsx`), and `engraved` (`SiteFooter` and `layout.tsx`, so it may be better off staying global).
- Pitfall: a module rule and a Tailwind utility of equal specificity resolve by stylesheet order, which follows import order (e.g., `layout.tsx` imports components before `globals.css`). Don't let both set the same property on the same element.

# Deferred accessibility issues

Raise these during the next comprehensive accessibility assessment.

- `PrimaryNav`'s mobile dropdown (daisyUI's focus-based pattern) has a `div[role="button"]` trigger without `aria-expanded`, and its open `ul[tabIndex={0}]` adds an extra tab stop. Consider a `<details>` element or a real `<button>`.
