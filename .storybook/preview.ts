import "../packages/core/src/styles.css";
import { registerCindorUi } from "../packages/core/src/register.js";
import {
  cindorAmethystTheme,
  cindorAmberTheme,
  cindorCobaltTheme,
  cindorEvergreenTheme,
  cindorOceanTheme,
  cindorRoseTheme,
  cindorSlateTheme,
  type ProviderThemePreset
} from "../packages/core/src/index.js";
import { derivePrimaryColorThemeTokens } from "../packages/core/src/components/provider/provider-theme.js";

import type { Preview } from "@storybook/web-components-vite";

registerCindorUi();

type StorybookThemeMode = "light" | "dark" | "retro" | "retro-light";
type StorybookThemePresetKey = "default" | "amethyst" | "amber" | "slate" | "evergreen" | "cobalt" | "rose" | "ocean";

const themePresets: Record<StorybookThemePresetKey, ProviderThemePreset | null> = {
  default: null,
  amethyst: cindorAmethystTheme,
  amber: cindorAmberTheme,
  slate: cindorSlateTheme,
  evergreen: cindorEvergreenTheme,
  cobalt: cindorCobaltTheme,
  rose: cindorRoseTheme,
  ocean: cindorOceanTheme
};

const appliedRootThemeTokens = new Set<`--${string}`>();
const storybookDocsThemeStylesId = "cindor-storybook-docs-theme";

function ensureStorybookDocsThemeStyles(): void {
  if (document.getElementById(storybookDocsThemeStylesId)) {
    return;
  }

  const styleElement = document.createElement("style");
  styleElement.id = storybookDocsThemeStylesId;
  styleElement.textContent = `
    .sbdocs,
    .sbdocs-wrapper {
      background: var(--bg);
      color: var(--fg);
    }

    .sbdocs-content,
    .sbdocs-title,
    .sbdocs-subtitle,
    .sbdocs p,
    .sbdocs li,
    .sbdocs td,
    .sbdocs th {
      color: var(--fg);
    }

    .sbdocs a {
      color: var(--accent);
    }

    .sbdocs .sb-previewBlock,
    .sbdocs .sb-anchor,
    .sbdocs .sb-unstyled,
    .sbdocs .docblock-argstable,
    .sbdocs .docblock-argstable tbody td,
    .sbdocs .docblock-argstable tbody th,
    .sbdocs .docblock-argstable thead th {
      background: var(--surface);
      color: var(--fg);
      border-color: var(--border);
    }

    .sbdocs .sbdocs-preview [role="toolbar"] {
      background: var(--surface);
      color: var(--fg-muted);
      border-block-end: 1px solid var(--border);
    }

    .sbdocs .sbdocs-preview [role="toolbar"] button,
    .sbdocs .sbdocs-preview [role="toolbar"] a {
      color: var(--fg-muted);
    }

    .sbdocs .docblock-argstable textarea,
    .sbdocs .docblock-argstable input,
    .sbdocs .docblock-argstable select,
    .sbdocs .docblock-argstable button,
    .sbdocs .docblock-argstable [role="button"] {
      background: var(--surface-raised);
      color: var(--fg);
      border-color: var(--border);
    }

    .sbdocs .sb-previewBlock,
    .sbdocs .docblock-argstable {
      box-shadow: none;
    }
  `;

  document.head.append(styleElement);
}

function applyRootTheme(mode: StorybookThemeMode, presetKey: StorybookThemePresetKey): void {
  const documentElement = document.documentElement;
  const resolvedColorScheme = mode === "retro" ? "dark" : mode === "retro-light" ? "light" : mode;
  const preset = mode === "light" || mode === "dark" ? themePresets[presetKey] : null;
  const nextTokens = preset
    ? {
        ...derivePrimaryColorThemeTokens(preset.primaryColor, resolvedColorScheme),
        ...(resolvedColorScheme === "dark" ? preset.darkThemeTokens : preset.lightThemeTokens)
      }
    : {};
  const nextTokenNames = new Set<`--${string}`>();

  documentElement.setAttribute("data-theme", mode);
  documentElement.style.colorScheme = resolvedColorScheme;
  ensureStorybookDocsThemeStyles();

  for (const [tokenName, tokenValue] of Object.entries(nextTokens)) {
    if (!tokenName.startsWith("--") || typeof tokenValue !== "string" || tokenValue.trim().length === 0) {
      continue;
    }

    const themeTokenName = tokenName as `--${string}`;
    nextTokenNames.add(themeTokenName);
    documentElement.style.setProperty(themeTokenName, tokenValue);
  }

  for (const tokenName of appliedRootThemeTokens) {
    if (!nextTokenNames.has(tokenName)) {
      documentElement.style.removeProperty(tokenName);
    }
  }

  appliedRootThemeTokens.clear();

  for (const tokenName of nextTokenNames) {
    appliedRootThemeTokens.add(tokenName);
  }
}

const preview = {
  globalTypes: {
    themeMode: {
      name: "Theme",
      description: "Global Cindor theme for Storybook stories.",
      toolbar: {
        icon: "mirror",
        items: [
          { title: "Light", value: "light" },
          { title: "Dark", value: "dark" },
          { title: "Retro", value: "retro" },
          { title: "Retro Light", value: "retro-light" }
        ],
        dynamicTitle: true
      }
    },
    themePreset: {
      name: "Theme preset",
      description: "Global Cindor theme preset for light and dark Storybook themes.",
      toolbar: {
        icon: "paintbrush",
        items: [
          { title: "Default", value: "default" },
          { title: "Amethyst", value: "amethyst" },
          { title: "Amber", value: "amber" },
          { title: "Slate", value: "slate" },
          { title: "Evergreen", value: "evergreen" },
          { title: "Cobalt", value: "cobalt" },
          { title: "Rose", value: "rose" },
          { title: "Ocean", value: "ocean" }
        ],
        dynamicTitle: true
      }
    }
  },
  initialGlobals: {
    themeMode: "light",
    themePreset: "default"
  },
  decorators: [
    (Story, context) => {
      const themeMode = (context.globals.themeMode as StorybookThemeMode | undefined) ?? "light";
      const themePreset = (context.globals.themePreset as StorybookThemePresetKey | undefined) ?? "default";

      applyRootTheme(themeMode, themePreset);

      return Story();
    }
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    layout: "centered",

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: "todo"
    }
  },
  tags: ["autodocs"],
} satisfies Preview;

export default preview;
