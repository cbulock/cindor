import { css, html, LitElement } from "lit";

import { CindorMenuItem } from "../menu-item/cindor-menu-item.js";
import { findCurrentIndexFromPath, handleLinearKeyboardNavigation } from "../shared/linear-navigation.js";

export class CindorMenu extends LitElement {
  static styles = css`
    :host {
      display: grid;
      gap: var(--space-1);
      box-sizing: border-box;
      min-width: 200px;
      padding: var(--space-2);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      background: var(--surface);
      box-shadow: var(--shadow-md);
    }

    ::slotted(cindor-menu-item) {
      display: block;
    }
  `;

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute("role", "menu");
    this.setAttribute("aria-orientation", "vertical");
  }

  protected override render() {
    return html`<slot @keydown=${this.handleKeyDown}></slot>`;
  }

  private handleKeyDown = (event: KeyboardEvent): void => {
    const enabledItems = this.menuItems.filter((item) => !item.disabled);

    if (enabledItems.length === 0) {
      return;
    }

    handleLinearKeyboardNavigation({
      currentIndex: findCurrentIndexFromPath(event.composedPath(), enabledItems),
      event,
      items: enabledItems,
      nextKeys: ["ArrowDown"],
      onNavigate: (item) => item.focus(),
      previousKeys: ["ArrowUp"]
    });
  };

  private get menuItems(): CindorMenuItem[] {
    return Array.from(this.children).filter((child): child is CindorMenuItem => child instanceof CindorMenuItem);
  }
}
