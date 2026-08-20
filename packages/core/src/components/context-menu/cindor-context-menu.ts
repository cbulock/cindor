import { css, html, LitElement } from "lit";

/**
 * Right-click menu surface that composes Cindor menu primitives.
 *
 * @fires toggle - Fired when the menu opens or closes.
 *
 * @slot trigger - Element that receives context menu and keyboard-open interaction.
 * @slot - `cindor-menu-item` children rendered inside the menu.
 */
export class CindorContextMenu extends LitElement {
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
      animation: cindor-context-menu-enter var(--duration-base) var(--ease-out) forwards;
    }

    @keyframes cindor-context-menu-enter {
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
  private readonly menuId = `cindor-context-menu-menu-${++contextMenuId}`;
  private anchorY = 0;
  private restoreFocusTarget: HTMLElement | null = null;
  private synthesizedTriggerRole = false;
  private synthesizedTriggerTabindex = false;
  private triggerNode: HTMLElement | null = null;

  override connectedCallback(): void {
    super.connectedCallback();
    document.addEventListener("pointerdown", this.handleDocumentPointerDown, true);
    window.addEventListener("blur", this.handleWindowBlur);
    window.addEventListener("resize", this.handleViewportChange);
    queueMicrotask(() => {
      this.syncTriggerNode();
    });
  }

  override disconnectedCallback(): void {
    document.removeEventListener("pointerdown", this.handleDocumentPointerDown, true);
    window.removeEventListener("blur", this.handleWindowBlur);
    window.removeEventListener("resize", this.handleViewportChange);
    this.detachTriggerListeners();
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
      <div class="trigger" part="trigger">
        <slot name="trigger" @slotchange=${this.handleSlotChange}></slot>
      </div>
      <cindor-menu
        class="menu"
        id=${this.menuId}
        part="menu"
        ?hidden=${!this.open}
        @keydown=${this.handleMenuKeydown}
        @menu-item-select=${this.handleMenuItemSelect}
      >
        <slot></slot>
      </cindor-menu>
    `;
  }

  protected override updated(changedProperties: Map<string, unknown>): void {
    if (!this.triggerNode) {
      this.syncTriggerNode();
    }
    this.syncTriggerA11y();
    this.syncMenuA11y();
    if (changedProperties.has("open") && this.open) {
      this.positionMenu();
      this.focusFirstItem();
      return;
    }

    if (this.open) {
      this.positionMenu();
    }
  }

  private handleSlotChange = (): void => {
    this.syncTriggerNode();
  };

  private handleContextMenu = (event: MouseEvent): void => {
    event.preventDefault();

    const path = event.composedPath();
    this.restoreFocusTarget =
      path.find((node): node is HTMLElement => node instanceof HTMLElement && node !== this && !this.shadowRoot?.contains(node)) ?? this.triggerElement;
    this.openAt(event.clientX, event.clientY);
  };

  private handleTriggerKeydown = (event: KeyboardEvent): void => {
    const opensMenuWithKeyboard =
      event.key === "ContextMenu" || (event.key === "F10" && event.shiftKey) || event.key === "Enter" || event.key === " ";
    if (!opensMenuWithKeyboard) {
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

  private syncMenuA11y(): void {
    const menu = this.menuElement;
    if (!menu) {
      return;
    }

    syncA11yAttribute(this, menu, "aria-label");
    syncA11yAttribute(this, menu, "aria-labelledby");
    syncA11yAttribute(this, menu, "aria-describedby");
  }

  private syncTriggerA11y(): void {
    if (!this.triggerNode) {
      return;
    }

    this.triggerNode.setAttribute("aria-controls", this.menuId);
    this.triggerNode.setAttribute("aria-expanded", String(this.open));
    this.triggerNode.setAttribute("aria-haspopup", "menu");

    if (!isInteractiveElement(this.triggerNode)) {
      if (!this.triggerNode.hasAttribute("role")) {
        this.triggerNode.setAttribute("role", "button");
        this.synthesizedTriggerRole = true;
      }
      if (!this.triggerNode.hasAttribute("tabindex")) {
        this.triggerNode.setAttribute("tabindex", "0");
        this.synthesizedTriggerTabindex = true;
      }
    }
  }

  private focusFirstItem(): void {
    const firstItem = Array.from(this.querySelectorAll("cindor-menu-item"))
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
    return this.triggerNode ?? this.renderRoot.querySelector(".trigger");
  }

  private detachTriggerListeners(): void {
    if (!this.triggerNode) {
      return;
    }

    this.triggerNode.removeEventListener("contextmenu", this.handleContextMenu);
    this.triggerNode.removeEventListener("keydown", this.handleTriggerKeydown);
    this.triggerNode.removeAttribute("aria-controls");
    this.triggerNode.removeAttribute("aria-expanded");
    this.triggerNode.removeAttribute("aria-haspopup");
    if (this.synthesizedTriggerRole) {
      this.triggerNode.removeAttribute("role");
    }
    if (this.synthesizedTriggerTabindex) {
      this.triggerNode.removeAttribute("tabindex");
    }
    this.synthesizedTriggerRole = false;
    this.synthesizedTriggerTabindex = false;
    this.triggerNode = null;
  }

  private syncTriggerNode(): void {
    const slot = this.renderRoot.querySelector<HTMLSlotElement>('slot[name="trigger"]');
    const nextTrigger = slot?.assignedElements({ flatten: true }).find((element): element is HTMLElement => element instanceof HTMLElement) ?? null;

    if (nextTrigger === this.triggerNode) {
      this.syncTriggerA11y();
      return;
    }

    this.detachTriggerListeners();
    if (!nextTrigger) {
      return;
    }

    this.triggerNode = nextTrigger;
    nextTrigger.addEventListener("contextmenu", this.handleContextMenu);
    nextTrigger.addEventListener("keydown", this.handleTriggerKeydown);
    this.syncTriggerA11y();
  }
}

let contextMenuId = 0;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function syncA11yAttribute(source: Element, target: Element, attribute: "aria-describedby" | "aria-label" | "aria-labelledby"): void {
  const value = source.getAttribute(attribute);
  if (value === null || value === "") {
    target.removeAttribute(attribute);
    return;
  }

  target.setAttribute(attribute, value);
}

function isInteractiveElement(element: HTMLElement): boolean {
  if (element.matches('button, input, select, textarea, summary, a[href]')) {
    return true;
  }

  if (element.getAttribute("contenteditable") === "true") {
    return true;
  }

  const role = element.getAttribute("role");
  return role === "button" || role === "link" || role === "menuitem";
}
