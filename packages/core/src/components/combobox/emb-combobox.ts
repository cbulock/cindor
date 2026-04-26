import { css, html, nothing } from "lit";
import { live } from "lit/directives/live.js";

import { attachFloatingPosition } from "../shared/floating-position.js";
import { FormAssociatedElement } from "../shared/form-associated-element.js";

type ComboboxOption = {
  label: string;
  value: string;
};

export class EmbCombobox extends FormAssociatedElement {
  static styles = css`
    :host {
      display: inline-block;
      width: var(--emb-field-inline-size, min(100%, 320px));
      max-width: 100%;
      min-width: 0;
      color: var(--fg);
    }

    .surface {
      position: relative;
    }

    input {
      box-sizing: border-box;
      width: 100%;
      min-height: 36px;
      font: inherit;
      padding: 0 var(--space-3);
      border-radius: var(--radius-md);
      border: 1px solid var(--border);
      background: var(--surface);
      color: var(--fg);
      transition:
        border-color var(--duration-base) var(--ease-out),
        box-shadow var(--duration-base) var(--ease-out),
        background var(--duration-base) var(--ease-out);
    }

    input::placeholder {
      color: var(--fg-subtle);
    }

    input:disabled {
      cursor: not-allowed;
      color: var(--fg-subtle);
      background: var(--bg-subtle);
    }

    input:focus-visible {
      outline: none;
      box-shadow: var(--ring-focus);
    }

    slot {
      display: none;
    }

    .listbox {
      position: fixed;
      z-index: 10;
      display: grid;
      gap: var(--space-1);
      max-block-size: 240px;
      overflow: auto;
      padding: var(--space-2);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      background: var(--surface);
      box-shadow: var(--shadow-md);
    }

    .option {
      width: 100%;
      padding: var(--space-2) var(--space-3);
      border: 0;
      border-radius: var(--radius-md);
      background: transparent;
      color: var(--fg);
      cursor: pointer;
      font: inherit;
      text-align: start;
    }

    .option:hover,
    .option[data-active="true"] {
      background: var(--bg-subtle);
    }

    .option[data-selected="true"] {
      color: var(--accent);
      font-weight: 600;
    }
  `;

  static properties = {
    activeIndex: { state: true },
    autocomplete: { reflect: true },
    disabled: { type: Boolean, reflect: true },
    name: { reflect: true },
    open: { state: true },
    placeholder: { reflect: true },
    readonly: { type: Boolean, reflect: true, attribute: "readonly" },
    required: { type: Boolean, reflect: true },
    value: { reflect: true }
  };

  private static nextId = 0;

  autocomplete = "";
  disabled = false;
  name = "";
  open = false;
  placeholder = "";
  readonly = false;
  required = false;
  value = "";

  private activeIndex = -1;
  private defaultValue = "";
  private floatingCleanup?: () => void;
  private floatingListbox: HTMLElement | null = null;
  private listId = `emb-combobox-list-${EmbCombobox.nextId++}`;
  private optionNodes: ComboboxOption[] = [];
  private updateFloatingPosition?: () => void;

  override connectedCallback(): void {
    super.connectedCallback();
    this.defaultValue = this.getAttribute("value") ?? this.value;
    this.refreshOptions();
  }

