import { css, html } from "lit";
import { live } from "lit/directives/live.js";

import { FormAssociatedElement } from "../shared/form-associated-element.js";

type CalendarDay = {
  date: Date;
  dateString: string;
  disabled: boolean;
  inRange: boolean;
  outsideMonth: boolean;
  rangeEnd: boolean;
  rangeStart: boolean;
  selected: boolean;
  today: boolean;
};

const monthFormatter = new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" });
const weekdayFormatter = new Intl.DateTimeFormat(undefined, { weekday: "short" });
const weekdayLabels = Array.from({ length: 7 }, (_, index) => weekdayFormatter.format(new Date(2024, 0, 7 + index)));

export class CindorCalendar extends FormAssociatedElement {
  static styles = css`
    :host {
      display: inline-grid;
      gap: var(--space-3);
      --cindor-calendar-month-min-inline-size: 0px;
      width: min(100%, var(--cindor-calendar-inline-size, 320px));
      max-width: 100%;
      color: var(--fg);
    }

    :host([range]) {
      --cindor-calendar-inline-size: 680px;
      --cindor-calendar-month-min-inline-size: 260px;
    }

    .surface {
      display: grid;
      gap: var(--space-3);
      padding: var(--space-4);
      border: 1px solid var(--border);
      border-radius: var(--radius-xl);
      background: var(--surface);
      box-shadow: var(--shadow-sm);
      overflow: auto;
    }

    .header {
      display: grid;
      grid-template-columns: auto 1fr auto;
      align-items: center;
      gap: var(--space-2);
      min-width: 0;
    }

    .month-titles {
      display: grid;
      gap: var(--space-1);
      min-width: 0;
      grid-template-columns: repeat(var(--cindor-calendar-month-count, 1), minmax(var(--cindor-calendar-month-min-inline-size), 1fr));
    }

    .month {
      text-align: center;
      font-weight: 600;
    }

    .months {
      display: grid;
      gap: var(--space-4);
      min-width: 0;
      grid-template-columns: repeat(var(--cindor-calendar-month-count, 1), minmax(var(--cindor-calendar-month-min-inline-size), 1fr));
    }

    .month-panel {
      display: grid;
      gap: var(--space-2);
      min-width: 0;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
    }

    th {
      padding-inline: var(--space-1);
      padding-block-end: var(--space-2);
      color: var(--fg-muted);
      font-size: var(--text-xs);
      font-weight: 600;
      text-transform: uppercase;
      white-space: nowrap;
    }

    td {
      padding: 0;
      text-align: center;
    }

    .day {
      inline-size: 100%;
      min-inline-size: 0;
      aspect-ratio: 1;
      border: 0;
      border-radius: var(--radius-md);
      background: transparent;
      color: var(--fg);
      font: inherit;
      transition:
        background var(--duration-base) var(--ease-out),
        color var(--duration-base) var(--ease-out),
        transform var(--duration-base) var(--ease-out);
    }

    .day:hover:not(:disabled) {
      background: var(--bg-subtle);
      transform: scale(1.03);
    }

    .day:focus-visible {
      outline: none;
      box-shadow: var(--ring-focus);
    }

    .day[data-in-range="true"]:not([data-selected="true"]) {
      background: color-mix(in srgb, var(--accent-muted) 75%, var(--surface));
      color: var(--accent);
      border-radius: 0;
    }

    .day[data-range-start="true"]:not([data-range-end="true"]) {
      border-start-end-radius: 0;
      border-end-end-radius: 0;
    }

    .day[data-range-end="true"]:not([data-range-start="true"]) {
      border-start-start-radius: 0;
      border-end-start-radius: 0;
    }

    .day[data-selected="true"] {
      background: var(--accent);
      color: var(--accent-contrast, white);
    }

    .day[data-today="true"]:not([data-selected="true"]) {
      box-shadow: inset 0 0 0 1px var(--accent);
      color: var(--accent);
    }

    .day[data-outside-month="true"]:not([data-selected="true"]) {
      color: var(--fg-subtle);
    }

    .day:disabled {
      color: var(--fg-subtle);
      cursor: not-allowed;
      transform: none;
    }
  `;

