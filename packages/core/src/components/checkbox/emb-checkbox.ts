import { css, html } from "lit";
import { live } from "lit/directives/live.js";

import { FormAssociatedElement } from "../shared/form-associated-element.js";

export class EmbCheckbox extends FormAssociatedElement {
  static styles = css`
    :host {
      display: inline-block;
      color: var(--fg);
    }

    label {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      font: inherit;
      cursor: pointer;
    }

    input {
      width: 16px;
      height: 16px;
      margin: 0;
      accent-color: var(--accent);
    }

    :host([disabled]) label {
      cursor: not-allowed;
      opacity: 0.72;
    }

    input:focus-visible {
      outline: none;
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
          @input=${this.handleInput}
          @change=${this.handleChange}
        />
        <slot></slot>
      </label>
    `;
  }

  protected override updated(): void {
    this.syncFormState();
    this.syncControlA11y(this.inputElement);
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
