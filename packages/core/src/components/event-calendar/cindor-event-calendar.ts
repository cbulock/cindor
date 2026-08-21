import { css, html, LitElement, nothing } from "lit";
import { live } from "lit/directives/live.js";

import {
  addDays,
  addMonths,
  endOfMonth,
  formatDate,
  formatMonth,
  parseDateString,
  parseMonthString,
  sameDate,
  startOfDay,
  startOfMonth
} from "../shared/calendar-utils.js";

type CalendarDay = {
  date: Date;
  dateString: string;
  events: EventCalendarEvent[];
  outsideMonth: boolean;
  selected: boolean;
  today: boolean;
};

export type EventCalendarEventTone = "neutral" | "accent" | "success" | "warning" | "danger";

export type EventCalendarEvent = {
  date: string;
  description?: string;
  endDate?: string;
  id: string;
  time?: string;
  title: string;
  tone?: EventCalendarEventTone;
};

type EventSelectDetail = {
  date: string;
  event: EventCalendarEvent;
};

const monthFormatter = new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" });
const selectedDateFormatter = new Intl.DateTimeFormat(undefined, {
  day: "numeric",
  month: "long",
  weekday: "long",
  year: "numeric"
});
const weekdayFormatter = new Intl.DateTimeFormat(undefined, { weekday: "short" });
const weekdayLabels = Array.from({ length: 7 }, (_, index) => weekdayFormatter.format(new Date(2024, 0, 7 + index)));

/**
 * Month calendar with event previews and a selected-day agenda panel.
 *
 * Assign `events` as a property to render date-aligned event summaries.
 *
 * @fires input - Fired when the selected date changes.
 * @fires change - Fired when the selected date changes.
 * @fires event-select - Fired when an agenda item is activated. Detail includes the selected date and event payload.
 */
