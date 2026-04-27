import { css, html, LitElement } from "lit";

import { EmbMenuItem } from "../menu-item/emb-menu-item.js";

export class EmbMenu extends LitElement {
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

    ::slotted(emb-menu-item) {
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

    const currentItem = event.composedPath().find((node): node is EmbMenuItem => node instanceof EmbMenuItem);
    const currentIndex = currentItem ? enabledItems.indexOf(currentItem) : -1;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      enabledItems[currentIndex < enabledItems.length - 1 ? currentIndex + 1 : 0]?.focus();
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      enabledItems[currentIndex > 0 ? currentIndex - 1 : enabledItems.length - 1]?.focus();
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      enabledItems[0]?.focus();
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      enabledItems.at(-1)?.focus();
    }
  };

  private get menuItems(): EmbMenuItem[] {
    return Array.from(this.children).filter((child): child is EmbMenuItem => child instanceof EmbMenuItem);
  }
}
