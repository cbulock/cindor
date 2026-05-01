import { css, html, LitElement } from "lit";

import { findCurrentIndexFromPath, handleLinearKeyboardNavigation } from "../shared/linear-navigation.js";

const menubarItemSelectors = ["cindor-button", "cindor-icon-button", "cindor-link", "button", "a"];

/**
 * Horizontal application menubar with roving keyboard focus.
 *
 * @slot - Menubar commands or links.
 */
export class CindorMenubar extends LitElement {
  static styles = css`
    :host {
      display: block;
      max-width: 100%;
    }

    .menubar {
      display: inline-flex;
      align-items: center;
      gap: var(--space-1);
      max-width: 100%;
      padding: var(--space-1);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      background: var(--surface);
      box-shadow: var(--shadow-xs);
    }
  `;

  protected override render() {
    return html`<div class="menubar" part="menubar" @keydown=${this.handleKeyDown}><slot @slotchange=${this.handleSlotChange}></slot></div>`;
  }

  protected override updated(): void {
    this.syncA11y();
  }

  private handleKeyDown = (event: KeyboardEvent): void => {
    const items = this.menubarItems;
    if (!items.length) {
      return;
    }

    handleLinearKeyboardNavigation({
      currentIndex: findCurrentIndexFromPath(event.composedPath(), items),
      event,
      items,
      nextKeys: ["ArrowRight"],
      onNavigate: (item) => this.focusItem(item),
      previousKeys: ["ArrowLeft"]
    });
  };

  private handleSlotChange = (): void => {
    this.syncA11y();
  };

  private syncA11y(): void {
    const menubar = this.menubarElement;
    if (!menubar) {
      return;
    }

    menubar.setAttribute("role", "menubar");
    for (const attributeName of ["aria-label", "aria-labelledby", "aria-describedby"]) {
      const value = this.getAttribute(attributeName);
      if (value === null || value === "") {
        menubar.removeAttribute(attributeName);
      } else {
        menubar.setAttribute(attributeName, value);
      }
    }
  }

  private focusItem(item: HTMLElement | undefined): void {
    item?.focus();
  }

  private collectItems(root: Element): HTMLElement[] {
    const matchesSelf = menubarItemSelectors.some((selector) => root.matches(selector)) && !this.isDisabled(root as HTMLElement);
    if (matchesSelf) {
      return [root as HTMLElement];
    }

    return Array.from(root.children).flatMap((child) => this.collectItems(child));
  }

  private isDisabled(element: HTMLElement): boolean {
    return "disabled" in element && Boolean((element as HTMLButtonElement & { disabled?: boolean }).disabled);
  }

  private get menubarElement(): HTMLElement | null {
    return this.renderRoot.querySelector(".menubar");
  }

  private get menubarItems(): HTMLElement[] {
    const slot = this.renderRoot.querySelector("slot");
    const assigned = slot?.assignedElements({ flatten: true }) ?? [];
    return assigned.flatMap((element) => this.collectItems(element));
  }
}
