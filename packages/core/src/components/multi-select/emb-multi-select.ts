import { css, html, nothing } from "lit";
import { live } from "lit/directives/live.js";

import { attachFloatingPosition } from "../shared/floating-position.js";
import { FormAssociatedElement } from "../shared/form-associated-element.js";
import { getNextEnabledIndex } from "../shared/linear-navigation.js";
import { readLightDomOptions, syncLightDomOptionSelection, type LightDomOption } from "../shared/light-dom-options.js";
import { EmbOption } from "../option/emb-option.js";

type MultiSelectOption = LightDomOption;

/**
 * Searchable multi-select built from Emberline listbox and option primitives.
 *
 * Use light-DOM `option` or `emb-option` children as the source option set.
 *
 * @fires input - Fired when the selected values change.
 * @fires change - Fired when the selected values change.
 *
 * @slot - `option` or `emb-option` children that define the available choices.
 */
export class EmbMultiSelect extends FormAssociatedElement {
  static styles = css`
    :host {
      display: inline-block;
      width: var(--emb-field-inline-size, min(100%, 360px));
      max-width: 100%;
      min-width: 0;
      color: var(--fg);
    }

    .surface {
      position: relative;
    }

    .control {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--space-2);
      box-sizing: border-box;
      width: 100%;
      min-height: 40px;
      padding: var(--space-2);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      background: var(--surface);
      transition:
        border-color var(--duration-base) var(--ease-out),
        box-shadow var(--duration-base) var(--ease-out),
        background var(--duration-base) var(--ease-out);
    }

    .control:focus-within {
      box-shadow: var(--ring-focus);
    }

    :host([disabled]) .control {
      background: var(--bg-subtle);
      color: var(--fg-subtle);
      cursor: not-allowed;
    }

    .chip-list {
      display: inline-flex;
      flex-wrap: wrap;
      gap: var(--space-2);
      min-width: 0;
    }

    .selection-chip {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      min-height: 28px;
      max-width: 100%;
      padding-inline-start: var(--space-3);
      border: 1px solid color-mix(in srgb, var(--accent) 28%, var(--border));
      border-radius: var(--radius-full);
      background: var(--accent-muted);
      color: var(--fg);
      font-size: var(--text-sm);
      white-space: nowrap;
    }

    .chip-label {
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .chip-remove {
      display: inline-grid;
      place-items: center;
      width: 1.5rem;
      height: 1.5rem;
      padding: 0;
      border: 0;
      border-radius: var(--radius-full);
      background: transparent;
      color: inherit;
      font: inherit;
      cursor: pointer;
    }

    .chip-remove:hover:not(:disabled) {
      background: color-mix(in srgb, var(--accent) 16%, transparent);
    }

    .chip-remove:focus-visible {
      outline: none;
      box-shadow: var(--ring-focus);
    }

    .chip-remove:disabled {
      cursor: not-allowed;
      opacity: 0.48;
    }

    input {
      flex: 1 1 7rem;
      min-width: 5rem;
      padding: 0;
      border: 0;
      background: transparent;
      color: inherit;
      font: inherit;
    }

    input::placeholder {
      color: var(--fg-subtle);
    }

    input:focus-visible {
      outline: none;
    }

    input:disabled {
      cursor: not-allowed;
    }

    slot {
      display: none;
    }

    emb-listbox {
      position: fixed;
      z-index: 10;
      max-block-size: 240px;
      overflow: auto;
    }
  `;

  static properties = {
    activeIndex: { state: true },
    disabled: { type: Boolean, reflect: true },
    name: { reflect: true },
    open: { type: Boolean, reflect: true },
    placeholder: { reflect: true },
    query: { state: true },
    required: { type: Boolean, reflect: true },
    values: { attribute: false }
  };

  private static nextId = 0;

  disabled = false;
  name = "";
  open = false;
  placeholder = "Select options";
  required = false;
  values: string[] = [];

