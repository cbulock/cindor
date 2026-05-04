import { css, html, LitElement } from "lit";
import { ifDefined } from "lit/directives/if-defined.js";

import type { ButtonType } from "../button/cindor-button.js";

export class CindorIconButton extends LitElement {
  static styles = css`
    :host {
      display: inline-block;
      color: var(--fg-muted);
    }

    cindor-button {
      --cindor-button-background: transparent;
      --cindor-button-border-color: transparent;
      --cindor-button-color: var(--fg-muted);
      --cindor-button-gap: 0;
      --cindor-button-ghost-background: transparent;
      --cindor-button-ghost-border-color: transparent;
      --cindor-button-ghost-color: var(--fg-muted);
      --cindor-button-hover-background: var(--bg-subtle);
      --cindor-button-hover-border-color: transparent;
      --cindor-button-hover-color: var(--fg);
      --cindor-button-icon-min-size: 2rem;
      --cindor-button-min-height: 2rem;
      --cindor-button-radius: var(--radius-sm);
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
  private readonly hostA11yObserver = new MutationObserver(() => {
    this.requestUpdate();
  });

  override connectedCallback(): void {
    super.connectedCallback();
    this.hostA11yObserver.observe(this, {
      attributeFilter: ["aria-description", "aria-describedby", "aria-label", "aria-labelledby", "id"],
      attributes: true
    });
  }

  override disconnectedCallback(): void {
    this.hostA11yObserver.disconnect();
    super.disconnectedCallback();
  }

  override focus(options?: FocusOptions): void {
    this.buttonElement?.focus(options);
  }

  override click(): void {
    this.buttonElement?.click();
  }

  protected override render() {
    return html`
      <cindor-button
        part="control"
        aria-description=${ifDefined(this.hostAriaDescription)}
        aria-describedby=${ifDefined(this.hostAriaDescribedBy)}
        aria-label=${ifDefined(this.label || this.hostAriaLabel)}
        aria-labelledby=${ifDefined(this.hostAriaLabelledBy)}
        ?disabled=${this.disabled}
        ?icon-only=${true}
        type=${this.type}
        variant="ghost"
      >
        <cindor-icon name=${this.name} part="icon" size=${String(this.size)} stroke-width=${String(this.strokeWidth)}></cindor-icon>
      </cindor-button>
    `;
  }

  private get buttonElement(): HTMLElement | null {
    return this.renderRoot.querySelector("cindor-button");
  }

  private get hostAriaDescribedBy(): string | undefined {
    return this.getAttribute("aria-describedby") ?? undefined;
  }

  private get hostAriaDescription(): string | undefined {
    return this.getAttribute("aria-description") ?? undefined;
  }

  private get hostAriaLabel(): string | undefined {
    return this.getAttribute("aria-label") ?? undefined;
  }

  private get hostAriaLabelledBy(): string | undefined {
    return this.getAttribute("aria-labelledby") ?? undefined;
  }
}
