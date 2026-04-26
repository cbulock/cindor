import { css, html } from "lit";
import { live } from "lit/directives/live.js";

import { FormAssociatedElement } from "../shared/form-associated-element.js";

export class EmbSwitch extends FormAssociatedElement {
  static styles = css`
    :host {
      display: inline-block;
      color: var(--fg);
    }

    label {
      display: inline-flex;
      align-items: center;
      gap: var(--space-3);
      font: inherit;
      cursor: pointer;
    }

    .track {
      position: relative;
      display: inline-flex;
      align-items: center;
      width: 38px;
      height: 22px;
      border-radius: var(--radius-full);
      border: 1px solid var(--border);
      background: var(--bg-subtle);
      transition:
        background var(--duration-base) var(--ease-out),
        border-color var(--duration-base) var(--ease-out);
    }

    .thumb {
      position: absolute;
      left: 2px;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: var(--surface);
      box-shadow: var(--shadow-xs);
      transition:
        transform var(--duration-base) var(--ease-out),
        background var(--duration-base) var(--ease-out);
    }

    input {
      position: absolute;
      inline-size: 1px;
      block-size: 1px;
      opacity: 0;
      pointer-events: none;
    }

    :host([checked]) .track {
      background: var(--accent);
      border-color: var(--accent);
    }

    :host([checked]) .thumb {
      transform: translateX(16px);
      background: var(--accent-fg);
    }

    :host([disabled]) label {
      cursor: not-allowed;
      opacity: 0.72;
    }

    input:focus-visible + .track {
      box-shadow: var(--ring-focus);
    }
  `;

  static properties = {
    checked: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    name: { reflect: true },
    required: { type: Boolean, reflect: true },
    value: { reflect: true }
  };

  checked = false;
  disabled = false;
  name = "";
  required = false;
  value = "on";

  private defaultChecked = false;

  override connectedCallback(): void {
    super.connectedCallback();
    this.defaultChecked = this.hasAttribute("checked");
  }

  checkValidity(): boolean {
    return this.inputElement?.checkValidity() ?? true;
  }

  override focus(options?: FocusOptions): void {
    this.inputElement?.focus(options);
  }

  reportValidity(): boolean {
    return this.inputElement?.reportValidity() ?? true;
  }

  formDisabledCallback(disabled: boolean): void {
    this.disabled = disabled;
  }

  formResetCallback(): void {
    this.checked = this.defaultChecked;
    this.syncFormState();
  }

  protected override render() {
    return html`
      <label part="label">
        <input
          part="control"
          .checked=${live(this.checked)}
          ?disabled=${this.disabled}
          name=${this.name}
          ?required=${this.required}
          type="checkbox"
          value=${this.value}
          role="switch"
          @input=${this.handleInput}
          @change=${this.handleChange}
        />
        <span class="track" aria-hidden="true"><span class="thumb"></span></span>
        <slot></slot>
      </label>
    `;
  }

  protected override updated(): void {
    this.syncFormState();
  }

  private handleChange = (event: Event): void => {
    event.stopPropagation();
    const input = event.currentTarget as HTMLInputElement;
    this.checked = input.checked;
    this.syncFormState();
    this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
  };

  private handleInput = (event: InputEvent): void => {
    event.stopPropagation();
    const input = event.currentTarget as HTMLInputElement;
    this.checked = input.checked;
    this.syncFormState();
    this.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
  };

  private syncFormState(): void {
    if (this.disabled || !this.checked) {
      this.setFormValue(null);
    } else {
      this.setFormValue(this.value);
    }

    if (this.inputElement) {
      this.setValidityFrom(this.inputElement);
    }
  }

  private get inputElement(): HTMLInputElement | null {
    return this.renderRoot.querySelector("input");
  }
}
