import "../../register.js";

import {
  cindorAmethystTheme,
  cindorAmberTheme,
  cindorCobaltTheme,
  cindorEvergreenTheme,
  cindorOceanTheme,
  cindorRoseTheme,
  cindorSlateTheme,
  cindorThemePresets,
  CindorProvider
} from "./cindor-provider.js";

type MatchMediaMockController = {
  restore: () => void;
  setMatches: (matches: boolean) => void;
};

describe("cindor-provider", () => {
  let matchMediaController: MatchMediaMockController;

  beforeEach(() => {
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.style.removeProperty("color-scheme");
    matchMediaController = installMatchMediaMock(false);
  });

  afterEach(() => {
    matchMediaController.restore();
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.style.removeProperty("color-scheme");
  });

  it("uses theme as the default control for both data-theme and color-scheme", async () => {
    const element = document.createElement("cindor-provider") as CindorProvider;
    element.theme = "dark";
    document.body.append(element);
    await element.updateComplete;

    expect(element.getAttribute("data-theme")).toBe("dark");
    expect(element.style.colorScheme).toBe("dark");
  });

  it("resolves system mode from prefers-color-scheme", async () => {
    matchMediaController.setMatches(true);

    const element = document.createElement("cindor-provider") as CindorProvider;
    element.theme = "system";
    document.body.append(element);
    await element.updateComplete;

    expect(element.getAttribute("data-theme")).toBe("dark");
    expect(element.style.colorScheme).toBe("dark");
  });

  it("updates system mode when prefers-color-scheme changes", async () => {
    const element = document.createElement("cindor-provider") as CindorProvider;
    element.theme = "system";
    document.body.append(element);
    await element.updateComplete;

    expect(element.getAttribute("data-theme")).toBe("light");
    expect(element.style.colorScheme).toBe("light");

    matchMediaController.setMatches(true);
    await element.updateComplete;

    expect(element.getAttribute("data-theme")).toBe("dark");
    expect(element.style.colorScheme).toBe("dark");
  });

  it("resolves retro family against the active color mode", async () => {
    const element = document.createElement("cindor-provider") as CindorProvider;
    element.theme = "light";
    element.themeFamily = "retro";
    document.body.append(element);
    await element.updateComplete;

    expect(element.getAttribute("data-theme")).toBe("retro-light");
    expect(element.style.colorScheme).toBe("light");

    element.theme = "dark";
    await element.updateComplete;

    expect(element.getAttribute("data-theme")).toBe("retro");
    expect(element.style.colorScheme).toBe("dark");
  });

  it("uses the inherited theme for color-scheme when both theme axes inherit", async () => {
    const outer = document.createElement("cindor-provider") as CindorProvider;
    outer.theme = "dark";
    outer.themeFamily = "retro";

    const inner = document.createElement("cindor-provider") as CindorProvider;
    outer.append(inner);
    document.body.append(outer);
    await outer.updateComplete;
    await inner.updateComplete;

    expect(inner.hasAttribute("data-theme")).toBe(false);
    expect(inner.style.colorScheme).toBe("dark");
  });

  it("can opt out of an inherited retro family while keeping the inherited color mode", async () => {
    const outer = document.createElement("cindor-provider") as CindorProvider;
    outer.theme = "dark";
    outer.themeFamily = "retro";

    const inner = document.createElement("cindor-provider") as CindorProvider;
    inner.themeFamily = "default";
    outer.append(inner);
    document.body.append(outer);
    await outer.updateComplete;
    await inner.updateComplete;

    expect(inner.getAttribute("data-theme")).toBe("dark");
    expect(inner.style.colorScheme).toBe("dark");
  });

  it("removes theme-specific presentation overrides when set back to inherit", async () => {
    const element = document.createElement("cindor-provider") as CindorProvider;
    element.theme = "dark";
    element.themeFamily = "retro";
    element.primaryColor = "#2563eb";
    document.body.append(element);
    await element.updateComplete;

    element.theme = "inherit";
    element.themeFamily = "inherit";
    element.primaryColor = "";
    await element.updateComplete;

    expect(element.hasAttribute("data-theme")).toBe(false);
    expect(element.style.colorScheme).toBe("light");
    expect(element.style.getPropertyValue("--accent")).toBe("");
  });

  it("derives accent tokens from the primary color", async () => {
    const element = document.createElement("cindor-provider") as CindorProvider;
    element.theme = "dark";
    document.body.append(element);
    element.primaryColor = "#2563eb";
    await element.updateComplete;

    expect(element.style.getPropertyValue("--accent")).toBe("#4c7fef");
    expect(element.style.getPropertyValue("--accent-hover")).toBe("#739bf2");
    expect(element.style.getPropertyValue("--accent-press")).toBe("#9bb7f6");
    expect(element.style.getPropertyValue("--accent-fg")).toBe("#0f0e0c");
    expect(element.style.getPropertyValue("--ring-focus")).toBe("0 0 0 2px #4c7fef");
  });

  it("applies token overrides and lets theme-specific tokens win", async () => {
    const element = document.createElement("cindor-provider") as CindorProvider;
    element.theme = "dark";
    element.primaryColor = "#2563eb";
    element.themeTokens = {
      "--accent": "#abcdef",
      "--border": "#123456"
    };
    element.darkThemeTokens = {
      "--accent": "#fedcba",
      "--surface": "#111111"
    };
    document.body.append(element);
    await element.updateComplete;

    expect(element.style.getPropertyValue("--accent")).toBe("#fedcba");
    expect(element.style.getPropertyValue("--border")).toBe("#123456");
    expect(element.style.getPropertyValue("--surface")).toBe("#111111");
  });

  it("recomputes inherited theme tokens when the ancestor theme changes", async () => {
    const outer = document.createElement("cindor-provider") as CindorProvider;
    outer.theme = "dark";

    const inner = document.createElement("cindor-provider") as CindorProvider;
    inner.primaryColor = "#2563eb";
    outer.append(inner);
    document.body.append(outer);
    await outer.updateComplete;
    await inner.updateComplete;

    expect(inner.style.getPropertyValue("--accent")).toBe("#4c7fef");

    outer.theme = "light";
    await outer.updateComplete;
    await Promise.resolve();

    expect(inner.style.getPropertyValue("--accent")).toBe("#2563eb");
  });

  it("exports reusable theme presets", () => {
    expect(cindorAmethystTheme.primaryColor).toBe("#7c3aed");
    expect(cindorAmethystTheme.darkThemeTokens["--surface"]).toBe("#1b1230");
    expect(cindorAmberTheme.primaryColor).toBe("#d97706");
    expect(cindorAmberTheme.darkThemeTokens["--fg"]).toBe("#fff7ed");
    expect(cindorEvergreenTheme.primaryColor).toBe("#15803d");
    expect(cindorEvergreenTheme.lightThemeTokens["--fg"]).toBe("#052e16");
    expect(cindorCobaltTheme.primaryColor).toBe("#2563eb");
    expect(cindorRoseTheme.darkThemeTokens["--border"]).toBe("#be185d");
    expect(cindorOceanTheme.lightThemeTokens["--fg"]).toBe("#134e4a");
    expect(cindorSlateTheme.lightThemeTokens["--fg"]).toBe("#0f172a");
    expect(Object.keys(cindorThemePresets)).toEqual(["amethyst", "amber", "slate", "evergreen", "cobalt", "rose", "ocean"]);
  });
});

