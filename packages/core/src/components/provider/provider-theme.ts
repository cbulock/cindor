export type ProviderResolvedTheme = "light" | "dark";

export type ProviderThemeTokens = Partial<Record<`--${string}`, string>>;

export type ProviderThemePreset = {
  darkThemeTokens: ProviderThemeTokens;
  lightThemeTokens: ProviderThemeTokens;
  primaryColor: string;
};

type RgbColor = {
  blue: number;
  green: number;
  red: number;
};

const WHITE: RgbColor = { red: 255, green: 255, blue: 255 };
const BLACK: RgbColor = { red: 15, green: 14, blue: 12 };

export const cindorAmethystTheme: ProviderThemePreset = {
  primaryColor: "#7c3aed",
  lightThemeTokens: {
    "--bg": "#faf5ff",
    "--bg-subtle": "#f3e8ff",
    "--bg-muted": "#eadcff",
    "--surface": "#ffffff",
    "--surface-raised": "#ffffff",
    "--fg": "#2e1065",
    "--fg-muted": "#6b21a8",
    "--fg-subtle": "#7e22ce",
    "--border": "#d8b4fe",
    "--border-muted": "#ede9fe"
  },
  darkThemeTokens: {
    "--bg": "#140c24",
    "--bg-subtle": "#1b1230",
    "--bg-muted": "#24163f",
    "--surface": "#1b1230",
    "--surface-raised": "#24163f",
    "--fg": "#f5f3ff",
    "--fg-muted": "#d8b4fe",
    "--fg-subtle": "#c084fc",
    "--border": "#5b21b6",
    "--border-muted": "#24163f"
  }
};

export const cindorEvergreenTheme: ProviderThemePreset = {
  primaryColor: "#15803d",
  lightThemeTokens: {
    "--bg": "#f6fdf7",
    "--bg-subtle": "#eefbf0",
    "--bg-muted": "#ddf3e0",
    "--surface": "#ffffff",
    "--surface-raised": "#ffffff",
    "--fg": "#052e16",
    "--fg-muted": "#166534",
    "--fg-subtle": "#15803d",
    "--border": "#bbf7d0",
    "--border-muted": "#dcfce7"
  },
  darkThemeTokens: {
    "--bg": "#08130d",
    "--bg-subtle": "#0d1c14",
    "--bg-muted": "#11261b",
    "--surface": "#0d1c14",
    "--surface-raised": "#11261b",
    "--fg": "#ecfdf3",
    "--fg-muted": "#bbf7d0",
    "--fg-subtle": "#86efac",
    "--border": "#166534",
    "--border-muted": "#11261b"
  }
};

export const cindorCobaltTheme: ProviderThemePreset = {
  primaryColor: "#2563eb",
  lightThemeTokens: {
    "--bg": "#f4f7ff",
    "--bg-subtle": "#e9efff",
    "--bg-muted": "#dbe6ff",
    "--surface": "#ffffff",
    "--surface-raised": "#ffffff",
    "--fg": "#172554",
    "--fg-muted": "#1d4ed8",
    "--fg-subtle": "#2563eb",
    "--border": "#bfdbfe",
    "--border-muted": "#dbeafe"
  },
  darkThemeTokens: {
    "--bg": "#0b1220",
    "--bg-subtle": "#101a2e",
    "--bg-muted": "#14213a",
    "--surface": "#101a2e",
    "--surface-raised": "#14213a",
    "--fg": "#eff6ff",
    "--fg-muted": "#bfdbfe",
    "--fg-subtle": "#60a5fa",
    "--border": "#1d4ed8",
    "--border-muted": "#14213a"
  }
};

export const cindorRoseTheme: ProviderThemePreset = {
  primaryColor: "#be185d",
  lightThemeTokens: {
    "--bg": "#fff5f8",
    "--bg-subtle": "#ffe8ef",
    "--bg-muted": "#ffd9e6",
    "--surface": "#ffffff",
    "--surface-raised": "#ffffff",
    "--fg": "#881337",
    "--fg-muted": "#be185d",
    "--fg-subtle": "#db2777",
    "--border": "#f9a8d4",
    "--border-muted": "#fbcfe8"
  },
  darkThemeTokens: {
    "--bg": "#220915",
    "--bg-subtle": "#2d0d1c",
    "--bg-muted": "#3a1024",
    "--surface": "#2d0d1c",
    "--surface-raised": "#3a1024",
    "--fg": "#fff1f6",
    "--fg-muted": "#fbcfe8",
    "--fg-subtle": "#f472b6",
    "--border": "#be185d",
    "--border-muted": "#3a1024"
  }
};

