import { css, html, nothing } from "lit";
import { live } from "lit/directives/live.js";

import { createFieldHostStyles, createTextControlStyles, floatingListboxStyles } from "../shared/control-styles.js";
import { attachFloatingPosition } from "../shared/floating-position.js";
import { FormAssociatedElement } from "../shared/form-associated-element.js";
import { getNextEnabledIndex } from "../shared/linear-navigation.js";
import { EmbOption } from "../option/emb-option.js";

export type AutocompleteSuggestion = {
  description?: string;
  disabled?: boolean;
  keywords?: string[];
  label: string;
  value?: string;
};

/**
 * Suggestion-first autocomplete input for search and remote result flows.
 *
 * @fires input - Fired as the query changes.
 * @fires change - Fired when a suggestion is committed.
 * @fires suggestion-select - Fired when a suggestion is committed.
 */
export class EmbAutocomplete extends FormAssociatedElement {
  static styles = [
    createFieldHostStyles("min(100%, 320px)"),
    createTextControlStyles("input"),
    floatingListboxStyles,
    css`
      .surface {
        position: relative;
      }

      emb-option::part(surface) {
        display: grid;
        gap: var(--space-1);
      }

      .option-description,
      .message {
        color: var(--fg-muted);
        font-size: var(--text-sm);
      }

      .message {
        padding: var(--space-3);
        border: 1px dashed var(--border);
        border-radius: var(--radius-lg);
        background: var(--surface);
      }
    `
  ];

  static properties = {
    activeIndex: { state: true },
    disabled: { type: Boolean, reflect: true },
    emptyMessage: { reflect: true, attribute: "empty-message" },
    loading: { type: Boolean, reflect: true },
    name: { reflect: true },
    open: { type: Boolean, reflect: true },
    placeholder: { reflect: true },
    query: { reflect: true },
    required: { type: Boolean, reflect: true },
    suggestions: { attribute: false },
    value: { reflect: true }
  };

  private static nextId = 0;

  disabled = false;
  emptyMessage = "No matching suggestions.";
  loading = false;
  name = "";
  open = false;
  placeholder = "";
  query = "";
  required = false;
  suggestions: AutocompleteSuggestion[] = [];
  value = "";

  private activeIndex = -1;
  private defaultValue = "";
  private floatingCleanup?: () => void;
  private floatingListbox: HTMLElement | null = null;
  private listId = `emb-autocomplete-list-${EmbAutocomplete.nextId++}`;
  private updateFloatingPosition?: () => void;

  override connectedCallback(): void {
    super.connectedCallback();
    this.defaultValue = this.getAttribute("value") ?? this.value;
    if (this.query === "") {
      this.query = this.value;
    }
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
    this.query = this.defaultValue;
    this.syncFormState();
  }

