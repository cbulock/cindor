import { css, html } from "lit";
import { live } from "lit/directives/live.js";

import { FormAssociatedElement } from "../shared/form-associated-element.js";

export class EmbTimeInput extends FormAssociatedElement {
  static styles = css`
    :host {
      display: inline-block;
      width: var(--emb-field-inline-size, min(100%, 320px));
      max-width: 100%;
      min-width: 0;
      color: var(--fg);
    }

    input {
      box-sizing: border-box;
      width: 100%;
      min-height: 36px;
      font: inherit;
      padding: 0 var(--space-3);
      border-radius: var(--radius-md);
      border: 1px solid var(--border);
      background: var(--surface);
      color: var(--fg);
      transition:
        border-color var(--duration-base) var(--ease-out),
        box-shadow var(--duration-base) var(--ease-out),
        background var(--duration-base) var(--ease-out);
    }

    input:disabled {
      cursor: not-allowed;
      color: var(--fg-subtle);
      background: var(--bg-subtle);
    }

    input:focus-visible {
      outline: none;
      box-shadow: var(--ring-focus);
    }
  `;

  static properties = {
    disabled: { type: Boolean, reflect: true },
    max: { reflect: true },
    min: { reflect: true },
    name: { reflect: true },
    readonly: { type: Boolean, reflect: true, attribute: "readonly" },
    required: { type: Boolean, reflect: true },
    step: { reflect: true },
    value: { reflect: true }
  };

  disabled = false;
  max = "";
  min = "";
  name = "";
  readonly = false;
  required = false;
  step = "";
  value = "";

  private defaultValue = "";

  override connectedCallback(): void {
    super.connectedCallback();
    this.defaultValue = this.getAttribute("value") ?? this.value;
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
    this.value = this.defaultValue;
    this.syncFormState();
  }

  protected override render() {
    return html`
      <input
        part="control"
        .value=${live(this.value)}
        ?disabled=${this.disabled}
        max=${this.max}
        min=${this.min}
        name=${this.name}
        ?readonly=${this.readonly}
        ?required=${this.required}
        step=${this.step}
        type="time"
        @input=${this.handleInput}
        @change=${this.handleChange}
      />
    `;
  }

  protected override updated(): void {
    this.syncFormState();
  }

  private handleChange = (event: Event): void => {
    event.stopPropagation();
    const input = event.currentTarget as HTMLInputElement;
    this.value = input.value;
    this.syncFormState();
    this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
  };

  private handleInput = (event: InputEvent): void => {
    event.stopPropagation();
    const input = event.currentTarget as HTMLInputElement;
    this.value = input.value;
    this.syncFormState();
    this.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
  };

  private syncFormState(): void {
    if (this.disabled) {
      this.setFormValue(null);
      return;
    }

    this.setFormValue(this.value);
    if (this.inputElement) {
      this.setValidityFrom(this.inputElement);
    }
  }

  private get inputElement(): HTMLInputElement | null {
    return this.renderRoot.querySelector("input");
  }
}