  static properties = {
    disabled: { type: Boolean, reflect: true },
    endValue: { reflect: true, attribute: "end-value" },
    max: { reflect: true },
    min: { reflect: true },
    month: { reflect: true },
    name: { reflect: true },
    range: { type: Boolean, reflect: true },
    required: { type: Boolean, reflect: true },
    startValue: { reflect: true, attribute: "start-value" },
    value: { reflect: true }
  };

  disabled = false;
  endValue = "";
  max = "";
  min = "";
  month = "";
  name = "";
  range = false;
  required = false;
  startValue = "";
  value = "";

  private defaultEndValue = "";
  private defaultMonth = "";
  private defaultStartValue = "";
  private defaultValue = "";

  override connectedCallback(): void {
    super.connectedCallback();
    this.defaultEndValue = this.getAttribute("end-value") ?? this.endValue;
    this.defaultMonth = this.getAttribute("month") ?? this.month;
    this.defaultStartValue = this.getAttribute("start-value") ?? this.startValue;
    this.defaultValue = this.getAttribute("value") ?? this.value;
    if (!parseMonthString(this.month)) {
      this.syncMonthFromSelectionOrToday();
    }
  }

  checkValidity(): boolean {
    this.syncFormState();
    return !(this.internals?.validity.valid === false);
  }

  override focus(options?: FocusOptions): void {
    this.primarySelectedDayButton?.focus(options);
  }

  reportValidity(): boolean {
    this.syncFormState();
    return this.internals?.reportValidity?.() ?? true;
  }

  formDisabledCallback(disabled: boolean): void {
    this.disabled = disabled;
  }

  formResetCallback(): void {
    this.endValue = this.defaultEndValue;
    this.month = this.defaultMonth;
    this.startValue = this.defaultStartValue;
    this.value = this.defaultValue;
    if (!parseMonthString(this.month)) {
      this.syncMonthFromSelectionOrToday();
    }
    this.syncFormState();
  }

  protected override render() {
    const visibleMonths = this.visibleMonths;

    return html`
      <div class="surface" part="surface">
        <div class="header" part="header">
          <cindor-icon-button
            label="Previous month"
            name="chevron-left"
            part="previous-button"
            ?disabled=${this.disabled || this.previousMonthDisabled}
            @click=${this.showPreviousMonth}
          ></cindor-icon-button>
          <div class="month-titles" part="month-titles" style=${`--cindor-calendar-month-count:${visibleMonths.length};`}>
            ${visibleMonths.map(
              (monthDate, index) => html`
                <div class="month" part=${index === 0 ? "month" : "month month-secondary"}>${monthFormatter.format(monthDate)}</div>
              `
            )}
          </div>
          <cindor-icon-button
            label="Next month"
            name="chevron-right"
            part="next-button"
            ?disabled=${this.disabled || this.nextMonthDisabled}
            @click=${this.showNextMonth}
          ></cindor-icon-button>
        </div>
        <div class="months" part="months" style=${`--cindor-calendar-month-count:${visibleMonths.length};`}>
          ${visibleMonths.map((monthDate, index) => this.renderMonthPanel(monthDate, index))}
        </div>
      </div>
    `;
  }

  protected override updated(changedProperties: Map<PropertyKey, unknown>): void {
    if (changedProperties.has("value") && !this.range) {
      const parsedValue = parseDateString(this.value);
      if (parsedValue) {
        this.month = formatMonth(parsedValue);
      }
    }

    if ((changedProperties.has("startValue") || changedProperties.has("endValue")) && this.range) {
      const anchorDate = this.selectionAnchorDate;
      if (anchorDate) {
        this.month = formatMonth(anchorDate);
      }
    }

    if (changedProperties.has("month") && !parseMonthString(this.month)) {
      this.syncMonthFromSelectionOrToday();
    }

    this.syncGridA11y();
    this.syncFormState();
  }

