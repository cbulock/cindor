import { css, html, LitElement } from "lit";
import { ifDefined } from "lit/directives/if-defined.js";

export type ButtonVariant = "solid" | "ghost";
export type ButtonType = "button" | "submit" | "reset";

export class EmbButton extends LitElement {
  static styles = css`
    :host {
      display: inline-block;
      color: var(--fg);
    }

    button {
      font: inherit;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--emb-button-gap, var(--space-2));
      min-width: var(--emb-button-min-width, auto);
      min-height: var(--emb-button-min-height, 36px);
      padding: var(--emb-button-padding-block, 0) var(--emb-button-padding-inline, var(--space-4));
      border: 1px solid var(--emb-button-border-color, var(--border));
      border-start-start-radius: var(--emb-button-border-start-start-radius, var(--emb-button-radius, var(--radius-md)));
      border-start-end-radius: var(--emb-button-border-start-end-radius, var(--emb-button-radius, var(--radius-md)));
      border-end-start-radius: var(--emb-button-border-end-start-radius, var(--emb-button-radius, var(--radius-md)));
      border-end-end-radius: var(--emb-button-border-end-end-radius, var(--emb-button-radius, var(--radius-md)));
      background: var(--emb-button-background, var(--surface));
      color: var(--emb-button-color, var(--fg));
      cursor: pointer;
      transition:
        background var(--duration-base) var(--ease-out),
        border-color var(--duration-base) var(--ease-out),
        color var(--duration-base) var(--ease-out),
        box-shadow var(--duration-base) var(--ease-out),
        transform var(--duration-base) var(--ease-out);
    }

    :host([variant="solid"]) button {
      background: var(--emb-button-solid-background, var(--accent));
      border-color: var(--emb-button-solid-border-color, var(--accent));
      color: var(--emb-button-solid-color, var(--accent-fg));
    }

    :host([variant="ghost"]) button {
      background: var(--emb-button-ghost-background, transparent);
      border-color: var(--emb-button-ghost-border-color, var(--border));
      color: var(--emb-button-ghost-color, var(--fg));
    }

    button:hover:not(:disabled) {
      border-color: var(--emb-button-hover-border-color, var(--border-strong));
      background: var(--emb-button-hover-background, var(--bg-subtle));
      color: var(--emb-button-hover-color, currentColor);
      transform: translateY(-1px);
    }

    :host([variant="solid"]) button:hover:not(:disabled) {
      background: var(--emb-button-solid-hover-background, var(--accent-hover));
      border-color: var(--emb-button-solid-hover-border-color, var(--accent-hover));
      color: var(--emb-button-solid-hover-color, var(--emb-button-solid-color, var(--accent-fg)));
    }

    button:disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }

    button:focus-visible {
      outline: none;
      box-shadow: var(--ring-focus);
    }

    button:active:not(:disabled) {
      transform: translateY(0);
    }

    :host([icon-only]) button {
      min-width: var(--emb-button-icon-min-size, 2rem);
      padding-inline: 0;
    }

    .icon-slot {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      line-height: 0;
    }

    .icon-slot::slotted(*) {
      flex: none;
    }

    .label {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
  `;

  static properties = {
    disabled: { type: Boolean, reflect: true },
    iconOnly: { type: Boolean, reflect: true, attribute: "icon-only" },
    type: { reflect: true },
    variant: { reflect: true }
  };

  disabled = false;
  iconOnly = false;
  type: ButtonType = "button";
  variant: ButtonVariant = "solid";

  override focus(options?: FocusOptions): void {
    this.buttonElement?.focus(options);
  }

  override click(): void {
    this.buttonElement?.click();
  }

  protected override render() {
    return html`
      <button
        class="emb-button__control"
        part="control"
        aria-describedby=${ifDefined(this.hostAriaDescribedBy)}
        aria-label=${ifDefined(this.hostAriaLabel)}
        aria-labelledby=${ifDefined(this.hostAriaLabelledBy)}
        ?disabled=${this.disabled}
        type=${this.type}
      >
        <slot class="icon-slot" name="start-icon" part="start-icon"></slot>
        <span class="label" part="label"><slot></slot></span>
        <slot class="icon-slot" name="end-icon" part="end-icon"></slot>
      </button>
    `;
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

  private get buttonElement(): HTMLButtonElement | null {
    return this.renderRoot.querySelector("button");
  }
}
