@AGENTS.md

# Conventions

- Every external link uses `@/components/ExternalLink`, which annotates it with an outbound-arrow icon.

# Deferred accessibility issues

Raise these during the next comprehensive accessibility assessment.

- `PrimaryNav`'s mobile dropdown (daisyUI's focus-based pattern) has a `div[role="button"]` trigger without `aria-expanded`, and its open `ul[tabIndex={0}]` adds an extra tab stop. Consider a `<details>` element or a real `<button>`.