  protected override render() {
    const suggestions = this.filteredSuggestions;

    return html`
      <div class="surface">
        <input
          part="control"
          .value=${live(this.query)}
          aria-activedescendant=${this.activeDescendantId ?? nothing}
          aria-autocomplete="list"
          aria-controls=${this.listId}
          aria-expanded=${String(this.panelVisible)}
          ?disabled=${this.disabled}
          name=${this.name}
          placeholder=${this.placeholder}
          ?required=${this.required}
          role="combobox"
          type="text"
          @blur=${this.handleBlur}
          @focus=${this.handleFocus}
          @input=${this.handleInput}
          @keydown=${this.handleKeyDown}
        />
        ${this.panelVisible
          ? html`
              ${this.loading
                ? html`<div class="message" part="message">Loading suggestions...</div>`
                : suggestions.length
                  ? html`
                      <emb-listbox
                        part="listbox"
                        id=${this.listId}
                        .activeIndex=${this.activeIndex}
                        @option-hover=${this.handleOptionHover}
                        @option-select=${this.handleOptionSelect}
                      >
                        ${suggestions.map(
                          (suggestion, index) => html`
                            <emb-option
                              id=${this.getOptionId(index)}
                              ?active=${index === this.activeIndex}
                              ?disabled=${Boolean(suggestion.disabled)}
                              label=${suggestion.label}
                              value=${suggestion.value ?? suggestion.label}
                            >
                              <span>${suggestion.label}</span>
                              ${suggestion.description ? html`<span class="option-description">${suggestion.description}</span>` : null}
                            </emb-option>
                          `
                        )}
                      </emb-listbox>
                    `
                  : html`<div class="message" part="message">${this.emptyMessage}</div>`}
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

  private handleBlur = (): void => {
    queueMicrotask(() => {
      this.open = false;
      this.activeIndex = -1;
    });
  };

  private handleFocus = (): void => {
    if (this.disabled) {
      return;
    }

    this.open = true;
    this.activeIndex = this.getInitialActiveIndex();
  };

  private handleInput = (event: InputEvent): void => {
    const input = event.currentTarget as HTMLInputElement;
    this.query = input.value;
    this.value = input.value;
    this.open = true;
    this.activeIndex = this.getInitialActiveIndex();
    this.syncFormState();
    this.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
  };

  private handleKeyDown = (event: KeyboardEvent): void => {
    const suggestions = this.filteredSuggestions;
    if (this.disabled) {
      return;
    }

    if (event.key === "Escape" && this.open) {
      event.preventDefault();
      this.open = false;
      this.activeIndex = -1;
      return;
    }

    if (!suggestions.length) {
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

    if (event.key === "Enter" && this.activeIndex >= 0) {
      event.preventDefault();
      this.commitSuggestion(this.activeIndex);
    }
  };

  private handleOptionHover = (event: CustomEvent<{ option: EmbOption }>): void => {
    const index = this.renderedOptions.indexOf(event.detail.option);
    if (index >= 0) {
      this.activeIndex = index;
    }
  };

  private handleOptionSelect = (event: CustomEvent<{ option: EmbOption }>): void => {
    const index = this.renderedOptions.indexOf(event.detail.option);
    if (index >= 0) {
      this.commitSuggestion(index);
    }
  };

  private commitSuggestion(index: number): void {
    const suggestion = this.filteredSuggestions[index];
    if (!suggestion || suggestion.disabled) {
      return;
    }

    this.value = suggestion.value ?? suggestion.label;
    this.query = suggestion.label;
    this.open = false;
    this.activeIndex = -1;
    this.syncFormState();
    this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
    this.dispatchEvent(
      new CustomEvent("suggestion-select", {
        bubbles: true,
        composed: true,
        detail: { suggestion, value: this.value }
      })
    );
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
    const panel = this.panelElement;

    if (!this.panelVisible || !input || !panel) {
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

  private getOptionId(index: number): string {
    return `${this.listId}-option-${index}`;
  }

  private getInitialActiveIndex(): number {
    return this.filteredSuggestions.findIndex((suggestion) => !suggestion.disabled);
  }

  private getNextActiveIndex(direction: 1 | -1): number {
    return getNextEnabledIndex(this.filteredSuggestions, this.activeIndex, direction, (suggestion) => Boolean(suggestion.disabled));
  }

  private get filteredSuggestions(): AutocompleteSuggestion[] {
    const query = this.query.trim().toLowerCase();
    if (query === "") {
      return this.suggestions;
    }

    return this.suggestions.filter((suggestion) => {
      const haystack = [suggestion.label, suggestion.value ?? "", ...(suggestion.keywords ?? [])].join(" ").toLowerCase();
      return haystack.includes(query);
    });
  }

  private get activeDescendantId(): string | undefined {
    if (!this.panelVisible || this.activeIndex < 0) {
      return undefined;
    }

    return this.getOptionId(this.activeIndex);
  }

  private get inputElement(): HTMLInputElement | null {
    return this.renderRoot.querySelector("input");
  }

  private get panelElement(): HTMLElement | null {
    return this.renderRoot.querySelector('[part="listbox"], [part="message"]');
  }

  private get panelVisible(): boolean {
    return this.open && (this.loading || this.filteredSuggestions.length > 0 || this.query.trim() !== "");
  }

  private get renderedOptions(): EmbOption[] {
    return Array.from(this.renderRoot.querySelectorAll("emb-option")).filter((option): option is EmbOption => option instanceof EmbOption);
  }
}
