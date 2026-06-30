import { css, html, LitElement, nothing } from "lit";

import { attachFloatingPosition } from "../shared/floating-position.js";

export type WorkspaceSwitcherItem = {
  description?: string;
  disabled?: boolean;
  group?: string;
  imageSrc?: string;
  keywords?: string[];
  label: string;
  meta?: string;
  value: string;
};

export type WorkspaceSwitcherSelectDetail = {
  item: WorkspaceSwitcherItem;
  items: WorkspaceSwitcherItem[];
  value: string;
};

/**
 * Searchable workspace and project switcher for app shells and multi-tenant tools.
 *
 * Pass `items` to populate the switcher and use `value` to control the current selection.
 *
 * @summary Searchable workspace switcher for cross-project navigation.
 * @tag cindor-workspace-switcher
 * @fires {CustomEvent<WorkspaceSwitcherSelectDetail>} select - Fired when the user selects an item.
 * @fires {CustomEvent<WorkspaceSwitcherSelectDetail>} input - Fired when the current value changes.
 * @fires {CustomEvent<WorkspaceSwitcherSelectDetail>} change - Fired when the current value changes.
 * @fires {CustomEvent<{ open: boolean }>} toggle - Fired when the panel opens or closes.
 */
export class CindorWorkspaceSwitcher extends LitElement {
  static styles = css`
    :host {
      display: inline-block;
      min-inline-size: min(100%, 20rem);
      color: var(--fg);
    }

    .trigger {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr) auto;
      gap: var(--space-3);
      align-items: center;
      inline-size: 100%;
      min-block-size: 3.5rem;
      padding: var(--space-3);
      border: 1px solid var(--border);
      border-radius: var(--radius-xl);
      background: var(--surface);
      color: inherit;
      text-align: start;
      cursor: pointer;
      box-shadow: var(--shadow-sm);
      transition:
        border-color var(--duration-base) var(--ease-out),
        box-shadow var(--duration-base) var(--ease-out),
        background var(--duration-base) var(--ease-out);
    }

    .trigger:hover:not(:disabled) {
      border-color: var(--border-strong);
      background: color-mix(in srgb, var(--surface) 88%, var(--bg-subtle));
    }

    .trigger:focus-visible,
    .search:focus-visible,
    .item:focus-visible {
      outline: none;
      box-shadow: var(--ring-focus);
    }

    .trigger:disabled,
    .item:disabled {
      cursor: not-allowed;
      color: var(--fg-subtle);
    }

    .trigger-copy,
    .item-copy {
      display: grid;
      gap: var(--space-1);
      min-width: 0;
    }

    .trigger-label,
    .item-label,
    .item-meta,
    .trigger-meta {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .trigger-label,
    .item-label {
      font-weight: var(--weight-semibold);
    }

    .trigger-meta,
    .item-meta,
    .item-description,
    .helper,
    .empty {
      color: var(--fg-muted);
      font-size: var(--text-sm);
      line-height: var(--text-helper-leading);
    }

    .chevron {
      color: var(--fg-muted);
    }

    .panel {
      box-sizing: border-box;
      position: fixed;
      display: grid;
      gap: var(--space-4);
      inline-size: min(30rem, calc(100vw - 16px));
      max-block-size: min(32rem, calc(100vh - 16px));
      overflow: auto;
      padding: var(--space-4);
      border: 1px solid var(--border);
      border-radius: var(--radius-xl);
      background: var(--surface);
      box-shadow: var(--shadow-lg);
      z-index: 30;
    }

    .panel-header {
      display: grid;
      gap: var(--space-1);
    }

    .title {
      margin: 0;
      font-size: var(--text-lg);
      font-weight: var(--weight-semibold);
    }

    .search {
      inline-size: 100%;
      min-block-size: 2.75rem;
      padding: 0 var(--space-3);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      background: var(--bg);
      color: var(--fg);
      font: inherit;
    }

    .search::placeholder {
      color: var(--fg-subtle);
    }

    .list,
    .group,
    .group-items {
      display: grid;
    }

    .list,
    .group {
      gap: var(--space-3);
    }

    .group-items {
      gap: var(--space-2);
    }

    .group-title {
      color: var(--fg-muted);
      font-size: var(--text-xs);
      font-weight: var(--weight-semibold);
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .item {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr) auto;
      gap: var(--space-3);
      align-items: start;
      inline-size: 100%;
      padding: var(--space-3);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      background: transparent;
      color: inherit;
      text-align: start;
      cursor: pointer;
      transition:
        border-color var(--duration-base) var(--ease-out),
        background var(--duration-base) var(--ease-out);
    }

    .item:hover:not(:disabled),
    .item[data-active="true"] {
      border-color: color-mix(in srgb, var(--accent) 35%, var(--border-strong));
      background: color-mix(in srgb, var(--accent-muted) 24%, var(--surface));
    }

    .item-badges {
      display: inline-flex;
      flex-wrap: wrap;
      gap: var(--space-2);
      align-items: center;
    }

    .current-badge {
      display: inline-flex;
      align-items: center;
      min-block-size: 1.5rem;
      padding: 0 var(--space-2);
      border-radius: var(--radius-full);
      background: color-mix(in srgb, var(--accent) 12%, var(--surface));
      color: var(--accent);
      font-size: var(--text-xs);
      font-weight: var(--weight-semibold);
      white-space: nowrap;
    }

    .avatar {
      inline-size: 2.5rem;
      block-size: 2.5rem;
      border-radius: 999px;
      display: grid;
      place-items: center;
      overflow: hidden;
      border: 1px solid var(--border);
      background: var(--bg-subtle);
      color: var(--fg);
      font-size: var(--text-sm);
      font-weight: var(--weight-semibold);
      text-transform: uppercase;
    }

    .avatar img {
      inline-size: 100%;
      block-size: 100%;
      object-fit: cover;
    }

    .empty {
      margin: 0;
      padding: var(--space-4);
      border: 1px dashed var(--border);
      border-radius: var(--radius-lg);
      text-align: center;
    }

    .sr-only {
      position: absolute;
      inline-size: 1px;
      block-size: 1px;
      margin: -1px;
      padding: 0;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }
  `;

