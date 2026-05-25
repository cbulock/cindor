import { css, html } from "lit";
import { ifDefined } from "lit/directives/if-defined.js";
import { live } from "lit/directives/live.js";
import ChevronDown from "lucide/dist/esm/icons/chevron-down.mjs";

import { renderLucideIcon } from "../icon/lucide.js";
import { CindorOption } from "../option/cindor-option.js";
import { createFieldHostStyles, createTextControlStyles, hiddenSlotStyles } from "../shared/control-styles.js";
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

export class CindorSelect extends FormAssociatedElement {
  static styles = [
    createFieldHostStyles("min(100%, 320px)"),
    createTextControlStyles("select", { includePlaceholder: false }),
    hiddenSlotStyles,
    css`
      .surface {
        position: relative;
      }

      select {
        appearance: none;
        padding-inline-end: calc(var(--space-4) * 2 + 1rem);
      }

      .icon {
        position: absolute;
        inset-block-start: 50%;
        inset-inline-end: var(--space-4);
        block-size: 1rem;
        inline-size: 1rem;
        color: var(--fg-subtle);
        pointer-events: none;
        transform: translateY(-50%);
      }
    `
  ];

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
      <div class="surface" part="surface">
        <select
          part="control"
          .value=${live(this.value)}
          ?disabled=${this.disabled}
          form=${ifDefined(this.associatedFormId)}
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
        <span class="icon" part="icon" aria-hidden="true">
          ${renderLucideIcon({
            iconNode: ChevronDown,
            size: 16,
            attributes: {
              class: "select-icon"
            }
          })}
        </span>
      </div>
    `;
  }

  protected override updated(): void {
    this.syncFormState();
    this.syncControlA11y(this.selectElement);
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
        const option = this.parseOptionNode(child);
        if (option) {
          return {
            kind: "option" as const,
            option
          };
        }

        if (child instanceof HTMLOptGroupElement) {
          return {
            kind: "optgroup" as const,
            group: {
              disabled: child.disabled,
              label: child.label,
              options: Array.from(child.children)
                .map((option) => this.parseOptionNode(option))
                .filter((option): option is SelectOption => option !== null)
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

  private parseOptionNode(child: Element): SelectOption | null {
    if (child instanceof HTMLOptionElement) {
      return {
        disabled: child.disabled,
        label: child.label || child.textContent?.trim() || "",
        value: child.value
      };
    }

    if (child instanceof CindorOption || child.localName === "cindor-option") {
      return {
        disabled: child instanceof CindorOption ? child.disabled : child.hasAttribute("disabled"),
        label:
          (child instanceof CindorOption ? child.label : child.getAttribute("label")) ||
          child.textContent?.trim() ||
          "",
        value: child instanceof CindorOption ? child.value : child.getAttribute("value") || ""
      };
    }

    return null;
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