export const cindorOceanTheme: ProviderThemePreset = {
  primaryColor: "#0f766e",
  lightThemeTokens: {
    "--bg": "#f2fcfa",
    "--bg-subtle": "#e0f7f4",
    "--bg-muted": "#c8eeea",
    "--surface": "#ffffff",
    "--surface-raised": "#ffffff",
    "--fg": "#134e4a",
    "--fg-muted": "#0f766e",
    "--fg-subtle": "#0d9488",
    "--border": "#99f6e4",
    "--border-muted": "#ccfbf1"
  },
  darkThemeTokens: {
    "--bg": "#061816",
    "--bg-subtle": "#08211e",
    "--bg-muted": "#0b2b27",
    "--surface": "#08211e",
    "--surface-raised": "#0b2b27",
    "--fg": "#e6fffb",
    "--fg-muted": "#99f6e4",
    "--fg-subtle": "#5eead4",
    "--border": "#0f766e",
    "--border-muted": "#0b2b27"
  }
};

export const cindorAmberTheme: ProviderThemePreset = {
  primaryColor: "#d97706",
  lightThemeTokens: {
    "--bg": "#fffaf2",
    "--bg-subtle": "#fff3df",
    "--bg-muted": "#ffe7c2",
    "--surface": "#ffffff",
    "--surface-raised": "#ffffff",
    "--fg": "#78350f",
    "--fg-muted": "#b45309",
    "--fg-subtle": "#d97706",
    "--border": "#fcd34d",
    "--border-muted": "#fde68a"
  },
  darkThemeTokens: {
    "--bg": "#1a1208",
    "--bg-subtle": "#24190c",
    "--bg-muted": "#2f2110",
    "--surface": "#24190c",
    "--surface-raised": "#2f2110",
    "--fg": "#fff7ed",
    "--fg-muted": "#fcd34d",
    "--fg-subtle": "#fbbf24",
    "--border": "#b45309",
    "--border-muted": "#2f2110"
  }
};

export const cindorSlateTheme: ProviderThemePreset = {
  primaryColor: "#475569",
  lightThemeTokens: {
    "--bg": "#f8fafc",
    "--bg-subtle": "#f1f5f9",
    "--bg-muted": "#e2e8f0",
    "--surface": "#ffffff",
    "--surface-raised": "#ffffff",
    "--fg": "#0f172a",
    "--fg-muted": "#334155",
    "--fg-subtle": "#475569",
    "--border": "#cbd5e1",
    "--border-muted": "#e2e8f0"
  },
  darkThemeTokens: {
    "--bg": "#0b1120",
    "--bg-subtle": "#111827",
    "--bg-muted": "#1f2937",
    "--surface": "#111827",
    "--surface-raised": "#1f2937",
    "--fg": "#f8fafc",
    "--fg-muted": "#cbd5e1",
    "--fg-subtle": "#94a3b8",
    "--border": "#334155",
    "--border-muted": "#1f2937"
  }
};

export const cindorThemePresets = {
  amethyst: cindorAmethystTheme,
  amber: cindorAmberTheme,
  slate: cindorSlateTheme,
  evergreen: cindorEvergreenTheme,
  cobalt: cindorCobaltTheme,
  rose: cindorRoseTheme,
  ocean: cindorOceanTheme
} as const;

export function derivePrimaryColorThemeTokens(primaryColor: string, theme: ProviderResolvedTheme): ProviderThemeTokens {
  const normalizedPrimaryColor = primaryColor.trim();

  if (normalizedPrimaryColor.length === 0) {
    return {};
  }

  const parsedBaseColor = parseColor(normalizedPrimaryColor);

  if (!parsedBaseColor) {
    return theme === "dark"
      ? {
          "--accent": `color-mix(in srgb, ${normalizedPrimaryColor} 82%, white)`,
          "--accent-hover": `color-mix(in srgb, ${normalizedPrimaryColor} 64%, white)`,
          "--accent-press": `color-mix(in srgb, ${normalizedPrimaryColor} 46%, white)`,
          "--accent-muted": `color-mix(in srgb, ${normalizedPrimaryColor} 16%, transparent)`,
          "--accent-fg": "#0f0e0c",
          "--fg-on-accent": "#0f0e0c",
          "--ring-focus": `0 0 0 2px color-mix(in srgb, ${normalizedPrimaryColor} 82%, white)`
        }
      : {
          "--accent": normalizedPrimaryColor,
          "--accent-hover": `color-mix(in srgb, ${normalizedPrimaryColor} 82%, black)`,
          "--accent-press": `color-mix(in srgb, ${normalizedPrimaryColor} 68%, black)`,
          "--accent-muted": `color-mix(in srgb, ${normalizedPrimaryColor} 14%, white)`,
          "--accent-fg": "#ffffff",
          "--fg-on-accent": "#ffffff",
          "--ring-focus": `0 0 0 2px ${normalizedPrimaryColor}`
        };
  }

  const accentColor = theme === "dark" ? mixColors(parsedBaseColor, WHITE, 0.18) : parsedBaseColor;
  const hoverColor = theme === "dark" ? mixColors(parsedBaseColor, WHITE, 0.36) : mixColors(parsedBaseColor, BLACK, 0.18);
  const pressColor = theme === "dark" ? mixColors(parsedBaseColor, WHITE, 0.54) : mixColors(parsedBaseColor, BLACK, 0.32);
  const accentForeground = chooseReadableForeground(accentColor);

  return {
    "--accent": formatHexColor(accentColor),
    "--accent-hover": formatHexColor(hoverColor),
    "--accent-press": formatHexColor(pressColor),
    "--accent-muted": theme === "dark" ? formatRgbaColor(accentColor, 0.16) : formatHexColor(mixColors(parsedBaseColor, WHITE, 0.86)),
    "--accent-fg": accentForeground,
    "--fg-on-accent": accentForeground,
    "--ring-focus": `0 0 0 2px ${formatHexColor(accentColor)}`
  };
}