  static properties = {
    activeIndex: { state: true },
    disabled: { type: Boolean, reflect: true },
    emptyMessage: { reflect: true, attribute: "empty-message" },
    items: { attribute: false },
    open: { type: Boolean, reflect: true },
    placeholder: { reflect: true },
    query: { state: true },
    searchLabel: { reflect: true, attribute: "search-label" },
    searchPlaceholder: { reflect: true, attribute: "search-placeholder" },
    title: { reflect: true },
    triggerLabel: { reflect: true, attribute: "trigger-label" },
    value: { reflect: true }
  };

  private static nextId = 0;

  activeIndex = -1;
  disabled = false;
  emptyMessage = "No workspaces match your search.";
  items: WorkspaceSwitcherItem[] = [];
  open = false;
  placeholder = "Select a workspace";
  query = "";
  searchLabel = "Search workspaces";
  searchPlaceholder = "Search workspaces";
  title = "Switch workspace";
  triggerLabel = "Toggle workspace switcher";
  value = "";

  private focusSearchOnOpen = false;
  private floatingCleanup?: () => void;
  private floatingPanel: HTMLElement | null = null;
  private readonly panelId = `cindor-workspace-switcher-panel-${CindorWorkspaceSwitcher.nextId++}`;
  private readonly listboxId = `cindor-workspace-switcher-listbox-${CindorWorkspaceSwitcher.nextId++}`;
  private restoreFocusOnClose = false;
  private readonly searchId = `cindor-workspace-switcher-search-${CindorWorkspaceSwitcher.nextId++}`;
  private updateFloatingPosition?: () => void;

