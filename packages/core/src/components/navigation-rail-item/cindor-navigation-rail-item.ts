import { css, html, LitElement, nothing } from "lit";

/**
 * Compact icon-and-label row used inside {@link CindorNavigationRail}.
 *
 * @slot start - Leading icon or badge.
 * @slot - Optional label content.
 */
export class CindorNavigationRailItem extends LitElement {
  static styles = css`
    :host {
      display: block;
      color: var(--fg);
    }

    .item {
      display: grid;
      justify-items: center;
      gap: var(--space-1);
      min-width: 4.5rem;
      padding: var(--space-3) var(--space-2);
      border: 0;
      border-radius: var(--radius-lg);
      background: transparent;
      color: inherit;
      text-decoration: none;
      font: inherit;
      cursor: pointer;
      text-align: center;
    }

    .item:hover:not([aria-disabled="true"]):not(:disabled) {
      background: var(--bg-subtle);
    }

    .item:focus-visible {
      outline: none;
      box-shadow: var(--ring-focus);
    }

    .item[aria-current="page"] {
      background: color-mix(in srgb, var(--accent) 14%, transparent);
      color: var(--fg);
      font-weight: var(--weight-medium);
    }

    .item[aria-disabled="true"] {
      color: var(--fg-subtle);
      cursor: not-allowed;
    }

    .icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 1.5rem;
      color: var(--fg-muted);
    }

    .label {
      font-size: var(--text-xs);
      line-height: 1.3;
    }
  `;

  static properties = {
    current: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    href: { reflect: true },
    label: { reflect: true },
    rel: { reflect: true },
    target: { reflect: true },
    value: { reflect: true }
  };

  current = false;
  disabled = false;
  href = "";
  label = "";
  rel = "";
  target = "";
  value = "";

  override click(): void {
    this.controlElement?.click();
  }

  override focus(options?: FocusOptions): void {
    this.controlElement?.focus(options);
  }

  protected override render() {
    const body = html`
      <span class="icon" part="icon"><slot name="start"></slot></span>
      <span class="label" part="label"><slot>${this.label || this.value || "Untitled"}</slot></span>
    `;

    return this.href !== ""
      ? html`
          <a
            class="item"
            part="item"
            aria-current=${this.current ? "page" : nothing}
            aria-disabled=${this.disabled ? "true" : nothing}
            href=${this.href}
            rel=${this.rel || nothing}
            tabindex=${this.disabled ? -1 : 0}
            target=${this.target || nothing}
            @click=${this.handleLinkClick}
          >
            ${body}
          </a>
        `
      : html`
          <button class="item" part="item" type="button" ?disabled=${this.disabled} @click=${this.handleClick}>
            ${body}
          </button>
        `;
  }

  private handleClick = (): void => {
    if (this.disabled) {
      return;
    }

    this.dispatchEvent(
      new CustomEvent("navigation-rail-select", {
        bubbles: true,
        composed: true,
        detail: { item: this, value: this.value || this.label }
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

  private get controlElement(): HTMLAnchorElement | HTMLButtonElement | null {
    return this.renderRoot.querySelector(".item");
  }
}
