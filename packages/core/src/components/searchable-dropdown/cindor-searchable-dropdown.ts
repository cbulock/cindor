import { css, html, nothing } from "lit";
import { live } from "lit/directives/live.js";

import { createFieldHostStyles, createTextControlStyles, floatingListboxStyles, hiddenSlotStyles } from "../shared/control-styles.js";
import { attachFloatingPosition } from "../shared/floating-position.js";
import { FormAssociatedElement } from "../shared/form-associated-element.js";
import { getNextEnabledIndex } from "../shared/linear-navigation.js";
import { readLightDomOptions, syncLightDomOptionSelection, type LightDomOption } from "../shared/light-dom-options.js";
import { CindorOption } from "../option/cindor-option.js";

type DropdownOption = LightDomOption;

/**
 * Searchable single selection from predefined options. Search text never changes value.
 * @slot - Direct native option or cindor-option children with unique values.
 * @fires input - A different option was committed by the user; precedes change.
 * @fires change - A different option was committed by the user.
 */
export class CindorSearchableDropdown extends FormAssociatedElement {
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
    query: { state: true },
    formDisabled: { state: true },
    emptyMessage: { attribute: "empty-message" },
    disabled: { type: Boolean, reflect: true },
    name: { reflect: true },
    open: { state: true },
    placeholder: { reflect: true },
    required: { type: Boolean, reflect: true },
    value: { reflect: true }
  };

  private static nextId = 0;

  emptyMessage = "No matching options";
  private query = "";
  private initialized = false;
  private initialValueAttribute?: boolean;
  private formDisabled = false;
  private optionObserver = new MutationObserver(() => this.refreshOptions());
  disabled = false;
  name = "";
  open = false;
  placeholder = "";
  required = false;
  value = "";

  private activeIndex = -1;
  private defaultValue = "";
  private floatingCleanup?: () => void;
  private floatingListbox: HTMLElement | null = null;
  private listId = `cindor-searchable-dropdown-list-${CindorSearchableDropdown.nextId++}`;
  private optionNodes: DropdownOption[] = [];
  private updateFloatingPosition?: () => void;

  override connectedCallback(): void {
    super.connectedCallback();
    this.initialValueAttribute ??= this.hasAttribute("value");
    this.refreshOptions();
    this.optionObserver.observe(this, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ["value", "label", "disabled"] });
  }

  override disconnectedCallback(): void {
    this.optionObserver.disconnect();
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
    this.formDisabled = disabled;
    if (this.effectiveDisabled) this.dismiss();
    this.syncFormState();
  }

  formResetCallback(): void {
    this.dismiss();
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
          .value=${live(this.open ? this.query : this.selectedLabel)}
          aria-activedescendant=${this.activeDescendantId ?? nothing}
          aria-autocomplete="list"
          aria-controls=${this.listboxVisible ? this.listId : nothing}
          aria-expanded=${String(this.listboxVisible)}
          autocomplete="off"
          ?disabled=${this.effectiveDisabled}
          name=${this.name}
          placeholder=${this.placeholder}
          aria-required=${String(this.required)}
          role="combobox"
          type="text"
          @blur=${this.handleBlur}
          @change=${this.handleChange}
          @click=${this.handleClick}
          @focus=${this.handleFocus}
          @input=${this.handleInput}
          @keydown=${this.handleKeyDown}
        />
        ${this.listboxVisible
          ? html`
              <cindor-listbox
                part="listbox"
                id=${this.listId}
                .activeIndex=${this.activeIndex}
                .selectedValue=${this.value}
                @option-hover=${this.handleOptionHoverEvent}
                @option-select=${this.handleOptionSelect}
              >
                ${filteredOptions.length === 0 ? html`<div role="status">${this.emptyMessage}</div>` : nothing}
                ${filteredOptions.map(
                  (option, index) => html`
                    <cindor-option
                      id=${this.getOptionId(index)}
                      ?active=${index === this.activeIndex}
                      ?disabled=${option.disabled}
                      ?selected=${option.value === this.value}
                      value=${option.value}
                    >
                      ${option.label}
                    </cindor-option>
                  `
                )}
              </cindor-listbox>
            `
          : nothing}
      </div>
    `;
  }

  protected override updated(): void {
    if (this.effectiveDisabled && this.open) this.dismiss();
    if (this.initialized) syncLightDomOptionSelection(this, [this.value]);
    this.syncFormState();
    this.renderRoot.querySelector<HTMLElement>(`#${this.activeDescendantId}`)?.scrollIntoView?.({ block: "nearest" });
    this.syncControlA11y(this.inputElement);
    this.syncControlA11y(this.listboxElement);
    this.syncFloatingPosition();
  }

  private handleChange = (event: Event): void => { event.stopPropagation(); };

  private handleInput = (event: InputEvent): void => {
    event.stopPropagation();
    if (this.effectiveDisabled) return;
    this.query = (event.currentTarget as HTMLInputElement).value;
    this.open = true;
    this.activeIndex = this.getInitialActiveIndex();
  };

  private handleFocus = (): void => {
    if (this.effectiveDisabled) return;
    this.query = "";
    this.open = true;
    this.activeIndex = this.getInitialActiveIndex();
  };

  private handleClick = (): void => {
    if (!this.open) this.handleFocus();
  };

  private dismiss(): void {
    this.open = false;
    this.query = "";
    this.activeIndex = -1;
  }

  private handleBlur = (): void => { this.dismiss(); };

  private handleKeyDown = (event: KeyboardEvent): void => {
    if (this.effectiveDisabled || event.isComposing || event.keyCode === 229) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!this.open) {
        this.handleFocus();
      } else {
        this.activeIndex = this.getNextActiveIndex(event.key === "ArrowDown" ? 1 : -1);
      }
    } else if (event.key === "Enter" && this.open) {
      event.preventDefault();
      this.commitOption(this.activeIndex);
    } else if (event.key === "Escape" && this.open) {
      event.preventDefault();
      this.dismiss();
    }
  };

  private handleSlotChange = (): void => {
    this.refreshOptions();
  };

  private refreshOptions(): void {
    const seen = new Set<string>();
    this.optionNodes = readLightDomOptions(this).filter((option) => {
      if (seen.has(option.value)) return false;
      seen.add(option.value);
      return true;
    });
    // Connection can precede parsing or appending the initial option children.
    // Ignore Lit's reflected default value attribute while waiting for them.
    if (!this.initialized && (this.optionNodes.length > 0 || this.initialValueAttribute || this.value !== "")) {
      if (!this.initialValueAttribute && this.value === "") {
        this.value = this.optionNodes.find((option) => option.selected)?.value ?? "";
      }
      this.defaultValue = this.value;
      this.initialized = true;
    }

    this.activeIndex = this.getInitialActiveIndex();
    this.requestUpdate();
  }

  private commitOption(index: number): void {
    const option = this.filteredOptions[index];

    if (this.effectiveDisabled || !option || option.disabled) {
      return;
    }

    const changed = this.value !== option.value;
    this.value = option.value;
    this.dismiss();
    this.syncFormState();
    if (!changed) return;
    this.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
    this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
  }

  private syncFormState(): void {
    if (this.effectiveDisabled) {
      this.inputElement?.setCustomValidity("");
      if (this.inputElement) this.setValidityFrom(this.inputElement);
      this.setFormValue(null);
      return;
    }

    const selected = this.optionNodes.find((option) => option.value === this.value);
    this.setFormValue(selected ? selected.value : null);
    if (this.inputElement) {
      this.inputElement.setCustomValidity(this.required && !selected ? "Please select an option." : "");
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

  get selectedLabel(): string {
    return this.optionNodes.find((option) => option.value === this.value)?.label ?? "";
  }

  private get effectiveDisabled(): boolean {
    return this.disabled || this.formDisabled;
  }

  private get inputElement(): HTMLInputElement | null {
    return this.renderRoot.querySelector("input");
  }

  private get listboxElement(): HTMLElement | null {
    return this.renderRoot.querySelector("cindor-listbox");
  }

  private get filteredOptions(): DropdownOption[] {
    const query = this.query.trim().toLowerCase();

    if (query === "") {
      return this.optionNodes;
    }

    return this.optionNodes.filter(
      (option) => option.label.toLowerCase().includes(query) || option.value.toLowerCase().includes(query)
    );
  }

  private get listboxVisible(): boolean {
    return this.open && !this.effectiveDisabled;
  }

  private get activeDescendantId(): string | undefined {
    if (!this.listboxVisible || this.activeIndex < 0 || !this.filteredOptions[this.activeIndex]) {
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

  private handleOptionHoverEvent = (event: CustomEvent<{ option: CindorOption }>): void => {
    const index = this.renderedOptionElements.indexOf(event.detail.option);

    if (index >= 0) {
      this.activeIndex = index;
    }
  };

  private handleOptionSelect = (event: CustomEvent<{ option: CindorOption }>): void => {
    const index = this.renderedOptionElements.indexOf(event.detail.option);

    if (index >= 0) {
      this.commitOption(index);
    }
  };

  private get renderedOptionElements(): CindorOption[] {
    return Array.from(this.listboxElement?.querySelectorAll("cindor-option") ?? []).filter(
      (option): option is CindorOption => option instanceof CindorOption
    );
  }

  private getNextActiveIndex(direction: 1 | -1): number {
    return getNextEnabledIndex(this.filteredOptions, this.activeIndex, direction, (option) => option.disabled);
  }
}