  override disconnectedCallback(): void {
    this.unbindGlobalListeners();
    this.destroyFloatingPosition();
    super.disconnectedCallback();
  }

  show(): void {
    if (!this.disabled) {
      this.open = true;
    }
  }

  close(options: { restoreFocus?: boolean } = {}): void {
    this.restoreFocusOnClose = Boolean(options.restoreFocus);
    this.open = false;
  }

  protected override render() {
    return html`
      <button
        aria-controls=${this.panelId}
        aria-expanded=${String(this.open)}
        aria-haspopup="dialog"
        class="trigger"
        part="trigger"
        type="button"
        ?disabled=${this.disabled}
        @click=${this.handleTriggerClick}
      >
        ${this.renderAvatar(this.selectedItem)}
        <span class="trigger-copy">
          <span class="trigger-label" part="trigger-label">${this.selectedItem?.label ?? this.placeholder}</span>
          <span class="trigger-meta" part="trigger-meta">${this.selectedItem?.meta ?? this.title}</span>
        </span>
        <cindor-icon class="chevron" name="chevrons-up-down" part="trigger-icon" size="16"></cindor-icon>
      </button>

      ${this.open
        ? html`
            <section aria-label=${this.title} class="panel" id=${this.panelId} part="panel" role="dialog">
              <div class="panel-header">
                <h2 class="title" part="title">${this.title}</h2>
                <p class="helper" part="helper">Search across workspaces, projects, and recent operating surfaces.</p>
              </div>

              <label class="sr-only" for=${this.searchId}>${this.searchLabel}</label>
              <input
                id=${this.searchId}
                aria-activedescendant=${this.activeOptionId ?? nothing}
                aria-controls=${this.listboxId}
                aria-expanded="true"
                aria-label=${this.searchLabel}
                aria-autocomplete="list"
                class="search"
                part="search"
                .value=${this.query}
                placeholder=${this.searchPlaceholder}
                role="combobox"
                type="search"
                @input=${this.handleSearchInput}
                @keydown=${this.handleSearchKeyDown}
              />

              ${this.filteredItems.length
                ? html`<div aria-label=${this.title} class="list" id=${this.listboxId} part="list" role="listbox">${this.renderGroupedItems()}</div>`
                : html`<p class="empty" part="empty">${this.emptyMessage}</p>`}
            </section>
          `
        : nothing}
    `;
  }

  protected override updated(changedProperties: Map<string, unknown>): void {
    if (changedProperties.has("items") || changedProperties.has("query")) {
      this.normalizeActiveIndex();
    }

    if (changedProperties.has("open")) {
      if (this.open) {
        this.query = "";
        this.focusSearchOnOpen = true;
        this.bindGlobalListeners();
        this.dispatchToggle();
      } else {
        this.query = "";
        this.unbindGlobalListeners();
        this.destroyFloatingPosition();
        this.dispatchToggle();

        if (this.restoreFocusOnClose) {
          this.restoreFocusOnClose = false;
          queueMicrotask(() => {
            this.triggerElement?.focus();
          });
        }
      }
    }

    this.syncFloatingPosition();

    if (this.focusSearchOnOpen && this.open) {
      this.focusSearchOnOpen = false;
      requestAnimationFrame(() => {
        this.searchElement?.focus();
      });
    }

    if (changedProperties.has("activeIndex") && this.open) {
      requestAnimationFrame(() => {
        this.activeOptionElement?.scrollIntoView?.({ block: "nearest" });
      });
    }
  }

  private renderGroupedItems() {
    return Array.from(this.groupedItems.entries()).map(([group, items]) => html`
      <section class="group" part="group">
        ${group ? html`<div class="group-title" part="group-title">${group}</div>` : nothing}
        <div class="group-items" part="group-items">
          ${items.map((item) => this.renderItem(item))}
        </div>
      </section>
    `);
  }

