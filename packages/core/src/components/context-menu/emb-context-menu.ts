import { css, html, LitElement } from "lit";

/**
 * Right-click menu surface that composes Emberline menu primitives.
 *
 * @fires toggle - Fired when the menu opens or closes.
 *
 * @slot trigger - Element that receives context menu and keyboard-open interaction.
 * @slot - `emb-menu-item` children rendered inside the menu.
 */
export class EmbContextMenu extends LitElement {
  static styles = css`
    :host {
      display: inline-block;
    }

    .trigger {
      display: block;
      min-width: 0;
    }

    .menu {
      position: fixed;
      z-index: 30;
      opacity: 0;
      transform: translateY(-4px);
    }

    .menu[hidden] {
      display: none;
    }

    :host([open]) .menu {
      animation: emb-context-menu-enter var(--duration-base) var(--ease-out) forwards;
    }

    @keyframes emb-context-menu-enter {
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

  private anchorX = 0;
  private anchorY = 0;
  private restoreFocusTarget: HTMLElement | null = null;

  override connectedCallback(): void {
    super.connectedCallback();
    document.addEventListener("pointerdown", this.handleDocumentPointerDown, true);
    window.addEventListener("blur", this.handleWindowBlur);
    window.addEventListener("resize", this.handleViewportChange);
  }

  override disconnectedCallback(): void {
    document.removeEventListener("pointerdown", this.handleDocumentPointerDown, true);
    window.removeEventListener("blur", this.handleWindowBlur);
    window.removeEventListener("resize", this.handleViewportChange);
    super.disconnectedCallback();
  }

  close(): void {
    if (!this.open) {
      return;
    }

    this.open = false;
    this.dispatchToggleEvent();
    this.restoreFocusTarget?.focus();
  }

  openAt(x: number, y: number): void {
    this.anchorX = x;
    this.anchorY = y;

    if (!this.open) {
      this.open = true;
      this.dispatchToggleEvent();
    }

    this.requestUpdate();
  }

  protected override render() {
    return html`
      <div class="trigger" part="trigger" @contextmenu=${this.handleContextMenu} @keydown=${this.handleTriggerKeydown}>
        <slot name="trigger"></slot>
      </div>
      <emb-menu
        class="menu"
        part="menu"
        ?hidden=${!this.open}
        @keydown=${this.handleMenuKeydown}
        @menu-item-select=${this.handleMenuItemSelect}
      >
        <slot></slot>
      </emb-menu>
    `;
  }

  protected override updated(changedProperties: Map<string, unknown>): void {
    if (changedProperties.has("open") && this.open) {
      this.positionMenu();
      this.focusFirstItem();
      return;
    }

    if (this.open) {
      this.positionMenu();
    }
  }

  private handleContextMenu = (event: MouseEvent): void => {
    event.preventDefault();

    const path = event.composedPath();
    this.restoreFocusTarget =
      path.find((node): node is HTMLElement => node instanceof HTMLElement && node !== this && !this.shadowRoot?.contains(node)) ?? this.triggerElement;
    this.openAt(event.clientX, event.clientY);
  };

  private handleTriggerKeydown = (event: KeyboardEvent): void => {
    const isContextMenuKey = event.key === "ContextMenu" || (event.key === "F10" && event.shiftKey);
    if (!isContextMenuKey) {
      return;
    }

    event.preventDefault();
    this.restoreFocusTarget =
      event.composedPath().find((node): node is HTMLElement => node instanceof HTMLElement && node !== this && !this.shadowRoot?.contains(node)) ??
      this.triggerElement;

    const triggerRect = this.triggerElement?.getBoundingClientRect();
    this.openAt(triggerRect?.left ?? 16, triggerRect?.bottom ?? 16);
  };

  private handleMenuItemSelect = (): void => {
    this.close();
  };

  private handleMenuKeydown = (event: KeyboardEvent): void => {
    if (event.key !== "Escape") {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    this.close();
  };

  private handleDocumentPointerDown = (event: PointerEvent): void => {
    if (!this.open) {
      return;
    }

    if (event.composedPath().includes(this)) {
      return;
    }

    this.close();
  };

  private handleWindowBlur = (): void => {
    this.close();
  };

  private handleViewportChange = (): void => {
    if (this.open) {
      this.positionMenu();
    }
  };

  private positionMenu(): void {
    const menu = this.menuElement;
    if (!menu) {
      return;
    }

    const viewportPadding = 8;
    menu.style.left = "0px";
    menu.style.top = "0px";

    const rect = menu.getBoundingClientRect();
    const maxLeft = Math.max(viewportPadding, window.innerWidth - rect.width - viewportPadding);
    const maxTop = Math.max(viewportPadding, window.innerHeight - rect.height - viewportPadding);

    menu.style.left = `${clamp(this.anchorX, viewportPadding, maxLeft)}px`;
    menu.style.top = `${clamp(this.anchorY, viewportPadding, maxTop)}px`;
  }

  private focusFirstItem(): void {
    const firstItem = Array.from(this.querySelectorAll("emb-menu-item"))
      .find((item): item is HTMLElement => item instanceof HTMLElement && !item.hasAttribute("disabled"));

    firstItem?.focus();
  }

  private dispatchToggleEvent(): void {
    this.dispatchEvent(
      new CustomEvent("toggle", {
        bubbles: true,
        composed: true,
        detail: { open: this.open }
      })
    );
  }

  private get menuElement(): HTMLElement | null {
    return this.renderRoot.querySelector(".menu");
  }

  private get triggerElement(): HTMLElement | null {
    return this.renderRoot.querySelector(".trigger");
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
