# Cindor Components

Cindor Components is a standards-based component library built around a framework-agnostic **web component core** with thin **React** and **Vue** wrappers.

The visual foundation comes from the upstream [cindor-design](https://github.com/cbulock/cindor-design) package. Treat that design system as a living upstream dependency rather than local copied styling.

## Packages

- `packages/core` — Lit-based custom elements in `cindor-ui-core`
- `packages/react` — React wrappers in `cindor-ui-react`
- `packages/vue` — Vue wrappers in `cindor-ui-vue`

## Apps

- `apps/docs` — living documentation site built with the Cindor web components themselves

The core package is the source of truth for behavior, events, accessibility, and styling hooks. React and Vue packages adapt those elements for framework ergonomics without re-implementing component logic.

## Development

Install dependencies:

```bash
npm install
```

Run the workspace scripts from the repository root:

```bash
npm run generate:manifest
npm run generate:wrappers
npm run build
npm run lint
npm run test
npm run test:watch
npm run typecheck
npm run storybook
npm run build-storybook
npm run docs
npm run build:docs
npm run docs:preview
```

Run a single test file with Vitest:

```bash
npx vitest run packages/core/src/components/button/cindor-button.test.ts
```

Replace the file path as needed for the specific component you are working on.

When adding or renaming components, update `scripts/wrapper-manifest.mjs` and run `npm run generate:wrappers` so the React and Vue wrapper exports stay aligned with the shared component metadata.

The docs API reference is generated from the core component source. Run `npm run generate:manifest` after changing public component properties, events, methods, or slots so `packages/core/custom-elements.json` and `packages/core/component-docs.json` stay current.

## Adding a new component

Use this workflow when adding a component so it is wired through the full library surface instead of existing only in the core package.

1. Create the component in `packages/core/src/components/<component-name>/` with:
   - `cindor-<component-name>.ts`
   - `cindor-<component-name>.test.ts`
   - `cindor-<component-name>.stories.ts`
2. Export the component from `packages/core/src/index.ts`.
3. Register the custom element in `packages/core/src/register.ts`.
4. If the component should be available in React and Vue, add it to `scripts/wrapper-manifest.mjs`, then run `npm run generate:wrappers`. Do not hand-edit `packages/react/src/index.tsx` or `packages/vue/src/index.ts`.
5. If the component has public properties, events, methods, or slots, add or update source-level descriptions/JSDoc as needed, then run `npm run generate:manifest` so `packages/core/custom-elements.json` and `packages/core/component-docs.json` stay aligned.
6. Add the component to the docs catalog in `apps/docs/src/catalog.ts`.
7. Add or update docs usage/preview coverage in `apps/docs/src/main.ts` when the component needs dedicated examples, previews, or framework-specific snippets.
8. Validate the full workflow from the repository root:

```bash
npm run generate:manifest
npm run generate:wrappers
npm run test
npm run typecheck
npm run lint
npm run build
```

For faster iteration during development, it is also normal to run a targeted test file first, for example:

```bash
npx vitest run packages/core/src/components/button/cindor-button.test.ts
```

## Architecture

This repository is designed around a few core rules:

1. **Native HTML primitives first** — prefer real platform elements such as `button`, `input`, `select`, `textarea`, `dialog`, `details`, and `summary` whenever they fit.
2. **Framework-agnostic core** — custom elements should work in any app that supports standard web components, not only React or Vue.
3. **Thin wrappers** — framework packages should only handle prop/event adaptation and typing.
4. **Shadow DOM component styling** — component-specific visuals live inside each Lit component.
5. **Shared global design layer** — `cindor-ui-core/styles.css` imports the upstream design-system fonts, tokens, base styles, and theme hooks.

## Styling and theming

The core package exports a shared stylesheet:

```ts
import "cindor-ui-core/styles.css";
```

That stylesheet pulls in the upstream `cindor-design` global layer. Component internals are styled inside shadow DOM, while the shared global CSS covers:

- fonts
- design tokens
- base element styling
- theme hooks

Theme switching is intended to stay compatible with the upstream design system's root-level `data-theme` pattern.

## Usage direction

The core integration surface should remain standards-based:

- custom element registration
- attributes and properties
- slots
- composed DOM events
- CSS custom properties and parts where needed

This keeps the components portable across generic web-component consumers as well as React and Vue applications.

Lucide is the preferred icon source for the library. The core package exposes `cindor-icon` for common UI glyphs, and built-in component affordances such as search, upload, and close actions use that same Lucide-backed icon path.

Toasts can also be managed imperatively through the shared toast manager system. Use `cindor-toast-region` for fixed-position stacking, or call `showToast()` from `cindor-ui-core` to target the default region in a standard web-component app.

## Storybook

Storybook is configured for the core web components. Add or update stories next to component source files in:

```text
packages/core/src/**/*.stories.ts
```

Storybook accessibility checks are part of the expected component workflow. Stories for interactive components should render a real accessible-name pattern such as visible text paired with `aria-labelledby`, not placeholder-only examples.

## Living docs

The repository also includes a docs app at `apps/docs` that uses the published Cindor component APIs directly inside the site itself. It is intended to stay in the same repo so examples, package APIs, and docs content evolve together.

GitHub Pages deployment is wired through `.github/workflows/docs-pages.yml`. The workflow builds `apps/docs` with a repo-aware `DOCS_BASE_PATH` so project-site deployments serve assets correctly from `https://<owner>.github.io/<repo>/`.

## Accessibility

Accessibility is a required part of component design in this repository:

- every interactive component must expose a reliable accessible-name pattern
- composite widgets must support keyboard interaction and focus management appropriate to their role
- dialogs, drawers, popovers, menus, tooltips, and similar overlays must use correct semantics and dismissal behavior
- new interactive component work should include accessibility assertions in tests and labeled Storybook examples
