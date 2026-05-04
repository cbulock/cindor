import { css, html } from "lit";

import { FormAssociatedElement } from "../shared/form-associated-element.js";
import { readLightDomOptions, syncLightDomOptionSelection, type LightDomOption } from "../shared/light-dom-options.js";

type TransferListOption = LightDomOption;

type TransferListChangeDetail = {
  labels: string[];
  values: string[];
};

/**
 * Dual-list selector for moving items between available and selected collections.
 *
 * Use light-DOM `option` or `cindor-option` children as the source option set.
 *
 * @fires {CustomEvent<TransferListChangeDetail>} input - Fired when the selected values change.
 * @fires {CustomEvent<TransferListChangeDetail>} change - Fired when the selected values change.
 *
 * @slot - `option` or `cindor-option` children that define the available choices.
 */
export class CindorTransferList extends FormAssociatedElement {
  static styles = css`
    :host {
      display: block;
      width: min(100%, 48rem);
      max-width: 100%;
      color: var(--fg);
    }

    .surface {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
      gap: var(--space-4);
      align-items: center;
    }

    .column {
      display: grid;
      gap: var(--space-2);
      min-width: 0;
    }

    .column-header {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      justify-content: space-between;
      gap: var(--space-2);
    }

    .label {
      font-weight: var(--weight-medium);
    }

    .count {
      color: var(--fg-muted);
      font-size: var(--text-sm);
    }

    select {
      width: 100%;
      min-height: 14rem;
      padding: var(--space-2);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      background: var(--surface);
      color: inherit;
      font: inherit;
    }

    select:focus-visible {
      outline: none;
      box-shadow: var(--ring-focus);
    }

    select:disabled {
      cursor: not-allowed;
      background: var(--bg-subtle);
      color: var(--fg-subtle);
    }

    .actions {
      display: grid;
      gap: var(--space-2);
      justify-items: stretch;
    }

    .action {
      min-width: 9rem;
      min-height: 2.25rem;
      padding: 0 var(--space-3);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      background: var(--surface);
      color: inherit;
      font: inherit;
      cursor: pointer;
      transition:
        background var(--duration-base) var(--ease-out),
        border-color var(--duration-base) var(--ease-out);
    }

    .action:hover:not(:disabled) {
      background: var(--bg-subtle);
    }

    .action:focus-visible {
      outline: none;
      box-shadow: var(--ring-focus);
    }

    .action:disabled {
      cursor: not-allowed;
      opacity: 0.56;
    }

    slot {
      display: none;
    }

    @media (max-width: 720px) {
      .surface {
        grid-template-columns: minmax(0, 1fr);
      }

      .actions {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .action {
        min-width: 0;
      }
    }
  `;

  static properties = {
    availableLabel: { reflect: true, attribute: "available-label" },
    disabled: { type: Boolean, reflect: true },
    name: { reflect: true },
    required: { type: Boolean, reflect: true },
    selectedLabel: { reflect: true, attribute: "selected-label" },
    selectedValues: { attribute: false },
    size: { type: Number, reflect: true }
  };

  availableLabel = "Available";
  disabled = false;
  name = "";
  required = false;
  selectedLabel = "Selected";
  selectedValues: string[] = [];
  size = 8;

  private activeAvailableValues: string[] = [];
  private activeSelectedValues: string[] = [];
  private defaultSelectedValues: string[] = [];
  private initializedValues = false;
  private optionNodes: TransferListOption[] = [];

  override connectedCallback(): void {
    super.connectedCallback();
    this.refreshOptions();

    if (!this.initializedValues) {
      if (this.selectedValues.length === 0) {
        this.selectedValues = this.optionNodes.filter((option) => option.selected).map((option) => option.value);
      }

      this.defaultSelectedValues = [...this.selectedValues];
      this.initializedValues = true;
    }
  }

  checkValidity(): boolean {
    if (this.internals && typeof this.internals.checkValidity === "function") {
      return this.internals.checkValidity();
    }

    return !this.isValueMissing;
  }

  override focus(options?: FocusOptions): void {
    this.availableSelect?.focus(options);
  }

  reportValidity(): boolean {
    if (this.internals && typeof this.internals.reportValidity === "function") {
      return this.internals.reportValidity();
    }

    const valid = this.checkValidity();
    if (!valid) {
      this.selectedSelect?.focus();
    }

    return valid;
  }

  formDisabledCallback(disabled: boolean): void {
    this.disabled = disabled;
  }

