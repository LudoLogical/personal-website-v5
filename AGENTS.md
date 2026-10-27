<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Conventions

Follow these in new and edited code, even where an older line still deviates from them.

## Tooling

- Prettier formats everything with its defaults (2-space indent, double quotes, semicolons, trailing commas, 80 columns) plus `prettier-plugin-tailwindcss`, which sorts class lists, so never order classes by hand. Format the files you touch (`pnpm exec prettier --write <paths>`) and run `pnpm lint`.
- Write every function, components and hooks included, as an arrow function assigned to a `const`; `function` declarations appear only in `.d.ts` shims. Declare object shapes with `type`, never `interface`.

## Project layout

- `src/app/` holds routes. A route folder holds `page.tsx`, its authored data in `content.tsx`, the data's types in `types.ts`, and route-only components grouped by role into plural-noun files (`resume/atoms.tsx`, `resume/timelines.tsx`), not in `src/components/`.
- `src/components/` holds shared components. A single-file component is `src/components/Name.tsx`. A component with a CSS module, its own content, helper modules, or subcomponents is a folder `Name/` containing `Name.tsx` and an `index.ts` barrel.
- In a component folder, other modules are lowercase nouns named for their concern (`dots.ts`, `timing.ts`, `paths.ts`, `timeline.ts`, `types.ts`, `levels.ts`, `content.ts`), and extracted subcomponents are PascalCase siblings (`LevelPanels.tsx`, `Iceberg.tsx`).
- `src/utils/` holds shared hooks, one per file named after the hook (`useTapOutside.ts`). `src/lib/` holds `.d.ts` shims named after packages whose own types can't be imported (`orthogonal-path-finding.d.ts`), each opening with a doc comment that says why it exists.
- Files in `public/` are kebab-case (`resume-daniel-ludo-deanda.pdf`, `logos/nebula-labs.png`).

## Colocation

- Keep each constant, type, helper, and style in the file of its only consumer (`LEVEL_CLASS_NAMES` lives in `LevelPanels.tsx`, not `levels.ts`). Move it to `src/components/`, `src/utils/`, or `globals.css` only once something else needs it.
- Keep authored content (copy, URLs, lists, tuning data) out of markup. A route's content goes in its `content.tsx`, and a self-contained component's goes in a `content.ts` beside it (`PrimaryNav/content.ts`). Content that belongs to a page reaches components as props (`TIPS` lives in `app/content.tsx`, not in `SpokenTips/`).
- When a component grows unwieldy, extract coherent pieces into subcomponents in its folder and pass them slices of its props (`LevelPanels` receives `childClassNames.panel` as `panelClassName`).

## Exports

- A file centered on one component or hook declares it with `const` and ends with `export default Name;`, routes' `page.tsx` and `layout.tsx` included. Files that hold several peers (route component files, helper modules, `types.ts`, `content.ts(x)`) use only named exports, written inline (`export const`, `export type`).
- Always export a component's props type (`export type NameProps`), even for subcomponents. Export other types and constants only when another module imports them: `ConnectingDotsTextOptions` is exported for `timing.ts`, but `CharCodeTextOptions` isn't. A component with an `options` prop exports `DEFAULT_OPTIONS`.
- A barrel re-exports the default, then the public API (the props type, `DEFAULT_OPTIONS`, and whatever callers need from sibling modules) in one statement per source module, values before `type` specifiers. Internal types and helpers stay out.

  ```ts
  import IcebergExplainerText from "./IcebergExplainerText";
  export default IcebergExplainerText;
  export {
    DEFAULT_OPTIONS,
    type IcebergExplainerTextProps,
  } from "./IcebergExplainerText";
  export type { Level, Levels } from "./levels";
  ```

## Imports

