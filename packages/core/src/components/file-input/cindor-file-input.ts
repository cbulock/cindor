import { css, html } from "lit";

import { FormAssociatedElement } from "../shared/form-associated-element.js";

export class CindorFileInput extends FormAssociatedElement {
  static styles = css`
    :host {
      display: inline-grid;
      gap: var(--space-2);
      width: var(--cindor-field-inline-size, min(100%, 420px));
      max-width: 100%;
      min-width: 0;
      color: var(--fg);
    }

    input {
      position: absolute;
      inline-size: 1px;
      block-size: 1px;
      margin: -1px;
      padding: 0;
      border: 0;
      overflow: hidden;
      clip: rect(0 0 0 0);
      clip-path: inset(50%);
      white-space: nowrap;
    }

    .surface {
      display: grid;
      grid-template-columns: auto 1fr;
      align-items: center;
      gap: var(--space-3);
      min-width: 0;
      padding: var(--space-3);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      background: var(--surface);
    }

    .surface:focus-within {
      box-shadow: var(--ring-focus);
    }

    cindor-button {
      align-self: center;
    }

    .summary {
      display: grid;
      gap: 2px;
      min-width: 0;
    }

    .label {
      color: var(--fg);
      font-size: var(--text-sm);
      font-weight: 600;
    }

    .files {
      min-width: 0;
      color: var(--fg-muted);
      font-size: var(--text-sm);
    }

    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2);
    }

    :host([disabled]) .surface {
      background: var(--bg-subtle);
    }

    :host([disabled]) .label,
    :host([disabled]) .files {
      color: var(--fg-subtle);
    }
  `;

  static properties = {
    accept: { reflect: true },
    disabled: { type: Boolean, reflect: true },
    multiple: { type: Boolean, reflect: true },
    name: { reflect: true },
    required: { type: Boolean, reflect: true }
  };

  accept = "";
  disabled = false;
  multiple = false;
  name = "";
  required = false;

  checkValidity(): boolean {
    return this.inputElement?.checkValidity() ?? true;
  }

  get files(): FileList | null {
    return this.inputElement?.files ?? null;
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
    if (this.inputElement) {
      this.inputElement.value = "";
    }
    this.syncFormState();
  }

  protected override render() {
    const fileNames = this.files ? Array.from(this.files).map((file) => file.name) : [];
    const triggerLabel = this.multiple ? "Choose files" : "Choose file";

    return html`
      <div class="surface" part="surface">
        <input
          part="control"
          accept=${this.accept}
          ?disabled=${this.disabled}
          ?multiple=${this.multiple}
          name=${this.name}
          ?required=${this.required}
          type="file"
          @input=${this.handleInput}
          @change=${this.handleChange}
        />
        <cindor-button part="trigger" type="button" variant="ghost" ?disabled=${this.disabled} @click=${this.handleTriggerClick}>
          <cindor-icon slot="start-icon" name="upload" part="trigger-icon" size="16"></cindor-icon>
          ${triggerLabel}
        </cindor-button>
        <div class="summary">
          <div class="label" part="label">${this.multiple ? "Selected files" : "Selected file"}</div>
          <div class="files" part="files">
            ${fileNames.length > 0
              ? html`
                  <div class="chips" part="chips">
                    ${fileNames.map(
                      (fileName) => html`
                        <cindor-chip part="file-chip">${fileName}</cindor-chip>
                      `
                    )}
                  </div>
                `
              : "No files selected"}
          </div>
        </div>
      </div>
    `;
  }

  protected override updated(): void {
    this.syncFormState();
    this.syncControlA11y(this.inputElement);
  }

  private handleInput = (event: InputEvent): void => {
    event.stopPropagation();
    this.syncFormState();
    this.requestUpdate();
    this.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
  };

  private handleChange = (event: Event): void => {
    event.stopPropagation();
    this.syncFormState();
    this.requestUpdate();
    this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
  };

  private syncFormState(): void {
    if (this.disabled || !this.inputElement) {
      this.setFormValue(null);
      return;
    }

    const files = this.inputElement.files;

    if (!files || files.length === 0) {
      this.setFormValue(null);
      this.setValidityFrom(this.inputElement);
      return;
    }

    if (this.multiple) {
      const formData = new FormData();

      for (const file of Array.from(files)) {
        formData.append(this.name || "files", file);
      }

      this.setFormValue(formData);
    } else {
      this.setFormValue(files[0] ?? null);
    }

    this.setValidityFrom(this.inputElement);
  }

  private get inputElement(): HTMLInputElement | null {
    return this.renderRoot.querySelector("input");
  }

  private handleTriggerClick = (): void => {
    if (this.disabled) {
      return;
    }

    this.inputElement?.click();
  };
}