  formResetCallback(): void {
    this.selectedValues = [...this.defaultSelectedValues];
    this.activeAvailableValues = [];
    this.activeSelectedValues = [];
    this.syncFormState();
  }

  protected override render() {
    return html`
      <div class="surface" part="surface">
        <slot @slotchange=${this.handleSlotChange}></slot>

        <div class="column" part="available-column">
          <div class="column-header" part="available-header">
            <label class="label" for="available-list">${this.availableLabel}</label>
            <span class="count" part="available-count">${this.availableOptions.length}</span>
          </div>
          <select
            id="available-list"
            part="available-select"
            multiple
            size=${Math.max(4, this.size)}
            ?disabled=${this.disabled}
            @dblclick=${this.handleAvailableDoubleClick}
            @input=${this.handleAvailableInput}
          >
            ${this.availableOptions.map(
              (option) => html`
                <option ?disabled=${option.disabled} value=${option.value}>${option.label}</option>
              `
            )}
          </select>
        </div>

        <div class="actions" part="actions">
          <button
            aria-label="Add selected items"
            class="action"
            part="add-button"
            type="button"
            ?disabled=${this.disabled || this.activeAvailableValues.length === 0}
            @click=${this.moveSelectedToChosen}
          >
            Add selected
          </button>
          <button
            aria-label="Add all available items"
            class="action"
            part="add-all-button"
            type="button"
            ?disabled=${this.disabled || this.availableMovableCount === 0}
            @click=${this.moveAllToChosen}
          >
            Add all
          </button>
          <button
            aria-label="Remove selected items"
            class="action"
            part="remove-button"
            type="button"
            ?disabled=${this.disabled || this.activeSelectedValues.length === 0}
            @click=${this.moveSelectedToAvailable}
          >
            Remove selected
          </button>
          <button
            aria-label="Remove all selected items"
            class="action"
            part="remove-all-button"
            type="button"
            ?disabled=${this.disabled || this.selectedValues.length === 0}
            @click=${this.moveAllToAvailable}
          >
            Remove all
          </button>
        </div>

        <div class="column" part="selected-column">
          <div class="column-header" part="selected-header">
            <label class="label" for="selected-list">${this.selectedLabel}</label>
            <span class="count" part="selected-count">${this.selectedValues.length}</span>
          </div>
          <select
            id="selected-list"
            part="selected-select"
            multiple
            size=${Math.max(4, this.size)}
            ?disabled=${this.disabled}
            @dblclick=${this.handleSelectedDoubleClick}
            @input=${this.handleSelectedInput}
          >
            ${this.selectedOptions.map(
              (option) => html`
                <option ?disabled=${option.disabled} value=${option.value}>${option.label}</option>
              `
            )}
          </select>
        </div>
      </div>
    `;
  }

  protected override updated(changedProperties: Map<string, unknown>): void {
    if (changedProperties.has("selectedValues")) {
      const normalizedValues = this.normalizedSelectedValues(this.selectedValues);
      if (
        normalizedValues.length !== this.selectedValues.length ||
        normalizedValues.some((value, index) => value !== this.selectedValues[index])
      ) {
        this.selectedValues = normalizedValues;
        return;
      }

      this.syncLightDomSelection();
    }

    this.syncFormState();
    this.syncControlA11y(this.availableSelect, { skipLabel: true });
    this.syncControlA11y(this.selectedSelect, { skipLabel: true });
  }

  private handleSlotChange = (): void => {
    this.refreshOptions();
  };

  private handleAvailableInput = (event: Event): void => {
    const select = event.currentTarget as HTMLSelectElement;
    this.activeAvailableValues = Array.from(select.selectedOptions).map((option) => option.value);
    this.requestUpdate();
  };

  private handleSelectedInput = (event: Event): void => {
    const select = event.currentTarget as HTMLSelectElement;
    this.activeSelectedValues = Array.from(select.selectedOptions).map((option) => option.value);
    this.requestUpdate();
  };

  private handleAvailableDoubleClick = (): void => {
    this.moveSelectedToChosen();
  };

  private handleSelectedDoubleClick = (): void => {
    this.moveSelectedToAvailable();
  };