- Order imports in three groups with no blank lines between them: packages, then `@/` aliases, then same-folder `./` paths. Sort each group case-insensitively by path, and put global CSS and CSS modules last.
- Reach other folders through `@/` (`@/components/Expandable`, `@/utils/useTapOutside`), never `../`, and import components through their barrels.
- Sort the names inside braces case-insensitively, values first and then inline `type` specifiers: `{ along, anchor, free, MarkerShape, Side, type Arrow }`.
- Use `import type { … }` when every name is a type, inline `type` when mixing, `import Logo, { type LogoProps } from "@/components/Logo";` for a default plus types, and `import type { default as Name, NameOptions } from "./Name";` when the default is needed only as a type. `default` sorts as the word "default" (`{ ConnectingDotsTextOptions, default as ConnectingDotsText }`).
- `pnpm lint` enforces these rules (except for side-effect imports like `import "./globals.css";`). `import/order` checks the ordering, and `pnpm exec eslint --fix <paths>` applies it. `custom-type-specifier-style` flags `import { type … }` and `export { type … }` statements whose names are all types, but it can't fix them since it is a custom rule.

## Naming

- PascalCase: components and their files, types, enums, and enum members, whose values are kebab-case strings (`FilledCircle = "filled-circle"`). camelCase: variables, functions, props, object keys, and non-component files.
- SCREAMING_SNAKE_CASE: module-level constants that hold content, configuration, or precomputed data, even when computed (`EXPERIENCES`, `NAV_ITEMS`, `VISIT_DWELL_TIME`, `TAIL_MASK`, `MIN_X`, `ALL_FACET_SHADING`). Module-level instances (`mulish`) and values that a page derives from its content for rendering (`skillsByGroup`, `numExtraExperiences`) stay camelCase.
- Write acronyms in lowercase if they are the first word (`svgRef`), but in capitals after the first word (`SkillID`, `skillIDs`, `pendingFrameRequestID`, `restAPIs`).
- Fixed affixes: `NameProps`; `NameOptions` (resolved options); `DEFAULT_OPTIONS`; `*_CLASS_NAMES` (class lookup tables); `xClassName` (one internal element); `xClassNames` or `childClassNames` (several). Counts take a `num` prefix (`numExtras`, `NUM_LEVELS`).
- Refs to DOM elements end in `Ref` (`rootRef`, `buttonRef`, `letterRefs`); refs holding anything else are named for it (`dwellTimeout`, `savedProgress`). Copy `.current` into a local named for the element before using it (`const header = headerRef.current;`). State is `[value, setValue]`, and functional updates name their argument `previousValue` (`previousTipIndex`).
- Booleans are bare adjectives or participles in props, state, and data (`active`, `expanded`, `visited`, `hidden`, `inline`, `large`, `last`, `featured`). Use `is`/`should` for predicates and derived values (`isTouchEvent`, `isActive`, `shouldBeActive`) and where the bare word could read as a noun (`isRemote`).
- Functions start with a verb: `get…` computes and returns, `read…` measures the DOM into state, `render…` returns JSX, `handle…` holds an internal handler's logic, and `on…` names callback props and listeners passed to `addEventListener` (`onTapOutside`, `onScroll`). Others take a precise action verb (`rasterizeArrow`, `simplifyPath`, `placeEndMarkers`, `toggle`, `scrubTo`), and factories in a data DSL are short words (`anchor`, `free`, `along`).
- Put units and kinds in names: `…Duration`, `…Delay`, `…Size`, `…Width`, `…Gap`, `…Opacity`, `…Curve` (easing strings), `…Fraction` (0–1) versus `…Percent` (0–100). em values converted to pixels get a `rasterized` prefix (`rasterizedMarkerGap`), and options go from `serializedOptions` to `resolvedOptions`.
- Spell names out (`pendingFrameRequestID`, not `frame`; `currentLevel`, not `level`; `arrowheadPath`, not `arrowhead`) apart from the established `e`, `i`/`j`/`k`, and `rect`, plus `prev`/`next` and `dx`/`dy` when their meanings are obvious. Keep each feature's vocabulary consistent: lines draw and retract, dots grow and shrink, text fades in and out, and devices are "touch screens", not "mobile devices".
- `data-*` attributes are kebab-case, with adjectives for state (`data-active`, `data-expanded`, `data-extra`) and nouns for parts (`data-arrowhead`, `data-body`). CSS custom properties are kebab-case and prefixed with their component or feature (`--wave-height`, `--lift-duration`, `--primary-nav-inset`). CSS module classes are short (`.root`, `.char`), keyframes are kebab-case (`strike-arrowhead`), and Tailwind groups are always named (`group/hero`).

## Order within a file

