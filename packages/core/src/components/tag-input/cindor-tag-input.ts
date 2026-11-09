import { css, html, nothing } from "lit";
import { live } from "lit/directives/live.js";

import { floatingListboxStyles } from "../shared/control-styles.js";
import { attachFloatingPosition } from "../shared/floating-position.js";
import { FormAssociatedElement } from "../shared/form-associated-element.js";
import { CindorOption } from "../option/cindor-option.js";

type TagInputChangeDetail = {
  values: string[];
};

export type TagInputSuggestion = {
  keywords?: string[];
  label: string;
};

/**
 * Freeform tag entry with removable tokens.
 *
 * @fires {CustomEvent<TagInputChangeDetail>} input - Fired when the committed tag values change.
 * @fires {CustomEvent<TagInputChangeDetail>} change - Fired when the committed tag values change.
 * @fires {Event} invalid - Fired when constraint validation fails. This event is cancelable and does not bubble.
 */
export class CindorTagInput extends FormAssociatedElement {
  static styles = [
    floatingListboxStyles,
    css`
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

      :host(:disabled) .control {
        background: var(--bg-subtle);
        color: var(--fg-subtle);
        cursor: not-allowed;
      }

      .chip-list {
        display: inline-flex;
        flex-wrap: wrap;
        gap: var(--space-2);
        min-width: 0;
        max-width: 100%;
      }

      .tag-chip {
        display: inline-flex;
        align-items: center;
        flex-wrap: wrap;
        gap: var(--space-2);
        min-height: 2.25rem;
        max-width: 100%;
        padding-inline-start: var(--space-3);
        border: 1px solid color-mix(in srgb, var(--accent) 28%, var(--border));
        border-radius: var(--radius-full);
        background: var(--accent-muted);
        color: var(--fg);
        font-size: var(--text-sm);
        white-space: normal;
      }

      .chip-label {
        overflow: hidden;
        text-overflow: ellipsis;
        overflow-wrap: anywhere;
      }

      .chip-remove {
        display: inline-grid;
        place-items: center;
        width: 2rem;
        height: 2rem;
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
    `
  ];

  static properties = {
    activeIndex: { state: true },
    disabled: { type: Boolean, reflect: true },
    name: { reflect: true },
    open: { type: Boolean, reflect: true },
    placeholder: { reflect: true },
    required: { type: Boolean, reflect: true },
    suggestions: { attribute: false },
    values: { attribute: false }
  };

  private static nextId = 0;

  disabled = false;
  name = "";
  open = false;
  placeholder = "Add a tag";
  required = false;
  suggestions: TagInputSuggestion[] = [];
  values: string[] = [];

  private activeIndex = -1;
  private defaultValues: string[] = [];
  private draftValue = "";
  private floatingCleanup?: () => void;
  private floatingListbox: HTMLElement | null = null;
  private initializedValues = false;
  private listId = `cindor-tag-input-list-${CindorTagInput.nextId++}`;
  private updateFloatingPosition?: () => void;

