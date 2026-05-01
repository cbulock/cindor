import { css, html, nothing, type CSSResultGroup } from "lit";
import { ifDefined } from "lit/directives/if-defined.js";
import { live } from "lit/directives/live.js";

import { createFieldHostStyles, createTextControlStyles } from "../shared/control-styles.js";
import { FormAssociatedElement } from "../shared/form-associated-element.js";

export class BaseInputElement extends FormAssociatedElement {
  static styles: CSSResultGroup = [
    createFieldHostStyles("min(100%, 320px)"),
    createTextControlStyles("input"),
    css`
      .surface {
        position: relative;
      }

      .surface[data-has-start-adornment="true"] input {
        padding-inline-start: calc(var(--space-3) * 2 + 1rem);
      }

      .surface[data-has-end-adornment="true"] input {
        padding-inline-end: calc(var(--space-3) * 2 + 1rem);
      }

      .icon {
        position: absolute;
        inset-block-start: 50%;
        block-size: 1rem;
        inline-size: 1rem;
        color: var(--fg-subtle);
        pointer-events: none;
        transform: translateY(-50%);
      }

      .start-icon {
        inset-inline-start: var(--space-3);
      }

      .end-icon {
        inset-inline-end: var(--space-3);
      }
    `
  ];

  static properties = {
    autocomplete: { reflect: true },
    disabled: { type: Boolean, reflect: true },
    endIcon: { reflect: true, attribute: "end-icon" },
    max: { reflect: true },
    min: { reflect: true },
    name: { reflect: true },
    placeholder: { reflect: true },
    readonly: { type: Boolean, reflect: true, attribute: "readonly" },
    required: { type: Boolean, reflect: true },
    startIcon: { reflect: true, attribute: "start-icon" },
    step: { reflect: true },
    value: { reflect: true }
  };

  autocomplete = "";
  disabled = false;
  endIcon = "";
  max = "";
  min = "";
  name = "";
  placeholder = "";
  readonly = false;
  required = false;
  startIcon = "";
  step = "";
  value = "";

  protected defaultValue = "";

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
    const hasStartAdornment = this.hasStartAdornment;
    const hasEndAdornment = this.hasEndAdornment;

    return html`
      <div
        class="surface"
        part="surface"
        data-has-start-adornment=${String(hasStartAdornment)}
        data-has-end-adornment=${String(hasEndAdornment)}
      >
        ${this.renderStartAdornment()}
        <input
          part="control"
          .value=${live(this.value)}
          autocomplete=${ifDefined(this.autocomplete || undefined)}
          ?disabled=${this.disabled}
          max=${ifDefined(this.max || undefined)}
          min=${ifDefined(this.min || undefined)}
          name=${this.name}
          placeholder=${this.placeholder}
          ?readonly=${this.readonly}
          ?required=${this.required}
          step=${ifDefined(this.step || undefined)}
          type=${this.inputType}
          @input=${this.handleInput}
          @change=${this.handleChange}
        />
        ${this.renderEndAdornment()}
      </div>
    `;
  }

  protected override updated(): void {
    this.syncFormState();
    this.syncControlA11y(this.inputElement);
  }

  protected handleChange = (event: Event): void => {
    event.stopPropagation();
    const input = event.currentTarget as HTMLInputElement;
    this.value = input.value;
    this.syncFormState();
    this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
  };

  protected handleInput = (event: InputEvent): void => {
    event.stopPropagation();
    const input = event.currentTarget as HTMLInputElement;
    this.value = input.value;
    this.syncFormState();
    this.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
  };

  protected syncFormState(): void {
    if (this.disabled) {
      this.setFormValue(null);
      return;
    }

    this.setFormValue(this.value);
    if (this.inputElement) {
      this.setValidityFrom(this.inputElement);
    }
  }

  protected get inputElement(): HTMLInputElement | null {
    return this.renderRoot.querySelector("input");
  }

  protected get hasStartAdornment(): boolean {
    return this.startIcon !== "";
  }

  protected get hasEndAdornment(): boolean {
    return this.endIcon !== "";
  }

  protected renderStartAdornment() {
    if (this.startIcon === "") {
      return nothing;
    }

    return html`
      <cindor-icon
        aria-hidden="true"
        class="icon start-icon"
        part="icon start-icon"
        name=${this.startIcon}
        size="16"
      ></cindor-icon>
    `;
  }

  protected renderEndAdornment() {
    if (this.endIcon === "") {
      return nothing;
    }

    return html`
      <cindor-icon
        aria-hidden="true"
        class="icon end-icon"
        part="icon end-icon"
        name=${this.endIcon}
        size="16"
      ></cindor-icon>
    `;
  }

  protected get inputType(): string {
    return "text";
  }
}

export class CindorInput extends BaseInputElement {
  static properties = {
    ...BaseInputElement.properties,
    type: { reflect: true }
  };

  type = "text";

  protected override get inputType(): string {
    return this.type;
  }
}
