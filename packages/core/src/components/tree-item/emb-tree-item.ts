import { css, html, LitElement } from "lit";

/**
 * Hierarchical item used inside {@link EmbTreeView}.
 *
 * Set `label` for the visible row text and nest additional `emb-tree-item`
 * elements in the default slot to create branches.
 *
 * @fires toggle - Fired when the expanded branch state changes.
 * @fires tree-item-select - Fired when the row is activated.
 *
 * @slot start - Optional leading decoration for the tree row.
 * @slot - Nested child `emb-tree-item` elements for branch content.
 */
export class EmbTreeItem extends LitElement {
  static styles = css`
    :host {
      display: block;
      color: var(--fg);
    }

    .branch {
      display: grid;
      gap: var(--space-1);
    }

    .row {
      display: grid;
      grid-template-columns: 1.25rem minmax(0, 1fr);
      align-items: center;
      gap: var(--space-1);
      min-width: 0;
    }

    .toggle,
    .item {
      font: inherit;
      color: inherit;
    }

    .toggle {
      display: inline-grid;
      place-items: center;
      width: 1.25rem;
      height: 1.25rem;
      padding: 0;
      border: 0;
      border-radius: var(--radius-sm);
      background: transparent;
      cursor: pointer;
    }

    .toggle:hover:not(:disabled),
    .item:hover:not(:disabled) {
      background: var(--bg-subtle);
    }

    .toggle:focus-visible,
    .item:focus-visible {
      outline: none;
      box-shadow: var(--ring-focus);
    }

    .toggle:disabled {
      cursor: default;
      opacity: 0.48;
    }

    .chevron {
      font-size: 0.75rem;
      line-height: 1;
      transition: transform var(--duration-base) var(--ease-out);
    }

    :host([expanded]) .chevron {
      transform: rotate(90deg);
    }

    .spacer {
      display: block;
      width: 1.25rem;
      height: 1.25rem;
    }

    .item {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      min-width: 0;
      min-height: 2rem;
      padding: var(--space-2) var(--space-3);
      border: 0;
      border-radius: var(--radius-md);
      background: transparent;
      text-align: start;
      cursor: pointer;
    }

    .item[aria-selected="true"] {
      background: color-mix(in srgb, var(--accent) 12%, transparent);
      color: var(--fg);
      font-weight: var(--weight-medium);
    }

    .item:disabled {
      color: var(--fg-subtle);
      cursor: not-allowed;
    }

    .start {
      display: inline-flex;
      align-items: center;
      color: var(--fg-muted);
    }

    .label {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .children {
      display: grid;
      gap: var(--space-1);
      margin-inline-start: calc(1.25rem + var(--space-2));
      padding-inline-start: var(--space-3);
      border-inline-start: 1px solid color-mix(in srgb, var(--border) 70%, transparent);
    }

    .children[hidden] {
      display: none;
    }
  `;

  static properties = {
    disabled: { type: Boolean, reflect: true },
    expanded: { type: Boolean, reflect: true },
    label: { reflect: true },
    selected: { type: Boolean, reflect: true },
    value: { reflect: true }
  };

  disabled = false;
  expanded = false;
  label = "";
  selected = false;
  value = "";

  private hasChildren = false;

  override connectedCallback(): void {
    super.connectedCallback();
    this.hasChildren = this.nestedTreeItems.length > 0;
  }

  override click(): void {
    this.buttonElement?.click();
  }

  override focus(options?: FocusOptions): void {
    this.buttonElement?.focus(options);
  }

  toggle(expanded?: boolean): void {
    if (!this.hasChildren) {
      return;
    }

    const nextExpanded = expanded ?? !this.expanded;
    if (nextExpanded === this.expanded) {
      return;
    }

    this.expanded = nextExpanded;
    this.dispatchToggleEvent();
  }

  protected override updated(): void {
    this.syncButtonState();
  }

  protected override render() {
    return html`
      <div class="branch" part="branch">
        <div class="row" part="row">
          ${
            this.hasChildren
              ? html`
                  <button
                    aria-label=${this.expanded ? "Collapse branch" : "Expand branch"}
                    class="toggle"
                    part="toggle"
                    type="button"
                    ?disabled=${this.disabled}
                    @click=${this.handleToggleClick}
                  >
                    <span aria-hidden="true" class="chevron">▸</span>
                  </button>
                `
              : html`<span aria-hidden="true" class="spacer"></span>`
          }
          <button class="item" part="item" type="button" ?disabled=${this.disabled} @click=${this.handleItemClick}>
            <span class="start"><slot name="start"></slot></span>
            <span class="label">${this.label || this.value || "Untitled item"}</span>
          </button>
        </div>
        <div class="children" part="children" role="group" ?hidden=${!this.hasChildren || !this.expanded}>
          <slot @slotchange=${this.handleSlotChange}></slot>
        </div>
      </div>
    `;
  }

  private handleItemClick = (): void => {
    if (this.disabled) {
      return;
    }

    this.dispatchEvent(
      new CustomEvent("tree-item-select", {
        bubbles: true,
        composed: true,
        detail: { item: this }
      })
    );
  };

  private handleSlotChange = (): void => {
    this.syncChildren();
  };

  private handleToggleClick = (event: MouseEvent): void => {
    event.preventDefault();
    event.stopPropagation();
    this.toggle();
  };

  private syncButtonState(): void {
    const button = this.buttonElement;
    if (!button) {
      return;
    }

    button.setAttribute("aria-selected", String(this.selected));

    if (this.hasChildren) {
      button.setAttribute("aria-expanded", String(this.expanded));
    } else {
      button.removeAttribute("aria-expanded");
    }
  }

  private syncChildren(): void {
    const nextHasChildren = this.nestedTreeItems.length > 0;
    if (this.hasChildren === nextHasChildren) {
      return;
    }

    this.hasChildren = nextHasChildren;
    if (!this.hasChildren) {
      this.expanded = false;
    }
    this.requestUpdate();
  }

  private dispatchToggleEvent(): void {
    this.dispatchEvent(
      new CustomEvent("toggle", {
        bubbles: true,
        composed: true,
        detail: { expanded: this.expanded, item: this }
      })
    );
  }

  private get nestedTreeItems(): EmbTreeItem[] {
    return Array.from(this.children).filter((child): child is EmbTreeItem => child instanceof EmbTreeItem);
  }

  private get buttonElement(): HTMLButtonElement | null {
    return this.renderRoot.querySelector(".item");
  }
}
