import { css, html, LitElement } from "lit";

import { CindorTreeItem } from "../tree-item/cindor-tree-item.js";

/**
 * Keyboard-accessible single-selection tree view.
 *
 * Use nested `cindor-tree-item` elements to create branches and leaves.
 *
 * @fires input - Fired when the selected item changes.
 * @fires change - Fired when the selected item changes.
 *
 * @slot - Direct child `cindor-tree-item` elements.
 */
export class CindorTreeView extends LitElement {
  static styles = css`
    :host {
      display: block;
      color: var(--fg);
    }

    .tree {
      display: grid;
      gap: var(--space-1);
    }
  `;

  static properties = {
    value: { reflect: true }
  };

  value = "";

  private readonly treeObserver = new MutationObserver(() => {
    this.refreshTree();
  });

  override connectedCallback(): void {
    super.connectedCallback();
    this.treeObserver.observe(this, {
      attributes: true,
      attributeFilter: ["disabled", "expanded", "label", "selected", "value"],
      childList: true,
      subtree: true
    });
    this.ensureValidValue();
  }

  override disconnectedCallback(): void {
    this.treeObserver.disconnect();
    super.disconnectedCallback();
  }

  protected override firstUpdated(): void {
    this.refreshTree();
  }

  protected override updated(changedProperties: Map<string, unknown>): void {
    if (changedProperties.has("value")) {
      this.refreshTree();
    }
  }

  protected override render() {
    return html`
      <div
        class="tree"
        part="tree"
        role="tree"
        @keydown=${this.handleKeyDown}
        @toggle=${this.handleTreeItemToggle}
        @tree-item-select=${this.handleTreeItemSelect}
      >
        <slot @slotchange=${this.handleSlotChange}></slot>
      </div>
    `;
  }

  private handleSlotChange = (): void => {
    this.refreshTree();
  };

  private handleTreeItemSelect = (event: Event): void => {
    const detail = (event as CustomEvent<{ item?: CindorTreeItem }>).detail;
    if (detail.item) {
      this.selectItem(detail.item);
    }
  };

  private handleTreeItemToggle = (): void => {
    this.refreshTree();
  };

  private handleKeyDown = (event: KeyboardEvent): void => {
    const currentItem = event.composedPath().find((node): node is CindorTreeItem => node instanceof CindorTreeItem);
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
        this.selectAndFocus(enabledItems[(currentIndex + 1) % enabledItems.length] ?? currentItem);
        return;
      case "ArrowUp":
        event.preventDefault();
        this.selectAndFocus(enabledItems[(currentIndex - 1 + enabledItems.length) % enabledItems.length] ?? currentItem);
        return;
      case "Home":
        event.preventDefault();
        this.selectAndFocus(enabledItems[0] ?? currentItem);
        return;
      case "End":
        event.preventDefault();
        this.selectAndFocus(enabledItems.at(-1) ?? currentItem);
        return;
      case "ArrowRight":
        event.preventDefault();
        this.handleExpandKey(currentItem);
        return;
      case "ArrowLeft":
        event.preventDefault();
        this.handleCollapseKey(currentItem);
        return;
      case "Enter":
      case " ":
        event.preventDefault();
        this.selectItem(currentItem);
        return;
      default:
        return;
    }
  };

  private handleExpandKey(item: CindorTreeItem): void {
    if (this.childItems(item).length > 0 && !item.expanded) {
      item.toggle(true);
      this.refreshTree();
      return;
    }

    const firstChild = this.childItems(item).find((child) => !child.disabled);
    if (firstChild) {
      this.selectAndFocus(firstChild);
    }
  }

  private handleCollapseKey(item: CindorTreeItem): void {
    if (this.childItems(item).length > 0 && item.expanded) {
      item.toggle(false);
      this.refreshTree();
      return;
    }

    const parent = this.parentItem(item);
    if (parent && !parent.disabled) {
      this.selectAndFocus(parent);
    }
  }

  private refreshTree(): void {
    const visibleItems = this.visibleItems;
    const allItems = this.allItems;

    this.ensureValidValue();

    const activeItem = visibleItems.find((item) => this.itemValue(item) === this.value) ?? visibleItems.find((item) => !item.disabled) ?? null;

    for (const item of allItems) {
      item.selected = this.itemValue(item) !== "" && this.itemValue(item) === this.value;
      const button = this.itemButton(item);
      if (!button) {
        continue;
      }

      const visible = visibleItems.includes(item);
      button.tabIndex = item === activeItem && !item.disabled ? 0 : -1;
      button.setAttribute("role", "treeitem");
      button.setAttribute("aria-level", String(this.levelFor(item)));
      button.setAttribute("aria-selected", String(item.selected));

      if (visible) {
        button.removeAttribute("aria-hidden");
      } else {
        button.setAttribute("aria-hidden", "true");
      }
    }
  }

  private selectAndFocus(item: CindorTreeItem): void {
    this.selectItem(item);
    void this.updateComplete.then(() => {
      item.focus();
    });
  }

  private selectItem(item: CindorTreeItem): void {
    const value = this.itemValue(item);
    if (item.disabled || value === "") {
      return;
    }

    this.value = value;
    const detail = { item, value: this.value };
    this.dispatchEvent(new CustomEvent("input", { bubbles: true, composed: true, detail }));
    this.dispatchEvent(new CustomEvent("change", { bubbles: true, composed: true, detail }));
  }

  private parentItem(item: CindorTreeItem): CindorTreeItem | null {
    let current: HTMLElement | null = item.parentElement;

    while (current) {
      if (current instanceof CindorTreeItem) {
        return current;
      }

      if (current === this) {
        return null;
      }

      current = current.parentElement;
    }

    return null;
  }

  private levelFor(item: CindorTreeItem): number {
    let level = 1;
    let current = this.parentItem(item);

    while (current) {
      level += 1;
      current = this.parentItem(current);
    }

    return level;
  }

  private collectVisibleItems(root: ParentNode = this): CindorTreeItem[] {
    const items = Array.from(root.children).filter((child): child is CindorTreeItem => child instanceof CindorTreeItem);
    const result: CindorTreeItem[] = [];

    for (const item of items) {
      result.push(item);
      if (item.expanded) {
        result.push(...this.collectVisibleItems(item));
      }
    }

    return result;
  }

  private get allItems(): CindorTreeItem[] {
    return Array.from(this.querySelectorAll("cindor-tree-item")).filter((child): child is CindorTreeItem => child instanceof CindorTreeItem);
  }

  private get visibleItems(): CindorTreeItem[] {
    return this.collectVisibleItems();
  }

  private ensureValidValue(): void {
    const visibleItems = this.visibleItems;
    if (!visibleItems.some((item) => this.itemValue(item) === this.value)) {
      const firstEnabled = visibleItems.find((item) => !item.disabled);
      this.value = firstEnabled ? this.itemValue(firstEnabled) : "";
    }
  }

  private childItems(item: CindorTreeItem): CindorTreeItem[] {
    return Array.from(item.children).filter((child): child is CindorTreeItem => child instanceof CindorTreeItem);
  }

  private itemButton(item: CindorTreeItem): HTMLButtonElement | null {
    return item.shadowRoot?.querySelector('[part="item"]') as HTMLButtonElement | null;
  }

  private itemValue(item: CindorTreeItem): string {
    return item.value || item.label;
  }
}
