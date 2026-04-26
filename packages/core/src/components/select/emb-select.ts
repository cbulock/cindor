import { css, html } from "lit";
import { live } from "lit/directives/live.js";

import { FormAssociatedElement } from "../shared/form-associated-element.js";

type SelectOption = {
  disabled: boolean;
  label: string;
  value: string;
};

type SelectOptGroup = {
  disabled: boolean;
  label: string;
  options: SelectOption[];
};

type SelectNode = { kind: "option"; option: SelectOption } | { kind: "optgroup"; group: SelectOptGroup };

export class EmbSelect extends FormAssociatedElement {
  static styles = css`
    :host {
      display: inline-block;
      width: var(--emb-field-inline-size, min(100%, 320px));
      max-width: 100%;
      min-width: 0;
      color: var(--fg);
    }

    select {
      box-sizing: border-box;
      width: 100%;
      min-height: 36px;
      font: inherit;
      padding: 0 var(--space-3);
      border-radius: var(--radius-md);
      border: 1px solid var(--border);
      background: var(--surface);
      color: var(--fg);
      transition:
        border-color var(--duration-base) var(--ease-out),
        box-shadow var(--duration-base) var(--ease-out),
        background var(--duration-base) var(--ease-out);
    }

    select:disabled {
      cursor: not-allowed;
      color: var(--fg-subtle);
      background: var(--bg-subtle);
    }

    select:focus-visible {
      outline: none;
      box-shadow: var(--ring-focus);
    }

    slot {
      display: none;
    }
  `;

  static properties = {
    disabled: { type: Boolean, reflect: true },
    name: { reflect: true },
    required: { type: Boolean, reflect: true },
    value: { reflect: true }
  };

  disabled = false;
  name = "";
  required = false;
  value = "";

  private defaultValue = "";
  private optionNodes: SelectNode[] = [];

  override connectedCallback(): void {
    super.connectedCallback();
    this.defaultValue = this.getAttribute("value") ?? this.value;
    this.refreshOptions();
  }

  checkValidity(): boolean {
    return this.selectElement?.checkValidity() ?? true;
  }

  override focus(options?: FocusOptions): void {
    this.selectElement?.focus(options);
  }

  reportValidity(): boolean {
    return this.selectElement?.reportValidity() ?? true;
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
      <slot @slotchange=${this.handleSlotChange}></slot>
      <select
        part="control"
        .value=${live(this.value)}
        ?disabled=${this.disabled}
        name=${this.name}
        ?required=${this.required}
        @input=${this.handleInput}
        @change=${this.handleChange}
      >
        ${this.optionNodes.map((node) =>
          node.kind === "option"
            ? html`<option value=${node.option.value} ?disabled=${node.option.disabled}>${node.option.label}</option>`
            : html`
                <optgroup label=${node.group.label} ?disabled=${node.group.disabled}>
                  ${node.group.options.map(
                    (option) =>
                      html`<option value=${option.value} ?disabled=${option.disabled}>${option.label}</option>`
                  )}
                </optgroup>
              `
        )}
      </select>
    `;
  }

  protected override updated(): void {
    this.syncFormState();
  }

  private handleChange = (event: Event): void => {
    event.stopPropagation();
    const select = event.currentTarget as HTMLSelectElement;
    this.value = select.value;
    this.syncFormState();
    this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
  };

  private handleInput = (event: InputEvent): void => {
    event.stopPropagation();
    const select = event.currentTarget as HTMLSelectElement;
    this.value = select.value;
    this.syncFormState();
    this.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
  };

  private handleSlotChange = (): void => {
    this.refreshOptions();
  };

  private refreshOptions(): void {
    const nodes = Array.from(this.children)
      .map((child) => {
        if (child instanceof HTMLOptionElement) {
          return {
            kind: "option" as const,
            option: {
              disabled: child.disabled,
              label: child.label || child.textContent?.trim() || "",
              value: child.value
            }
          };
        }

        if (child instanceof HTMLOptGroupElement) {
          return {
            kind: "optgroup" as const,
            group: {
              disabled: child.disabled,
              label: child.label,
              options: Array.from(child.children)
                .filter((option): option is HTMLOptionElement => option instanceof HTMLOptionElement)
                .map((option) => ({
                  disabled: option.disabled,
                  label: option.label || option.textContent?.trim() || "",
                  value: option.value
                }))
            }
          };
        }

        return null;
      })
      .filter((node): node is SelectNode => node !== null);

    this.optionNodes = nodes;

    if (!this.hasAttribute("value")) {
      const firstOptionNode = nodes.find(
        (node): node is Extract<SelectNode, { kind: "option" }> => node.kind === "option"
      );
      const firstGroupNode = nodes.find(
        (node): node is Extract<SelectNode, { kind: "optgroup" }> => node.kind === "optgroup"
      );
      const selectedOption = firstOptionNode?.option ?? firstGroupNode?.group.options[0];

      if (selectedOption) {
        this.value = selectedOption.value;
      }
    }

    this.requestUpdate();
  }

  private syncFormState(): void {
    if (this.disabled) {
      this.setFormValue(null);
      return;
    }

    this.setFormValue(this.value);
    if (this.selectElement) {
      this.setValidityFrom(this.selectElement);
    }
  }

  private get selectElement(): HTMLSelectElement | null {
    return this.renderRoot.querySelector("select");
  }
}
