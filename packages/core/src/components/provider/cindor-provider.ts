import { css, html, LitElement } from "lit";

import {
  derivePrimaryColorThemeTokens,
  normalizeThemeTokens,
  type ProviderResolvedTheme,
  type ProviderThemeTokens
} from "./provider-theme.js";

export type ProviderTheme = "inherit" | "system" | "light" | "dark";
export type ProviderThemeFamily = "inherit" | "default" | "retro";
type ProviderResolvedThemeFamily = Exclude<ProviderThemeFamily, "inherit">;
type ProviderResolvedThemeName = "light" | "dark" | "retro" | "retro-light";

export {
  cindorAmethystTheme,
  cindorAmberTheme,
  cindorCobaltTheme,
  cindorEvergreenTheme,
  cindorOceanTheme,
  cindorRoseTheme,
  cindorSlateTheme,
  cindorThemePresets
} from "./provider-theme.js";
export type { ProviderThemePreset, ProviderThemeTokens } from "./provider-theme.js";

/**
 * Lightweight theme scope for Cindor tokens and descendant components.
 *
 * `theme` controls color mode (`inherit`, `system`, `light`, `dark`) and
 * `themeFamily` controls the visual family (`inherit`, `default`, `retro`).
 * The provider resolves those inputs to the shared root-level `data-theme`
 * values and mirrors the resolved color mode to CSS `color-scheme` for native
 * browser surfaces inside the scope.
 *
 * @slot - Descendant application or component content.
 */
export class CindorProvider extends LitElement {
  static styles = css`
    :host {
      display: block;
      min-width: 0;
      color: var(--fg);
    }
  `;

  static properties = {
    darkThemeTokens: { attribute: false },
    lightThemeTokens: { attribute: false },
    primaryColor: { attribute: "primary-color", reflect: true },
    themeTokens: { attribute: false },
    theme: { reflect: true },
    themeFamily: { attribute: "theme-family", reflect: true }
  };

  darkThemeTokens: ProviderThemeTokens = {};
  lightThemeTokens: ProviderThemeTokens = {};
  primaryColor = "";
  themeTokens: ProviderThemeTokens = {};
  /** Controls light/dark resolution for this provider boundary. */
  theme: ProviderTheme = "inherit";
  /** Controls which visual theme family this provider boundary resolves to. */
  themeFamily: ProviderThemeFamily = "inherit";

  private readonly appliedThemeTokens = new Set<`--${string}`>();
  private readonly themeScopeObserver = new MutationObserver(() => {
    this.syncPresentation();
    this.syncThemeScopeObserver();
  });
  private systemThemeQuery: MediaQueryList | null = null;
  private readonly systemThemeQueryListener = () => {
    this.syncPresentation();
  };

  override connectedCallback(): void {
    super.connectedCallback();
    this.syncThemeScopeObserver();
    this.syncSystemThemeObserver();
    this.syncPresentation();
  }

  override disconnectedCallback(): void {
    this.themeScopeObserver.disconnect();
    this.stopObservingSystemTheme();
    super.disconnectedCallback();
  }

  protected override updated(): void {
    this.syncPresentation();
    this.syncThemeScopeObserver();
    this.syncSystemThemeObserver();
  }

  protected override render() {
    return html`<slot></slot>`;
  }

  private syncPresentation(): void {
    const resolvedPresentation = this.resolvePresentation();

    if (this.theme === "inherit" && this.themeFamily === "inherit") {
      this.removeAttribute("data-theme");
    } else {
      this.setAttribute("data-theme", resolvedPresentation.themeName);
    }

    this.style.setProperty("color-scheme", resolvedPresentation.theme);

    this.applyThemeTokens(this.createThemeTokens(resolvedPresentation.theme));
  }

  private createThemeTokens(theme: ProviderResolvedTheme): ProviderThemeTokens {
    return {
      ...derivePrimaryColorThemeTokens(this.primaryColor, theme),
      ...normalizeThemeTokens(this.themeTokens),
      ...normalizeThemeTokens(theme === "dark" ? this.darkThemeTokens : this.lightThemeTokens)
    };
  }

  private applyThemeTokens(tokens: ProviderThemeTokens): void {
    const nextTokenNames = new Set<`--${string}`>();

    for (const [tokenName, tokenValue] of Object.entries(tokens)) {
      if (typeof tokenValue !== "string") {
        continue;
      }

      const themeTokenName = tokenName as `--${string}`;
      nextTokenNames.add(themeTokenName);
      this.style.setProperty(themeTokenName, tokenValue);
    }

    for (const tokenName of this.appliedThemeTokens) {
      if (!nextTokenNames.has(tokenName)) {
        this.style.removeProperty(tokenName);
      }
    }

    this.appliedThemeTokens.clear();

    for (const tokenName of nextTokenNames) {
      this.appliedThemeTokens.add(tokenName);
    }
  }

  private resolvePresentation(): {
    family: ProviderResolvedThemeFamily;
    theme: ProviderResolvedTheme;
    themeName: ProviderResolvedThemeName;
  } {
    const inheritedPresentation = this.resolveInheritedPresentation();
    const resolvedTheme = this.resolveEffectiveTheme(inheritedPresentation.theme);
    const resolvedThemeFamily = this.resolveEffectiveThemeFamily(inheritedPresentation.family);

    return {
      family: resolvedThemeFamily,
      theme: resolvedTheme,
      themeName: resolveThemeName(resolvedTheme, resolvedThemeFamily)
    };
  }

