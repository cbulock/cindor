import {
  cindorAmethystTheme,
  cindorAmberTheme,
  cindorCobaltTheme,
  cindorEvergreenTheme,
  cindorOceanTheme,
  cindorRoseTheme,
  cindorSlateTheme
} from "./cindor-provider.js";
import type { CindorProvider, ProviderThemeTokens } from "./cindor-provider.js";

type ProviderStoryArgs = {
  darkThemeTokens: ProviderThemeTokens;
  lightThemeTokens: ProviderThemeTokens;
  primaryColor: string;
  themeFamily: "inherit" | "default" | "retro";
  themeTokens: ProviderThemeTokens;
  theme: "inherit" | "system" | "light" | "dark";
};

const meta = {
  title: "Layout/Provider",
  args: {
    darkThemeTokens: {},
    lightThemeTokens: {},
    primaryColor: "",
    themeFamily: "default",
    themeTokens: {},
    theme: "system"
  },
  argTypes: {
    darkThemeTokens: {
      control: "object"
    },
    lightThemeTokens: {
      control: "object"
    },
    primaryColor: {
      control: "color"
    },
    themeFamily: {
      control: "select",
      options: ["inherit", "default", "retro"]
    },
    themeTokens: {
      control: "object"
    },
    theme: {
      control: "select",
      options: ["inherit", "system", "light", "dark"]
    }
  },
  render: ({ darkThemeTokens, lightThemeTokens, primaryColor, theme, themeFamily, themeTokens }: ProviderStoryArgs) => {
    const provider = document.createElement("cindor-provider") as CindorProvider;
    provider.theme = theme;
    provider.themeFamily = themeFamily;
    provider.primaryColor = primaryColor;
    provider.themeTokens = themeTokens;
    provider.lightThemeTokens = lightThemeTokens;
    provider.darkThemeTokens = darkThemeTokens;
    provider.innerHTML = `
      <cindor-card>
        <div style="padding: var(--space-4); display: grid; gap: var(--space-3);">
          <h3 style="margin: 0;">Scoped theme boundary</h3>
          <p style="margin: 0;">Wrap any standard web component consumer and keep token-driven theming local to that subtree. Theme controls light, dark, or system mode, while themeFamily can opt into retro without giving up native color-scheme handling.</p>
          <cindor-stack direction="horizontal" gap="2" wrap>
            <cindor-badge tone="accent">Provider</cindor-badge>
            <cindor-badge>Theme aware</cindor-badge>
          </cindor-stack>
          <cindor-button>Save theme</cindor-button>
        </div>
      </cindor-card>
    `;

    return provider;
  }
};

export default meta;

export const Default = {};

export const RetroFamily = {
  args: {
    theme: "dark",
    themeFamily: "retro"
  }
};

export const PrimaryColor = {
  args: {
    primaryColor: "#7c3aed"
  }
};

export const FullCustomTheme = {
  args: {
    darkThemeTokens: {
      "--accent": "#c084fc",
      "--accent-fg": "#160f24",
      "--accent-hover": "#d8b4fe",
      "--accent-muted": "rgba(192, 132, 252, 0.18)",
      "--accent-press": "#ede9fe",
      "--bg": "#120d1d",
      "--border": "#5b21b6",
      "--fg": "#f5f3ff",
      "--surface": "#1b1230"
    }
  }
};

export const AmethystPreset = {
  args: {
    darkThemeTokens: cindorAmethystTheme.darkThemeTokens,
    lightThemeTokens: cindorAmethystTheme.lightThemeTokens,
    primaryColor: cindorAmethystTheme.primaryColor
  }
};

export const AmberPreset = {
  args: {
    darkThemeTokens: cindorAmberTheme.darkThemeTokens,
    lightThemeTokens: cindorAmberTheme.lightThemeTokens,
    primaryColor: cindorAmberTheme.primaryColor
  }
};

export const SlatePreset = {
  args: {
    darkThemeTokens: cindorSlateTheme.darkThemeTokens,
    lightThemeTokens: cindorSlateTheme.lightThemeTokens,
    primaryColor: cindorSlateTheme.primaryColor
  }
};

export const EvergreenPreset = {
  args: {
    darkThemeTokens: cindorEvergreenTheme.darkThemeTokens,
    lightThemeTokens: cindorEvergreenTheme.lightThemeTokens,
    primaryColor: cindorEvergreenTheme.primaryColor
  }
};

export const CobaltPreset = {
  args: {
    darkThemeTokens: cindorCobaltTheme.darkThemeTokens,
    lightThemeTokens: cindorCobaltTheme.lightThemeTokens,
    primaryColor: cindorCobaltTheme.primaryColor
  }
};

export const RosePreset = {
  args: {
    darkThemeTokens: cindorRoseTheme.darkThemeTokens,
    lightThemeTokens: cindorRoseTheme.lightThemeTokens,
    primaryColor: cindorRoseTheme.primaryColor
  }
};

export const OceanPreset = {
  args: {
    darkThemeTokens: cindorOceanTheme.darkThemeTokens,
    lightThemeTokens: cindorOceanTheme.lightThemeTokens,
    primaryColor: cindorOceanTheme.primaryColor
  }
};