  private handleDayClick = (event: Event): void => {
    if (this.disabled) {
      return;
    }

    const button = event.currentTarget as HTMLButtonElement;
    const nextValue = button.value;
    if (!nextValue) {
      return;
    }

    if (!this.range) {
      this.value = nextValue;
      this.month = formatMonth(parseDateString(nextValue) ?? this.visibleMonthDate);
      this.syncFormState();
      this.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
      this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
      return;
    }

    const clickedDate = parseDateString(nextValue);
    const startDate = parseDateString(this.startValue);
    const endDate = parseDateString(this.endValue);

    if (!clickedDate) {
      return;
    }

    if (!startDate || endDate) {
      this.startValue = nextValue;
      this.endValue = "";
    } else if (clickedDate < startDate) {
      this.startValue = nextValue;
      this.endValue = this.startValue;
      this.endValue = formatDate(startDate);
    } else {
      this.endValue = nextValue;
    }

    this.month = formatMonth(clickedDate);
    this.syncFormState();
    this.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
    this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
  };

  private showPreviousMonth = (): void => {
    if (this.disabled || this.previousMonthDisabled) {
      return;
    }

    this.month = formatMonth(addMonths(this.visibleMonthDate, -1));
  };

  private showNextMonth = (): void => {
    if (this.disabled || this.nextMonthDisabled) {
      return;
    }

    this.month = formatMonth(addMonths(this.visibleMonthDate, 1));
  };

  private syncMonthFromSelectionOrToday(): void {
    const anchorDate = this.selectionAnchorDate;
    this.month = formatMonth(anchorDate ?? new Date());
  }

  private syncFormState(): void {
    if (this.disabled) {
      this.setFormValue(null);
      this.internals?.setValidity?.({});
      return;
    }

    if (!this.range) {
      this.syncSingleValueFormState();
      return;
    }

    const startDate = parseDateString(this.startValue);
    const endDate = parseDateString(this.endValue);
    const minDate = parseDateString(this.min);
    const maxDate = parseDateString(this.max);

    if (!startDate && !endDate) {
      this.setFormValue(null);
      if (this.required) {
        this.internals?.setValidity?.({ valueMissing: true }, "Please select a start and end date.", this.primarySelectedDayButton ?? undefined);
      } else {
        this.internals?.setValidity?.({});
      }
      return;
    }

    if (!startDate || !endDate) {
      this.setFormValue(null);
      this.internals?.setValidity?.({ customError: true }, "Please complete the date range.", this.primarySelectedDayButton ?? undefined);
      return;
    }

    if (endDate < startDate) {
      this.setFormValue(null);
      this.internals?.setValidity?.({ customError: true }, "End date must be on or after start date.", this.primarySelectedDayButton ?? undefined);
      return;
    }

    if ((minDate && startDate < minDate) || (minDate && endDate < minDate)) {
      this.setFormValue(null);
      this.internals?.setValidity?.({ rangeUnderflow: true }, `Date range must start on or after ${this.min}.`, this.primarySelectedDayButton ?? undefined);
      return;
    }

    if ((maxDate && startDate > maxDate) || (maxDate && endDate > maxDate)) {
      this.setFormValue(null);
      this.internals?.setValidity?.({ rangeOverflow: true }, `Date range must end on or before ${this.max}.`, this.primarySelectedDayButton ?? undefined);
      return;
    }

    const formData = new FormData();
    const fieldBaseName = this.name || "date-range";
    formData.append(`${fieldBaseName}-start`, this.startValue);
    formData.append(`${fieldBaseName}-end`, this.endValue);
    this.setFormValue(formData);
    this.internals?.setValidity?.({});
  }

