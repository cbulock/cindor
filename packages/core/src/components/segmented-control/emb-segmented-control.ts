import { css, html } from "lit";
import { live } from "lit/directives/live.js";

import { FormAssociatedElement } from "../shared/form-associated-element.js";

export type SegmentedControlOption = {
  disabled?: boolean;
  label: string;
  value: string;
};

export class EmbSegmentedControl extends FormAssociatedElement {
  static styles = css`
    :host {
      display: inline-block;
      width: var(--emb-field-inline-size, min(100%, 420px));
      max-width: 100%;
      min-width: 0;
      color: var(--fg);
    }

    .group {
      display: inline-grid;
      grid-auto-columns: 1fr;
      grid-auto-flow: column;
      gap: var(--space-1);
      padding: var(--space-1);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      background: var(--bg-subtle);
      width: 100%;
      box-sizing: border-box;
    }

    label {
      position: relative;
      min-width: 0;
      cursor: pointer;
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

    .option {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 2.25rem;
      padding: 0 var(--space-3);
      border-radius: var(--radius-md);
      background: transparent;
      color: var(--fg-muted);
      font: inherit;
      text-align: center;
      transition:
        background var(--duration-base) var(--ease-out),
        color var(--duration-base) var(--ease-out),
        box-shadow var(--duration-base) var(--ease-out);
    }

    input:checked + .option {
      background: var(--surface);
      color: var(--fg);
      box-shadow: var(--shadow-xs);
    }

    input:focus-visible + .option {
      box-shadow: var(--ring-focus);
    }

    input:disabled + .option {
      cursor: not-allowed;
      color: var(--fg-subtle);
      opacity: 0.72;
    }
  `;

  static properties = {
    disabled: { type: Boolean, reflect: true },
    name: { reflect: true },
    options: { attribute: false },
    required: { type: Boolean, reflect: true },
    value: { reflect: true }
  };

  private static nextId = 0;

  disabled = false;
  name = "";
  options: SegmentedControlOption[] = [];
  required = false;
  value = "";

  private defaultValue = "";
  private groupId = `emb-segmented-control-${EmbSegmentedControl.nextId++}`;

  override connectedCallback(): void {
    super.connectedCallback();
    this.defaultValue = this.getAttribute("value") ?? this.value;
    this.normalizeValue();
  }

  checkValidity(): boolean {
    return this.inputElements[0]?.checkValidity() ?? true;
  }

  override focus(options?: FocusOptions): void {
    this.inputElements.find((input) => !input.disabled)?.focus(options);
  }

  reportValidity(): boolean {
    return this.inputElements[0]?.reportValidity() ?? true;
  }

  formDisabledCallback(disabled: boolean): void {
    this.disabled = disabled;
  }

  formResetCallback(): void {
    this.value = this.defaultValue;
    this.syncFormState();
  }

  protected override render() {
    const groupName = this.name || this.groupId;

    return html`
      <div class="group" part="group" role="radiogroup">
        ${this.options.map(
          (option) => html`
            <label part="label">
              <input
                part="control"
                .checked=${live(option.value === this.value)}
                ?disabled=${this.disabled || Boolean(option.disabled)}
                name=${groupName}
                ?required=${this.required}
                type="radio"
                value=${option.value}
                @input=${this.handleInput}
                @change=${this.handleChange}
              />
              <span class="option" part=${option.value === this.value ? "option option-selected" : "option"}>${option.label}</span>
            </label>
          `
        )}
      </div>
    `;
  }

  protected override updated(changedProperties: Map<PropertyKey, unknown>): void {
    if (changedProperties.has("options")) {
      this.normalizeValue();
    }

    this.syncFormState();
    this.syncGroupA11y();
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

  private normalizeValue(): void {
    if (this.value !== "" && this.options.some((option) => option.value === this.value && !option.disabled)) {
      return;
    }

    if (this.value !== "" && !this.options.some((option) => option.value === this.value)) {
      this.value = "";
    }
  }

  private syncFormState(): void {
    if (this.disabled || this.value === "") {
      this.setFormValue(null);
    } else {
      this.setFormValue(this.value);
    }

    const validityControl = this.inputElements[0];
    if (validityControl) {
      this.setValidityFrom(validityControl);
    }
  }

  private syncGroupA11y(): void {
    const group = this.groupElement;
    if (!group) {
      return;
    }

    for (const attributeName of ["aria-label", "aria-labelledby", "aria-describedby"]) {
      const value = this.getAttribute(attributeName);
      if (value === null || value === "") {
        group.removeAttribute(attributeName);
      } else {
        group.setAttribute(attributeName, value);
      }
    }
  }

  private get groupElement(): HTMLElement | null {
    return this.renderRoot.querySelector('[part="group"]');
  }

  private get inputElements(): HTMLInputElement[] {
    return Array.from(this.renderRoot.querySelectorAll("input"));
  }
}