export class CindorEventCalendar extends LitElement {
  static styles = css`
    :host {
      display: block;
      color: var(--fg);
    }

    .surface {
      display: grid;
      gap: var(--space-4);
      padding: var(--space-4);
      border: 1px solid var(--border);
      border-radius: var(--radius-xl);
      background: var(--surface);
      box-shadow: var(--shadow-sm);
    }

    .header {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr) auto;
      align-items: center;
      gap: var(--space-2);
    }

    .month {
      text-align: center;
      font-weight: var(--weight-semibold);
    }

    .layout {
      display: grid;
      gap: var(--space-4);
    }

    @media (min-width: 52rem) {
      .layout {
        grid-template-columns: minmax(0, 1.6fr) minmax(18rem, 0.95fr);
        align-items: start;
      }
    }

    table {
      width: 100%;
      border-collapse: separate;
      border-spacing: var(--space-1);
      table-layout: fixed;
    }

    th {
      padding-block-end: var(--space-2);
      color: var(--fg-muted);
      font-size: var(--text-xs);
      font-weight: var(--weight-semibold);
      text-transform: uppercase;
    }

    td {
      padding: 0;
      vertical-align: top;
    }

    .day {
      display: grid;
      gap: var(--space-2);
      inline-size: 100%;
      min-block-size: 6.5rem;
      padding: var(--space-2);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      background: var(--surface);
      color: inherit;
      font: inherit;
      text-align: start;
      transition:
        border-color var(--duration-base) var(--ease-out),
        box-shadow var(--duration-base) var(--ease-out),
        transform var(--duration-base) var(--ease-out);
    }

    .day:hover {
      border-color: color-mix(in srgb, var(--accent) 38%, var(--border));
      transform: translateY(-1px);
    }

    .day:focus-visible {
      outline: none;
      box-shadow: var(--ring-focus);
    }

    .day[data-outside-month="true"] {
      background: color-mix(in srgb, var(--surface) 92%, var(--bg-subtle));
    }

    .day[data-selected="true"] {
      border-color: var(--accent);
      box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--accent) 55%, transparent);
      background: color-mix(in srgb, var(--accent-muted) 28%, var(--surface));
    }

    .day[data-today="true"] .date-number {
      color: var(--accent);
    }

    .date-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-2);
    }

    .date-number {
      font-size: var(--text-sm);
      font-weight: var(--weight-semibold);
    }

    .event-count {
      color: var(--fg-muted);
      font-size: var(--text-xs);
    }

    .previews {
      display: grid;
      gap: 0.25rem;
      align-content: start;
      min-height: 0;
    }

    .preview {
      display: block;
      overflow: hidden;
      padding: 0.125rem 0.375rem;
      border-radius: var(--radius-sm);
      white-space: nowrap;
      text-overflow: ellipsis;
      font-size: 0.7rem;
      font-weight: var(--weight-medium);
    }

    .preview[data-tone="neutral"] {
      background: color-mix(in srgb, var(--bg-subtle) 82%, white);
      color: var(--fg);
    }

    .preview[data-tone="accent"] {
      background: color-mix(in srgb, var(--accent-muted) 64%, white);
      color: var(--accent);
    }

    .preview[data-tone="success"] {
      background: color-mix(in srgb, var(--success, #15803d) 14%, white);
      color: var(--success, #15803d);
    }

    .preview[data-tone="warning"] {
      background: color-mix(in srgb, var(--warning, #b45309) 14%, white);
      color: var(--warning, #b45309);
    }

    .preview[data-tone="danger"] {
      background: color-mix(in srgb, var(--danger, #b91c1c) 14%, white);
      color: var(--danger, #b91c1c);
    }

    .preview-more {
      color: var(--fg-muted);
      font-size: 0.7rem;
      font-weight: var(--weight-medium);
    }

    .agenda {
      display: grid;
      gap: var(--space-3);
      min-width: 0;
      padding: var(--space-4);
      border: 1px solid var(--border);
      border-radius: var(--radius-xl);
      background: color-mix(in srgb, var(--surface) 92%, white);
    }

    .agenda-header {
      display: grid;
      gap: 0.125rem;
    }

    .agenda-label {
      color: var(--fg-muted);
      font-size: var(--text-xs);
      font-weight: var(--weight-semibold);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .agenda-title {
      font-size: var(--text-lg);
      font-weight: var(--weight-semibold);
    }

    .agenda-empty {
      color: var(--fg-muted);
      font-size: var(--text-sm);
    }

    .agenda-list {
      display: grid;
      gap: var(--space-2);
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .agenda-event {
      inline-size: 100%;
      display: grid;
      gap: 0.375rem;
      padding: var(--space-3);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      background: var(--surface);
      color: inherit;
      font: inherit;
      text-align: start;
    }

    button.agenda-event {
      cursor: pointer;
      transition:
        border-color var(--duration-base) var(--ease-out),
        transform var(--duration-base) var(--ease-out);
    }

    button.agenda-event:hover {
      border-color: color-mix(in srgb, var(--accent) 34%, var(--border));
      transform: translateY(-1px);
    }

    button.agenda-event:focus-visible {
      outline: none;
      box-shadow: var(--ring-focus);
    }

    .agenda-event[data-tone="accent"] {
      border-inline-start: 3px solid var(--accent);
    }

    .agenda-event[data-tone="success"] {
      border-inline-start: 3px solid var(--success, #15803d);
    }

    .agenda-event[data-tone="warning"] {
      border-inline-start: 3px solid var(--warning, #b45309);
    }

    .agenda-event[data-tone="danger"] {
      border-inline-start: 3px solid var(--danger, #b91c1c);
    }

    .agenda-event[data-tone="neutral"] {
      border-inline-start: 3px solid color-mix(in srgb, var(--border) 70%, transparent);
    }

    .agenda-event-title {
      font-weight: var(--weight-semibold);
    }

    .agenda-event-time,
    .agenda-event-description {
      color: var(--fg-muted);
      font-size: var(--text-sm);
    }
  `;

  static properties = {
    emptyMessage: { reflect: true, attribute: "empty-message" },
    events: { attribute: false },
    month: { reflect: true },
    value: { reflect: true }
  };

  /** Empty-state copy shown when the selected day has no scheduled items. */
  emptyMessage = "No events scheduled for this day.";

  /** Event records assigned as a property. Dates use `YYYY-MM-DD` strings. */
  events: EventCalendarEvent[] = [];

  /** Visible month using `YYYY-MM`. */
  month = "";

  /** Selected day using `YYYY-MM-DD`. */
  value = "";

  override connectedCallback(): void {
    super.connectedCallback();
    if (!parseMonthString(this.month)) {
      this.month = this.initialMonth;
    }
  }

  override focus(options?: FocusOptions): void {
    this.selectedDayButton?.focus(options);
  }