- A component file runs in this order:
  1. `"use client";` and a blank line, but only on shared components that need hooks or handlers. Subcomponents and hook modules that only client components import omit it, and CSS-only components stay server components.
  2. Imports, then module setup (`gsap.registerPlugin(…)`, font loaders, `export const metadata`).
  3. Module constants, each with a doc comment, then module helper functions.
  4. `export type NameProps`.
  5. For an `options` prop: `type Groups`, `NameOptions`, and `export const DEFAULT_OPTIONS`.
  6. The component's doc comment and `const Name = …`.
  7. `export default Name;`
- Declare things before their first use: a helper type sits just above the first code that uses it. In a file with several components, file-private helper components come first, each exported component follows its own props type, and the outermost component comes last.
- In a component body, put refs and resolved options first, then state, hooks, and effects, then handlers and derived values, then the `return`. Separate the groups with blank lines, and introduce a group with a comment when its purpose isn't obvious.

## Components and props

- Write `const Name = ({ …props }: NameProps) => (…)`, typing layouts with Next's global `LayoutProps<"/">`. Use an expression body when the function only returns, and a block body only when statements come before the `return`. Destructure props in the parameter list, nesting where useful (`organization: { name, logo }`), and rename component values to PascalCase (`icon: Icon`).
- Exported components take a named props type that documents every member. File-private helper components (`EntryHeader`, `Section`) take an inline prop type without member docs.
- Declare props in this order: the primary data (`text`, `tips`, `organization`, `entry`), behavior and variant props, `options`, `className`, classes for internal elements (`affordanceClassName`, `childClassNames`), and `children` last. Within a group, order related members logically (`forwardDuration` before `backwardSpeedup`, which is defined relative to it) and alphabetize the rest, as in `DiagramAnimation`'s `appearance` options.
- Repeat the declared order wherever the members reappear: in destructuring, in JSX props at call sites, in `DEFAULT_OPTIONS`, and in object literals of the type (each entry in `EXPERIENCES` follows `Experience`).
- Order JSX attributes as `id`, `key`, `ref`, the element's own attributes (`type`, `href`, `src`, `alt`, `width`, `popover`, …), `aria-*`, `data-*`, `className`, `style`, then event handlers. Write boolean attributes and props bare (`aria-hidden`, `inline`). Put a `{...props}` spread after defaults the caller may override and before attributes it mustn't clobber: `target="_blank" rel="noopener noreferrer" {...props} className={twMerge(…, className)}`.
- Key list items by a stable value (`href`, `id`, `title`, or a composite such as `` `${entry.organization.name} ${entry.start}` ``), and fall back to the index only for static sequences such as characters and points.
- Set defaults in the destructuring, writing `= false` for booleans too (`shape = "underline"`, `fadeInDelay = 0`, `inline = false`), and state each one in the prop's doc. Optional function parameters default in the signature (`pathMarkers: PathMarker[] = []`). Values that no caller would reasonably tune are module constants, not props. Add props, `className` included, only when a caller needs them.
- Express variants as a discriminated `kind` union backed by a `Record` of classes (`ExternalLink`) or as a boolean prop (`large`), not by passing variant classes through `className`.
- A component with many non-boolean tunables takes `options?: { appearance?: {…}; animation?: {…} }` with a fully populated `DEFAULT_OPTIONS`. Flat options merge as `{ ...DEFAULT_OPTIONS, ...options }`. Grouped options are merged group by group in a `useMemo` keyed on `serializedOptions = JSON.stringify(options ?? {})`, and the result is `resolvedOptions`.
- Callers style internals through `className` on the root, an `xClassName` for one internal element, a nested `childClassNames` for several, or CSS variables for values that change per breakpoint. Merge with `twMerge(baseClasses, condition && "classes", className)`, caller classes last.
- Expose state that surrounding content reacts to as a `data-*` attribute on the root, set to `flag || undefined` so that it's absent when false (`data-active`, read by `group-has-data-active/hero:`).

## TypeScript and logic

