import { css, html } from "lit";

import { FormAssociatedElement } from "../shared/form-associated-element.js";

/**
 * Combined date and time picker built from Emberline date and time fields.
 *
 * @fires input - Fired when either the date or time value changes.
 * @fires change - Fired when the combined value changes.
 */
export class EmbDateTimePicker extends FormAssociatedElement {
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
    return !this.required || this.value !== "";
  }

  override focus(options?: FocusOptions): void {
    this.datePickerElement?.focus(options);
  }

  reportValidity(): boolean {
    return this.checkValidity();
  }

  formDisabledCallback(disabled: boolean): void {
    this.disabled = disabled;
  }

  formResetCallback(): void {
    this.value = this.defaultValue;
    this.syncSplitValues();
    this.syncFormState();
  }

  protected override render() {
    return html`
      <div class="surface" part="surface">
        <emb-date-picker
          .value=${this.dateValue}
          ?disabled=${this.disabled}
          ?required=${this.required}
          @change=${this.handleDateChange}
          @input=${this.handleDateInput}
        ></emb-date-picker>
        <emb-time-input
          .value=${this.timeValue}
          ?disabled=${this.disabled}
          ?required=${this.required}
          @change=${this.handleTimeChange}
          @input=${this.handleTimeInput}
        ></emb-time-input>
      </div>
    `;
  }

  protected override updated(changedProperties: Map<PropertyKey, unknown>): void {
    if (changedProperties.has("value")) {
      this.syncSplitValues();
    }

    this.syncFormState();
  }

  private handleDateInput = (event: Event): void => {
    const picker = event.currentTarget as HTMLElement & { value: string };
    this.dateValue = picker.value;
    this.syncCombinedValue();
    this.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
  };

  private handleDateChange = (event: Event): void => {
    const picker = event.currentTarget as HTMLElement & { value: string };
    this.dateValue = picker.value;
    this.syncCombinedValue();
    this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
  };

  private handleTimeInput = (event: Event): void => {
    const input = event.currentTarget as HTMLElement & { value: string };
    this.timeValue = input.value;
    this.syncCombinedValue();
    this.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
  };

  private handleTimeChange = (event: Event): void => {
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
    if (this.disabled) {
      this.setFormValue(null);
      return;
    }

    this.setFormValue(this.value);
  }

  private get datePickerElement(): HTMLElement | null {
    return this.renderRoot.querySelector("emb-date-picker");
  }
}
