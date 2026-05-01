import { css, html, LitElement } from "lit";

import { findCurrentIndexFromPath, handleLinearKeyboardNavigation } from "../shared/linear-navigation.js";

export type ToolbarOrientation = "horizontal" | "vertical";

const toolbarItemSelectors = ["cindor-button", "cindor-icon-button", "cindor-segmented-control", "button", "a", "input", "select", "textarea"];

export class CindorToolbar extends LitElement {
  static styles = css`
    :host {
      display: inline-block;
      max-width: 100%;
    }

    .toolbar {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      flex-wrap: nowrap;
      max-width: 100%;
    }

    :host([wrap]) .toolbar {
      flex-wrap: wrap;
    }

    :host([orientation="vertical"]) .toolbar {
      flex-direction: column;
      align-items: stretch;
    }
  `;

  static properties = {
    orientation: { reflect: true },
    wrap: { type: Boolean, reflect: true }
  };

  orientation: ToolbarOrientation = "horizontal";
  wrap = false;

  protected override render() {
    return html`<div class="toolbar" part="toolbar" @keydown=${this.handleKeyDown}><slot @slotchange=${this.handleSlotChange}></slot></div>`;
  }

  protected override updated(): void {
    this.syncToolbarA11y();
  }

  private handleKeyDown = (event: KeyboardEvent): void => {
    const items = this.toolbarItems;
    if (!items.length) {
      return;
    }

    const vertical = this.orientation === "vertical";
    const nextKey = vertical ? "ArrowDown" : "ArrowRight";
    const previousKey = vertical ? "ArrowUp" : "ArrowLeft";
    handleLinearKeyboardNavigation({
      currentIndex: findCurrentIndexFromPath(event.composedPath(), items),
      event,
      items,
      nextKeys: [nextKey],
      onNavigate: (item) => this.focusItem(item),
      previousKeys: [previousKey]
    });
  };

  private handleSlotChange = (): void => {
    this.syncToolbarA11y();
  };

  private focusItem(item: HTMLElement): void {
    if (typeof (item as { focus?: (options?: FocusOptions) => void }).focus === "function") {
      item.focus();
      return;
    }

    item.focus();
  }

  private syncToolbarA11y(): void {
    const toolbar = this.toolbarElement;
    if (!toolbar) {
      return;
    }

    toolbar.setAttribute("role", "toolbar");
    toolbar.setAttribute("aria-orientation", this.orientation);

    for (const attributeName of ["aria-label", "aria-labelledby", "aria-describedby"]) {
      const value = this.getAttribute(attributeName);
      if (value === null || value === "") {
        toolbar.removeAttribute(attributeName);
      } else {
        toolbar.setAttribute(attributeName, value);
      }
    }
  }

  private collectToolbarItems(root: Element): HTMLElement[] {
    const matchesSelf =
      toolbarItemSelectors.some((selector) => root.matches(selector)) &&
      !this.isDisabled(root as HTMLElement);

    if (matchesSelf) {
      return [root as HTMLElement];
    }

    return Array.from(root.children).flatMap((child) => this.collectToolbarItems(child));
  }

  private isDisabled(element: HTMLElement): boolean {
    return "disabled" in element && Boolean((element as HTMLButtonElement & { disabled?: boolean }).disabled);
  }

  private get toolbarElement(): HTMLElement | null {
    return this.renderRoot.querySelector(".toolbar");
  }

  private get toolbarItems(): HTMLElement[] {
    const slot = this.renderRoot.querySelector("slot");
    const assigned = slot?.assignedElements({ flatten: true }) ?? [];
    return assigned.flatMap((element) => this.collectToolbarItems(element));
  }
}
