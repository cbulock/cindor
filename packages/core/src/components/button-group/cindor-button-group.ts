import { css, html, LitElement } from "lit";

export type ButtonGroupOrientation = "horizontal" | "vertical";

const groupedButtonTags = new Set(["CINDOR-BUTTON", "CINDOR-ICON-BUTTON"]);
const buttonRadiusVars = [
  "--cindor-button-border-start-start-radius",
  "--cindor-button-border-start-end-radius",
  "--cindor-button-border-end-start-radius",
  "--cindor-button-border-end-end-radius"
] as const;

export class CindorButtonGroup extends LitElement {
  static styles = css`
    :host {
      display: inline-block;
      max-width: 100%;
    }

    .group {
      display: inline-flex;
      align-items: stretch;
      gap: var(--space-2);
      max-width: 100%;
    }

    :host([orientation="vertical"]) .group {
      flex-direction: column;
    }

    :host([attached]) .group {
      gap: 0;
    }

    ::slotted(*) {
      flex: none;
    }
  `;

  static properties = {
    attached: { type: Boolean, reflect: true },
    orientation: { reflect: true }
  };

  attached = false;
  orientation: ButtonGroupOrientation = "horizontal";

  protected override render() {
    return html`<div class="group" part="group"><slot @slotchange=${this.handleSlotChange}></slot></div>`;
  }

  protected override updated(): void {
    this.syncGroupA11y();
    this.syncItems();
  }

  private handleSlotChange = (): void => {
    this.syncItems();
  };

  private syncGroupA11y(): void {
    const group = this.groupElement;
    if (!group) {
      return;
    }

    group.setAttribute("role", "group");

    for (const attributeName of ["aria-label", "aria-labelledby", "aria-describedby"]) {
      const value = this.getAttribute(attributeName);
      if (value === null || value === "") {
        group.removeAttribute(attributeName);
      } else {
        group.setAttribute(attributeName, value);
      }
    }
  }

  private syncItems(): void {
    const items = this.itemElements;
    const vertical = this.orientation === "vertical";

    items.forEach((item, index) => {
      this.resetItemStyles(item);

      if (!this.attached || !groupedButtonTags.has(item.tagName)) {
        return;
      }

      const isFirst = index === 0;
      const isLast = index === items.length - 1;

      if (vertical) {
        if (!isFirst) {
          item.style.marginBlockStart = "-1px";
        }
      } else {
        if (!isFirst) {
          item.style.marginInlineStart = "-1px";
        }
      }

      const startStartRadius = vertical ? (isFirst ? "var(--radius-md)" : "0px") : isFirst ? "var(--radius-md)" : "0px";
      const startEndRadius = vertical ? (isFirst ? "var(--radius-md)" : "0px") : isLast ? "var(--radius-md)" : "0px";
      const endStartRadius = vertical ? (isLast ? "var(--radius-md)" : "0px") : isFirst ? "var(--radius-md)" : "0px";
      const endEndRadius = vertical ? (isLast ? "var(--radius-md)" : "0px") : isLast ? "var(--radius-md)" : "0px";

      item.style.setProperty("--cindor-button-border-start-start-radius", startStartRadius);
      item.style.setProperty("--cindor-button-border-start-end-radius", startEndRadius);
      item.style.setProperty("--cindor-button-border-end-start-radius", endStartRadius);
      item.style.setProperty("--cindor-button-border-end-end-radius", endEndRadius);
    });
  }

  private resetItemStyles(item: HTMLElement): void {
    item.style.marginInlineStart = "";
    item.style.marginBlockStart = "";
    for (const variable of buttonRadiusVars) {
      item.style.removeProperty(variable);
    }
  }

  private get groupElement(): HTMLElement | null {
    return this.renderRoot.querySelector(".group");
  }

  private get itemElements(): HTMLElement[] {
    const slot = this.renderRoot.querySelector("slot");
    return (slot?.assignedElements({ flatten: true }) ?? []).filter((node): node is HTMLElement => node instanceof HTMLElement);
  }
}
