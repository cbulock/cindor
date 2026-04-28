import { css, html, LitElement } from "lit";

import { EmbSideNavItem } from "../side-nav-item/emb-side-nav-item.js";

/**
 * Keyboard-accessible side navigation landmark with nested sections.
 *
 * Use direct child `emb-side-nav-item` elements, optionally nesting them to
 * create collapsible sections.
 *
 * @slot - Direct child `emb-side-nav-item` elements.
 */
export class EmbSideNav extends LitElement {
  static styles = css`
    :host {
      display: block;
      color: var(--fg);
    }

    .nav {
      display: grid;
      gap: var(--space-1);
    }
  `;

  private readonly itemObserver = new MutationObserver(() => {
    this.refreshItems();
  });

  override connectedCallback(): void {
    super.connectedCallback();
    this.itemObserver.observe(this, {
      attributes: true,
      attributeFilter: ["current", "disabled", "expanded", "href", "label", "target", "value"],
      childList: true,
      subtree: true
    });
  }

  override disconnectedCallback(): void {
    this.itemObserver.disconnect();
    super.disconnectedCallback();
  }

  protected override firstUpdated(): void {
    this.refreshItems();
  }

  protected override render() {
    return html`
      <nav class="nav" part="nav" @focusin=${this.handleFocusIn} @keydown=${this.handleKeyDown}>
        <slot @slotchange=${this.handleSlotChange}></slot>
      </nav>
    `;
  }

  protected override updated(): void {
    this.syncNavA11y();
  }

  private handleFocusIn = (): void => {
    this.refreshItems();
  };

  private handleKeyDown = (event: KeyboardEvent): void => {
    const currentItem = event.composedPath().find((node): node is EmbSideNavItem => node instanceof EmbSideNavItem);
    if (!currentItem || currentItem.disabled) {
      return;
    }

    const enabledItems = this.visibleItems.filter((item) => !item.disabled);
    const currentIndex = enabledItems.indexOf(currentItem);
    if (currentIndex === -1) {
      return;
    }

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        this.focusItem(enabledItems[(currentIndex + 1) % enabledItems.length] ?? currentItem);
        return;
      case "ArrowUp":
        event.preventDefault();
        this.focusItem(enabledItems[(currentIndex - 1 + enabledItems.length) % enabledItems.length] ?? currentItem);
        return;
      case "Home":
        event.preventDefault();
        this.focusItem(enabledItems[0] ?? currentItem);
        return;
      case "End":
        event.preventDefault();
        this.focusItem(enabledItems.at(-1) ?? currentItem);
        return;
      case "ArrowRight":
        event.preventDefault();
        this.handleExpandKey(currentItem);
        return;
      case "ArrowLeft":
        event.preventDefault();
        this.handleCollapseKey(currentItem);
        return;
      default:
        return;
    }
  };

  private handleSlotChange = (): void => {
    this.refreshItems();
  };

  private handleExpandKey(item: EmbSideNavItem): void {
    if (this.childItems(item).length > 0 && !item.expanded) {
      item.toggle(true);
      this.refreshItems();
      return;
    }

    const firstChild = this.childItems(item).find((child) => !child.disabled);
    if (firstChild) {
      this.focusItem(firstChild);
    }
  }

  private handleCollapseKey(item: EmbSideNavItem): void {
    if (this.childItems(item).length > 0 && item.expanded) {
      item.toggle(false);
      this.refreshItems();
      return;
    }

    const parent = this.parentItem(item);
    if (parent && !parent.disabled) {
      this.focusItem(parent);
    }
  }

  private focusItem(item: EmbSideNavItem): void {
    this.refreshItems(item);
    item.focus();
  }

  private refreshItems(preferredItem?: EmbSideNavItem | null): void {
    const visibleItems = this.visibleItems;
    const allItems = this.allItems;
    const focusedItem = this.focusedItem;
    const activeItem =
      preferredItem ??
      focusedItem ??
      visibleItems.find((item) => item.current && !item.disabled) ??
      visibleItems.find((item) => !item.disabled) ??
      null;

    for (const item of allItems) {
      const control = this.itemControl(item);
      if (!control) {
        continue;
      }

      const visible = visibleItems.includes(item);
      control.tabIndex = item === activeItem && !item.disabled ? 0 : -1;

      if (visible) {
        control.removeAttribute("aria-hidden");
      } else {
        control.setAttribute("aria-hidden", "true");
      }
    }
  }

  private syncNavA11y(): void {
    const nav = this.navElement;
    if (!nav) {
      return;
    }

    for (const attributeName of ["aria-label", "aria-labelledby", "aria-describedby"]) {
      const value = this.getAttribute(attributeName);
      if (value === null || value === "") {
        nav.removeAttribute(attributeName);
      } else {
        nav.setAttribute(attributeName, value);
      }
    }

    if (!nav.hasAttribute("aria-label") && !nav.hasAttribute("aria-labelledby")) {
      nav.setAttribute("aria-label", "Side navigation");
    }
  }

  private collectVisibleItems(root: ParentNode = this): EmbSideNavItem[] {
    const items = Array.from(root.children).filter((child): child is EmbSideNavItem => child instanceof EmbSideNavItem);
    const result: EmbSideNavItem[] = [];

    for (const item of items) {
      result.push(item);
      if (item.expanded) {
        result.push(...this.collectVisibleItems(item));
      }
    }

    return result;
  }

  private parentItem(item: EmbSideNavItem): EmbSideNavItem | null {
    let current: HTMLElement | null = item.parentElement;

    while (current) {
      if (current instanceof EmbSideNavItem) {
        return current;
      }

      if (current === this) {
        return null;
      }

      current = current.parentElement;
    }

    return null;
  }

  private childItems(item: EmbSideNavItem): EmbSideNavItem[] {
    return Array.from(item.children).filter((child): child is EmbSideNavItem => child instanceof EmbSideNavItem);
  }

  private itemControl(item: EmbSideNavItem): HTMLAnchorElement | HTMLButtonElement | null {
    return item.shadowRoot?.querySelector('[part="item"]') as HTMLAnchorElement | HTMLButtonElement | null;
  }

  private get allItems(): EmbSideNavItem[] {
    return Array.from(this.querySelectorAll("emb-side-nav-item")).filter((child): child is EmbSideNavItem => child instanceof EmbSideNavItem);
  }

  private get focusedItem(): EmbSideNavItem | null {
    return this.visibleItems.find((item) => item.shadowRoot?.activeElement !== null) ?? null;
  }

  private get navElement(): HTMLElement | null {
    return this.renderRoot.querySelector(".nav");
  }

  private get visibleItems(): EmbSideNavItem[] {
    return this.collectVisibleItems();
  }
}
