import { css, html } from "lit";

import type { CindorDatePicker } from "../date-picker/cindor-date-picker.js";
import { FormAssociatedElement } from "../shared/form-associated-element.js";

/**
 * Combined date and time picker built from Cindor date and time fields.
 *
 * @fires input - Fired when either the date or time value changes.
 * @fires change - Fired when the combined value changes.
 * @fires {Event} invalid - Fired when constraint validation fails. This event is cancelable and does not bubble.
 */
export class CindorDateTimePicker extends FormAssociatedElement {
  static styles = css`
    :host {
      display: block;
      color: var(--fg);
    }

    .surface {
      display: grid;
      gap: var(--space-3);
    }

    @media (min-width: 40rem) {
      .surface {
        grid-template-columns: minmax(0, 1fr) minmax(10rem, 12rem);
      }
    }
  `;

  static properties = {
    dateValue: { reflect: true, attribute: "date-value" },
    disabled: { type: Boolean, reflect: true },
    name: { reflect: true },
    required: { type: Boolean, reflect: true },
    timeValue: { reflect: true, attribute: "time-value" },
    value: { reflect: true }
  };

  dateValue = "";
  disabled = false;
  name = "";
  required = false;
  timeValue = "";
  value = "";

  private defaultValue = "";

  override connectedCallback(): void {
    super.connectedCallback();
    this.defaultValue = this.getAttribute("value") ?? this.value;
    this.syncSplitValues();
  }

  checkValidity(): boolean {
    this.syncFormState();
    return this.internals?.checkValidity?.() ?? !this.validationMessage;
  }

  get validationMessage(): string {
    return !this.effectiveDisabled && this.required && !this.value ? "Please select a date and time." : "";
  }

  get validity(): Pick<ValidityState, "valid" | "valueMissing"> {
    const valueMissing = Boolean(this.validationMessage);
    return this.internals?.validity ?? { valid: !valueMissing, valueMissing };
  }

  override focus(options?: FocusOptions): void {
    this.datePickerElement?.focus(options);
  }

  reportValidity(): boolean {
    this.syncFormState();
    return this.internals?.reportValidity?.() ?? !this.validationMessage;
  }

  override formDisabledCallback(disabled: boolean): void {
    super.formDisabledCallback(disabled);
  }

  formResetCallback(): void {
    this.value = this.defaultValue;
    this.dateValue = "";
    this.timeValue = "";
    this.syncSplitValues();
    this.syncFormState();
  }

  protected override willUpdate(changedProperties: Map<PropertyKey, unknown>): void {
    if (!changedProperties.has("value")) {
      return;
    }

    // A child edit that clears the combined value has already cleared one of the fields.
    if (changedProperties.get("value") && this.value === "" && this.dateValue && this.timeValue) {
      this.dateValue = "";
      this.timeValue = "";
    } else {
      this.syncSplitValues();
    }
  }

  protected override render() {
    return html`
      <div class="surface" part="surface">
        <cindor-date-picker
          .value=${this.dateValue}
          ?disabled=${this.effectiveDisabled}
          ?required=${this.required}
          @change=${this.handleDateChange}
          @input=${this.handleDateInput}
        ></cindor-date-picker>
        <cindor-time-input
          .value=${this.timeValue}
          ?disabled=${this.effectiveDisabled}
          ?required=${this.required}
          @change=${this.handleTimeChange}
          @input=${this.handleTimeInput}
          @select=${(event: Event) => event.stopPropagation()}
        ></cindor-time-input>
      </div>
    `;
  }

  protected override updated(): void {
    this.syncFormState();
  }

  protected override firstUpdated(): void {
    void this.datePickerElement?.updateComplete.then(() => this.syncFormState());
  }

  private handleDateInput = (event: Event): void => {
    event.stopPropagation();
    const picker = event.currentTarget as HTMLElement & { value: string };
    this.dateValue = picker.value;
    this.syncCombinedValue();
    this.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
  };

  private handleDateChange = (event: Event): void => {
    event.stopPropagation();
    const picker = event.currentTarget as HTMLElement & { value: string };
    this.dateValue = picker.value;
    this.syncCombinedValue();
    this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
  };

  private handleTimeInput = (event: Event): void => {
    event.stopPropagation();
    const input = event.currentTarget as HTMLElement & { value: string };
    this.timeValue = input.value;
    this.syncCombinedValue();
    this.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
  };

  private handleTimeChange = (event: Event): void => {
    event.stopPropagation();
    const input = event.currentTarget as HTMLElement & { value: string };
    this.timeValue = input.value;
    this.syncCombinedValue();
    this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
  };

  private syncSplitValues(): void {
    if (!this.value.includes("T")) {
      if (this.value && !this.dateValue) {
        this.dateValue = this.value;
      }
      return;
    }

    const [dateValue, timeValue] = this.value.split("T");
    this.dateValue = dateValue ?? "";
    this.timeValue = timeValue ?? "";
  }

  private syncCombinedValue(): void {
    this.value = this.dateValue && this.timeValue ? `${this.dateValue}T${this.timeValue}` : "";
    this.syncFormState();
  }

  private syncFormState(): void {
    this.setFormValue(this.effectiveDisabled ? null : this.value);
    const message = this.validationMessage;
    const anchor = this.datePickerElement?.shadowRoot?.querySelector("input") ?? undefined;
    this.internals?.setValidity?.(message ? { valueMissing: true } : {}, message, anchor);
  }

  private get datePickerElement(): CindorDatePicker | null {
    return this.renderRoot?.querySelector("cindor-date-picker") ?? null;
  }
}
