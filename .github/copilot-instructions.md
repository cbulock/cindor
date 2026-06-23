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

- `npx vitest run packages/core/src/components/button/cindor-button.test.ts`

Replace the file path as needed for the specific test you are working on.

## Branch starting point

Always create new work on top of a clean, updated `main` branch.

- Run `git fetch origin`
- Run `git checkout main`
- Run `git pull --ff-only`
- Create the new branch from that refreshed `main`

Do not branch from a stale local `main` or from another feature branch unless the task explicitly requires a stacked branch.

## Versioning workflow

This repository enforces a synchronized workspace version across:

- `package.json`
- `package-lock.json`
- `apps/docs/package.json`
- `packages/core/package.json`
- `packages/react/package.json`
- `packages/vue/package.json`

Workspace versions are owned by `release-please` on `main`.

- Do not add manual version bumps to ordinary feature PRs.
- Keep commits and PR titles release-friendly when practical. `release-please` uses Conventional Commit semantics such as `fix:`, `feat:`, and `feat!:` to determine the next release.
- Expect release PRs on `main` to carry the synchronized updates to the version files listed above, including `package-lock.json`.

## Intended architecture

The target is a **web component library** that should stay compatible with both **React** and **Vue**.

This library now owns its shared design layer directly in-repo. Treat the vendored Cindor fonts, tokens, base styles, and theme hooks in `packages/core/src/design/` as the visual foundation for the component library.

Favor this shape unless the repository later establishes a different one:

1. A framework-agnostic core package (`cindor-ui-core`) built from standards-based web components / custom elements
2. Thin React bindings that adapt the custom elements to React ergonomics without re-implementing component logic
3. Thin Vue bindings that do the same for Vue
4. Shared styling, tokens, events, and accessibility behavior owned by the core layer, not duplicated in framework wrappers or framework adapters

When making changes, keep the core package independent from React- or Vue-specific runtime assumptions. Framework-specific behavior should live in adapters/wrappers, not in the base components.

Favor **native HTML primitives first**. Build on standard platform elements and behaviors wherever possible instead of recreating them in custom abstractions. Using modern standards-based primitives is encouraged when browser support is acceptable for the repository, including features like the native `<dialog>` element when it fits the component.

When styling components, prefer consuming or aligning to the shared in-repo Cindor design surface rather than inventing a parallel token language. Its main reusable layers are fonts, tokens, and base styles, with theme state driven through root-level `data-theme`.

The current styling split is:

1. `cindor-ui-core/styles.css` for the shared global Cindor surface (fonts, tokens, base styles)
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
- Assume the vendored design layer may evolve over time. Favor integration patterns that can absorb token, theme, or base-style changes without rewriting each component by hand.
- Preserve **framework-agnostic business and rendering behavior** in the core component implementation.
- Prefer building higher-level components and workflow surfaces from existing **Cindor primitives** first. If the library already has a button, input, select, checkbox, dialog, form-field, stack, or similar primitive that fits, compose with it instead of dropping to bespoke internal markup or ad hoc native controls.
- Treat the variable font setup in `packages/core/src/design/` as intentional. Prefer Mona Sans for UI/body copy and JetBrains Mono for code/data surfaces; use shared weight tokens instead of ad hoc numeric weights wherever possible.
- For non-retro themes, default Mona Sans usage should usually stay within regular/medium/semibold/bold token ranges, and JetBrains Mono should usually stay on the shared mono/code tokens rather than per-component custom weights. Retro themes use Press Start 2P at 400 and should not simulate heavier weights.
- Prefer **native HTML elements and browser behavior** over re-implementing controls in JavaScript. Start from semantic elements such as `button`, `input`, `select`, `textarea`, `dialog`, `fieldset`, `label`, and standard form semantics before introducing custom behavior.
- Only bypass existing Cindor primitives when there is a strong reason, such as a semantic/accessibility requirement the current primitives cannot express, a foundational primitive being built for reuse, or a concrete performance/platform limitation. In those cases, keep the reason explicit in the implementation or review context rather than treating bespoke internal markup as the default.
- Prefer **semantic HTML elements and native roles/landmarks whenever the platform already provides them**. Only add ARIA roles or extra semantics when native HTML does not already express the behavior correctly, and do not replace or duplicate built-in semantics without a concrete need.
- Prefer **shared public APIs** across the core, React wrapper, and Vue wrapper so the same component concepts map cleanly between frameworks.
- If wrappers are introduced, keep them **thin**: prop/event translation, typing, and lifecycle glue only.
- Treat `scripts/wrapper-manifest.mjs` as the single source of truth for React/Vue wrapper generation. When wrapper exports change, update the manifest and regenerate the wrapper files instead of hand-editing `packages/react/src/index.tsx` or `packages/vue/src/index.ts`.
- When adding a new component, wire it through the whole library surface: implement it under `packages/core/src/components/<name>/`, export it from `packages/core/src/index.ts`, register it in `packages/core/src/register.ts`, add stories/tests beside the source, update `scripts/wrapper-manifest.mjs` if it should be wrapped for React/Vue, regenerate wrappers, regenerate the component manifest, and add docs catalog/usage coverage in `apps/docs/src/catalog.ts` and `apps/docs/src/main.ts` as needed.
- The repeatable validation flow for a new component is: `npm run generate:manifest`, `npm run generate:wrappers`, `npm run test`, `npm run typecheck`, `npm run lint`, and `npm run build`.
- Treat **DOM events, attributes/properties, slots, CSS custom properties, and accessibility semantics** as the primary integration surface for the core components.
- Keep **component-specific styles inside shadow DOM**. Do not export per-component CSS files unless there is a concrete non-shadow use case.
- Keep the exported `cindor-ui-core/styles.css` focused on the shared global Cindor layer: fonts, tokens, base styles, and theme hooks.
- Keep the core components usable from **any standard web-component consumer**, not just React or Vue. Do not require framework runtime helpers inside the custom elements themselves.
- Prefer **standards-based integration points** that work in generic apps: custom elements registration, attributes/properties, slots, CSS custom properties/parts, and composed DOM events.
- Prefer theme and styling integration that remains compatible with the shared vendored design conventions, including token-driven styling and root theme switching patterns such as `data-theme`.
- Storybook is configured for the core web components. Add or update stories in `packages/core/src/**/*.stories.ts` alongside the component source.
- Accessibility is a hard requirement for every component change. Interactive components must have an accessible name pattern, correct semantic roles, keyboard support, focus management where applicable, and Storybook stories that demonstrate labeled usage rather than placeholder-only usage.
- When adding or updating interactive components, include accessibility assertions in tests and keep Storybook accessibility tooling passing.
- Do not introduce React-only or Vue-only patterns into the core library unless the repository later documents that choice explicitly.
