# Cindor Components

<p align="center">
  <img src="./branding/cindor-wordmark.png" alt="Cindor UI" width="720" />
</p>

Cindor Components is a standards-based component library built around a framework-agnostic **web component core** with thin **React** and **Vue** wrappers.

The visual foundation lives directly in this repository through the vendored Cindor fonts, design tokens, base styles, and theme hooks that ship with `cindor-ui-core`.

## Licensing

The repository source and published packages are licensed under MIT.

Vendored font assets in `packages/core/src/design/fonts` are distributed under
the SIL Open Font License 1.1 instead. Their notice and license text ship with
the core package in:

- `packages/core/src/design/fonts/FONT-LICENSES.md`
- `packages/core/src/design/fonts/OFL-1.1.txt`

## Packages

- `packages/core` — Lit-based custom elements in `cindor-ui-core`
- `packages/react` — React wrappers in `cindor-ui-react`
- `packages/vue` — Vue wrappers in `cindor-ui-vue`

## Installation

Install the published packages from the npm registry:

```bash
npm install cindor-ui-core
npm install cindor-ui-core cindor-ui-react
npm install cindor-ui-core cindor-ui-vue
```

The GitHub repository root is the workspace source tree, not a consumable replacement for the individual package entries. Apps should depend on the published `cindor-ui-core`, `cindor-ui-react`, and `cindor-ui-vue` packages instead of installing the monorepo root from GitHub.

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
npm run build:netlify
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
5. **Shared global design layer** — `cindor-ui-core/styles.css` imports the local Cindor fonts, tokens, base styles, and theme hooks that ship with the core package.

## Styling and theming

The core package exports a shared stylesheet:

```ts
import "cindor-ui-core/styles.css";
```

That stylesheet pulls in the vendored Cindor global layer that ships with this repository. Component internals are styled inside shadow DOM, while the shared global CSS covers:

- fonts
- design tokens
- base element styling
- theme hooks

Theme switching follows the shared root-level `data-theme` pattern used by the vendored Cindor design layer.

For scoped theming, `CindorProvider` now supports three practical paths:

1. **Preset theme** — quickest path when you want a ready-made alternate look
2. **`primaryColor` / `primary-color`** — quickest custom path when you only want to change the accent family
3. **`themeTokens`, `lightThemeTokens`, and `darkThemeTokens`** — full semantic token overrides at the provider boundary

Use **`theme` for color mode** (`inherit`, `system`, `light`, `dark`) and **`themeFamily` / `theme-family`** for the visual family (`inherit`, `default`, `retro`). The provider automatically mirrors the resolved light/dark mode to CSS `color-scheme` for native browser surfaces inside the scope.

Built-in presets are exported as `cindorAmethystTheme`, `cindorAmberTheme`, `cindorSlateTheme`, `cindorEvergreenTheme`, `cindorCobaltTheme`, `cindorRoseTheme`, and `cindorOceanTheme`.

### When to use each option

| Need | Recommended API |
| --- | --- |
| A reusable branded look with almost no setup | Any built-in preset such as `cindorAmethystTheme`, `cindorAmberTheme`, or `cindorSlateTheme` |
| A custom accent color while keeping the default neutrals | `primaryColor` |
| Full control of surfaces, borders, text, and accent tokens | `themeTokens`, `lightThemeTokens`, `darkThemeTokens` |

### Preset usage

```ts
import { cindorAmethystTheme } from "cindor-ui-core";

const provider = document.querySelector("cindor-provider");

provider.theme = "system";
Object.assign(provider, cindorAmethystTheme);
```

### Primary-color override

`primaryColor` derives the accent-oriented token family for the active theme:

- `--accent`
- `--accent-hover`
- `--accent-press`
- `--accent-muted`
- `--accent-fg`
- `--fg-on-accent`
- `--ring-focus`

```html
<cindor-provider theme="system" primary-color="#7c3aed">
  <cindor-button>Save changes</cindor-button>
</cindor-provider>
```

### Retro family

Retro is explicit and app-selected. Use `themeFamily` / `theme-family` to opt into it, and let `theme="system"` decide whether the retro branch resolves to `retro` or `retro-light`:

```html
<cindor-provider theme="system" theme-family="retro">
  <cindor-button>Launch arcade mode</cindor-button>
</cindor-provider>
```

### Full semantic token override

Use `themeTokens` for overrides that should apply in both modes, then layer `lightThemeTokens` or `darkThemeTokens` for mode-specific differences.

```ts
const provider = document.querySelector("cindor-provider");

provider.primaryColor = "#7c3aed";
provider.themeTokens = {
  "--radius-md": "8px"
};
provider.darkThemeTokens = {
  "--surface": "#1b1230",
  "--border": "#5b21b6",
  "--accent": "#c084fc",
  "--accent-hover": "#d8b4fe",
  "--accent-press": "#ede9fe",
  "--accent-fg": "#160f24"
};
```

### Common semantic tokens

The most useful theme tokens to override first are:

