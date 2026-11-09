import { html } from "lit";
import { ifDefined } from "lit/directives/if-defined.js";
import { live } from "lit/directives/live.js";

import { createFieldHostStyles, createTextControlStyles } from "../shared/control-styles.js";
import { FormAssociatedElement } from "../shared/form-associated-element.js";
import { bridgeNativeEvent } from "../shared/native-events.js";

/**
 * @fires {InputEvent | Event} input - Fired as the value changes through user interaction.
 * @fires {Event} change - Fired when the user commits a value change.
 * @fires {Event} select - Fired when the native control reports text selection.
 * @fires {Event} invalid - Fired when constraint validation fails. This event is cancelable and does not bubble.
 */
export class CindorTextarea extends FormAssociatedElement {
  static styles = [
    createFieldHostStyles("min(100%, 420px)"),
    createTextControlStyles("textarea", {
      lineHeight: "var(--leading-normal)",
      minBlockSize: "88px",
      padding: "var(--space-3)",
      resize: "vertical"
    })
  ];

  static properties = {
    disabled: { type: Boolean, reflect: true },
    name: { reflect: true },
    placeholder: { reflect: true },
    readonly: { type: Boolean, reflect: true, attribute: "readonly" },
    required: { type: Boolean, reflect: true },
    rows: { type: Number, reflect: true },
    value: { reflect: true }
  };

  disabled = false;
  name = "";
  placeholder = "";
  readonly = false;
  required = false;
  rows = 4;
  value = "";

  private defaultValue = "";

  override connectedCallback(): void {
    super.connectedCallback();
    this.defaultValue = this.getAttribute("value") ?? this.value;
  }

  checkValidity(): boolean {
    return this.textareaElement?.checkValidity() ?? true;
  }

  override focus(options?: FocusOptions): void {
    this.textareaElement?.focus(options);
  }

  reportValidity(): boolean {
    return this.textareaElement?.reportValidity() ?? true;
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
      <textarea
        part="control"
        .value=${live(this.value)}
        ?disabled=${this.effectiveDisabled}
        form=${ifDefined(this.associatedFormId)}
        name=${this.name}
        placeholder=${this.placeholder}
        ?readonly=${this.readonly}
        ?required=${this.required}
        rows=${this.rows}
        @invalid=${this.handleControlInvalid}
        @select=${this.handleControlSelect}
        @input=${this.handleInput}
        @change=${this.handleChange}
      ></textarea>
    `;
  }

  protected override updated(): void {
    this.syncFormState();
    this.syncControlA11y(this.textareaElement);
  }

  private handleChange = (event: Event): void => {
    const textarea = event.currentTarget as HTMLTextAreaElement;
    this.value = textarea.value;
    this.syncFormState();
    bridgeNativeEvent(this, event);
  };

  private handleInput = (event: InputEvent): void => {
    const textarea = event.currentTarget as HTMLTextAreaElement;
    this.value = textarea.value;
    this.syncFormState();
    bridgeNativeEvent(this, event);
  };

  private syncFormState(): void {
    if (this.effectiveDisabled) {
      this.setFormValue(null);
      return;
    }

    this.setFormValue(this.value);
    if (this.textareaElement) {
      this.setValidityFrom(this.textareaElement);
    }
  }

  private get textareaElement(): HTMLTextAreaElement | null {
    return this.renderRoot.querySelector("textarea");
  }
}
