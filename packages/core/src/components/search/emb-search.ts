import { css, html } from "lit";
import { live } from "lit/directives/live.js";

import { renderLucideIcon } from "../icon/lucide.js";
import { FormAssociatedElement } from "../shared/form-associated-element.js";

export class EmbSearch extends FormAssociatedElement {
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
      padding: 0 var(--space-3) 0 calc(var(--space-3) * 2 + 1rem);
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

    .icon {
      position: absolute;
      inset-block-start: 50%;
      inset-inline-start: var(--space-3);
      inline-size: 1rem;
      block-size: 1rem;
      color: var(--fg-subtle);
      pointer-events: none;
      transform: translateY(-50%);
    }
  `;

  static properties = {
    autocomplete: { reflect: true },
    disabled: { type: Boolean, reflect: true },
    name: { reflect: true },
    placeholder: { reflect: true },
    readonly: { type: Boolean, reflect: true, attribute: "readonly" },
    required: { type: Boolean, reflect: true },
    value: { reflect: true }
  };

  autocomplete = "";
  disabled = false;
  name = "";
  placeholder = "";
  readonly = false;
  required = false;
  value = "";

  private defaultValue = "";

  override connectedCallback(): void {
    super.connectedCallback();
    this.defaultValue = this.getAttribute("value") ?? this.value;
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
      return html`
      <div class="surface" part="surface">
        ${renderLucideIcon({
          name: "search",
          size: 16,
          attributes: {
            class: "icon",
            part: "icon"
          }
        })}
        <input
          part="control"
          .value=${live(this.value)}
          autocomplete=${this.autocomplete}
          ?disabled=${this.disabled}
          name=${this.name}
          placeholder=${this.placeholder}
          ?readonly=${this.readonly}
          ?required=${this.required}
          type="search"
          @input=${this.handleInput}
          @change=${this.handleChange}
        />
      </div>
    `;
  }

  protected override updated(): void {
    this.syncFormState();
  }

  private handleChange = (event: Event): void => {
    event.stopPropagation();
    const input = event.currentTarget as HTMLInputElement;
    this.value = input.value;
    this.syncFormState();
    this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
  };

  private handleInput = (event: InputEvent): void => {
    event.stopPropagation();
    const input = event.currentTarget as HTMLInputElement;
    this.value = input.value;
    this.syncFormState();
    this.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
  };

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

  private get inputElement(): HTMLInputElement | null {
    return this.renderRoot.querySelector("input");
  }
}
