import { css, html, LitElement, nothing } from "lit";

/**
 * Navigable row used inside {@link EmbSideNav}.
 *
 * Set `href` to render the row as a link, or omit it to render a button-like
 * item that can toggle its nested children.
 *
 * @fires toggle - Fired when the expanded branch state changes.
 * @fires side-nav-select - Fired when a non-link leaf item is activated.
 *
 * @slot start - Optional leading decoration such as an icon.
 * @slot - Nested child `emb-side-nav-item` elements.
 */
export class EmbSideNavItem extends LitElement {
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
    .item:hover:not([aria-disabled="true"]):not(:disabled) {
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
      min-height: 2.25rem;
      padding: var(--space-2) var(--space-3);
      border: 0;
      border-radius: var(--radius-md);
      background: transparent;
      color: inherit;
      text-align: start;
      text-decoration: none;
      cursor: pointer;
    }

    .item[aria-current="page"] {
      background: color-mix(in srgb, var(--accent) 12%, transparent);
      color: var(--fg);
      font-weight: var(--weight-medium);
    }

    .item[aria-disabled="true"] {
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
    current: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    expanded: { type: Boolean, reflect: true },
    href: { reflect: true },
    label: { reflect: true },
    rel: { reflect: true },
    target: { reflect: true },
    value: { reflect: true }
  };

  current = false;
  disabled = false;
  expanded = false;
  href = "";
  label = "";
  rel = "";
  target = "";
  value = "";

  private hasChildren = false;

  override connectedCallback(): void {
    super.connectedCallback();
    this.hasChildren = this.nestedItems.length > 0;
  }

  override click(): void {
    this.itemElement?.click();
  }

  override focus(options?: FocusOptions): void {
    this.itemElement?.focus(options);
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

  protected override render() {
    const commonLabel = html`
      <span class="start"><slot name="start"></slot></span>
      <span class="label">${this.label || this.value || "Untitled item"}</span>
    `;

    return html`
      <div class="branch" part="branch">
        <div class="row" part="row">
          ${this.hasChildren
            ? html`
                <button
                  aria-label=${this.expanded ? "Collapse section" : "Expand section"}
                  class="toggle"
                  part="toggle"
                  type="button"
                  ?disabled=${this.disabled}
                  @click=${this.handleToggleClick}
                >
                  <span aria-hidden="true" class="chevron">▸</span>
                </button>
              `
            : html`<span aria-hidden="true" class="spacer"></span>`}
          ${this.href !== ""
            ? html`
                <a
                  class="item"
                  part="item"
                  aria-current=${this.current ? "page" : nothing}
                  aria-disabled=${this.disabled ? "true" : nothing}
                  aria-expanded=${this.hasChildren ? String(this.expanded) : nothing}
                  href=${this.href}
                  rel=${this.rel || nothing}
                  tabindex=${this.disabled ? -1 : 0}
                  target=${this.target || nothing}
                  @click=${this.handleLinkClick}
                >
                  ${commonLabel}
                </a>
              `
            : html`
                <button
                  class="item"
                  part="item"
                  aria-current=${this.current ? "page" : nothing}
                  aria-expanded=${this.hasChildren ? String(this.expanded) : nothing}
                  type="button"
                  ?disabled=${this.disabled}
                  @click=${this.handleButtonClick}
                >
                  ${commonLabel}
                </button>
              `}
        </div>
        <div class="children" part="children" ?hidden=${!this.hasChildren || !this.expanded}>
          <slot @slotchange=${this.handleSlotChange}></slot>
        </div>
      </div>
    `;
  }

  private handleButtonClick = (): void => {
    if (this.disabled) {
      return;
    }

    if (this.hasChildren) {
      this.toggle();
      return;
    }

    this.dispatchEvent(
      new CustomEvent("side-nav-select", {
        bubbles: true,
        composed: true,
        detail: { item: this, label: this.label, value: this.value || this.label }
      })
    );
  };

  private handleLinkClick = (event: MouseEvent): void => {
    if (!this.disabled) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
  };

  private handleSlotChange = (): void => {
    const nextHasChildren = this.nestedItems.length > 0;
    if (this.hasChildren === nextHasChildren) {
      return;
    }

    this.hasChildren = nextHasChildren;
    if (!this.hasChildren) {
      this.expanded = false;
    }

    this.requestUpdate();
  };

  private handleToggleClick = (event: MouseEvent): void => {
    event.preventDefault();
    event.stopPropagation();
    this.toggle();
  };

  private dispatchToggleEvent(): void {
    this.dispatchEvent(
      new CustomEvent("toggle", {
        bubbles: true,
        composed: true,
        detail: { expanded: this.expanded, item: this }
      })
    );
  }

  private get itemElement(): HTMLAnchorElement | HTMLButtonElement | null {
    return this.renderRoot.querySelector(".item");
  }

  private get nestedItems(): EmbSideNavItem[] {
    return Array.from(this.children).filter((child): child is EmbSideNavItem => child instanceof EmbSideNavItem);
  }
}