  protected override render() {
    const visibleMonth = this.visibleMonthDate;
    const activeDate = this.activeDate;
    const days = this.buildCalendarDays(visibleMonth);
    const agendaEvents = this.eventsForDate(activeDate.dateString);

    return html`
      <div class="surface" part="surface">
        <div class="header" part="header">
          <cindor-icon-button label="Previous month" name="chevron-left" part="previous-button" @click=${this.showPreviousMonth}></cindor-icon-button>
          <div class="month" part="month">${monthFormatter.format(visibleMonth)}</div>
          <cindor-icon-button label="Next month" name="chevron-right" part="next-button" @click=${this.showNextMonth}></cindor-icon-button>
        </div>

        <div class="layout" part="layout">
          <table part="calendar" role="grid" aria-label=${this.hostAriaLabel ?? nothing} aria-labelledby=${this.hostAriaLabelledBy ?? nothing}>
            <thead>
              <tr>
                ${weekdayLabels.map((label) => html`<th scope="col">${label}</th>`)}
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
                            part=${day.selected ? "day day-selected" : "day"}
                            .value=${live(day.dateString)}
                            data-outside-month=${String(day.outsideMonth)}
                            data-selected=${String(day.selected)}
                            data-today=${String(day.today)}
                            type="button"
                            @click=${this.handleDayClick}
                          >
                            <span class="date-row">
                              <span class="date-number">${day.date.getDate()}</span>
                              ${day.events.length > 0 ? html`<span class="event-count">${day.events.length}</span>` : nothing}
                            </span>
                            <span class="previews">
                              ${day.events.slice(0, 2).map((event) => this.renderPreview(event))}
                              ${day.events.length > 2 ? html`<span class="preview-more">+${day.events.length - 2} more</span>` : nothing}
                            </span>
                          </button>
                        </td>
                      `
                    )}
                  </tr>
                `
              )}
            </tbody>
          </table>

          <aside class="agenda" part="agenda">
            <div class="agenda-header">
              <span class="agenda-label">Selected day</span>
              <span class="agenda-title">${selectedDateFormatter.format(activeDate.date)}</span>
            </div>
            ${agendaEvents.length > 0
              ? html`
                  <ol class="agenda-list" part="agenda-list">
                    ${agendaEvents.map((event) => this.renderAgendaEvent(event, activeDate.dateString))}
                  </ol>
                `
              : html`<p class="agenda-empty" part="agenda-empty">${this.emptyMessage}</p>`}
          </aside>
        </div>
      </div>
    `;
  }

  protected override updated(changedProperties: Map<PropertyKey, unknown>): void {
    if (changedProperties.has("month") && !parseMonthString(this.month)) {
      this.month = this.initialMonth;
    }

    if (changedProperties.has("value") && this.value && parseDateString(this.value)) {
      this.month = formatMonth(parseDateString(this.value) ?? this.visibleMonthDate);
    }
  }

  private handleDayClick = (event: Event): void => {
    const button = event.currentTarget as HTMLButtonElement;
    const nextValue = button.value;
    if (!parseDateString(nextValue)) {
      return;
    }

    this.value = nextValue;
    this.month = formatMonth(parseDateString(nextValue) ?? this.visibleMonthDate);
    this.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
    this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
  };

  private handleAgendaEventClick = (eventRecord: EventCalendarEvent, dateString: string): void => {
    this.dispatchEvent(
      new CustomEvent<EventSelectDetail>("event-select", {
        bubbles: true,
        composed: true,
        detail: {
          date: dateString,
          event: eventRecord
        }
      })
    );
  };

  private showPreviousMonth = (): void => {
    this.month = formatMonth(addMonths(this.visibleMonthDate, -1));
  };

  private showNextMonth = (): void => {
    this.month = formatMonth(addMonths(this.visibleMonthDate, 1));
  };

  private buildCalendarDays(visibleMonth: Date): CalendarDay[] {
    const monthStart = startOfMonth(visibleMonth);
    const firstVisibleDay = addDays(monthStart, -monthStart.getDay());
    const activeDate = this.activeDate.date;
    const today = startOfDay(new Date());

    return Array.from({ length: 42 }, (_, index) => {
      const date = addDays(firstVisibleDay, index);

      return {
        date,
        dateString: formatDate(date),
        events: this.eventsForDate(formatDate(date)),
        outsideMonth: date.getMonth() !== visibleMonth.getMonth(),
        selected: sameDate(date, activeDate),
        today: sameDate(date, today)
      };
    });
  }

  private chunkDays(days: CalendarDay[]): CalendarDay[][] {
    const weeks: CalendarDay[][] = [];
    for (let index = 0; index < days.length; index += 7) {
      weeks.push(days.slice(index, index + 7));
    }
    return weeks;
  }

  private eventCoversDate(eventRecord: EventCalendarEvent, dateString: string): boolean {
    const eventStart = parseDateString(eventRecord.date);
    const eventEnd = parseDateString(eventRecord.endDate ?? eventRecord.date);
    const date = parseDateString(dateString);
    if (!eventStart || !eventEnd || !date) {
      return false;
    }

    const rangeStart = eventStart <= eventEnd ? eventStart : eventEnd;
    const rangeEnd = eventStart <= eventEnd ? eventEnd : eventStart;
    return date >= rangeStart && date <= rangeEnd;
  }

  private eventsForDate(dateString: string): EventCalendarEvent[] {
    return this.events
      .filter((eventRecord) => this.eventCoversDate(eventRecord, dateString))
      .sort((left, right) => {
        const timeComparison = (left.time ?? "").localeCompare(right.time ?? "");
        if (timeComparison !== 0) {
          return timeComparison;
        }

        return left.title.localeCompare(right.title);
      });
  }

  private renderAgendaEvent(eventRecord: EventCalendarEvent, dateString: string) {
    const tone = eventRecord.tone ?? "neutral";

    return html`
      <li>
        <button
          class="agenda-event"
          part="agenda-event"
          data-tone=${tone}
          type="button"
          @click=${() => this.handleAgendaEventClick(eventRecord, dateString)}
        >
          <span class="agenda-event-title">${eventRecord.title}</span>
          ${eventRecord.time ? html`<span class="agenda-event-time">${eventRecord.time}</span>` : nothing}
          ${eventRecord.description ? html`<span class="agenda-event-description">${eventRecord.description}</span>` : nothing}
        </button>
      </li>
    `;
  }

  private renderPreview(eventRecord: EventCalendarEvent) {
    const tone = eventRecord.tone ?? "neutral";
    const label = eventRecord.time ? `${eventRecord.time} ${eventRecord.title}` : eventRecord.title;
    return html`<span class="preview" data-tone=${tone} title=${label}>${label}</span>`;
  }

  private get activeDate(): { date: Date; dateString: string } {
    const selectedDate = parseDateString(this.value);
    if (selectedDate) {
      return {
        date: selectedDate,
        dateString: formatDate(selectedDate)
      };
    }

    const firstEventDate = this.firstEventDateInVisibleMonth;
    if (firstEventDate) {
      return {
        date: firstEventDate,
        dateString: formatDate(firstEventDate)
      };
    }

    return {
      date: this.visibleMonthDate,
      dateString: formatDate(this.visibleMonthDate)
    };
  }

  private get firstEventDateInVisibleMonth(): Date | null {
    const monthStart = startOfMonth(this.visibleMonthDate);
    const monthEnd = endOfMonth(this.visibleMonthDate);
    const eventDates = this.events
      .flatMap((eventRecord) => {
        const startDate = parseDateString(eventRecord.date);
        const endDate = parseDateString(eventRecord.endDate ?? eventRecord.date);
        if (!startDate || !endDate) {
          return [];
        }

        const rangeStart = startDate <= endDate ? startDate : endDate;
        const rangeEnd = startDate <= endDate ? endDate : startDate;
        const dates: Date[] = [];

        for (let date = rangeStart; date <= rangeEnd; date = addDays(date, 1)) {
          if (date >= monthStart && date <= monthEnd) {
            dates.push(date);
          }
        }

        return dates;
      })
      .sort((left, right) => left.getTime() - right.getTime());

    return eventDates[0] ?? null;
  }

  private get firstEventDate(): Date | null {
    const eventDates = this.events
      .flatMap((eventRecord) => {
        const startDate = parseDateString(eventRecord.date);
        const endDate = parseDateString(eventRecord.endDate ?? eventRecord.date);
        if (!startDate || !endDate) {
          return [];
        }

        return [startDate, endDate];
      })
      .sort((left, right) => left.getTime() - right.getTime());

    return eventDates[0] ?? null;
  }

  private get hostAriaLabel(): string | null {
    return this.getAttribute("aria-label");
  }

  private get hostAriaLabelledBy(): string | null {
    return this.getAttribute("aria-labelledby");
  }

  private get initialMonth(): string {
    const selectedDate = parseDateString(this.value);
    if (selectedDate) {
      return formatMonth(selectedDate);
    }

    const firstEventDate = this.firstEventDate;
    if (firstEventDate) {
      return formatMonth(firstEventDate);
    }

    return formatMonth(new Date());
  }

  private get selectedDayButton(): HTMLButtonElement | null {
    return this.renderRoot.querySelector('[data-selected="true"]');
  }

  private get visibleMonthDate(): Date {
    return parseMonthString(this.month) ?? startOfMonth(new Date());
  }
}
