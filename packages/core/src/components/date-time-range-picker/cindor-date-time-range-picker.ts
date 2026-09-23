import { css, html } from "lit";

import { FormAssociatedElement } from "../shared/form-associated-element.js";

type DateTimePart = "start" | "end";

/**
 * A form-associated date and time range picker.
 *
 * `startValue`, `endValue`, `min`, and `max` use local ISO date-time strings
 * such as `2026-04-28T09:30`. A completed range is always ordered from the
 * earlier value to the later value after user interaction.
 *
 * @fires input - Fired as either endpoint changes.
 * @fires change - Fired when an endpoint change is committed.
 */
export class CindorDateTimeRangePicker extends FormAssociatedElement {
  static styles = css`
    :host {
      display: block;
      color: var(--fg);
    }

    fieldset {
      display: grid;
      gap: var(--space-4);
      min-width: 0;
      margin: 0;
      padding: 0;
      border: 0;
    }

    legend {
      margin-bottom: var(--space-2);
      font-weight: var(--weight-semibold);
    }

    .range {
      display: grid;
      gap: var(--space-4);
    }

    .endpoint {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: var(--space-3);
    }

    .endpoint-label {
      grid-column: 1 / -1;
      color: var(--fg-muted);
      font-size: var(--text-sm);
      font-weight: var(--weight-medium);
    }

    .validation-message {
      color: var(--danger, #b42318);
      font-size: var(--text-sm);
    }

    @media (min-width: 40rem) {
      .range {
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
      }

      .endpoint {
        grid-template-columns: minmax(0, 1fr) minmax(8rem, 10rem);
        align-items: end;
      }
    }
  `;

  static properties = {
    disabled: { type: Boolean, reflect: true },
    endValue: { reflect: true, attribute: "end-value" },
    max: { reflect: true },
    min: { reflect: true },
    name: { reflect: true },
    required: { type: Boolean, reflect: true },
    startValue: { reflect: true, attribute: "start-value" }
  };

  disabled = false;
  endValue = "";
  max = "";
  min = "";
  name = "";
  required = false;
  startValue = "";

  private defaultEndValue = "";
  private defaultStartValue = "";

  override connectedCallback(): void {
    super.connectedCallback();
    this.defaultEndValue = this.getAttribute("end-value") ?? this.endValue;
    this.defaultStartValue = this.getAttribute("start-value") ?? this.startValue;
  }

  checkValidity(): boolean {
    this.syncFormState();
    return this.internals?.validity?.valid ?? this.validationMessage === "";
  }

  override focus(options?: FocusOptions): void {
    this.startDateElement?.focus(options);
  }

  reportValidity(): boolean {
    this.syncFormState();
    return this.internals?.reportValidity?.() ?? this.checkValidity();
  }

  formDisabledCallback(disabled: boolean): void {
    this.disabled = disabled;
  }

  formResetCallback(): void {
    this.startValue = this.defaultStartValue;
    this.endValue = this.defaultEndValue;
    this.syncFormState();
  }

  protected override render() {
    const label = this.accessibleLabel;
    const message = this.validationMessage;

    return html`
      <fieldset aria-describedby=${message ? "validation-message" : ""} aria-label=${label} part="field">
        <legend>${label}</legend>
        <div class="range" part="range">
          ${this.renderEndpoint("start", "Start", this.startValue)}
          ${this.renderEndpoint("end", "End", this.endValue)}
        </div>
        ${message ? html`<div aria-live="polite" class="validation-message" id="validation-message" part="validation-message">${message}</div>` : null}
      </fieldset>
    `;
  }

  protected override updated(): void {
    this.syncFormState();
  }

