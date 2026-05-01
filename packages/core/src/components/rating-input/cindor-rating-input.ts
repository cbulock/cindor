import { css, html, nothing } from "lit";
import { live } from "lit/directives/live.js";

import { renderLucideIcon } from "../icon/lucide.js";
import { FormAssociatedElement } from "../shared/form-associated-element.js";

export class CindorRatingInput extends FormAssociatedElement {
  static styles = css`
    :host {
      display: inline-flex;
      align-items: center;
      gap: var(--space-3);
      color: var(--fg);
    }

    .group {
      display: inline-flex;
      align-items: center;
      gap: var(--space-1);
    }

    label {
      position: relative;
      display: inline-flex;
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

    .star {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: var(--fg-subtle);
      transition:
        color var(--duration-base) var(--ease-out),
        transform var(--duration-base) var(--ease-out);
    }

    .star[data-filled="true"] {
      color: color-mix(in srgb, var(--warning) 80%, var(--accent));
    }

    input:focus-visible + .star {
      box-shadow: var(--ring-focus);
      border-radius: var(--radius-sm);
    }

    label:hover .star:not([data-disabled="true"]) {
      transform: scale(1.04);
    }

    .clear {
      padding: 0;
      border: 0;
      background: transparent;
      color: var(--fg-muted);
      cursor: pointer;
      font: inherit;
      text-decoration: underline;
    }

    .clear:focus-visible {
      outline: none;
      box-shadow: var(--ring-focus);
      border-radius: var(--radius-sm);
    }
  `;

  static properties = {
    clearable: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    max: { type: Number, reflect: true },
    name: { reflect: true },
    required: { type: Boolean, reflect: true },
    value: { type: Number, reflect: true }
  };

  private static nextId = 0;

  clearable = false;
  disabled = false;
  max = 5;
  name = "";
  required = false;
  value = 0;

  private defaultValue = 0;
  private groupId = `cindor-rating-input-${CindorRatingInput.nextId++}`;

  override connectedCallback(): void {
    super.connectedCallback();
    this.defaultValue = Number(this.getAttribute("value") ?? this.value);
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
        ${Array.from({ length: Math.max(1, this.max) }, (_, index) => {
          const ratingValue = index + 1;
          const checked = ratingValue === this.value;

          return html`
            <label part="label">
              <input
                part="control"
                .checked=${live(checked)}
                ?disabled=${this.disabled}
                name=${groupName}
                ?required=${this.required && ratingValue === 1}
                type="radio"
                value=${String(ratingValue)}
                @input=${this.handleInput}
                @change=${this.handleChange}
              />
              <span class="star" part=${checked ? "star star-filled" : "star"} data-disabled=${String(this.disabled)} data-filled=${String(ratingValue <= this.value)}>
                ${renderLucideIcon({
                  name: "star",
                  size: 18,
                  attributes: {
                    part: "star-icon",
                    fill: ratingValue <= this.value ? "currentColor" : "none"
                  },
                  label: `${ratingValue} star${ratingValue === 1 ? "" : "s"}`
                })}
              </span>
            </label>
          `;
        })}
      </div>
      ${this.clearable && this.value > 0
        ? html`<button class="clear" part="clear-button" type="button" ?disabled=${this.disabled} @click=${this.handleClearClick}>Clear</button>`
        : nothing}
    `;
  }

  protected override updated(): void {
    this.syncFormState();
    this.syncGroupA11y();
  }

  private handleChange = (event: Event): void => {
    event.stopPropagation();
    const input = event.currentTarget as HTMLInputElement;
    this.value = Number(input.value);
    this.syncFormState();
    this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
  };

  private handleInput = (event: InputEvent): void => {
    event.stopPropagation();
    const input = event.currentTarget as HTMLInputElement;
    this.value = Number(input.value);
    this.syncFormState();
    this.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
  };

  private handleClearClick = (): void => {
    if (this.disabled) {
      return;
    }

    this.value = 0;
    this.syncFormState();
    this.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
    this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
  };

  private syncFormState(): void {
    if (this.disabled || this.value <= 0) {
      this.setFormValue(null);
    } else {
      this.setFormValue(String(this.value));
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