  private activeIndex = -1;
  private defaultValues: string[] = [];
  private floatingCleanup?: () => void;
  private floatingListbox: HTMLElement | null = null;
  private initializedValues = false;
  private listId = `emb-multi-select-list-${EmbMultiSelect.nextId++}`;
  private optionNodes: MultiSelectOption[] = [];
  private query = "";
  private updateFloatingPosition?: () => void;

  override connectedCallback(): void {
    super.connectedCallback();
    this.refreshOptions();

    if (!this.initializedValues) {
      if (this.values.length === 0) {
        this.values = this.optionNodes.filter((option) => option.selected).map((option) => option.value);
      }

      this.defaultValues = [...this.values];
      this.initializedValues = true;
    }
  }

  override disconnectedCallback(): void {
    this.destroyFloatingPosition();
    super.disconnectedCallback();
  }

  checkValidity(): boolean {
    if (this.internals && typeof this.internals.checkValidity === "function") {
      return this.internals.checkValidity();
    }

    return !this.isValueMissing;
  }

  override focus(options?: FocusOptions): void {
    this.inputElement?.focus(options);
  }

  reportValidity(): boolean {
    if (this.internals && typeof this.internals.reportValidity === "function") {
      return this.internals.reportValidity();
    }

    const valid = this.checkValidity();
    if (!valid) {
      this.inputElement?.focus();
    }

    return valid;
  }

  formDisabledCallback(disabled: boolean): void {
    this.disabled = disabled;
  }

  formResetCallback(): void {
    this.values = [...this.defaultValues];
    this.query = "";
    this.open = false;
    this.activeIndex = this.getInitialActiveIndex();
    this.syncFormState();
  }

  protected override render() {
    const selectedOptions = this.selectedOptions;

    return html`
      <div class="surface">
        <slot @slotchange=${this.handleSlotChange}></slot>
        <div class="control" part="control" @pointerdown=${this.handleControlPointerDown}>
          ${selectedOptions.length > 0
            ? html`
                <div class="chip-list" part="chips">
                  ${selectedOptions.map(
                    (option) => html`
                      <span class="selection-chip" part="chip">
                        <span class="chip-label">${option.label}</span>
                        <button
                          aria-label=${`Remove ${option.label}`}
                          class="chip-remove"
                          part="chip-remove"
                          type="button"
                          ?disabled=${this.disabled}
                          @click=${() => this.removeValue(option.value)}
                        >
                          x
                        </button>
                      </span>
                    `
                  )}
                </div>
              `
            : nothing}
          <input
            part="input"
            .value=${live(this.query)}
            aria-activedescendant=${this.activeDescendantId ?? nothing}
            aria-autocomplete="list"
            aria-controls=${this.listId}
            aria-expanded=${String(this.listboxVisible)}
            autocomplete="off"
            ?disabled=${this.disabled}
            placeholder=${selectedOptions.length === 0 ? this.placeholder : ""}
            role="combobox"
            type="text"
            @blur=${this.handleBlur}
            @focus=${this.handleFocus}
            @input=${this.handleInput}
            @keydown=${this.handleKeyDown}
          />
        </div>
        ${this.listboxVisible
          ? html`
              <emb-listbox
                part="listbox"
                id=${this.listId}
                .activeIndex=${this.activeIndex}
                .multiselectable=${true}
                @option-hover=${this.handleOptionHoverEvent}
                @option-select=${this.handleOptionSelect}
              >
                ${this.filteredOptions.map(
                  (option, index) => html`
                    <emb-option
                      id=${this.getOptionId(index)}
                      ?active=${index === this.activeIndex}
                      ?disabled=${option.disabled}
                      ?selected=${this.isSelected(option.value)}
                      value=${option.value}
                    >
                      ${option.label}
                    </emb-option>
                  `
                )}
              </emb-listbox>
            `
          : nothing}
      </div>
    `;
  }

  protected override updated(changedProperties: Map<string, unknown>): void {
    if (changedProperties.has("values")) {
      const normalizedValues = this.normalizedValues(this.values);
      if (
        normalizedValues.length !== this.values.length ||
        normalizedValues.some((value, index) => value !== this.values[index])
      ) {
        this.values = normalizedValues;
        return;
      }

      this.syncLightDomSelection();
    }

    this.syncFormState();
    this.syncControlA11y(this.inputElement);
    this.syncFloatingPosition();
  }

