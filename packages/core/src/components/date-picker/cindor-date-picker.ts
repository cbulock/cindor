import { css, html } from "lit";

import { attachFloatingPosition } from "../shared/floating-position.js";
import { FormAssociatedElement } from "../shared/form-associated-element.js";
import { CindorCalendar } from "../calendar/cindor-calendar.js";

/**
 * Popup date picker that reuses the Cindor calendar surface.
 *
 * @fires input - Fired when the selected date changes.
 * @fires change - Fired when the selected date changes.
 * @fires toggle - Fired when the popup opens or closes.
 */
export class CindorDatePicker extends FormAssociatedElement {
  static styles = css`
    :host {
      display: inline-block;
      width: var(--cindor-field-inline-size, min(100%, 320px));
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

    input {
      min-width: 0;
      padding: 0 var(--space-3);
      border: 0;
      background: transparent;
      color: inherit;
      font: inherit;
    }

    input:focus-visible {
      outline: none;
    }

    input:disabled {
      cursor: not-allowed;
      color: var(--fg-subtle);
    }

    .field cindor-icon-button {
      color: var(--fg-muted);
    }

    cindor-calendar {
      position: fixed;
      z-index: 20;
    }
  `;

  static properties = {
    disabled: { type: Boolean, reflect: true },
    max: { reflect: true },
    min: { reflect: true },
    month: { reflect: true },
    name: { reflect: true },
    open: { type: Boolean, reflect: true },
    placeholder: { reflect: true },
    required: { type: Boolean, reflect: true },
    value: { reflect: true }
  };

  disabled = false;
  max = "";
  min = "";
  month = "";
  name = "";
  open = false;
  placeholder = "Select a date";
  required = false;
  value = "";

  private defaultValue = "";
  private floatingCleanup?: () => void;
  private floatingPanel: HTMLElement | null = null;
  private updateFloatingPosition?: () => void;

  override connectedCallback(): void {
    super.connectedCallback();
    this.defaultValue = this.getAttribute("value") ?? this.value;
    if (this.month === "" && this.value) {
      this.month = this.value.slice(0, 7);
    }
    document.addEventListener("pointerdown", this.handleDocumentPointerDown, true);
  }

  override disconnectedCallback(): void {
    document.removeEventListener("pointerdown", this.handleDocumentPointerDown, true);
    this.destroyFloatingPosition();
    super.disconnectedCallback();
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

  show(): void {
    if (this.disabled) {
      return;
    }

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

  formDisabledCallback(disabled: boolean): void {
    this.disabled = disabled;
  }

  formResetCallback(): void {
    this.value = this.defaultValue;
    this.month = this.value ? this.value.slice(0, 7) : this.month;
    this.syncFormState();
  }

  protected override render() {
    return html`
      <div class="surface">
        <div class="field" part="field">
          <input
            part="control"
            .value=${this.value}
            ?disabled=${this.disabled}
            name=${this.name}
            placeholder=${this.placeholder}
            readonly
            ?required=${this.required}
            type="text"
            @keydown=${this.handleFieldKeyDown}
            @click=${this.handleFieldClick}
          />
          ${this.value
            ? html`
                <cindor-icon-button
                  label="Clear date"
                  name="x"
                  part="clear-button"
                  ?disabled=${this.disabled}
                  @click=${this.handleClear}
                ></cindor-icon-button>
              `
            : null}
          <cindor-icon-button
            label=${this.open ? "Close calendar" : "Open calendar"}
            name="calendar"
            part="toggle-button"
            ?disabled=${this.disabled}
            @click=${this.handleToggleClick}
          ></cindor-icon-button>
        </div>
        ${this.open
          ? html`
              <cindor-calendar
                part="panel"
                .value=${this.value}
                ?disabled=${this.disabled}
                max=${this.max}
                min=${this.min}
                month=${this.month}
                @change=${this.handleCalendarChange}
                @input=${this.handleCalendarInput}
              ></cindor-calendar>
            `
          : null}
      </div>
    `;
  }

  protected override updated(changedProperties: Map<PropertyKey, unknown>): void {
    if (changedProperties.has("value") && this.value && this.month === "") {
      this.month = this.value.slice(0, 7);
    }

    this.syncFormState();
    this.syncControlA11y(this.inputElement);
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
    this.value = "";
    this.syncFormState();
    this.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
    this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
  };

  private handleCalendarInput = (event: Event): void => {
    event.stopPropagation();
    const calendar = event.currentTarget as CindorCalendar;
    this.value = calendar.value;
    if (this.value) {
      this.month = this.value.slice(0, 7);
    }
    this.syncFormState();
    this.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
  };

  private handleCalendarChange = (event: Event): void => {
    event.stopPropagation();
    const calendar = event.currentTarget as CindorCalendar;
    this.value = calendar.value;
    if (this.value) {
      this.month = this.value.slice(0, 7);
    }
    this.close();
    this.syncFormState();
    this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
  };

  private handleDocumentPointerDown = (event: PointerEvent): void => {
    if (!this.open) {
      return;
    }

    if (event.composedPath().includes(this)) {
      return;
    }

    this.close();
  };

  private syncFormState(): void {
    if (this.disabled) {
      this.setFormValue(null);
      return;
    }

    this.setFormValue(this.value);
    if (this.inputElement) {
      this.setValidityFrom(this.inputElement);
    }
  }

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

  private get inputElement(): HTMLInputElement | null {
    return this.renderRoot.querySelector("input");
  }

  private get panelElement(): HTMLElement | null {
    return this.renderRoot.querySelector("cindor-calendar");
  }
}