  private syncSingleValueFormState(): void {
    const parsedValue = parseDateString(this.value);

    if (!parsedValue) {
      this.setFormValue(null);
      if (this.required) {
        this.internals?.setValidity?.({ valueMissing: true }, "Please select a date.", this.primarySelectedDayButton ?? undefined);
      } else {
        this.internals?.setValidity?.({});
      }
      return;
    }

    const minDate = parseDateString(this.min);
    if (minDate && parsedValue < minDate) {
      this.setFormValue(this.value);
      this.internals?.setValidity?.({ rangeUnderflow: true }, `Date must be on or after ${this.min}.`, this.primarySelectedDayButton ?? undefined);
      return;
    }

    const maxDate = parseDateString(this.max);
    if (maxDate && parsedValue > maxDate) {
      this.setFormValue(this.value);
      this.internals?.setValidity?.({ rangeOverflow: true }, `Date must be on or before ${this.max}.`, this.primarySelectedDayButton ?? undefined);
      return;
    }

    this.setFormValue(this.value);
    this.internals?.setValidity?.({});
  }

  private syncGridA11y(): void {
    for (const grid of this.gridElements) {
      for (const attributeName of ["aria-label", "aria-labelledby", "aria-describedby"]) {
        const value = this.getAttribute(attributeName);
        if (value === null || value === "") {
          grid.removeAttribute(attributeName);
        } else {
          grid.setAttribute(attributeName, value);
        }
      }
    }
  }

  private chunkDays(days: CalendarDay[]): CalendarDay[][] {
    const weeks: CalendarDay[][] = [];
    for (let index = 0; index < days.length; index += 7) {
      weeks.push(days.slice(index, index + 7));
    }
    return weeks;
  }

  private buildCalendarDays(visibleMonth: Date): CalendarDay[] {
    const monthStart = startOfMonth(visibleMonth);
    const startOffset = monthStart.getDay();
    const firstVisibleDay = addDays(monthStart, -startOffset);
    const selectedDate = !this.range ? parseDateString(this.value) : null;
    const selectedRange = this.selectedRange;
    const pendingRangeStart = this.pendingRangeStart;
    const minDate = parseDateString(this.min);
    const maxDate = parseDateString(this.max);
    const today = startOfDay(new Date());

    return Array.from({ length: 42 }, (_, index) => {
      const date = addDays(firstVisibleDay, index);
      const rangeStart = Boolean(selectedRange && sameDate(date, selectedRange.start));
      const rangeEnd = Boolean(selectedRange && sameDate(date, selectedRange.end));
      const inRange = Boolean(selectedRange && date >= selectedRange.start && date <= selectedRange.end);
      const pendingStart = Boolean(pendingRangeStart && sameDate(date, pendingRangeStart));
      const selected = this.range
        ? rangeStart || rangeEnd || pendingStart
        : Boolean(selectedDate && sameDate(date, selectedDate));

      return {
        date,
        dateString: formatDate(date),
        disabled: isDateOutOfRange(date, minDate, maxDate),
        inRange,
        outsideMonth: date.getMonth() !== visibleMonth.getMonth(),
        rangeEnd: rangeEnd || pendingStart,
        rangeStart: rangeStart || pendingStart,
        selected,
        today: sameDate(date, today)
      };
    });
  }

  private get nextMonthDisabled(): boolean {
    const maxDate = parseDateString(this.max);
    if (!maxDate) {
      return false;
    }

    return startOfMonth(addMonths(this.lastVisibleMonthDate, 1)) > endOfDay(maxDate);
  }

  private get previousMonthDisabled(): boolean {
    const minDate = parseDateString(this.min);
    if (!minDate) {
      return false;
    }

    return endOfMonth(addMonths(this.visibleMonthDate, -1)) < startOfDay(minDate);
  }

  private get visibleMonthDate(): Date {
    return parseMonthString(this.month) ?? startOfMonth(this.selectionAnchorDate ?? new Date());
  }

  private get selectionAnchorDate(): Date | null {
    if (this.range) {
      return parseDateString(this.startValue) ?? parseDateString(this.endValue);
    }

    return parseDateString(this.value);
  }

