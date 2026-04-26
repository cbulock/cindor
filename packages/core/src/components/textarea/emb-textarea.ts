import { css, html } from "lit";
import { live } from "lit/directives/live.js";

import { FormAssociatedElement } from "../shared/form-associated-element.js";

export class EmbTextarea extends FormAssociatedElement {
  static styles = css`
    :host {
      display: inline-block;
      width: var(--emb-field-inline-size, min(100%, 420px));
      max-width: 100%;
      min-width: 0;
      color: var(--fg);
    }

    textarea {
      box-sizing: border-box;
      width: 100%;
      min-height: 88px;
      font: inherit;
      line-height: var(--leading-normal);
      padding: var(--space-3);
      border-radius: var(--radius-md);
      border: 1px solid var(--border);
      background: var(--surface);
      color: var(--fg);
      resize: vertical;
      transition:
        border-color var(--duration-base) var(--ease-out),
        box-shadow var(--duration-base) var(--ease-out),
        background var(--duration-base) var(--ease-out);
    }

    textarea::placeholder {
      color: var(--fg-subtle);
    }

    textarea:disabled {
      cursor: not-allowed;
      color: var(--fg-subtle);
      background: var(--bg-subtle);
    }

    textarea:focus-visible {
      outline: none;
      box-shadow: var(--ring-focus);
    }
  `;

  static properties = {
    disabled: { type: Boolean, reflect: true },
    name: { reflect: true },
    placeholder: { reflect: true },
    readonly: { type: Boolean, reflect: true, attribute: "readonly" },
    required: { type: Boolean, reflect: true },
    rows: { type: Number, reflect: true },
    value: { reflect: true }
  };

  disabled = false;
  name = "";
  placeholder = "";
  readonly = false;
  required = false;
  rows = 4;
  value = "";

  private defaultValue = "";

  override connectedCallback(): void {
    super.connectedCallback();
    this.defaultValue = this.getAttribute("value") ?? this.value;
  }

  checkValidity(): boolean {
    return this.textareaElement?.checkValidity() ?? true;
  }

  override focus(options?: FocusOptions): void {
    this.textareaElement?.focus(options);
  }

  reportValidity(): boolean {
    return this.textareaElement?.reportValidity() ?? true;
  }

  formDisabledCallback(disabled: boolean): void {
    this.disabled = disabled;
  }

  formResetCallback(): void {
    this.value = this.defaultValue;
    this.syncFormState();
  }

  protected override render() {
    return html`
      <textarea
        part="control"
        .value=${live(this.value)}
        ?disabled=${this.disabled}
        name=${this.name}
        placeholder=${this.placeholder}
        ?readonly=${this.readonly}
        ?required=${this.required}
        rows=${this.rows}
        @input=${this.handleInput}
        @change=${this.handleChange}
      ></textarea>
    `;
  }

  protected override updated(): void {
    this.syncFormState();
  }

  private handleChange = (event: Event): void => {
    event.stopPropagation();
    const textarea = event.currentTarget as HTMLTextAreaElement;
    this.value = textarea.value;
    this.syncFormState();
    this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
  };

  private handleInput = (event: InputEvent): void => {
    event.stopPropagation();
    const textarea = event.currentTarget as HTMLTextAreaElement;
    this.value = textarea.value;
    this.syncFormState();
    this.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
  };

  private syncFormState(): void {
    if (this.disabled) {
      this.setFormValue(null);
      return;
    }

    this.setFormValue(this.value);
    if (this.textareaElement) {
      this.setValidityFrom(this.textareaElement);
    }
  }

  private get textareaElement(): HTMLTextAreaElement | null {
    return this.renderRoot.querySelector("textarea");
  }
}