  private resolveInheritedPresentation(): {
    family: ProviderResolvedThemeFamily;
    scope: Element | null;
    theme: ProviderResolvedTheme;
  } {
    const inheritedThemeScope = this.findInheritedThemeScope();

    return {
      ...parseThemeName(inheritedThemeScope?.getAttribute("data-theme") ?? null),
      scope: inheritedThemeScope
    };
  }

  private resolveEffectiveTheme(inheritedTheme: ProviderResolvedTheme): ProviderResolvedTheme {
    if (this.theme === "light" || this.theme === "dark") {
      return this.theme;
    }

    if (this.theme === "system") {
      return this.resolveSystemTheme();
    }

    return inheritedTheme;
  }

  private resolveEffectiveThemeFamily(inheritedThemeFamily: ProviderResolvedThemeFamily): ProviderResolvedThemeFamily {
    if (this.themeFamily === "default" || this.themeFamily === "retro") {
      return this.themeFamily;
    }

    return inheritedThemeFamily;
  }

  private resolveSystemTheme(): ProviderResolvedTheme {
    return this.getSystemThemeQuery()?.matches ? "dark" : "light";
  }

  private findInheritedThemeScope(): Element | null {
    const getParentNode = (node: Node): Node | null => {
      const rootNode = node.getRootNode();
      return node.parentNode ?? (rootNode instanceof ShadowRoot ? rootNode.host : null);
    };

    for (let parentNode = getParentNode(this); parentNode; parentNode = getParentNode(parentNode)) {
      if (parentNode instanceof Element && parentNode.hasAttribute("data-theme")) {
        return parentNode;
      }
    }

    return this.ownerDocument?.documentElement ?? null;
  }

  private syncThemeScopeObserver(): void {
    this.themeScopeObserver.disconnect();

    if (!this.usesInheritedThemeScope()) {
      return;
    }

    const ownerDocument = this.ownerDocument;

    if (!ownerDocument) {
      return;
    }

    const observerOptions: MutationObserverInit = {
      attributeFilter: ["data-theme"],
      attributes: true
    };
    const inheritedThemeScope = this.resolveInheritedPresentation().scope;

    this.themeScopeObserver.observe(ownerDocument.documentElement, observerOptions);

    if (inheritedThemeScope && inheritedThemeScope !== ownerDocument.documentElement) {
      this.themeScopeObserver.observe(inheritedThemeScope, observerOptions);
    }
  }

  private usesInheritedThemeScope(): boolean {
    return this.theme === "inherit" || this.themeFamily === "inherit";
  }

  private syncSystemThemeObserver(): void {
    this.stopObservingSystemTheme();

    if (this.theme !== "system") {
      return;
    }

    const systemThemeQuery = this.getSystemThemeQuery();

    if (!systemThemeQuery) {
      return;
    }

    this.systemThemeQuery = systemThemeQuery;

    if (typeof systemThemeQuery.addEventListener === "function") {
      systemThemeQuery.addEventListener("change", this.systemThemeQueryListener);
      return;
    }

    const legacyMediaQueryList = systemThemeQuery as MediaQueryList & {
      addListener?: (listener: (event: MediaQueryListEvent) => void) => void;
    };
    legacyMediaQueryList.addListener?.(this.systemThemeQueryListener);
  }

  private stopObservingSystemTheme(): void {
    if (!this.systemThemeQuery) {
      return;
    }

    if (typeof this.systemThemeQuery.removeEventListener === "function") {
      this.systemThemeQuery.removeEventListener("change", this.systemThemeQueryListener);
    } else {
      const legacyMediaQueryList = this.systemThemeQuery as MediaQueryList & {
        removeListener?: (listener: (event: MediaQueryListEvent) => void) => void;
      };
      legacyMediaQueryList.removeListener?.(this.systemThemeQueryListener);
    }

    this.systemThemeQuery = null;
  }

  private getSystemThemeQuery(): MediaQueryList | null {
    const defaultView = this.ownerDocument?.defaultView ?? (typeof window !== "undefined" ? window : null);

    if (!defaultView?.matchMedia) {
      return null;
    }

    if (this.systemThemeQuery?.media === "(prefers-color-scheme: dark)") {
      return this.systemThemeQuery;
    }

    return defaultView.matchMedia("(prefers-color-scheme: dark)");
  }
}

function parseThemeName(themeName: string | null): {
  family: ProviderResolvedThemeFamily;
  theme: ProviderResolvedTheme;
} {
  if (themeName === "dark") {
    return {
      family: "default",
      theme: "dark"
    };
  }

  if (themeName === "retro") {
    return {
      family: "retro",
      theme: "dark"
    };
  }

  if (themeName === "retro-light") {
    return {
      family: "retro",
      theme: "light"
    };
  }

  return {
    family: "default",
    theme: "light"
  };
}

function resolveThemeName(theme: ProviderResolvedTheme, family: ProviderResolvedThemeFamily): ProviderResolvedThemeName {
  if (family === "retro") {
    return theme === "dark" ? "retro" : "retro-light";
  }

  return theme;
}