  override disconnectedCallback(): void {
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

  formDisabledCallback(disabled: boolean): void {
    this.disabled = disabled;
  }

  formResetCallback(): void {
    this.value = this.defaultValue;
    this.syncFormState();
  }

  protected override render() {
    const filteredOptions = this.filteredOptions;

    return html`
      <div class="surface">
        <slot @slotchange=${this.handleSlotChange}></slot>
        <input
          part="control"
          .value=${live(this.value)}
          aria-activedescendant=${this.activeDescendantId ?? nothing}
          aria-autocomplete="list"
          aria-controls=${this.listId}
          aria-expanded=${String(this.listboxVisible)}
          autocomplete=${this.autocomplete}
          ?disabled=${this.disabled}
          name=${this.name}
          placeholder=${this.placeholder}
          ?readonly=${this.readonly}
          ?required=${this.required}
          role="combobox"
          type="text"
          @blur=${this.handleBlur}
          @change=${this.handleChange}
          @focus=${this.handleFocus}
          @input=${this.handleInput}
          @keydown=${this.handleKeyDown}
        />
        ${this.listboxVisible
          ? html`
              <div class="listbox" part="listbox" id=${this.listId} role="listbox">
                ${filteredOptions.map(
                  (option, index) => html`
                    <button
                      id=${this.getOptionId(index)}
                      class="option"
                      part=${index === this.activeIndex ? "option option-active" : "option"}
                      type="button"
                      role="option"
                      aria-selected=${String(option.value === this.value)}
                      data-active=${String(index === this.activeIndex)}
                      data-selected=${String(option.value === this.value)}
                      @mousedown=${this.handleOptionMouseDown}
                      @click=${() => this.commitOption(index)}
                    >
                      ${option.label}
                    </button>
                  `
                )}
              </div>
            `
          : nothing}
      </div>
    `;
  }

  protected override updated(): void {
    this.syncFormState();
    this.syncFloatingPosition();
  }

  private handleChange = (event: Event): void => {
    event.stopPropagation();
    const input = event.currentTarget as HTMLInputElement;
    this.value = input.value;
    this.open = false;
    this.activeIndex = -1;
    this.syncFormState();
    this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
  };

  private handleInput = (event: InputEvent): void => {
    event.stopPropagation();
    const input = event.currentTarget as HTMLInputElement;
    this.value = input.value;
    this.open = this.filteredOptions.length > 0;
    this.activeIndex = this.getInitialActiveIndex();
    this.syncFormState();
    this.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
  };

  private handleFocus = (): void => {
    if (this.filteredOptions.length === 0 || this.disabled) {
      return;
    }

    this.open = true;
    this.activeIndex = this.getInitialActiveIndex();
  };

  private handleBlur = (): void => {
    queueMicrotask(() => {
      this.open = false;
      this.activeIndex = -1;
    });
  };

  private handleKeyDown = (event: KeyboardEvent): void => {
    const options = this.filteredOptions;

    if (options.length === 0 || this.disabled) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      this.open = true;
      this.activeIndex = this.activeIndex < options.length - 1 ? this.activeIndex + 1 : options.length - 1;
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      this.open = true;
      this.activeIndex = this.activeIndex > 0 ? this.activeIndex - 1 : 0;
      return;
    }

    if (event.key === "Enter" && this.listboxVisible && this.activeIndex >= 0) {
      event.preventDefault();
      this.commitOption(this.activeIndex);
      return;
    }

    if (event.key === "Escape" && this.open) {
      event.preventDefault();
      this.open = false;
      this.activeIndex = -1;
    }
  };

  private handleSlotChange = (): void => {
    this.refreshOptions();
  };

  private handleOptionMouseDown = (event: MouseEvent): void => {
    event.preventDefault();
  };

  private refreshOptions(): void {
    this.optionNodes = Array.from(this.children)
      .filter((child): child is HTMLOptionElement => child instanceof HTMLOptionElement)
      .map((option) => ({
        label: option.label || option.textContent?.trim() || option.value,
        value: option.value
      }));

    this.activeIndex = this.getInitialActiveIndex();
    this.requestUpdate();
  }

  private commitOption(index: number): void {
    const option = this.filteredOptions[index];

    if (!option) {
      return;
    }

    this.value = option.value;
    this.open = false;
    this.activeIndex = -1;
    this.syncFormState();
    this.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
    this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
  }

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

  private get inputElement(): HTMLInputElement | null {
    return this.renderRoot.querySelector("input");
  }

  private get listboxElement(): HTMLElement | null {
    return this.renderRoot.querySelector(".listbox");
  }

  private get filteredOptions(): ComboboxOption[] {
    const query = this.value.trim().toLowerCase();

    if (query === "") {
      return this.optionNodes;
    }

    return this.optionNodes.filter(
      (option) => option.label.toLowerCase().includes(query) || option.value.toLowerCase().includes(query)
    );
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

  private getInitialActiveIndex(): number {
    const exactMatchIndex = this.filteredOptions.findIndex((option) => option.value === this.value);

    if (exactMatchIndex >= 0) {
      return exactMatchIndex;
    }

    return this.filteredOptions.length > 0 ? 0 : -1;
  }

  private getOptionId(index: number): string {
    return `${this.listId}-option-${index}`;
  }
}