  private handleBlur = (): void => {
    queueMicrotask(() => {
      if (this.shadowRoot?.activeElement) {
        return;
      }

      this.open = false;
      this.activeIndex = -1;
    });
  };

  private handleControlPointerDown = (event: PointerEvent): void => {
    if (this.disabled) {
      return;
    }

    const target = event.composedPath()[0];
    if (target instanceof HTMLButtonElement) {
      return;
    }

    if (target !== this.inputElement) {
      event.preventDefault();
    }

    this.inputElement?.focus();
  };

  private handleFocus = (): void => {
    if (this.disabled || this.filteredOptions.length === 0) {
      return;
    }

    this.open = true;
    this.activeIndex = this.getInitialActiveIndex();
  };

  private handleInput = (event: InputEvent): void => {
    const input = event.currentTarget as HTMLInputElement;
    this.query = input.value;
    this.open = this.filteredOptions.length > 0;
    this.activeIndex = this.getInitialActiveIndex();
  };

  private handleKeyDown = (event: KeyboardEvent): void => {
    if (this.disabled) {
      return;
    }

    if (event.key === "Backspace" && this.query === "" && this.values.length > 0) {
      event.preventDefault();
      this.removeValue(this.values.at(-1) ?? "");
      return;
    }

    const options = this.filteredOptions;

    if (event.key === "Escape" && this.open) {
      event.preventDefault();
      this.open = false;
      this.activeIndex = -1;
      return;
    }

    if (options.length === 0) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      this.open = true;
      this.activeIndex = this.getNextActiveIndex(1);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      this.open = true;
      this.activeIndex = this.getNextActiveIndex(-1);
      return;
    }