  override connectedCallback(): void {
    super.connectedCallback();

    if (!this.initializedValues) {
      this.values = this.normalizeValues(this.values);
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

  override formDisabledCallback(disabled: boolean): void {
    super.formDisabledCallback(disabled);
  }

  formResetCallback(): void {
    this.values = [...this.defaultValues];
    this.draftValue = "";
    this.open = false;
    this.activeIndex = -1;
    this.syncFormState();
  }

  protected override render() {
    const filteredSuggestions = this.filteredSuggestions;

    return html`
      <div class="surface">
        <div class="control" part="control" @pointerdown=${this.handleControlPointerDown}>
          ${this.values.length > 0
            ? html`
                <div class="chip-list" part="chips">
                  ${this.values.map(
                    (value) => html`
                      <span class="tag-chip" part="chip">
                        <span class="chip-label">${value}</span>
                        <button
                          aria-label=${`Remove ${value}`}
                          class="chip-remove"
                          part="chip-remove"
                          type="button"
                          ?disabled=${this.effectiveDisabled}
                          @click=${() => this.removeTag(value)}
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
            .value=${live(this.draftValue)}
            aria-activedescendant=${this.activeDescendantId ?? nothing}
            aria-autocomplete="list"
            aria-controls=${this.listId}
            aria-expanded=${String(this.listboxVisible)}
            autocomplete="off"
            ?disabled=${this.effectiveDisabled}
            placeholder=${this.values.length === 0 ? this.placeholder : ""}
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
              <cindor-listbox
                part="listbox"
                id=${this.listId}
                .activeIndex=${this.activeIndex}
                @option-hover=${this.handleOptionHover}
                @option-select=${this.handleOptionSelect}
              >
                ${filteredSuggestions.map(
                  (suggestion, index) => html`
                    <cindor-option id=${this.getOptionId(index)} ?active=${index === this.activeIndex} label=${suggestion.label} value=${suggestion.label}>
                      ${suggestion.label}
                    </cindor-option>
                  `
                )}
              </cindor-listbox>
            `
          : nothing}
      </div>
    `;
  }

  protected override updated(changedProperties: Map<string, unknown>): void {
    if (changedProperties.has("values")) {
      const normalizedValues = this.normalizeValues(this.values);
      if (
        normalizedValues.length !== this.values.length ||
        normalizedValues.some((value, index) => value !== this.values[index])
      ) {
        this.values = normalizedValues;
        return;
      }
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
      this.commitDraft();
    });
  };

  private handleControlPointerDown = (event: PointerEvent): void => {
    if (this.effectiveDisabled) {
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
    if (this.effectiveDisabled || this.filteredSuggestions.length === 0) {
      return;
    }

    this.open = true;
    this.activeIndex = this.getInitialActiveIndex();
  };

  private handleInput = (event: InputEvent): void => {
    event.stopPropagation();
    const input = event.currentTarget as HTMLInputElement;
    this.draftValue = input.value;
    this.open = this.filteredSuggestions.length > 0;
    this.activeIndex = this.getInitialActiveIndex();
  };

  private handleKeyDown = (event: KeyboardEvent): void => {
    if (this.effectiveDisabled) {
      return;
    }

    if (event.key === "Backspace" && this.draftValue === "" && this.values.length > 0) {
      event.preventDefault();
      this.removeTag(this.values.at(-1) ?? "");
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      this.draftValue = "";
      this.open = false;
      this.activeIndex = -1;
      return;
    }

    if (event.key === "ArrowDown" && this.filteredSuggestions.length > 0) {
      event.preventDefault();
      this.open = true;
      this.activeIndex = this.getNextActiveIndex(1);
      return;
    }

    if (event.key === "ArrowUp" && this.filteredSuggestions.length > 0) {
      event.preventDefault();
      this.open = true;
      this.activeIndex = this.getNextActiveIndex(-1);
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      if (this.listboxVisible && this.activeIndex >= 0) {
        this.commitSuggestion(this.activeIndex);
        return;
      }

      this.commitDraft();
      return;
    }

    if (event.key === ",") {
      event.preventDefault();
      this.commitDraft();
      return;
    }

    if (event.key === "Tab" && this.draftValue.trim() !== "") {
      if (this.listboxVisible && this.activeIndex >= 0) {
        this.commitSuggestion(this.activeIndex);
        return;
      }

      this.commitDraft();
    }
  };

  private commitDraft(): void {
    const nextTag = this.normalizeTag(this.draftValue);
    this.draftValue = "";

    if (nextTag === "") {
      return;
    }

    if (this.values.some((value) => value.toLowerCase() === nextTag.toLowerCase())) {
      this.open = false;
      this.activeIndex = -1;
      return;
    }

    this.values = [...this.values, nextTag];
    this.open = false;
    this.activeIndex = -1;
    this.dispatchValueEvents();
  }

  private commitSuggestion(index: number): void {
    const suggestion = this.filteredSuggestions[index];
    if (!suggestion) {
      return;
    }

    this.draftValue = suggestion.label;
    this.commitDraft();
  }

  private removeTag(value: string): void {
    if (!value || this.effectiveDisabled || !this.values.includes(value)) {
      return;
    }

    this.values = this.values.filter((entry) => entry !== value);
    this.dispatchValueEvents();
  }

  private dispatchValueEvents(): void {
    const detail: TagInputChangeDetail = { values: [...this.values] };

    this.dispatchEvent(new CustomEvent("input", { bubbles: true, composed: true, detail }));
    this.dispatchEvent(new CustomEvent("change", { bubbles: true, composed: true, detail }));
  }

  private handleOptionHover = (event: CustomEvent<{ option: CindorOption }>): void => {
    const index = this.renderedOptions.indexOf(event.detail.option);
    if (index >= 0) {
      this.activeIndex = index;
    }
  };

  private handleOptionSelect = (event: CustomEvent<{ option: CindorOption }>): void => {
    const index = this.renderedOptions.indexOf(event.detail.option);
    if (index >= 0) {
      this.commitSuggestion(index);
    }
  };

  private syncFormState(): void {
    if (this.effectiveDisabled || this.name === "" || this.values.length === 0) {
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

    this.internals.setValidity({ valueMissing: true }, "Enter at least one tag.", input ?? undefined);
  }

  private syncFloatingPosition(): void {
    const input = this.inputElement;
    const panel = this.panelElement;

    if (!this.listboxVisible || !input || !panel) {
      this.destroyFloatingPosition();
      return;
    }

    if (this.floatingListbox !== panel) {
      this.destroyFloatingPosition();
      const handle = attachFloatingPosition({
        floating: panel,
        matchReferenceWidth: true,
        placement: "bottom-start",
        reference: input
      });

      this.floatingCleanup = handle.cleanup;
      this.updateFloatingPosition = handle.update;
      this.floatingListbox = panel;
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

  private normalizeTag(value: string): string {
    return value.trim().replace(/\s+/g, " ");
  }

  private normalizeValues(values: string[]): string[] {
    const normalizedValues: string[] = [];
    const seenValues = new Set<string>();

    for (const value of values) {
      const normalizedValue = this.normalizeTag(value);
      const key = normalizedValue.toLowerCase();
      if (normalizedValue === "" || seenValues.has(key)) {
        continue;
      }

      seenValues.add(key);
      normalizedValues.push(normalizedValue);
    }

    return normalizedValues;
  }

  private get inputElement(): HTMLInputElement | null {
    return this.renderRoot.querySelector("input");
  }

  private get panelElement(): HTMLElement | null {
    return this.renderRoot.querySelector('[part="listbox"]');
  }

  private get isValueMissing(): boolean {
    return this.required && !this.effectiveDisabled && this.values.length === 0;
  }

  private get filteredSuggestions(): TagInputSuggestion[] {
    const selectedValues = new Set(this.values.map((value) => value.toLowerCase()));
    const query = this.draftValue.trim().toLowerCase();
    const normalizedSuggestions: TagInputSuggestion[] = [];
    const seenSuggestions = new Set<string>();

    for (const suggestion of this.suggestions) {
      const label = this.normalizeTag(suggestion.label);
      const key = label.toLowerCase();
      if (label === "" || seenSuggestions.has(key) || selectedValues.has(key)) {
        continue;
      }

      const haystack = [label, ...(suggestion.keywords ?? [])].join(" ").toLowerCase();
      if (query !== "" && !haystack.includes(query)) {
        continue;
      }

      seenSuggestions.add(key);
      normalizedSuggestions.push({
        ...suggestion,
        label
      });
    }

    return normalizedSuggestions;
  }

  private get listboxVisible(): boolean {
    return this.open && this.filteredSuggestions.length > 0;
  }

  private get activeDescendantId(): string | undefined {
    if (!this.listboxVisible || this.activeIndex < 0) {
      return undefined;
    }

    return this.getOptionId(this.activeIndex);
  }

  private get renderedOptions(): CindorOption[] {
    return Array.from(this.renderRoot.querySelectorAll("cindor-option")).filter((option): option is CindorOption => option instanceof CindorOption);
  }

  private getInitialActiveIndex(): number {
    return this.filteredSuggestions.length > 0 ? 0 : -1;
  }

  private getNextActiveIndex(direction: 1 | -1): number {
    const suggestions = this.filteredSuggestions;
    if (suggestions.length === 0) {
      return -1;
    }

    if (this.activeIndex < 0) {
      return direction === 1 ? 0 : suggestions.length - 1;
    }

    return (this.activeIndex + direction + suggestions.length) % suggestions.length;
  }

  private getOptionId(index: number): string {
    return `${this.listId}-option-${index}`;
  }
}