  private refreshOptions(): void {
    this.optionNodes = readLightDomOptions(this);

    const nextValues = this.normalizedSelectedValues(this.selectedValues);
    if (
      nextValues.length !== this.selectedValues.length ||
      nextValues.some((value, index) => value !== this.selectedValues[index])
    ) {
      this.selectedValues = nextValues;
      return;
    }

    const availableValueSet = new Set(this.optionNodes.map((option) => option.value));
    this.activeAvailableValues = this.activeAvailableValues.filter((value) => availableValueSet.has(value));
    this.activeSelectedValues = this.activeSelectedValues.filter((value) => availableValueSet.has(value));
    this.requestUpdate();
  }

  private moveSelectedToChosen = (): void => {
    if (this.disabled || this.activeAvailableValues.length === 0) {
      return;
    }

    const selected = new Set(this.selectedValues);
    for (const value of this.activeAvailableValues) {
      const option = this.optionNodes.find((candidate) => candidate.value === value);
      if (option && !option.disabled) {
        selected.add(value);
      }
    }

    this.selectedValues = this.optionNodes.filter((option) => selected.has(option.value)).map((option) => option.value);
    this.activeAvailableValues = [];
    this.dispatchValueEvents();
    this.requestUpdate();
  };

  private moveAllToChosen = (): void => {
    if (this.disabled || this.availableMovableCount === 0) {
      return;
    }

    const currentlySelected = new Set(this.selectedValues);
    this.selectedValues = this.optionNodes
      .filter((option) => currentlySelected.has(option.value) || !option.disabled)
      .map((option) => option.value);
    this.activeAvailableValues = [];
    this.dispatchValueEvents();
    this.requestUpdate();
  };

  private moveSelectedToAvailable = (): void => {
    if (this.disabled || this.activeSelectedValues.length === 0) {
      return;
    }

    const removed = new Set(this.activeSelectedValues);
    this.selectedValues = this.selectedValues.filter((value) => !removed.has(value));
    this.activeSelectedValues = [];
    this.dispatchValueEvents();
    this.requestUpdate();
  };

  private moveAllToAvailable = (): void => {
    if (this.disabled || this.selectedValues.length === 0) {
      return;
    }

    this.selectedValues = [];
    this.activeSelectedValues = [];
    this.dispatchValueEvents();
    this.requestUpdate();
  };

  private dispatchValueEvents(): void {
    const detail: TransferListChangeDetail = {
      labels: this.selectedOptions.map((option) => option.label),
      values: [...this.selectedValues]
    };

    this.dispatchEvent(new CustomEvent("input", { bubbles: true, composed: true, detail }));
    this.dispatchEvent(new CustomEvent("change", { bubbles: true, composed: true, detail }));
  }

  private syncFormState(): void {
    if (this.disabled || this.name === "" || this.selectedValues.length === 0) {
      this.setFormValue(null);
    } else {
      const formData = new FormData();
      for (const value of this.selectedValues) {
        formData.append(this.name, value);
      }
      this.setFormValue(formData);
    }

    this.syncValidity();
  }

  private syncValidity(): void {
    const select = this.selectedSelect;
    const valid = !this.isValueMissing;

    if (select) {
      if (valid) {
        select.removeAttribute("aria-invalid");
      } else {
        select.setAttribute("aria-invalid", "true");
      }
    }

    if (!this.internals || typeof this.internals.setValidity !== "function") {
      return;
    }

    if (valid) {
      this.internals.setValidity({}, "");
      return;
    }

    this.internals.setValidity({ valueMissing: true }, "Select at least one item.", select ?? undefined);
  }

  private syncLightDomSelection(): void {
    syncLightDomOptionSelection(this, this.selectedValues);
  }

  private normalizedSelectedValues(values: string[]): string[] {
    const selectedSet = new Set(values);
    return this.optionNodes.filter((option) => selectedSet.has(option.value)).map((option) => option.value);
  }

  private get availableOptions(): TransferListOption[] {
    const selectedValues = new Set(this.selectedValues);
    return this.optionNodes.filter((option) => !selectedValues.has(option.value));
  }

  private get availableMovableCount(): number {
    return this.availableOptions.filter((option) => !option.disabled).length;
  }

  private get selectedOptions(): TransferListOption[] {
    const selectedValues = new Set(this.selectedValues);
    return this.optionNodes.filter((option) => selectedValues.has(option.value));
  }

  private get availableSelect(): HTMLSelectElement | null {
    return this.renderRoot.querySelector('[part="available-select"]');
  }

  private get isValueMissing(): boolean {
    return this.required && !this.disabled && this.selectedValues.length === 0;
  }

  private get selectedSelect(): HTMLSelectElement | null {
    return this.renderRoot.querySelector('[part="selected-select"]');
  }
}
