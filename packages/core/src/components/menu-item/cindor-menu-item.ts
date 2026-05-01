import { css, html, LitElement } from "lit";

export class CindorMenuItem extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    button {
      width: 100%;
      box-sizing: border-box;
      min-height: 36px;
      padding: var(--space-2) var(--space-3);
      border: 0;
      border-radius: var(--radius-md);
      background: transparent;
      color: var(--fg);
      font: inherit;
      text-align: start;
      transition:
        background var(--duration-base) var(--ease-out),
        color var(--duration-base) var(--ease-out);
    }

    button:hover:not(:disabled) {
      background: var(--bg-subtle);
    }

    button:focus-visible {
      outline: none;
      box-shadow: var(--ring-focus);
    }

    button:disabled {
      color: var(--fg-subtle);
      cursor: not-allowed;
    }
  `;

  static properties = {
    disabled: { type: Boolean, reflect: true }
  };

  disabled = false;

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute("role", "menuitem");
  }

  override click(): void {
    this.buttonElement?.click();
  }

  override focus(options?: FocusOptions): void {
    this.buttonElement?.focus(options);
  }

  protected override updated(): void {
    this.setAttribute("aria-disabled", String(this.disabled));
  }

  protected override render() {
    return html`
      <button part="control" type="button" ?disabled=${this.disabled} @click=${this.handleClick}>
        <slot></slot>
      </button>
    `;
  }

  private handleClick = (event: MouseEvent): void => {
    if (this.disabled) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    this.dispatchEvent(
      new CustomEvent("menu-item-select", {
        bubbles: true,
        composed: true,
        detail: { item: this }
      })
    );
  };

  private get buttonElement(): HTMLButtonElement | null {
    return this.renderRoot.querySelector("button");
  }
}