  private renderItem(item: WorkspaceSwitcherItem) {
    const index = this.filteredItems.findIndex((candidate) => candidate.value === item.value);
    const isCurrent = item.value === this.value;
    return html`
      <button
        aria-selected=${String(isCurrent)}
        class="item"
        data-active=${String(index === this.activeIndex)}
        data-index=${String(index)}
        id=${this.getOptionId(index)}
        part="item"
        role="option"
        type="button"
        ?disabled=${Boolean(item.disabled)}
        @click=${() => this.selectItem(item)}
        @mouseenter=${() => {
          if (!item.disabled) {
            this.activeIndex = index;
          }
        }}
      >
        ${this.renderAvatar(item)}
        <span class="item-copy">
          <span class="item-label" part="item-label">${item.label}</span>
          ${item.description ? html`<span class="item-description" part="item-description">${item.description}</span>` : nothing}
          ${item.meta ? html`<span class="item-meta" part="item-meta">${item.meta}</span>` : nothing}
        </span>
        <span class="item-badges">
          ${isCurrent ? html`<span class="current-badge" part="current-badge">Current</span>` : nothing}
        </span>
      </button>
    `;
  }

  private renderAvatar(item?: WorkspaceSwitcherItem) {
    const initials = this.getInitials(item);
    return html`
      <span class="avatar" part="avatar" aria-hidden="true">
        ${item?.imageSrc ? html`<img alt="" src=${item.imageSrc} />` : initials}
      </span>
    `;
  }

  private handleTriggerClick = (): void => {
    if (!this.disabled) {
      this.open = !this.open;
    }
  };

  private handleSearchInput = (event: Event): void => {
    this.query = (event.currentTarget as HTMLInputElement).value;
  };

  private handleSearchKeyDown = (event: KeyboardEvent): void => {
    if (event.key === "Escape") {
      event.preventDefault();
      this.close({ restoreFocus: true });
      return;
    }

    if (!this.enabledIndexes.length) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      this.activeIndex = this.getNextEnabledIndex(1);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      this.activeIndex = this.getNextEnabledIndex(-1);
      return;
    }

