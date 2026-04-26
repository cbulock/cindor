import { css, html } from "lit";
import { live } from "lit/directives/live.js";

import { FormAssociatedElement } from "../shared/form-associated-element.js";

export class EmbRange extends FormAssociatedElement {
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
      accent-color: var(--accent);
    }
  `;

  static properties = {
    disabled: { type: Boolean, reflect: true },
    max: { type: Number, reflect: true },
    min: { type: Number, reflect: true },
    name: { reflect: true },
    required: { type: Boolean, reflect: true },
    step: { type: Number, reflect: true },
    value: { type: Number, reflect: true }
  };

  disabled = false;
  max = 100;
  min = 0;
  name = "";
  required = false;
  step = 1;
  value = 0;

  private defaultValue = 0;

  override connectedCallback(): void {
    super.connectedCallback();
    this.defaultValue = Number(this.getAttribute("value") ?? this.value);
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
        .value=${live(String(this.value))}
        ?disabled=${this.disabled}
        max=${String(this.max)}
        min=${String(this.min)}
        name=${this.name}
        ?required=${this.required}
        step=${String(this.step)}
        type="range"
        @input=${this.handleInput}
        @change=${this.handleChange}
      />
    `;
  }

  protected override updated(): void {
    this.syncFormState();
  }

  private handleInput = (event: InputEvent): void => {
    event.stopPropagation();
    const input = event.currentTarget as HTMLInputElement;
    this.value = Number(input.value);
    this.syncFormState();
    this.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
  };

  private handleChange = (event: Event): void => {
    event.stopPropagation();
    const input = event.currentTarget as HTMLInputElement;
    this.value = Number(input.value);
    this.syncFormState();
    this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
  };

  private syncFormState(): void {
    if (this.disabled) {
      this.setFormValue(null);
      return;
    }

    this.setFormValue(String(this.value));
    if (this.inputElement) {
      this.setValidityFrom(this.inputElement);
    }
  }

  private get inputElement(): HTMLInputElement | null {
    return this.renderRoot.querySelector("input");
  }
}
