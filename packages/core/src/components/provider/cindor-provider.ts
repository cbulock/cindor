import { css, html, LitElement } from "lit";

export type ProviderTheme = "inherit" | "light" | "dark";
export type ProviderColorScheme = "inherit" | "light" | "dark";

/**
 * Lightweight theme scope for Cindor tokens and descendant components.
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
    colorScheme: { attribute: "color-scheme", reflect: true },
    theme: { reflect: true }
  };

  colorScheme: ProviderColorScheme = "inherit";
  theme: ProviderTheme = "inherit";

  override connectedCallback(): void {
    super.connectedCallback();
    this.syncPresentation();
  }

  protected override updated(): void {
    this.syncPresentation();
  }

  protected override render() {
    return html`<slot></slot>`;
  }

  private syncPresentation(): void {
    if (this.theme === "inherit") {
      this.removeAttribute("data-theme");
    } else {
      this.setAttribute("data-theme", this.theme);
    }

    if (this.colorScheme === "inherit") {
      this.style.removeProperty("color-scheme");
    } else {
      this.style.setProperty("color-scheme", this.colorScheme);
    }
  }
}
