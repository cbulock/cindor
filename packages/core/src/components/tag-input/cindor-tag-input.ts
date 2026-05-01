import { css, html, nothing } from "lit";
import { live } from "lit/directives/live.js";

import { FormAssociatedElement } from "../shared/form-associated-element.js";

type TagInputChangeDetail = {
  values: string[];
};

/**
 * Freeform tag entry with removable tokens.
 *
 * @fires {CustomEvent<TagInputChangeDetail>} input - Fired when the committed tag values change.
 * @fires {CustomEvent<TagInputChangeDetail>} change - Fired when the committed tag values change.
 */
export class CindorTagInput extends FormAssociatedElement {
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

    .tag-chip {
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
  `;

  static properties = {
    disabled: { type: Boolean, reflect: true },
    name: { reflect: true },
    placeholder: { reflect: true },
    required: { type: Boolean, reflect: true },
    values: { attribute: false }
  };

  disabled = false;
  name = "";
  placeholder = "Add a tag";
  required = false;
  values: string[] = [];

  private defaultValues: string[] = [];
  private draftValue = "";
  private initializedValues = false;

  override connectedCallback(): void {
    super.connectedCallback();

    if (!this.initializedValues) {
      this.values = this.normalizeValues(this.values);
      this.defaultValues = [...this.values];
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
    this.draftValue = "";
    this.syncFormState();
  }

  protected override render() {
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
                          ?disabled=${this.disabled}
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
            ?disabled=${this.disabled}
            placeholder=${this.values.length === 0 ? this.placeholder : ""}
            type="text"
            @blur=${this.handleBlur}
            @input=${this.handleInput}
            @keydown=${this.handleKeyDown}
          />
        </div>
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
  }

  private handleBlur = (): void => {
    this.commitDraft();
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

  private handleInput = (event: InputEvent): void => {
    const input = event.currentTarget as HTMLInputElement;
    this.draftValue = input.value;
  };

  private handleKeyDown = (event: KeyboardEvent): void => {
    if (this.disabled) {
      return;
    }

    if (event.key === "Backspace" && this.draftValue === "" && this.values.length > 0) {
      event.preventDefault();
      this.removeTag(this.values.at(-1) ?? "");
      return;
    }

    if (event.key === "Escape" && this.draftValue !== "") {
      event.preventDefault();
      this.draftValue = "";
      return;
    }

    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      this.commitDraft();
      return;
    }

    if (event.key === "Tab" && this.draftValue.trim() !== "") {
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
      return;
    }

    this.values = [...this.values, nextTag];
    this.dispatchValueEvents();
  }

  private removeTag(value: string): void {
    if (!value || this.disabled || !this.values.includes(value)) {
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

    this.internals.setValidity({ valueMissing: true }, "Enter at least one tag.", input ?? undefined);
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

  private get isValueMissing(): boolean {
    return this.required && !this.disabled && this.values.length === 0;
  }
}
