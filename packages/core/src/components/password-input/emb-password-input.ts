import { css, html } from "lit";
import { live } from "lit/directives/live.js";

import { renderLucideIcon } from "../icon/lucide.js";
import { FormAssociatedElement } from "../shared/form-associated-element.js";

export class EmbPasswordInput extends FormAssociatedElement {
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
      padding: 0 calc(var(--space-3) * 2 + 1rem + var(--space-2)) 0 var(--space-3);
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

    .toggle {
      position: absolute;
      inset-block-start: 50%;
      inset-inline-end: var(--space-2);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      inline-size: calc(1rem + var(--space-2));
      block-size: calc(1rem + var(--space-2));
      padding: 0;
      border: 0;
      border-radius: var(--radius-sm);
      background: transparent;
      color: var(--fg-muted);
      cursor: pointer;
      transform: translateY(-50%);
      transition:
        background var(--duration-base) var(--ease-out),
        color var(--duration-base) var(--ease-out),
        transform var(--duration-base) var(--ease-out);
    }

    .toggle:hover:not(:disabled) {
      background: var(--bg-subtle);
      color: var(--fg);
      transform: translateY(-50%) scale(1.04);
    }

    .toggle:disabled {
      cursor: not-allowed;
      color: var(--fg-subtle);
    }

    .toggle:focus-visible {
      outline: none;
      box-shadow: var(--ring-focus);
    }

    .toggle:active:not(:disabled) {
      transform: translateY(-50%) scale(0.98);
    }

    .toggle-icon {
      display: block;
      inline-size: 1rem;
      block-size: 1rem;
    }
  `;

  static properties = {
    autocomplete: { reflect: true },
    disabled: { type: Boolean, reflect: true },
    name: { reflect: true },
    placeholder: { reflect: true },
    readonly: { type: Boolean, reflect: true, attribute: "readonly" },
    required: { type: Boolean, reflect: true },
    revealPassword: { state: true },
    value: { reflect: true }
  };

  autocomplete = "current-password";
  disabled = false;
  name = "";
  placeholder = "";
  readonly = false;
  required = false;
  value = "";

  private defaultValue = "";
  private revealPassword = false;

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
        <input
          part="control"
          .value=${live(this.value)}
          autocomplete=${this.autocomplete}
          ?disabled=${this.disabled}
          name=${this.name}
          placeholder=${this.placeholder}
          ?readonly=${this.readonly}
          ?required=${this.required}
          type=${this.revealPassword ? "text" : "password"}
          @input=${this.handleInput}
          @change=${this.handleChange}
        />
        <button
          class="toggle"
          part="toggle"
          type="button"
          ?disabled=${this.disabled}
          aria-label=${this.revealPassword ? "Hide password" : "Show password"}
          aria-pressed=${String(this.revealPassword)}
          @click=${this.handleToggleClick}
        >
          ${renderLucideIcon({
            name: this.revealPassword ? "eye-off" : "eye",
            size: 16,
            attributes: {
              class: "toggle-icon",
              part: "toggle-icon"
            }
          })}
        </button>
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

  private handleToggleClick = (): void => {
    if (this.disabled) {
      return;
    }

    this.revealPassword = !this.revealPassword;
    this.inputElement?.focus();
  };
}
