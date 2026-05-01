import { css, html } from "lit";
import { live } from "lit/directives/live.js";

import { FormAssociatedElement } from "../shared/form-associated-element.js";

export class CindorColorInput extends FormAssociatedElement {
  static styles = css`
    :host {
      display: inline-block;
      width: var(--cindor-field-inline-size, min(100%, 160px));
      max-width: 100%;
      min-width: 0;
      color: var(--fg);
    }

    input {
      position: absolute;
      inline-size: 1px;
      block-size: 1px;
      margin: -1px;
      padding: 0;
      border: 0;
      overflow: hidden;
      clip: rect(0 0 0 0);
      clip-path: inset(50%);
      white-space: nowrap;
    }

    .surface {
      display: grid;
    }

    .trigger {
      box-sizing: border-box;
      display: grid;
      grid-template-columns: auto 1fr;
      align-items: center;
      gap: var(--space-3);
      width: 100%;
      min-height: 40px;
      padding: 6px;
      border-radius: var(--radius-md);
      border: 1px solid var(--border);
      background: var(--surface);
      color: var(--fg);
      cursor: pointer;
      font: inherit;
      text-align: start;
      transition:
        border-color var(--duration-base) var(--ease-out),
        box-shadow var(--duration-base) var(--ease-out),
        background var(--duration-base) var(--ease-out);
    }

    .trigger:hover:not(:disabled) {
      border-color: var(--border-strong);
      background: var(--bg-subtle);
    }

    .trigger:disabled {
      cursor: not-allowed;
      background: var(--bg-subtle);
      color: var(--fg-subtle);
    }

    .trigger:focus-visible,
    .surface:focus-within .trigger {
      outline: none;
      box-shadow: var(--ring-focus);
    }

    .swatch {
      inline-size: 1.75rem;
      block-size: 1.75rem;
      border-radius: calc(var(--radius-md) - 2px);
      border: 1px solid color-mix(in srgb, var(--fg) 12%, var(--border));
      background-color: var(--cindor-color-input-value, #4f46e5);
      box-shadow: inset 0 0 0 1px rgb(255 255 255 / 30%);
    }

    .value {
      font-family: var(--font-mono);
      font-size: var(--text-sm);
      letter-spacing: 0.02em;
    }
  `;

  static properties = {
    disabled: { type: Boolean, reflect: true },
    name: { reflect: true },
    value: { reflect: true }
  };

  disabled = false;
  name = "";
  value = "#4f46e5";

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
      <div class="surface" part="surface" style=${`--cindor-color-input-value: ${this.value};`}>
        <input
          part="control"
          .value=${live(this.value)}
          ?disabled=${this.disabled}
          name=${this.name}
          type="color"
          @input=${this.handleInput}
          @change=${this.handleChange}
        />
        <button class="trigger" part="trigger" type="button" ?disabled=${this.disabled} @click=${this.handleTriggerClick}>
          <span class="swatch" part="swatch" aria-hidden="true"></span>
          <span class="value" part="value">${this.value.toUpperCase()}</span>
        </button>
      </div>
    `;
  }

  protected override updated(): void {
    this.syncFormState();
    this.syncControlA11y(this.inputElement);
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

  private handleTriggerClick = (): void => {
    if (this.disabled || !this.inputElement) {
      return;
    }

    if (typeof this.inputElement.showPicker === "function") {
      this.inputElement.showPicker();
      return;
    }

    this.inputElement.click();
  };
}