- Derive types from data instead of restating them: `SkillGroup = (typeof SKILL_GROUPS)[number]` with `as const`, `SkillID = keyof typeof SKILLS_BY_ID` with `satisfies`, `ExternalLinkProps["kind"]`, `Required<NonNullable<NameProps["options"]>>`. Extend existing props with `Omit<ComponentProps<"a">, "target" | "rel" | "children"> & {…}` or `Omit<ExpandableProps, "labels"> & {…}`.
- Use string literal unions for props (`shape?: "underline" | "circle"`), inlined unless they're reused elsewhere; string `enum`s for closed sets used as data and as `Record` keys (`Side`, `MarkerShape`); and tuples for fixed lengths (`Levels = [Level, Level, Level, Level]`).
- Don't add `| undefined` to optional members. Annotate the return types of hooks and of helpers that return values, never those of components. Cast style objects that set CSS variables `as CSSProperties`, and use `!` only where a value is guaranteed (`char.codePointAt(0)!`).
- Guard with early returns (`if (!svg || !parent) return;`), and drop the braces only when the whole `if` fits on one line. Read callback props inside effects through `useEffectEvent` (`useTapOutside`), and give every listener and observer a cleanup.

## Doc comments

- Give a `/** … */` doc comment to every component, hook, helper, type, type member, and module constant. Route entry points (`Home`, `Resume`, `RootLayout`) get none, content constants may get a `//` note on their order or tuning instead, and functions nested in other functions get at most a `//` comment.
- Prefer the multi-line form even for one sentence. Separate paragraphs with a blank ` *` line, and separate documented members with a blank line.
- End every description with a period, noun phrases included. Wrap at 80 columns, and when a sentence needs two lines, break it near the middle at a phrase boundary instead of filling the first line:

  ```ts
  /**
   * The {@link Organization} whose logo is
   * to be rendered in this {@link OrgLogo}.
   */
  ```

- Document the contract (what is rendered or returned, inputs, defaults, units, edge cases), and leave implementation reasoning to `//` comments beside the code.
- Wrap every in-scope type, component, enum, and constant in `{@link}`, with plural and possessive endings outside the braces (`{@link Skill}s`, `{@link Organization}'s`). A type's own top-level comment names itself in a code span (`` `ArrowAnchor` ``), a component's own comment calls it "this component", and members call their parent "this {@link Name}".
- A doc comment may `{@link}` a name that its file doesn't otherwise use. Bring that name into scope with an `import type` (a JSDoc `@import` has no effect in `.ts`/`.tsx` files). `jsdoc/no-undefined-types` counts such imports as used and flags `{@link}`s to names that aren't in scope.
  - Pitfall: TypeScript resolves member links only one level deep (`Type.member`), so for deeper targets, link the deepest resolvable member and name the rest in a code span (e.g., `` `snapDistance` in {@link DiagramAnimationOptions.precision} ``).
- Put all other code in code spans: props and parameters (`` `text` ``), functions and hooks with parentheses (`` `useTapOutside()` ``), literal values (`` `true` ``, `` `null` ``, `` `"underline"` ``), HTML elements with brackets (`` `<span>` ``), classes, CSS properties and variables, attributes, routes, paths, and package names. Bare numbers and measurements stay plain (0, 330px, 0.1em), and ordinary nouns that echo type names stay lowercase ("the logo", "a single arrow").
- A component's comment opens with "Renders …" and calls inputs "the specified `text`" or "the specified {@link Skill}". Later paragraphs cover interaction, exposed state, and caveats, reusing these sentences where they apply:
  - "Motionless if the user `prefers-reduced-motion`."
  - "The animation triggers on hover, except on touch screens, for which it toggles on tap and can be dismissed by tapping anywhere."
  - "While active, the root element carries a `data-active` attribute so that surrounding content can react."
  - "Animated using CSS alone and thus valid as a server component."
  - "Note: This component is hidden from ATs, so its parent is responsible for supplying a label if one is necessary."
