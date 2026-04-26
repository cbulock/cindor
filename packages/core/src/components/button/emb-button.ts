import { css, html, LitElement } from "lit";

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
      gap: var(--space-2);
      min-height: 36px;
      padding: 0 var(--space-4);
      border-radius: var(--radius-md);
      border: 1px solid var(--border);
      background: var(--surface);
      color: var(--fg);
      cursor: pointer;
      transition:
        background var(--duration-base) var(--ease-out),
        border-color var(--duration-base) var(--ease-out),
        color var(--duration-base) var(--ease-out),
        box-shadow var(--duration-base) var(--ease-out),
        transform var(--duration-base) var(--ease-out);
    }

    :host([variant="solid"]) button {
      background: var(--accent);
      border-color: var(--accent);
      color: var(--accent-fg);
    }

    :host([variant="ghost"]) button {
      background: transparent;
    }

    button:hover:not(:disabled) {
      border-color: var(--border-strong);
      background: var(--bg-subtle);
      transform: translateY(-1px);
    }

    :host([variant="solid"]) button:hover:not(:disabled) {
      background: var(--accent-hover);
      border-color: var(--accent-hover);
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
  `;

  static properties = {
    disabled: { type: Boolean, reflect: true },
    type: { reflect: true },
    variant: { reflect: true }
  };

  disabled = false;
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
      <button class="emb-button__control" part="control" ?disabled=${this.disabled} type=${this.type}>
        <slot></slot>
      </button>
    `;
  }

  private get buttonElement(): HTMLButtonElement | null {
    return this.renderRoot.querySelector("button");
  }
}