    if (event.key === "Enter" && this.listboxVisible && this.activeIndex >= 0) {
      event.preventDefault();
      this.commitOption(this.activeIndex);
    }
  };

  private handleOptionHoverEvent = (event: CustomEvent<{ option: EmbOption }>): void => {
    const index = this.renderedOptionElements.indexOf(event.detail.option);

    if (index >= 0) {
      this.activeIndex = index;
    }
  };

  private handleOptionSelect = (event: CustomEvent<{ option: EmbOption }>): void => {
    const index = this.renderedOptionElements.indexOf(event.detail.option);

    if (index >= 0) {
      this.commitOption(index);
    }
  };

  private handleSlotChange = (): void => {
    this.refreshOptions();
  };

  private refreshOptions(): void {
    this.optionNodes = readLightDomOptions(this);

    const availableValues = new Set(this.optionNodes.map((option) => option.value));
    const nextValues = this.values.filter((value) => availableValues.has(value));

    if (nextValues.length !== this.values.length || nextValues.some((value, index) => value !== this.values[index])) {
      this.values = nextValues;
      return;
    }

    this.activeIndex = this.getInitialActiveIndex();
    this.requestUpdate();
  }

  private commitOption(index: number): void {
    const option = this.filteredOptions[index];

    if (!option || option.disabled) {
      return;
    }

    this.values = this.isSelected(option.value)
      ? this.values.filter((value) => value !== option.value)
      : this.optionNodes.filter((candidate) => this.values.includes(candidate.value) || candidate.value === option.value).map((candidate) => candidate.value);
    this.query = "";
    this.open = this.optionNodes.length > 0;
    this.activeIndex = this.getInitialActiveIndex();
    this.dispatchValueEvents();
  }

  private removeValue(value: string): void {
    if (!value || this.disabled || !this.values.includes(value)) {
      return;
    }

    this.values = this.values.filter((entry) => entry !== value);
    this.activeIndex = this.getInitialActiveIndex();
    this.dispatchValueEvents();
  }

  private dispatchValueEvents(): void {
    const detail = {
      labels: this.selectedOptions.map((option) => option.label),
      values: [...this.values]
    };

    this.dispatchEvent(new CustomEvent("input", { bubbles: true, composed: true, detail }));
    this.dispatchEvent(new CustomEvent("change", { bubbles: true, composed: true, detail }));
  }

  private syncFormState(): void {
    if (this.disabled || this.name === "" || this.values.length === 0) {
      this.setFormValue(null);
    } else {
      const formData = new FormData();
      for (const value of this.values) {
        formData.append(this.name, value);
      }
      this.setFormValue(formData);
    }

    this.syncValidity();
  }

  private syncValidity(): void {
    const input = this.inputElement;
    const valid = !this.isValueMissing;

    if (input) {
      if (valid) {
        input.removeAttribute("aria-invalid");
      } else {
        input.setAttribute("aria-invalid", "true");
      }
    }

    if (!this.internals || typeof this.internals.setValidity !== "function") {
      return;
    }

    if (valid) {
      this.internals.setValidity({}, "");
      return;
    }

    this.internals.setValidity({ valueMissing: true }, "Select at least one option.", input ?? undefined);
  }

  private syncFloatingPosition(): void {
    const input = this.inputElement;
    const listbox = this.listboxElement;

    if (!this.listboxVisible || !input || !listbox) {
      this.destroyFloatingPosition();
      return;
    }

    if (this.floatingListbox !== listbox) {
      this.destroyFloatingPosition();
      const handle = attachFloatingPosition({
        floating: listbox,
        matchReferenceWidth: true,
        placement: "bottom-start",
        reference: input
      });

      this.floatingCleanup = handle.cleanup;
      this.updateFloatingPosition = handle.update;
      this.floatingListbox = listbox;
      return;
    }

    this.updateFloatingPosition?.();
  }

  private destroyFloatingPosition(): void {
    this.floatingCleanup?.();
    this.floatingCleanup = undefined;
    this.updateFloatingPosition = undefined;

    if (this.floatingListbox) {
      this.floatingListbox.style.position = "";
      this.floatingListbox.style.left = "";
      this.floatingListbox.style.top = "";
      this.floatingListbox.style.width = "";
    }

    this.floatingListbox = null;
  }

  private syncLightDomSelection(): void {
    syncLightDomOptionSelection(this, this.values);
  }

  private normalizedValues(values: string[]): string[] {
    const available = new Set(this.optionNodes.map((option) => option.value));
    return [...new Set(values)].filter((value) => available.has(value));
  }

  private isSelected(value: string): boolean {
    return this.values.includes(value);
  }

  private getOptionId(index: number): string {
    return `${this.listId}-option-${index}`;
  }

  private getInitialActiveIndex(): number {
    return this.filteredOptions.findIndex((option) => !option.disabled);
  }

  private getNextActiveIndex(direction: 1 | -1): number {
    return getNextEnabledIndex(this.filteredOptions, this.activeIndex, direction, (option) => option.disabled);
  }

  private get filteredOptions(): MultiSelectOption[] {
    const query = this.query.trim().toLowerCase();

    if (query === "") {
      return this.optionNodes;
    }

    return this.optionNodes.filter(
      (option) => option.label.toLowerCase().includes(query) || option.value.toLowerCase().includes(query)
    );
  }

  private get selectedOptions(): MultiSelectOption[] {
    return this.optionNodes.filter((option) => this.values.includes(option.value));
  }

  private get listboxVisible(): boolean {
    return this.open && this.filteredOptions.length > 0;
  }

  private get activeDescendantId(): string | undefined {
    if (!this.listboxVisible || this.activeIndex < 0) {
      return undefined;
    }

    return this.getOptionId(this.activeIndex);
  }

  private get inputElement(): HTMLInputElement | null {
    return this.renderRoot.querySelector("input");
  }

  private get isValueMissing(): boolean {
    return this.required && !this.disabled && this.values.length === 0;
  }

  private get listboxElement(): HTMLElement | null {
    return this.renderRoot.querySelector("emb-listbox");
  }

  private get renderedOptionElements(): EmbOption[] {
    return Array.from(this.listboxElement?.querySelectorAll("emb-option") ?? []).filter(
      (option): option is EmbOption => option instanceof EmbOption
    );
  }
}