- surfaces: `--bg`, `--bg-subtle`, `--bg-muted`, `--surface`, `--surface-raised`
- text: `--fg`, `--fg-muted`, `--fg-subtle`
- borders: `--border`, `--border-strong`, `--border-muted`
- accent: `--accent`, `--accent-hover`, `--accent-press`, `--accent-muted`, `--accent-fg`, `--fg-on-accent`
- feedback: `--success`, `--warning`, `--danger`
- focus/misc: `--ring-focus`

These token names match the semantic layer already consumed by the components, so most components will pick up theme changes automatically.

### Migrating from the old provider API

The provider now uses **`theme` for color mode** and keeps native browser `color-scheme` aligned automatically.

1. Remove `color-scheme="..."` from `<cindor-provider>`
2. Remove `provider.colorScheme = ...`
3. Remove `colorScheme={...}` in React
4. Remove `colorScheme` / `:color-scheme` usage in Vue
5. Keep `primaryColor`, preset objects, and theme token overrides as-is
6. Use `theme="system"` when you want browser preference handling
7. Use `themeFamily` / `theme-family` when you want to opt into retro explicitly

**Before**

```html
<cindor-provider theme="dark" color-scheme="dark" primary-color="#7c3aed">
  <cindor-button>Save changes</cindor-button>
</cindor-provider>
```

```ts
provider.theme = "dark";
provider.colorScheme = "dark";
```

**After**

```html
<cindor-provider theme="dark" primary-color="#7c3aed">
  <cindor-button>Save changes</cindor-button>
</cindor-provider>
```

```ts
provider.theme = "dark";
```

If your old code intentionally mismatched theme and native browser color scheme, move to a single choice. Native browser surfaces now follow the resolved provider theme automatically. If you want automatic browser light/dark handling, switch to `theme="system"`.

## Usage direction

The core integration surface should remain standards-based:

- custom element registration
- attributes and properties
- slots
- composed DOM events
- CSS custom properties and parts where needed

This keeps the components portable across generic web-component consumers as well as React and Vue applications.

Lucide is the preferred icon source for the library. The core package exposes `cindor-icon` for the full Lucide catalog, and built-in component affordances such as search, upload, and close actions use that same Lucide-backed icon path. Browse available names in the [Lucide icon docs](https://lucide.dev/icons/).

Toasts can also be managed imperatively through the shared toast manager system. Use `cindor-toast-region` for fixed-position stacking, or call `showToast()` from `cindor-ui-core` to target the default region in a standard web-component app.

## Storybook

Storybook is configured for the core web components. Add or update stories next to component source files in:

```text
packages/core/src/**/*.stories.ts
```

Storybook accessibility checks are part of the expected component workflow. Stories for interactive components should render a real accessible-name pattern such as visible text paired with `aria-labelledby`, not placeholder-only examples.

## Living docs

The repository also includes a docs app at `apps/docs` that uses the published Cindor component APIs directly inside the site itself. It is intended to stay in the same repo so examples, package APIs, and docs content evolve together.

Production deployment is wired through `.github/workflows/deploy-netlify.yml`.

The repository deploys three Netlify sites from the same codebase:

- `cindor.dev` for the marketing landing page
- `docs.cindor.dev` for the technical docs experience
- `playground.cindor.dev` for Storybook

To build the production outputs locally, run:

```bash
npm run build:netlify
```

This writes:

- `dist/netlify/landing`
- `dist/netlify/docs`
- `dist/netlify/playground`

The docs build now emits Netlify redirects for path-based docs routes so deep links such as `/overview` and `/components/button` resolve back to the SPA entry point on `docs.cindor.dev`.

The GitHub Actions deployment expects these repository secrets:

- `NETLIFY_AUTH_TOKEN`
- `NETLIFY_SITE_ID_LANDING`
- `NETLIFY_SITE_ID_DOCS`
- `NETLIFY_SITE_ID_PLAYGROUND`

One-time Netlify setup still requires creating or linking the three sites in your Netlify account and attaching the custom domains there.

## Publishing packages

Package publishing is wired through `.github/workflows/publish-packages.yml`. The workflow validates the workspace, builds the package artifacts, and publishes `cindor-ui-core`, `cindor-ui-react`, and `cindor-ui-vue` from their own workspace roots. It intentionally keeps the monorepo root private.

For the initial release, you can set an `NPM_TOKEN` repository secret and let the workflow publish with token auth. Long term, the workflow is also set up to work with npm trusted publishing once the GitHub repository is registered as a trusted publisher in npm; when that is in place, remove the `NPM_TOKEN` secret and the same workflow can publish with OIDC instead.

## Accessibility

Accessibility is a required part of component design in this repository:

- every interactive component must expose a reliable accessible-name pattern
- composite widgets must support keyboard interaction and focus management appropriate to their role
- dialogs, drawers, popovers, menus, tooltips, and similar overlays must use correct semantics and dismissal behavior
- new interactive component work should include accessibility assertions in tests and labeled Storybook examples