  private renderEndpoint(part: DateTimePart, label: string, value: string) {
    const [date = "", time = ""] = value.split("T");
    const dateBounds = this.dateBounds();
    const timeBounds = this.timeBounds(part, date);

    return html`
      <div class="endpoint" part="${part}-endpoint">
        <span class="endpoint-label">${label}</span>
        <cindor-date-picker
          aria-label=${`${this.accessibleLabel} ${label.toLowerCase()} date`}
          .value=${date}
          ?disabled=${this.disabled}
          max=${dateBounds.max}
          min=${dateBounds.min}
          ?required=${this.required}
          @change=${(event: Event) => this.handleEndpointEvent(event, part, "date", "change")}
          @input=${(event: Event) => this.handleEndpointEvent(event, part, "date", "input")}
        ></cindor-date-picker>
        <cindor-time-input
          aria-label=${`${this.accessibleLabel} ${label.toLowerCase()} time`}
          .value=${time}
          ?disabled=${this.disabled}
          max=${timeBounds.max}
          min=${timeBounds.min}
          ?required=${this.required}
          @change=${(event: Event) => this.handleEndpointEvent(event, part, "time", "change")}
          @input=${(event: Event) => this.handleEndpointEvent(event, part, "time", "input")}
        ></cindor-time-input>
      </div>
    `;
  }

  private handleEndpointEvent(event: Event, part: DateTimePart, unit: "date" | "time", type: "input" | "change"): void {
    event.stopPropagation();
    const control = event.currentTarget as HTMLElement & { value: string };
    const [existingDate = "", existingTime = ""] = (part === "start" ? this.startValue : this.endValue).split("T");
    const nextValue = unit === "date" ? combineDateTime(control.value, existingTime) : combineDateTime(existingDate, control.value);

    if (part === "start") {
      this.startValue = nextValue;
    } else {
      this.endValue = nextValue;
    }

    this.orderCompletedRange();
    this.syncFormState();
    this.dispatchEvent(new Event(type, { bubbles: true, composed: true }));
  }

  private orderCompletedRange(): void {
    if (this.startValue && this.endValue && this.startValue > this.endValue) {
      [this.startValue, this.endValue] = [this.endValue, this.startValue];
    }
  }

  private syncFormState(): void {
    const message = this.validationMessage;
    if (this.disabled) {
      this.setFormValue(null);
      this.internals?.setValidity?.({});
      return;
    }

    if (message) {
      this.setFormValue(null);
      const flags = message === "Please select a start and end date and time." ? { valueMissing: true } : { customError: true };
      this.internals?.setValidity?.(flags, message, this.startDateElement ?? undefined);
      return;
    }

    if (!this.startValue && !this.endValue) {
      this.setFormValue(null);
    } else if (this.name) {
      const values = new FormData();
      values.append(`${this.name}-start`, this.startValue);
      values.append(`${this.name}-end`, this.endValue);
      this.setFormValue(values);
    } else {
      this.setFormValue(`${this.startValue}/${this.endValue}`);
    }
    this.internals?.setValidity?.({});
  }

  private get validationMessage(): string {
    const hasStart = this.startValue !== "";
    const hasEnd = this.endValue !== "";
    if (!hasStart && !hasEnd) {
      return this.required ? "Please select a start and end date and time." : "";
    }
    if (!hasStart || !hasEnd || !isCompleteDateTime(this.startValue) || !isCompleteDateTime(this.endValue)) {
      return "Please complete the date and time range.";
    }
    if (this.startValue > this.endValue) {
      return "The start must be before the end.";
    }
    if (this.min && this.startValue < this.min) {
      return `The range must start on or after ${this.min}.`;
    }
    if (this.max && this.endValue > this.max) {
      return `The range must end on or before ${this.max}.`;
    }
    return "";
  }

  private dateBounds(): { min: string; max: string } {
    return { max: this.max.slice(0, 10), min: this.min.slice(0, 10) };
  }

  private timeBounds(_part: DateTimePart, date: string): { min: string; max: string } {
    const min = date && date === this.min.slice(0, 10) ? this.min.slice(11) : "";
    const max = date && date === this.max.slice(0, 10) ? this.max.slice(11) : "";
    return { max, min };
  }

  private get accessibleLabel(): string {
    return this.normalizeA11yText(this.getAttribute("aria-label")) || "Date and time range";
  }

  private get startDateElement(): HTMLElement | null {
    return this.renderRoot.querySelector('[part="start-endpoint"] cindor-date-picker');
  }
}

function combineDateTime(date: string, time: string): string {
  return date && time ? `${date}T${time}` : date || time ? `${date}T${time}` : "";
}

function isCompleteDateTime(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?$/.test(value);
}