    if (event.key === "Enter" && this.activeIndex >= 0) {
      event.preventDefault();
      const item = this.filteredItems[this.activeIndex];
      if (item && !item.disabled) {
        this.selectItem(item);
      }
    }
  };

  private selectItem(item: WorkspaceSwitcherItem): void {
    if (item.disabled) {
      return;
    }

    const changed = item.value !== this.value;
    this.value = item.value;
    this.close({ restoreFocus: true });

    const detail = {
      item,
      items: [...this.items],
      value: item.value
    };

    this.dispatchEvent(new CustomEvent<WorkspaceSwitcherSelectDetail>("select", { bubbles: true, composed: true, detail }));

    if (changed) {
      this.dispatchEvent(new CustomEvent<WorkspaceSwitcherSelectDetail>("input", { bubbles: true, composed: true, detail }));
      this.dispatchEvent(new CustomEvent<WorkspaceSwitcherSelectDetail>("change", { bubbles: true, composed: true, detail }));
    }
  }

  private normalizeActiveIndex(): void {
    const activeItem = this.filteredItems[this.activeIndex];
    if (activeItem && !activeItem.disabled) {
      return;
    }

    this.activeIndex = this.enabledIndexes[0] ?? -1;
  }

  private getNextEnabledIndex(direction: 1 | -1): number {
    if (!this.enabledIndexes.length) {
      return -1;
    }

    const currentPosition = this.enabledIndexes.indexOf(this.activeIndex);
    if (currentPosition < 0) {
      return this.enabledIndexes[0];
    }

    return this.enabledIndexes[(currentPosition + direction + this.enabledIndexes.length) % this.enabledIndexes.length];
  }

  private dispatchToggle(): void {
    this.dispatchEvent(
      new CustomEvent<{ open: boolean }>("toggle", {
        bubbles: true,
        composed: true,
        detail: { open: this.open }
      })
    );
  }

  private syncFloatingPosition(): void {
    const trigger = this.triggerElement;
    const panel = this.panelElement;

    if (!this.open || !trigger || !panel) {
      this.destroyFloatingPosition();
      return;
    }

    if (this.floatingPanel !== panel) {
      this.destroyFloatingPosition();
      const handle = attachFloatingPosition({
        floating: panel,
        placement: "bottom-start",
        reference: trigger
      });

      this.floatingCleanup = handle.cleanup;
      this.updateFloatingPosition = handle.update;
      this.floatingPanel = panel;
      return;
    }

    this.updateFloatingPosition?.();
  }

  private destroyFloatingPosition(): void {
    this.floatingCleanup?.();
    this.floatingCleanup = undefined;
    this.updateFloatingPosition = undefined;

    if (this.floatingPanel) {
      this.floatingPanel.style.position = "";
      this.floatingPanel.style.left = "";
      this.floatingPanel.style.top = "";
    }

    this.floatingPanel = null;
  }

  private bindGlobalListeners(): void {
    document.addEventListener("keydown", this.handleDocumentKeyDown);
    document.addEventListener("pointerdown", this.handleDocumentPointerDown);
  }

  private unbindGlobalListeners(): void {
    document.removeEventListener("keydown", this.handleDocumentKeyDown);
    document.removeEventListener("pointerdown", this.handleDocumentPointerDown);
  }

  private handleDocumentKeyDown = (event: KeyboardEvent): void => {
    if (event.key === "Escape" && this.open) {
      event.preventDefault();
      this.close({ restoreFocus: true });
    }
  };

  private handleDocumentPointerDown = (event: PointerEvent): void => {
    if (!this.open) {
      return;
    }

    if (!event.composedPath().includes(this)) {
      this.close();
    }
  };

  private get filteredItems(): WorkspaceSwitcherItem[] {
    const query = this.query.trim().toLowerCase();
    if (query === "") {
      return this.items;
    }

    return this.items.filter((item) => {
      const haystack = [
        item.label,
        item.description,
        item.meta,
        item.group,
        ...(item.keywords ?? [])
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }

  private get groupedItems(): Map<string, WorkspaceSwitcherItem[]> {
    const groups = new Map<string, WorkspaceSwitcherItem[]>();

    for (const item of this.filteredItems) {
      const key = item.group?.trim() ?? "";
      const existing = groups.get(key) ?? [];
      existing.push(item);
      groups.set(key, existing);
    }

    return groups;
  }

  private get selectedItem(): WorkspaceSwitcherItem | undefined {
    return this.items.find((item) => item.value === this.value);
  }

  private get enabledIndexes(): number[] {
    return this.filteredItems.map((item, index) => (item.disabled ? -1 : index)).filter((index) => index >= 0);
  }

  private get triggerElement(): HTMLElement | null {
    return this.renderRoot.querySelector('[part="trigger"]');
  }

  private get panelElement(): HTMLElement | null {
    return this.renderRoot.querySelector('[part="panel"]');
  }

  private get searchElement(): HTMLInputElement | null {
    return this.renderRoot.querySelector('[part="search"]');
  }

  private get activeOptionElement(): HTMLElement | null {
    return this.activeIndex >= 0 ? this.renderRoot.querySelector<HTMLElement>(`#${this.getOptionId(this.activeIndex)}`) : null;
  }

  private get activeOptionId(): string | undefined {
    return this.activeIndex >= 0 ? this.getOptionId(this.activeIndex) : undefined;
  }

  private getOptionId(index: number): string {
    return `${this.listboxId}-option-${index}`;
  }

  private getInitials(item?: WorkspaceSwitcherItem): string {
    const source = item?.label?.trim() || this.selectedItem?.label?.trim() || this.placeholder;
    const words = source
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2);

    if (words.length === 0) {
      return "?";
    }

    return words.map((word) => word.charAt(0)).join("").toUpperCase();
  }
}
