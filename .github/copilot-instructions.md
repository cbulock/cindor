# Copilot instructions for this repository

## Current commands

Use the root workspace scripts:

- `npm install`
- `npm run build`
- `npm run lint`
- `npm run test`
- `npm run test:watch`
- `npm run typecheck`
- `npm run storybook`
- `npm run build-storybook`

To run a single test file, use:

- `npx vitest run packages/core/src/components/button/emb-button.test.ts`

Replace the file path as needed for the specific test you are working on.

## Intended architecture

The target is a **web component library** that should stay compatible with both **React** and **Vue**.

This library should use the upstream design system at <https://github.com/cbulock/emberline-design> as its visual and stylistic foundation. Treat that repository as a **living upstream system**, not a one-time reference snapshot.

Favor this shape unless the repository later establishes a different one:

1. A framework-agnostic core package (`emberline-ui-core`) built from standards-based web components / custom elements
2. Thin React bindings that adapt the custom elements to React ergonomics without re-implementing component logic
3. Thin Vue bindings that do the same for Vue
4. Shared styling, tokens, events, and accessibility behavior owned by the core layer, not duplicated in framework wrappers or framework adapters

When making changes, keep the core package independent from React- or Vue-specific runtime assumptions. Framework-specific behavior should live in adapters/wrappers, not in the base components.

Favor **native HTML primitives first**. Build on standard platform elements and behaviors wherever possible instead of recreating them in custom abstractions. Using modern standards-based primitives is encouraged when browser support is acceptable for the repository, including features like the native `<dialog>` element when it fits the component.

When styling components, prefer consuming or aligning to the upstream design system's shared surface rather than inventing a parallel token language. The upstream README currently identifies its main reusable layers as fonts, tokens, and base styles, with theme state driven through root-level `data-theme`.

The current styling split is:

1. `emberline-ui-core/styles.css` for the shared global Emberline surface (fonts, tokens, base styles)
2. Component visuals defined inside each Lit component's shadow root

## Intended package and workspace structure

If this repository becomes a monorepo, prefer a layout where shared component behavior has a single source of truth:

1. `packages/core` for the core web components
2. `packages/react` for React wrappers
3. `packages/vue` for Vue wrappers
4. Optional supporting packages for shared tokens, themes, icons, utilities, docs, or demo apps

Keep cross-package dependencies flowing outward from the core:

- React and Vue packages may depend on the core package
- Shared design-token or styling packages may be consumed by all packages
- The core package should not depend on React or Vue wrapper packages
- Demo/docs apps should consume published package APIs rather than reaching into package internals

The workspace uses npm workspaces, TypeScript, tsup, Vitest, ESLint, and Storybook for web components. Keep shared build and quality tooling at the workspace root, but keep package entry points, exports, and framework integration logic owned by each package.

## Key conventions for future sessions

- Treat the upstream **design-system** repository as the source foundation for visual language, tokens, typography, and base styling. Reuse it, wrap it, or map to it; do not casually fork its concepts into unrelated local conventions.
- Assume the upstream design system may change over time. Favor integration patterns that can absorb upstream token, theme, or base-style changes without rewriting each component by hand.
- Preserve **framework-agnostic business and rendering behavior** in the core component implementation.
- Prefer **native HTML elements and browser behavior** over re-implementing controls in JavaScript. Start from semantic elements such as `button`, `input`, `select`, `textarea`, `dialog`, `fieldset`, `label`, and standard form semantics before introducing custom behavior.
- Prefer **shared public APIs** across the core, React wrapper, and Vue wrapper so the same component concepts map cleanly between frameworks.
- If wrappers are introduced, keep them **thin**: prop/event translation, typing, and lifecycle glue only.
- Treat **DOM events, attributes/properties, slots, CSS custom properties, and accessibility semantics** as the primary integration surface for the core components.
- Keep **component-specific styles inside shadow DOM**. Do not export per-component CSS files unless there is a concrete non-shadow use case.
- Keep the exported `emberline-ui-core/styles.css` focused on the shared global Emberline layer: fonts, tokens, base styles, and theme hooks.
- Keep the core components usable from **any standard web-component consumer**, not just React or Vue. Do not require framework runtime helpers inside the custom elements themselves.
- Prefer **standards-based integration points** that work in generic apps: custom elements registration, attributes/properties, slots, CSS custom properties/parts, and composed DOM events.
- Prefer theme and styling integration that remains compatible with the upstream design system's conventions, including token-driven styling and root theme switching patterns such as `data-theme`.
- Storybook is configured for the core web components. Add or update stories in `packages/core/src/**/*.stories.ts` alongside the component source.
- Do not introduce React-only or Vue-only patterns into the core library unless the repository later documents that choice explicitly.
