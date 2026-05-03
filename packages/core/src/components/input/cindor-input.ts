import { css, html, nothing, type CSSResultGroup } from "lit";
import { ifDefined } from "lit/directives/if-defined.js";
import { live } from "lit/directives/live.js";

import { createFieldHostStyles, createTextControlStyles } from "../shared/control-styles.js";
import { FormAssociatedElement } from "../shared/form-associated-element.js";

export class BaseInputElement extends FormAssociatedElement {
  private static readonly assistiveTextStyles = [
    "position:absolute",
    "inline-size:1px",
    "block-size:1px",
    "padding:0",
    "margin:-1px",
    "overflow:hidden",
    "clip:rect(0 0 0 0)",
    "white-space:nowrap",
    "border:0"
  ].join(";");

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
    const resolvedLabelText = this.resolvedLabelText;
    const resolvedDescriptionText = this.resolvedDescriptionText;

    return html`
      ${resolvedLabelText
        ? html`
            <label id=${this.controlLabelId} for=${this.controlId} style=${BaseInputElement.assistiveTextStyles}>
              ${resolvedLabelText}
            </label>
          `
        : nothing}
      <div
        class="surface"
        part="surface"
        data-has-start-adornment=${String(hasStartAdornment)}
        data-has-end-adornment=${String(hasEndAdornment)}
      >
        ${this.renderStartAdornment()}
        <input
          id=${this.controlId}
          part="control"
          .value=${live(this.value)}
          aria-describedby=${ifDefined(resolvedDescriptionText ? this.controlDescriptionId : undefined)}
          autocomplete=${ifDefined(this.resolvedAutocomplete)}
          ?disabled=${this.disabled}
          form=${ifDefined(this.associatedFormId)}
          max=${ifDefined(this.max || undefined)}
          min=${ifDefined(this.min || undefined)}
          name=${ifDefined(this.name || undefined)}
          placeholder=${ifDefined(this.placeholder || undefined)}
          ?readonly=${this.readonly}
          ?required=${this.required}
          step=${ifDefined(this.step || undefined)}
          type=${this.inputType}
          @keydown=${this.handleKeyDown}
          @input=${this.handleInput}
          @change=${this.handleChange}
        />
        ${this.renderEndAdornment()}
      </div>
      ${resolvedDescriptionText
        ? html`
            <span id=${this.controlDescriptionId} style=${BaseInputElement.assistiveTextStyles}>
              ${resolvedDescriptionText}
            </span>
          `
        : nothing}
    `;
  }

  protected override updated(): void {
    this.syncFormState();
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

  protected handleKeyDown = (event: KeyboardEvent): void => {
    if (
      event.key !== "Enter" ||
      event.defaultPrevented ||
      event.isComposing ||
      this.disabled ||
      this.readonly ||
      !this.associatedForm
    ) {
      return;
    }

    event.preventDefault();
    this.associatedForm.requestSubmit();
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

  protected get resolvedAutocomplete(): string | undefined {
    return this.normalizeA11yText(this.autocomplete) || undefined;
  }

  protected get resolvedLabelText(): string {
    const ariaLabelledBy = this.resolveReferencedText(this.getAttribute("aria-labelledby"));
    const ariaLabel = this.normalizeA11yText(this.getAttribute("aria-label"));
    return ariaLabelledBy || ariaLabel;
  }

  protected get resolvedDescriptionText(): string {
    const describedByText = this.resolveReferencedText(this.getAttribute("aria-describedby"));
    return this.normalizeA11yText(
      [this.getAttribute("aria-description"), describedByText].filter((value) => value && value.trim() !== "").join(" ")
    );
  }

  private get controlDescriptionId(): string {
    return `${this.controlId}-description`;
  }

  private get controlLabelId(): string {
    return `${this.controlId}-label`;
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