export function normalizeThemeTokens(tokens: ProviderThemeTokens | null | undefined): ProviderThemeTokens {
  if (!tokens) {
    return {};
  }

  const normalizedTokens: ProviderThemeTokens = {};

  for (const [tokenName, tokenValue] of Object.entries(tokens)) {
    if (!tokenName.startsWith("--")) {
      continue;
    }

    const normalizedTokenValue = tokenValue?.trim();

    if (!normalizedTokenValue) {
      continue;
    }

    normalizedTokens[tokenName as `--${string}`] = normalizedTokenValue;
  }

  return normalizedTokens;
}

function parseColor(value: string): RgbColor | null {
  const normalizedValue = value.trim().toLowerCase();

  if (normalizedValue.startsWith("#")) {
    return parseHexColor(normalizedValue);
  }

  if (normalizedValue.startsWith("rgb(") || normalizedValue.startsWith("rgba(")) {
    return parseRgbColor(normalizedValue);
  }

  return null;
}

function parseHexColor(value: string): RgbColor | null {
  const hex = value.slice(1);

  if (!/^[0-9a-f]+$/i.test(hex)) {
    return null;
  }

  if (hex.length === 3 || hex.length === 4) {
    const [red, green, blue] = hex.slice(0, 3).split("").map((part) => Number.parseInt(part.repeat(2), 16));
    return { red, green, blue };
  }

  if (hex.length === 6 || hex.length === 8) {
    return {
      red: Number.parseInt(hex.slice(0, 2), 16),
      green: Number.parseInt(hex.slice(2, 4), 16),
      blue: Number.parseInt(hex.slice(4, 6), 16)
    };
  }

  return null;
}

function parseRgbColor(value: string): RgbColor | null {
  const match = value.match(/^rgba?\((.+)\)$/i);

  if (!match) {
    return null;
  }

  const parts = match[1].split(",").map((part) => part.trim());

  if (parts.length < 3) {
    return null;
  }

  const [red, green, blue] = parts.slice(0, 3).map(parseRgbChannel);

  if (red === null || green === null || blue === null) {
    return null;
  }

  return { red, green, blue };
}

function parseRgbChannel(value: string): number | null {
  if (value.endsWith("%")) {
    const percent = Number.parseFloat(value.slice(0, -1));
    if (!Number.isFinite(percent)) {
      return null;
    }

    return clampChannel((percent / 100) * 255);
  }

  const channel = Number.parseFloat(value);
  if (!Number.isFinite(channel)) {
    return null;
  }

  return clampChannel(channel);
}

function mixColors(source: RgbColor, target: RgbColor, amount: number): RgbColor {
  return {
    red: clampChannel(source.red + (target.red - source.red) * amount),
    green: clampChannel(source.green + (target.green - source.green) * amount),
    blue: clampChannel(source.blue + (target.blue - source.blue) * amount)
  };
}

function chooseReadableForeground(color: RgbColor): string {
  const luminance = getRelativeLuminance(color);
  const whiteContrast = getContrastRatio(luminance, 1);
  const blackContrast = getContrastRatio(luminance, getRelativeLuminance(BLACK));

  return whiteContrast >= blackContrast ? "#ffffff" : "#0f0e0c";
}

function getContrastRatio(firstLuminance: number, secondLuminance: number): number {
  const lighter = Math.max(firstLuminance, secondLuminance);
  const darker = Math.min(firstLuminance, secondLuminance);
  return (lighter + 0.05) / (darker + 0.05);
}

function getRelativeLuminance(color: RgbColor): number {
  const channels = [color.red, color.green, color.blue].map((channel) => {
    const normalized = channel / 255;
    return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
  });

  return (0.2126 * channels[0]) + (0.7152 * channels[1]) + (0.0722 * channels[2]);
}

function clampChannel(value: number): number {
  return Math.min(255, Math.max(0, Math.round(value)));
}

function formatHexColor(color: RgbColor): string {
  return `#${toHex(color.red)}${toHex(color.green)}${toHex(color.blue)}`;
}

function formatRgbaColor(color: RgbColor, alpha: number): string {
  return `rgba(${color.red}, ${color.green}, ${color.blue}, ${alpha.toFixed(2)})`;
}

function toHex(value: number): string {
  return value.toString(16).padStart(2, "0");
}
