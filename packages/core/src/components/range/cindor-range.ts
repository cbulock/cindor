import { css, html } from "lit";
import { live } from "lit/directives/live.js";

import { FormAssociatedElement } from "../shared/form-associated-element.js";
import { bridgeNativeEvent } from "../shared/native-events.js";

/**
 * @fires {Event} input - Fired as the value changes through user interaction.
 * @fires {Event} change - Fired when the user commits a value change.
 * @fires {Event} invalid - Fired when constraint validation fails. This event is cancelable and does not bubble.
 */
export class CindorRange extends FormAssociatedElement {
  static styles = css`
    :host {
      display: inline-block;
      width: var(--cindor-field-inline-size, min(100%, 320px));
      max-width: 100%;
      min-width: 0;
      color: var(--fg);
    }

    input {
      box-sizing: border-box;
      width: 100%;
      accent-color: var(--accent);
    }

    :host-context([data-theme='retro']) input,
    :host-context([data-theme='retro-light']) input {
      appearance: none;
      -webkit-appearance: none;
      height: 20px;
      background: transparent;
      cursor: pointer;
    }

    :host-context([data-theme='retro']) input::-webkit-slider-runnable-track,
    :host-context([data-theme='retro-light']) input::-webkit-slider-runnable-track {
      height: 8px;
      border-radius: 0;
      background:
        linear-gradient(
          to right,
          currentColor 0 var(--cindor-range-progress),
          color-mix(in srgb, currentColor 16%, transparent) var(--cindor-range-progress) 100%
        );
      box-shadow: inset 0 0 0 2px currentColor;
    }

    :host-context([data-theme='retro']) input::-webkit-slider-thumb,
    :host-context([data-theme='retro-light']) input::-webkit-slider-thumb {
      appearance: none;
      -webkit-appearance: none;
      inline-size: 18px;
      block-size: 18px;
      margin-top: -5px;
      border: 0;
      border-radius: 0;
      background: var(--surface);
      box-shadow:
        inset 0 0 0 2px currentColor,
        2px 2px 0 currentColor;
    }

    :host-context([data-theme='retro']) input::-webkit-slider-thumb {
      filter: drop-shadow(0 0 4px currentColor);
    }

    :host-context([data-theme='retro']) input::-moz-range-track,
    :host-context([data-theme='retro-light']) input::-moz-range-track {
      height: 8px;
      border: 0;
      border-radius: 0;
      background: color-mix(in srgb, currentColor 16%, transparent);
      box-shadow: inset 0 0 0 2px currentColor;
    }

    :host-context([data-theme='retro']) input::-moz-range-progress,
    :host-context([data-theme='retro-light']) input::-moz-range-progress {
      height: 8px;
      border: 0;
      border-radius: 0;
      background: currentColor;
      box-shadow: inset 0 0 0 2px currentColor;
    }

    :host-context([data-theme='retro']) input::-moz-range-thumb,
    :host-context([data-theme='retro-light']) input::-moz-range-thumb {
      inline-size: 18px;
      block-size: 18px;
      border: 0;
      border-radius: 0;
      background: var(--surface);
      box-shadow:
        inset 0 0 0 2px currentColor,
        2px 2px 0 currentColor;
    }

    :host-context([data-theme='retro']) input::-moz-range-thumb {
      filter: drop-shadow(0 0 4px currentColor);
    }

    :host-context([data-theme='retro']) input:focus-visible,
    :host-context([data-theme='retro-light']) input:focus-visible {
      outline: none;
    }

    :host-context([data-theme='retro']) input:focus-visible::-webkit-slider-thumb,
    :host-context([data-theme='retro-light']) input:focus-visible::-webkit-slider-thumb,
    :host-context([data-theme='retro']) input:focus-visible::-moz-range-thumb,
    :host-context([data-theme='retro-light']) input:focus-visible::-moz-range-thumb {
      box-shadow:
        inset 0 0 0 2px currentColor,
        2px 2px 0 currentColor,
        var(--ring-focus);
    }

    :host-context([data-theme='retro']) input:disabled,
    :host-context([data-theme='retro-light']) input:disabled {
      cursor: not-allowed;
      opacity: 0.6;
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

  override formDisabledCallback(disabled: boolean): void {
    super.formDisabledCallback(disabled);
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
        ?disabled=${this.effectiveDisabled}
        max=${String(this.max)}
        min=${String(this.min)}
        name=${this.name}
        ?required=${this.required}
        step=${String(this.step)}
        style=${`--cindor-range-progress:${this.progressPercent}%;`}
        type="range"
        @invalid=${this.handleControlInvalid}
        @input=${this.handleInput}
        @change=${this.handleChange}
      />
    `;
  }

  protected override updated(): void {
    this.syncFormState();
    this.syncControlA11y(this.inputElement);
  }

  private handleInput = (event: InputEvent): void => {
    const input = event.currentTarget as HTMLInputElement;
    this.value = Number(input.value);
    this.syncFormState();
    bridgeNativeEvent(this, event);
  };

  private handleChange = (event: Event): void => {
    const input = event.currentTarget as HTMLInputElement;
    this.value = Number(input.value);
    this.syncFormState();
    bridgeNativeEvent(this, event);
  };

  private syncFormState(): void {
    if (this.effectiveDisabled) {
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

  private get progressPercent(): number {
    const span = this.max - this.min;

    if (span <= 0) {
      return 0;
    }

    return Math.min(100, Math.max(0, ((this.value - this.min) / span) * 100));
  }
}
