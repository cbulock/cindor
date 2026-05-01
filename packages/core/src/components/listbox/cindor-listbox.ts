import { css, html, LitElement } from "lit";

import { CindorOption } from "../option/cindor-option.js";

export class CindorListbox extends LitElement {
  static styles = css`
    :host {
      display: grid;
      gap: var(--space-1);
      box-sizing: border-box;
      padding: var(--space-2);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      background: var(--surface);
      box-shadow: var(--shadow-md);
    }

    ::slotted(cindor-option) {
      display: block;
    }
  `;

  static properties = {
    activeIndex: { type: Number, attribute: "active-index" },
    multiselectable: { type: Boolean, reflect: true },
    selectedValue: { attribute: "selected-value" }
  };

  activeIndex = -1;
  multiselectable = false;
  selectedValue?: string;

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute("role", "listbox");
    this.setAttribute("aria-orientation", "vertical");
  }

  protected override updated(): void {
    if (this.multiselectable) {
      this.setAttribute("aria-multiselectable", "true");
    } else {
      this.removeAttribute("aria-multiselectable");
    }

    this.optionElements.forEach((option, index) => {
      option.active = index === this.activeIndex;

      if (this.selectedValue !== undefined) {
        option.selected = option.value === this.selectedValue;
      }
    });
  }

  protected override render() {
    return html`<slot></slot>`;
  }

  private get optionElements(): CindorOption[] {
    return Array.from(this.children).filter((child): child is CindorOption => child instanceof CindorOption);
  }
}
