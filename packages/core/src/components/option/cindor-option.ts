import { css, html, LitElement } from "lit";

export class CindorOption extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .surface {
      display: block;
      width: 100%;
      box-sizing: border-box;
      padding: var(--space-2) var(--space-3);
      border-radius: var(--radius-md);
      background: transparent;
      color: var(--fg);
      font: inherit;
      text-align: start;
      transition:
        background var(--duration-base) var(--ease-out),
        color var(--duration-base) var(--ease-out);
    }

    :host([active]) .surface {
      background: var(--bg-subtle);
    }

    :host([selected]) .surface {
      color: var(--accent);
      font-weight: 600;
    }

    :host([disabled]) .surface {
      color: var(--fg-subtle);
      cursor: not-allowed;
    }
  `;

  static properties = {
    active: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    label: { reflect: true },
    selected: { type: Boolean, reflect: true },
    value: { reflect: true }
  };

  active = false;
  disabled = false;
  label = "";
  selected = false;
  value = "";

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute("role", "option");
  }

  override click(): void {
    this.surfaceElement?.click();
  }

  protected override updated(): void {
    this.setAttribute("aria-disabled", String(this.disabled));
    this.setAttribute("aria-selected", String(this.selected));
  }

  protected override render() {
    return html`
      <div class="surface" part="surface" @click=${this.handleClick} @mousedown=${this.handleMouseDown} @mousemove=${this.handleMouseMove}>
        <slot>${this.label}</slot>
      </div>
    `;
  }

  private handleClick = (): void => {
    if (this.disabled) {
      return;
    }

    this.dispatchEvent(
      new CustomEvent("option-select", {
        bubbles: true,
        composed: true,
        detail: { option: this, value: this.value }
      })
    );
  };

  private handleMouseDown = (event: MouseEvent): void => {
    if (this.disabled) {
      return;
    }

    event.preventDefault();
  };

  private handleMouseMove = (): void => {
    if (this.disabled) {
      return;
    }

    this.dispatchEvent(
      new CustomEvent("option-hover", {
        bubbles: true,
        composed: true,
        detail: { option: this, value: this.value }
      })
    );
  };

  private get surfaceElement(): HTMLElement | null {
    return this.renderRoot.querySelector(".surface");
  }
}
