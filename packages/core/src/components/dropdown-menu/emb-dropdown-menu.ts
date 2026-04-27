import { css, html, LitElement } from "lit";

import { attachFloatingPosition } from "../shared/floating-position.js";

export class EmbDropdownMenu extends LitElement {
  static styles = css`
    :host {
      display: inline-block;
    }

    details {
      position: relative;
    }

    summary {
      list-style: none;
      cursor: pointer;
    }

    summary::-webkit-details-marker {
      display: none;
    }

    emb-menu.menu {
      position: fixed;
      z-index: 20;
      opacity: 0;
      transform: translateY(-4px);
    }

    details[open] emb-menu.menu {
      animation: emb-dropdown-menu-enter var(--duration-base) var(--ease-out) forwards;
    }

    @keyframes emb-dropdown-menu-enter {
      from {
        opacity: 0;
        transform: translateY(-4px);
      }

      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `;

  static properties = {
    open: { type: Boolean, reflect: true }
  };

  open = false;

  private floatingCleanup?: () => void;
  private floatingMenu: HTMLElement | null = null;
  private updateFloatingPosition?: () => void;

  protected override render() {
    return html`
      <details ?open=${this.open} @toggle=${this.handleToggle}>
        <summary part="trigger">
          <slot name="trigger"></slot>
        </summary>
        <emb-menu class="menu" part="menu" @menu-item-select=${this.handleItemSelect}>
          <slot></slot>
        </emb-menu>
      </details>
    `;
  }

  protected override updated(): void {
    this.syncFloatingPosition();
  }

  override disconnectedCallback(): void {
    this.destroyFloatingPosition();
    super.disconnectedCallback();
  }

  private handleToggle = (event: Event): void => {
    event.stopPropagation();
    const details = event.currentTarget as HTMLDetailsElement;
    this.open = details.open;
    this.dispatchEvent(new Event("toggle", { bubbles: true, composed: true }));
  };

  private syncFloatingPosition(): void {
    const trigger = this.triggerElement;
    const menu = this.menuElement;

    if (!this.open || !trigger || !menu) {
      this.destroyFloatingPosition();
      return;
    }

    if (this.floatingMenu !== menu) {
      this.destroyFloatingPosition();
      const handle = attachFloatingPosition({
        floating: menu,
        placement: "bottom-start",
        reference: trigger
      });

      this.floatingCleanup = handle.cleanup;
      this.updateFloatingPosition = handle.update;
      this.floatingMenu = menu;
      return;
    }

    this.updateFloatingPosition?.();
  }

  private destroyFloatingPosition(): void {
    this.floatingCleanup?.();
    this.floatingCleanup = undefined;
    this.updateFloatingPosition = undefined;

    if (this.floatingMenu) {
      this.floatingMenu.style.position = "";
      this.floatingMenu.style.left = "";
      this.floatingMenu.style.top = "";
    }

    this.floatingMenu = null;
  }

  private get menuElement(): HTMLElement | null {
    return this.renderRoot.querySelector("emb-menu");
  }

  private get triggerElement(): HTMLElement | null {
    return this.renderRoot.querySelector("summary");
  }

  private handleItemSelect = (): void => {
    this.detailsElement?.removeAttribute("open");
    this.open = false;
  };

  private get detailsElement(): HTMLDetailsElement | null {
    return this.renderRoot.querySelector("details");
  }
}