function installMatchMediaMock(initialMatches: boolean): MatchMediaMockController {
  let matches = initialMatches;
  const listeners = new Set<(event: MediaQueryListEvent) => void>();
  const originalMatchMedia = window.matchMedia;
  const media = "(prefers-color-scheme: dark)";
  const queryList = {
    addEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) => {
      listeners.add(listener);
    },
    addListener: (listener: (event: MediaQueryListEvent) => void) => {
      listeners.add(listener);
    },
    dispatchEvent: () => true,
    get matches() {
      return matches;
    },
    media,
    onchange: null,
    removeEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) => {
      listeners.delete(listener);
    },
    removeListener: (listener: (event: MediaQueryListEvent) => void) => {
      listeners.delete(listener);
    }
  } as MediaQueryList;

  window.matchMedia = vi.fn().mockImplementation((query: string) => {
    if (query !== media) {
      throw new Error(`Unexpected media query: ${query}`);
    }

    return queryList;
  });

  return {
    restore: () => {
      window.matchMedia = originalMatchMedia;
    },
    setMatches: (nextMatches: boolean) => {
      matches = nextMatches;

      const event = { matches, media } as MediaQueryListEvent;
      for (const listener of listeners) {
        listener(event);
      }

      queryList.onchange?.(event);
    }
  };
}