- Hooks and functions open with a third-person verb ("Tracks …", "Computes …", "Creates …", "While enabled, invokes …"), and a hook that tracks a changing value says when it updates ("Updates whenever …"). Types open with a noun phrase ("A link in the {@link SiteFooter}.", "One end of an {@link Arrow}."). Members and constants are noun phrases that give units between commas ("The duration, in seconds, over which …", "The month, in YYYY-MM format, in which …"), except callable members, which open with a verb ("Registers …").
- Boolean members read "`true` if …, `false` otherwise (and by default)." When the default is `true`, they end "… `false` otherwise. Defaults to `true`." Other defaults read "Defaults to `"underline"`." or "Defaults to "Present" if omitted.", and omission is spelled out ("Omitted if said role is ongoing.", "omit if the toggle button should be omitted").
- Give a reason with "Exists to …", a secondary role with "Also used as …", and a caveat with "Note:" or "Note that". Put longer asides under `@remarks` with a blank line on each side, and point to related settings with `@see`.
- Reuse the standard text for options. The `options` prop is "Optional settings for this {@link Name}. Unspecified values are set according to {@link DEFAULT_OPTIONS}.", each group is "Optional settings that control how …", and `DEFAULT_OPTIONS` is "The values used for any settings that are omitted from the `options` prop." Copy `Groups` and `NameOptions`, docs included, from an existing component.
- `className` reads "Classes for the container `<div>` of this {@link Name}.", naming the actual element, plus notes on anything the classes control or can't override. Classes for internal elements add "Applied after (and thus take precedence over) internal defaults."
- Common phrasing: "the specified", "said", "iff", "i.e.,", "e.g.,", "(s)" plurals ("role(s)"), interval notation ("[0, 1)", "Not constrained to [0, 1]."), `*emphasis*` with asterisks, "ATs" for assistive technologies, and "touch screens".
- Document every parameter with `@param name description` and any return value with `@returns description`. Tag text is lowercase, opens with an article ("the", "a", or "`true` if"), has no final period or types, and wraps with a hanging indent under its first character. Add a blank ` *` line before the tags only when the description has more than one paragraph. Components take no tags, since their props carry the docs.

  ```ts
  /**
   * Generates random vertical positions for the specified number of dots.
   * @param count the number of positions to be generated
   * @param margin the minimum vertical distance, in ems, between
   *               each position and the edges of the bounding box
   *               of the {@link ConnectingDotsText} to which the
   *               dots will be assigned
   * @returns the generated positions, in ems from the top of the bounding box
   */
  ```

## Other comments

