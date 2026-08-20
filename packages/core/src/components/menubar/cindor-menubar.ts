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
      color: var(--fg);
    }

    .menubar {
      display: inline-flex;
      align-items: center;
      gap: 2px;
      min-height: 2.5rem;
      max-width: 100%;
      overflow-x: auto;
      overscroll-behavior-x: contain;
      scrollbar-width: thin;
      padding: 0.1875rem;
      border: 1px solid color-mix(in srgb, var(--border-strong) 65%, var(--border));
      border-radius: var(--radius-md);
      background:
        linear-gradient(
          180deg,
          color-mix(in srgb, var(--surface-raised, var(--surface)) 88%, white 12%),
          color-mix(in srgb, var(--surface) 96%, black 4%)
        );
      box-shadow:
        inset 0 1px 0 color-mix(in srgb, white 55%, transparent),
        var(--shadow-xs);
      color: var(--fg);
    }

    ::slotted(cindor-button),
    ::slotted(cindor-icon-button) {
      --cindor-button-background: transparent;
      --cindor-button-border-color: transparent;
      --cindor-button-color: var(--fg);
      --cindor-button-gap: var(--space-1);
      --cindor-button-ghost-background: transparent;
      --cindor-button-ghost-border-color: transparent;
      --cindor-button-ghost-color: var(--fg);
      --cindor-button-hover-background: color-mix(in srgb, var(--accent) 14%, transparent);
      --cindor-button-hover-border-color: transparent;
      --cindor-button-hover-color: var(--fg);
      --cindor-button-min-height: 2.125rem;
      --cindor-button-padding-block: 0;
      --cindor-button-padding-inline: var(--space-3);
      --cindor-button-radius: calc(var(--radius-sm) + 1px);
      flex: none;
      font-size: var(--text-sm);
      font-weight: var(--weight-medium);
    }

    ::slotted(cindor-link),
    ::slotted(button),
    ::slotted(a) {
      flex: none;
      border-radius: calc(var(--radius-sm) + 1px);
      color: var(--fg);
      font-size: var(--text-sm);
      font-weight: var(--weight-medium);
      text-decoration: none;
    }

    ::slotted(button),
    ::slotted(a) {
      min-height: 2.125rem;
      padding: 0 var(--space-3);
      border: 0;
      background: transparent;
      font: inherit;
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
