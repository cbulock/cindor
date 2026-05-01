import { css, html, LitElement } from "lit";
import { live } from "lit/directives/live.js";

/**
 * Inline text editing surface for titles, labels, and small editable values.
 *
 * @fires input - Fired while the draft value changes.
 * @fires change - Fired when the saved value changes.
 * @fires cancel - Fired when editing is cancelled.
 * @fires toggle - Fired when editing starts or stops.
 */
export class CindorInlineEdit extends LitElement {
  static styles = css`
    :host {
      display: inline-block;
      min-width: min(100%, 12rem);
      color: var(--fg);
    }

    .surface {
      display: grid;
      gap: var(--space-2);
    }

    .display {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      min-height: 2.25rem;
    }

    .value {
      min-width: 0;
    }

    .placeholder {
      color: var(--fg-subtle);
    }

    .editor {
      display: grid;
      gap: var(--space-2);
    }

    .actions {
      display: inline-flex;
      gap: var(--space-2);
      flex-wrap: wrap;
    }

    input {
      box-sizing: border-box;
      width: 100%;
      min-height: 36px;
      padding: 0 var(--space-3);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      background: var(--surface);
      color: inherit;
      font: inherit;
    }

    input:focus-visible {
      outline: none;
      box-shadow: var(--ring-focus);
    }

    input:disabled {
      cursor: not-allowed;
      background: var(--bg-subtle);
      color: var(--fg-subtle);
    }
  `;

  static properties = {
    disabled: { type: Boolean, reflect: true },
    editing: { type: Boolean, reflect: true },
    placeholder: { reflect: true },
    value: { reflect: true }
  };

  disabled = false;
  editing = false;
  placeholder = "Click edit";
  value = "";

  private draftValue = "";

  beginEdit(): void {
    if (this.disabled || this.editing) {
      return;
    }

    this.draftValue = this.value;
    this.editing = true;
    this.dispatchToggle();
  }

  cancelEdit(): void {
    if (!this.editing) {
      return;
    }

    this.draftValue = this.value;
    this.editing = false;
    this.dispatchEvent(new Event("cancel", { bubbles: true, composed: true }));
    this.dispatchToggle();
  }

  save(): void {
    if (!this.editing) {
      return;
    }

    const nextValue = this.draftValue.trim();
    const changed = nextValue !== this.value;
    this.value = nextValue;
    this.editing = false;

    if (changed) {
      this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
    }

    this.dispatchToggle();
  }

  override focus(options?: FocusOptions): void {
    (this.editing ? this.inputElement : this.editButton)?.focus(options);
  }

  protected override updated(changedProperties: Map<PropertyKey, unknown>): void {
    if (changedProperties.has("editing") && this.editing) {
      this.draftValue = this.value;
      queueMicrotask(() => {
        this.inputElement?.focus();
        this.inputElement?.select();
      });
    }
  }

  protected override render() {
    return html`
      <div class="surface" part="surface">
        ${this.editing
          ? html`
              <div class="editor" part="editor">
                <input
                  part="input"
                  .value=${live(this.draftValue)}
                  ?disabled=${this.disabled}
                  placeholder=${this.placeholder}
                  @input=${this.handleInput}
                  @keydown=${this.handleKeyDown}
                />
                <div class="actions" part="actions">
                  <cindor-button part="save-button" type="button" @click=${this.handleSave}>Save</cindor-button>
                  <cindor-button part="cancel-button" type="button" variant="ghost" @click=${this.handleCancel}>Cancel</cindor-button>
                </div>
              </div>
            `
          : html`
              <div class="display" part="display">
                <span class=${this.value ? "value" : "value placeholder"} part="value">${this.value || this.placeholder}</span>
                <cindor-button
                  part="edit-button"
                  type="button"
                  variant="ghost"
                  ?disabled=${this.disabled}
                  @click=${this.handleBeginEdit}
                >
                  Edit
                </cindor-button>
              </div>
            `}
      </div>
    `;
  }

  private handleBeginEdit = (): void => {
    this.beginEdit();
  };

  private handleCancel = (): void => {
    this.cancelEdit();
  };

  private handleInput = (event: InputEvent): void => {
    const input = event.currentTarget as HTMLInputElement;
    this.draftValue = input.value;
    this.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
  };

  private handleKeyDown = (event: KeyboardEvent): void => {
    if (event.key === "Enter") {
      event.preventDefault();
      this.save();
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      this.cancelEdit();
    }
  };

  private handleSave = (): void => {
    this.save();
  };

  private dispatchToggle(): void {
    this.dispatchEvent(
      new CustomEvent("toggle", {
        bubbles: true,
        composed: true,
        detail: { editing: this.editing }
      })
    );
  }

  private get editButton(): HTMLElement | null {
    return this.renderRoot.querySelector('[part="edit-button"]');
  }

  private get inputElement(): HTMLInputElement | null {
    return this.renderRoot.querySelector("input");
  }
}