- Use `//`, or `{/* … */}` among JSX children, to explain why something non-obvious works: a constraint, a workaround, or a rejected alternative (``Not `<sup>` b/c `ExternalLink` demands a `string` here``). **Don't restate the code or narrate design intent**. Keep comments to one to three lines, longer only for real derivations like the geometry in `paths.ts`.
- Start with a capital letter. A comment that is one sentence or fragment has no final period, even when wrapped; a comment with several sentences ends each with one. End-of-line comments are terse fragments, usually lowercase (``// destroy `observer` on cleanup``, `// run only once per mount`). Wrap like doc comments, balancing two-line comments.
- Match the mood to the target. A comment on a declaration or JSX element describes it, usually with a participle or a third-person verb ("Shared by every …", "Raised above the underline so that …", "Clears the navigation bar, which …"). A comment that introduces steps is imperative ("Wait until the gap is measurable", "Fade the entire arrow in"). A comment that justifies one class or value names it first (`` `w-fit` so the underline doesn't fill the row ``).
- Put each comment directly above its target: a statement, a single attribute inside a JSX tag, the root element inside `return (`, or a JSX child, as `{/* … */}` with continuation lines aligned under the text after `{/* `. Label complex regions of a long JSX tree with short comments (`{/* Scrub indicator */}`), and separate them, like other major sibling blocks, with blank lines.
- In data lists, group entries under short `//` headings (`// Engineering`, `// Absurd (real world)`), and state the order above the list (`// General order: highest -> lowest, leftmost -> rightmost`).
- Code spans work as in doc comments, but `//` comments never use `{@link}`. Informal abbreviations ("b/c", "w/", "i.e.,", "e.g.,") and `*emphasis*` are fine, and an ellipsis can carry one thought across two adjacent comments (`PrimaryNav.tsx`).
- Reuse these comments verbatim when the situation recurs: "Screen readers ignore `aria-label` on generic elements like spans, so the text is exposed this way instead", "Spreading iterates by code point, so "astral" characters like emoji aren't split up!", "Ignore whitespace characters", "Keyed by value so receiving an identical copy won't re-run the memo", and "Wait until …" before a guard.
- Mark unfinished work `// TODO: …`, or end a commented-out placeholder with `TODO`. Heed comments addressed to AI agents ("Note for AI agents") and write your own only when the content would likely already be part of humans' contextual knowledge.
- In CSS, use `/* … */` for one-liners and star-prefixed blocks for longer notes, and open a module with a block saying what it does or which variables it reads. Conditions can be spelled out as `IF … AND … THEN …` (`PrimaryNav.module.css`) and timelines as aligned tables (`AnimatedLogo.module.css`).

## Styling

- Component-specific custom CSS (keyframes, descendant/parent-state selectors, effects that only one component uses) lives in a CSS module colocated with its component, and a component with a module lives in its own folder with an `index.ts` barrel (e.g., `WaveText/`). This keeps components decoupled and reusable. Ordinary styling stays in Tailwind utilities. `globals.css` holds only shared tokens (the daisyUI theme, breakpoints, font) and generic utilities meant to be shared.
  - When callers need to tune a component per breakpoint, expose the tunable as a CSS variable that the module reads with a `var()` fallback, and have callers set it with an arbitrary property (e.g., `sm:[--wave-height:0.15em]`).
  - Pitfall: a module rule and a Tailwind utility of equal specificity resolve by stylesheet order, which follows import order (e.g., `layout.tsx` imports components before `globals.css`). Don't let both set the same property on the same element. For the same reason, give caller-settable variables their defaults as `var()` fallbacks rather than declaring them in the module.
- Style with Tailwind and daisyUI components (`btn`, `badge`, `menu`, `timeline`, `tooltip`), the theme's tokens (`bg-base-100`, `text-base-content/60`, `text-primary`), and the custom breakpoints `xxs` through `xl`.
- Write class lists as plain string attributes. Use `twMerge()` whenever classes are conditional or come from a caller, and a template literal only to interpolate a generated class (a module class, `mulish.variable`) into static utilities.
- Pass values that vary at runtime through `style`, either directly or as CSS variables that classes read (`duration-(--lift-duration)`), and keep static styling in classes. Promote repeated or meaningful arbitrary values to `@theme` tokens in `globals.css`, each with a comment saying what it does (`--shadow-page`).
- Gate motion. Put `motion-reduce:transition-none` on transitioned elements (with `!` to beat inline `transition` styles), use `motion-safe:` for decorative animation, wrap CSS module animations in `@media (prefers-reduced-motion: no-preference)`, and check `matchMedia("(prefers-reduced-motion: reduce)")` before animating in JS.
- In CSS modules, select states and parts with `data-*` attributes (`.root[data-hidden]`, `& [data-arrowhead]`), nest with `&`, use `@starting-style` for enter transitions, and put `@keyframes` after the rules.

## Interaction and accessibility

- Hover interactions also work on touch screens. Handle `onPointerEnter` and `onPointerLeave` for other pointers and toggle on `onPointerUp` for touch, using `const isTouchEvent = (e: PointerEvent) => e.pointerType === "touch";`, and dismiss with `useTapOutside()`.
- Hide decorative icons and visuals with a bare `aria-hidden`. When text is split into per-character spans, render the full text once in an `sr-only` span and hide the pieces. Label landmarks and lists (`aria-label="Primary"`, `aria-labelledby`), and mark the current link with `aria-current="page"`.

## Content and assets

- Annotate content constants with their item type when one exists (`EXPERIENCES: Experience[]`), and list each object's keys in the type's declared order. Author data in units that are easy to tune and convert it in code (`DOT_POSITIONS` divides grid values by 48).
- Dates are `YYYY-MM` or `YYYY-MM-DD` strings, rendered in `<time dateTime>`. JSX text escapes typographic apostrophes and quotes (’ “ ”) as entities (`&apos;`, `&ldquo;`, `&rdquo;`).
- Don't write or embellish personal content (bio text, resume entries, skills, tips, metadata descriptions) unless the user specifically asks you to. Leave a `TODO` for them instead.
- Before adding or replacing any organization logo in `public/logos/` (shown on `/resume`), read and follow `agents/logos.md`, which covers the spec, sourcing, processing, and provenance of every logo.
