import { css, html } from "lit";

import { attachFloatingPosition } from "../shared/floating-position.js";
import { CindorCalendar } from "../calendar/cindor-calendar.js";
import { LitElement } from "lit";

/**
 * Popup date range picker powered by the Cindor range calendar.
 *
 * @fires input - Fired as the selected range changes.
 * @fires change - Fired when a range selection completes.
 * @fires toggle - Fired when the popup opens or closes.
 */
export class CindorDateRangePicker extends LitElement {
  static styles = css`
    :host {
      display: inline-block;
      width: var(--cindor-field-inline-size, min(100%, 360px));
      max-width: 100%;
      min-width: 0;
      color: var(--fg);
    }

    .surface {
      position: relative;
    }

    .field {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto auto;
      align-items: center;
      min-height: 36px;
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      background: var(--surface);
    }

    .field:focus-within {
      box-shadow: var(--ring-focus);
    }

    .summary {
      padding: 0 var(--space-3);
      color: var(--fg);
      font: inherit;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .summary[data-empty="true"] {
      color: var(--fg-subtle);
    }

    cindor-calendar {
      position: fixed;
      z-index: 20;
    }
  `;

  static properties = {
    endValue: { reflect: true, attribute: "end-value" },
    max: { reflect: true },
    min: { reflect: true },
    month: { reflect: true },
    open: { type: Boolean, reflect: true },
    placeholder: { reflect: true },
    startValue: { reflect: true, attribute: "start-value" }
  };

  endValue = "";
  max = "";
  min = "";
  month = "";
  open = false;
  placeholder = "Select a date range";
  startValue = "";

  private floatingCleanup?: () => void;
  private floatingPanel: HTMLElement | null = null;
  private updateFloatingPosition?: () => void;

  override connectedCallback(): void {
    super.connectedCallback();
    if (this.month === "" && this.startValue) {
      this.month = this.startValue.slice(0, 7);
    }
    document.addEventListener("pointerdown", this.handleDocumentPointerDown, true);
  }

  override disconnectedCallback(): void {
    document.removeEventListener("pointerdown", this.handleDocumentPointerDown, true);
    this.destroyFloatingPosition();
    super.disconnectedCallback();
  }

  show(): void {
    this.open = true;
    this.dispatchToggle();
  }

  close(): void {
    if (!this.open) {
      return;
    }

    this.open = false;
    this.dispatchToggle();
  }

  protected override render() {
    const summary = this.rangeSummary;
    return html`
      <div class="surface">
        <div class="field" part="field" tabindex="0" @click=${this.handleFieldClick} @keydown=${this.handleFieldKeyDown}>
          <span class="summary" part="summary" data-empty=${String(summary === "")}>${summary || this.placeholder}</span>
          ${this.startValue || this.endValue
            ? html`
                <cindor-icon-button label="Clear range" name="x" part="clear-button" @click=${this.handleClear}></cindor-icon-button>
              `
            : null}
          <cindor-icon-button
            label=${this.open ? "Close calendar" : "Open calendar"}
            name="calendar-range"
            part="toggle-button"
            @click=${this.handleToggleClick}
          ></cindor-icon-button>
        </div>
        ${this.open
          ? html`
              <cindor-calendar
                part="panel"
                end-value=${this.endValue}
                max=${this.max}
                min=${this.min}
                month=${this.month}
                range
                start-value=${this.startValue}
                @change=${this.handleCalendarChange}
                @input=${this.handleCalendarInput}
              ></cindor-calendar>
            `
          : null}
      </div>
    `;
  }

  protected override updated(): void {
    this.syncFloatingPosition();
  }

  private handleFieldClick = (): void => {
    this.show();
  };

  private handleFieldKeyDown = (event: KeyboardEvent): void => {
    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      this.show();
    }
  };

  private handleToggleClick = (event: Event): void => {
    event.stopPropagation();
    if (this.open) {
      this.close();
    } else {
      this.show();
    }
  };

  private handleClear = (event: Event): void => {
    event.stopPropagation();
    this.startValue = "";
    this.endValue = "";
    this.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
    this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
  };

  private handleCalendarInput = (event: Event): void => {
    event.stopPropagation();
    const calendar = event.currentTarget as CindorCalendar;
    this.startValue = calendar.startValue;
    this.endValue = calendar.endValue;
    if (this.startValue) {
      this.month = this.startValue.slice(0, 7);
    }
    this.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
  };

  private handleCalendarChange = (event: Event): void => {
    event.stopPropagation();
    const calendar = event.currentTarget as CindorCalendar;
    this.startValue = calendar.startValue;
    this.endValue = calendar.endValue;
    if (this.startValue) {
      this.month = this.startValue.slice(0, 7);
    }
    if (this.startValue && this.endValue) {
      this.close();
    }
    this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
  };

  private handleDocumentPointerDown = (event: PointerEvent): void => {
    if (!this.open || event.composedPath().includes(this)) {
      return;
    }

    this.close();
  };

  private syncFloatingPosition(): void {
    const trigger = this.fieldElement;
    const panel = this.panelElement;
    if (!this.open || !trigger || !panel) {
      this.destroyFloatingPosition();
      return;
    }

    if (this.floatingPanel !== panel) {
      this.destroyFloatingPosition();
      const handle = attachFloatingPosition({
        floating: panel,
        placement: "bottom-start",
        reference: trigger
      });

      this.floatingCleanup = handle.cleanup;
      this.updateFloatingPosition = handle.update;
      this.floatingPanel = panel;
      return;
    }

    this.updateFloatingPosition?.();
  }

  private destroyFloatingPosition(): void {
    this.floatingCleanup?.();
    this.floatingCleanup = undefined;
    this.updateFloatingPosition = undefined;

    if (this.floatingPanel) {
      this.floatingPanel.style.position = "";
      this.floatingPanel.style.left = "";
      this.floatingPanel.style.top = "";
    }

    this.floatingPanel = null;
  }

  private dispatchToggle(): void {
    this.dispatchEvent(
      new CustomEvent("toggle", {
        bubbles: true,
        composed: true,
        detail: { open: this.open }
      })
    );
  }

  private get fieldElement(): HTMLElement | null {
    return this.renderRoot.querySelector(".field");
  }

  private get panelElement(): HTMLElement | null {
    return this.renderRoot.querySelector("cindor-calendar");
  }

  private get rangeSummary(): string {
    if (!this.startValue && !this.endValue) {
      return "";
    }

    if (this.startValue && !this.endValue) {
      return `${this.startValue} ->`;
    }

    return `${this.startValue} -> ${this.endValue}`;
  }
}