  private get selectedRange(): { end: Date; start: Date } | null {
    if (!this.range) {
      return null;
    }

    const startDate = parseDateString(this.startValue);
    const endDate = parseDateString(this.endValue);

    if (!startDate || !endDate) {
      return null;
    }

    return startDate <= endDate ? { start: startDate, end: endDate } : { start: endDate, end: startDate };
  }

  private get gridElements(): HTMLElement[] {
    return Array.from(this.renderRoot.querySelectorAll('[part~="calendar"]'));
  }

  private get primarySelectedDayButton(): HTMLButtonElement | null {
    return this.renderRoot.querySelector('[data-range-start="true"], [data-selected="true"]');
  }

  private get pendingRangeStart(): Date | null {
    if (!this.range) {
      return null;
    }

    const startDate = parseDateString(this.startValue);
    const endDate = parseDateString(this.endValue);
    return startDate && !endDate ? startDate : null;
  }

  private get visibleMonths(): Date[] {
    return this.range ? [this.visibleMonthDate, addMonths(this.visibleMonthDate, 1)] : [this.visibleMonthDate];
  }

  private get lastVisibleMonthDate(): Date {
    return this.visibleMonths.at(-1) ?? this.visibleMonthDate;
  }

  private getDayPart(day: CalendarDay): string {
    const parts = ["day"];

    if (day.inRange) {
      parts.push("day-in-range");
    }

    if (day.rangeStart) {
      parts.push("day-range-start");
    }

    if (day.rangeEnd) {
      parts.push("day-range-end");
    }

    if (day.selected) {
      parts.push("day-selected");
    }

    return parts.join(" ");
  }

  private renderMonthPanel(monthDate: Date, index: number) {
    const days = this.buildCalendarDays(monthDate);

    return html`
      <div class="month-panel" part=${index === 0 ? "month-panel" : "month-panel month-panel-secondary"}>
        <table part=${index === 0 ? "calendar" : "calendar calendar-secondary"} role="grid">
          <thead>
            <tr>
              ${weekdayLabels.map(
                (label) => html`
                  <th scope="col">${label}</th>
                `
              )}
            </tr>
          </thead>
          <tbody>
            ${this.chunkDays(days).map(
              (week) => html`
                <tr>
                  ${week.map(
                    (day) => html`
                      <td role="gridcell" aria-selected=${String(day.selected)}>
                        <button
                          class="day"
                          part=${this.getDayPart(day)}
                          .value=${live(day.dateString)}
                          ?disabled=${this.disabled || day.disabled}
                          data-in-range=${String(day.inRange)}
                          data-outside-month=${String(day.outsideMonth)}
                          data-range-end=${String(day.rangeEnd)}
                          data-range-start=${String(day.rangeStart)}
                          data-selected=${String(day.selected)}
                          data-today=${String(day.today)}
                          type="button"
                          @click=${this.handleDayClick}
                        >
                          ${day.date.getDate()}
                        </button>
                      </td>
                    `
                  )}
                </tr>
              `
            )}
          </tbody>
        </table>
      </div>
    `;
  }
}

function addDays(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount);
}

function addMonths(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function endOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
}

function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatMonth(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function isDateOutOfRange(date: Date, minDate: Date | null, maxDate: Date | null): boolean {
  if (minDate && date < minDate) {
    return true;
  }

  if (maxDate && date > maxDate) {
    return true;
  }

  return false;
}

function parseDateString(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(year, month - 1, day);
  if (parsed.getFullYear() !== year || parsed.getMonth() !== month - 1 || parsed.getDate() !== day) {
    return null;
  }

  return startOfDay(parsed);
}

function parseMonthString(value: string): Date | null {
  if (!/^\d{4}-\d{2}$/.test(value)) {
    return null;
  }

  const [year, month] = value.split("-").map(Number);
  const parsed = new Date(year, month - 1, 1);
  if (parsed.getFullYear() !== year || parsed.getMonth() !== month - 1) {
    return null;
  }

  return parsed;
}

function sameDate(left: Date, right: Date): boolean {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}
