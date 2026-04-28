import { css, html, nothing } from "lit";
import { live } from "lit/directives/live.js";

import { createFieldHostStyles, createTextControlStyles, floatingListboxStyles, hiddenSlotStyles } from "../shared/control-styles.js";
import { attachFloatingPosition } from "../shared/floating-position.js";
import { FormAssociatedElement } from "../shared/form-associated-element.js";
import { getNextEnabledIndex } from "../shared/linear-navigation.js";
import { readLightDomOptions, type LightDomOption } from "../shared/light-dom-options.js";
import { EmbOption } from "../option/emb-option.js";

type ComboboxOption = LightDomOption;

export class EmbCombobox extends FormAssociatedElement {
  static styles = [
    createFieldHostStyles("min(100%, 320px)"),
    createTextControlStyles("input"),
    hiddenSlotStyles,
    floatingListboxStyles,
    css`
      .surface {
        position: relative;
      }
    `
  ];

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
              <emb-listbox
                part="listbox"
                id=${this.listId}
                .activeIndex=${this.activeIndex}
                .selectedValue=${this.value}
                @option-hover=${this.handleOptionHoverEvent}
                @option-select=${this.handleOptionSelect}
              >
                ${filteredOptions.map(
                  (option, index) => html`
                    <emb-option
                      id=${this.getOptionId(index)}
                      ?active=${index === this.activeIndex}
                      ?disabled=${option.disabled}
                      ?selected=${option.value === this.value}
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

  protected override updated(): void {
    this.syncFormState();
    this.syncControlA11y(this.inputElement);
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

  private refreshOptions(): void {
    this.optionNodes = readLightDomOptions(this);

    this.activeIndex = this.getInitialActiveIndex();
    this.requestUpdate();
  }

  private commitOption(index: number): void {
    const option = this.filteredOptions[index];

    if (!option || option.disabled) {
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
    return this.renderRoot.querySelector("emb-listbox");
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
    const exactMatchIndex = this.filteredOptions.findIndex((option) => option.value === this.value && !option.disabled);

    if (exactMatchIndex >= 0) {
      return exactMatchIndex;
    }

    return this.filteredOptions.findIndex((option) => !option.disabled);
  }

  private getOptionId(index: number): string {
    return `${this.listId}-option-${index}`;
  }

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

  private get renderedOptionElements(): EmbOption[] {
    return Array.from(this.listboxElement?.querySelectorAll("emb-option") ?? []).filter(
      (option): option is EmbOption => option instanceof EmbOption
    );
  }

  private getNextActiveIndex(direction: 1 | -1): number {
    return getNextEnabledIndex(this.filteredOptions, this.activeIndex, direction, (option) => option.disabled);
  }
}
