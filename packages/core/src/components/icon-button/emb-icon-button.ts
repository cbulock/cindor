import { css, html, LitElement } from "lit";
import { ifDefined } from "lit/directives/if-defined.js";

import type { ButtonType } from "../button/emb-button.js";

export class EmbIconButton extends LitElement {
  static styles = css`
    :host {
      display: inline-block;
      color: var(--fg-muted);
    }

    emb-button {
      --emb-button-background: transparent;
      --emb-button-border-color: transparent;
      --emb-button-color: var(--fg-muted);
      --emb-button-gap: 0;
      --emb-button-ghost-background: transparent;
      --emb-button-ghost-border-color: transparent;
      --emb-button-ghost-color: var(--fg-muted);
      --emb-button-hover-background: var(--bg-subtle);
      --emb-button-hover-border-color: transparent;
      --emb-button-hover-color: var(--fg);
      --emb-button-icon-min-size: 2rem;
      --emb-button-min-height: 2rem;
      --emb-button-radius: var(--radius-sm);
    }
  `;

  static properties = {
    disabled: { type: Boolean, reflect: true },
    label: { reflect: true },
    name: { reflect: true },
    size: { type: Number, reflect: true },
    strokeWidth: { type: Number, reflect: true, attribute: "stroke-width" },
    type: { reflect: true }
  };

  disabled = false;
  label = "";
  name = "";
  size = 16;
  strokeWidth = 2;
  type: ButtonType = "button";

  override focus(options?: FocusOptions): void {
    this.buttonElement?.focus(options);
  }

  override click(): void {
    this.buttonElement?.click();
  }

  protected override render() {
    return html`
      <emb-button
        part="control"
        aria-describedby=${ifDefined(this.hostAriaDescribedBy)}
        aria-label=${ifDefined(this.label || this.hostAriaLabel)}
        aria-labelledby=${ifDefined(this.hostAriaLabelledBy)}
        ?disabled=${this.disabled}
        ?icon-only=${true}
        type=${this.type}
        variant="ghost"
      >
        <emb-icon name=${this.name} part="icon" size=${String(this.size)} stroke-width=${String(this.strokeWidth)}></emb-icon>
      </emb-button>
    `;
  }

  private get buttonElement(): HTMLElement | null {
    return this.renderRoot.querySelector("emb-button");
  }

  private get hostAriaDescribedBy(): string | undefined {
    return this.getAttribute("aria-describedby") ?? undefined;
  }

  private get hostAriaLabel(): string | undefined {
    return this.getAttribute("aria-label") ?? undefined;
  }

  private get hostAriaLabelledBy(): string | undefined {
    return this.getAttribute("aria-labelledby") ?? undefined;
  }
}
