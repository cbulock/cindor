# Emberline Components

Emberline Components is a standards-based component library built around a framework-agnostic **web component core** with thin **React** and **Vue** wrappers.

The visual foundation comes from the upstream [emberline-design](https://github.com/cbulock/emberline-design) package. Treat that design system as a living upstream dependency rather than local copied styling.

## Packages

- `packages/core` — Lit-based custom elements in `emberline-ui-core`
- `packages/react` — React wrappers in `emberline-ui-react`
- `packages/vue` — Vue wrappers in `emberline-ui-vue`

The core package is the source of truth for behavior, events, accessibility, and styling hooks. React and Vue packages adapt those elements for framework ergonomics without re-implementing component logic.

## Development

Install dependencies:

```bash
npm install
```

Run the workspace scripts from the repository root:

```bash
npm run build
npm run lint
npm run test
npm run test:watch
npm run typecheck
npm run storybook
npm run build-storybook
```

Run a single test file with Vitest:

```bash
npx vitest run packages/core/src/components/button/emb-button.test.ts
```

Replace the file path as needed for the specific component you are working on.

## Architecture

This repository is designed around a few core rules:

1. **Native HTML primitives first** — prefer real platform elements such as `button`, `input`, `select`, `textarea`, `dialog`, `details`, and `summary` whenever they fit.
2. **Framework-agnostic core** — custom elements should work in any app that supports standard web components, not only React or Vue.
3. **Thin wrappers** — framework packages should only handle prop/event adaptation and typing.
4. **Shadow DOM component styling** — component-specific visuals live inside each Lit component.
5. **Shared global design layer** — `emberline-ui-core/styles.css` imports the upstream Emberline fonts, tokens, base styles, and theme hooks.

## Styling and theming

The core package exports a shared stylesheet:

```ts
import "emberline-ui-core/styles.css";
```

That stylesheet pulls in the upstream `emberline-design` global layer. Component internals are styled inside shadow DOM, while the shared global CSS covers:

- fonts
- design tokens
- base element styling
- theme hooks

Theme switching is intended to stay compatible with Emberline’s root-level `data-theme` pattern.

## Usage direction

The core integration surface should remain standards-based:

- custom element registration
- attributes and properties
- slots
- composed DOM events
- CSS custom properties and parts where needed

This keeps the components portable across generic web-component consumers as well as React and Vue applications.

Lucide is the preferred icon source for the library. The core package exposes `emb-icon` for common UI glyphs, and built-in component affordances such as search, upload, and close actions use that same Lucide-backed icon path.

Toasts can also be managed imperatively through the shared toast manager system. Use `emb-toast-region` for fixed-position stacking, or call `showToast()` from `emberline-ui-core` to target the default region in a standard web-component app.

## Storybook

Storybook is configured for the core web components. Add or update stories next to component source files in:

```text
packages/core/src/**/*.stories.ts
```
