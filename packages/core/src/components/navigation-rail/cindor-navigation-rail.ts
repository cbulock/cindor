import { css, html, LitElement } from "lit";

import { CindorNavigationRailItem } from "../navigation-rail-item/cindor-navigation-rail-item.js";
import { findCurrentIndexFromPath, handleLinearKeyboardNavigation } from "../shared/linear-navigation.js";

/**
 * Vertical navigation rail for compact app-shell layouts.
 *
 * @slot - `cindor-navigation-rail-item` children.
 */
export class CindorNavigationRail extends LitElement {
  static styles = css`
    :host {
      display: inline-block;
      max-width: 100%;
    }

    .rail {
      display: grid;
      gap: var(--space-2);
      padding: var(--space-2);
      border: 1px solid var(--border);
      border-radius: var(--radius-xl);
      background: var(--surface);
      box-shadow: var(--shadow-xs);
    }
  `;

  protected override render() {
    return html`<nav class="rail" part="rail" @keydown=${this.handleKeyDown}><slot @slotchange=${this.handleSlotChange}></slot></nav>`;
  }

  protected override updated(): void {
    this.syncA11y();
  }

  private handleKeyDown = (event: KeyboardEvent): void => {
    const items = this.railItems.filter((item) => !item.disabled);
    if (!items.length) {
      return;
    }

    handleLinearKeyboardNavigation({
      currentIndex: findCurrentIndexFromPath(event.composedPath(), items),
      event,
      items,
      nextKeys: ["ArrowDown"],
      onNavigate: (item) => item.focus(),
      previousKeys: ["ArrowUp"]
    });
  };

  private handleSlotChange = (): void => {
    this.syncA11y();
  };

  private syncA11y(): void {
    const rail = this.railElement;
    if (!rail) {
      return;
    }

    for (const attributeName of ["aria-label", "aria-labelledby", "aria-describedby"]) {
      const value = this.getAttribute(attributeName);
      if (value === null || value === "") {
        rail.removeAttribute(attributeName);
      } else {
        rail.setAttribute(attributeName, value);
      }
    }

    if (!rail.hasAttribute("aria-label") && !rail.hasAttribute("aria-labelledby")) {
      rail.setAttribute("aria-label", "Navigation rail");
    }
  }

  private get railElement(): HTMLElement | null {
    return this.renderRoot.querySelector(".rail");
  }

  private get railItems(): CindorNavigationRailItem[] {
    return Array.from(this.children).filter((child): child is CindorNavigationRailItem => child instanceof CindorNavigationRailItem);
  }
}
