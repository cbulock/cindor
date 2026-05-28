import { css, html, LitElement } from "lit";
import { ifDefined } from "lit/directives/if-defined.js";

import type { ButtonType, ButtonVariant } from "../button/cindor-button.js";
import { attachFloatingPosition } from "../shared/floating-position.js";

/**
 * Split button for a primary action plus related secondary menu actions.
 *
 * @slot - Primary button label content.
 * @slot start-icon - Leading icon content for the primary action.
 * @slot end-icon - Trailing icon content for the primary action.
 * @slot menu - One or more `cindor-menu-item` elements for secondary actions.
 * @slot menu-icon - Optional icon content for the menu trigger. Defaults to a chevron-down icon.
 *
 * @fires toggle - Fired when the secondary action menu opens or closes.
 * @fires click - Uses the native click event from the primary action button.
 */
export class CindorSplitButton extends LitElement {
  private static nextFormIdCounter = 0;

  static styles = css`
    :host {
      display: inline-flex;
      max-width: 100%;
    }

    .group {
      display: inline-flex;
      align-items: stretch;
      max-width: 100%;
    }

    cindor-button.primary {
      --cindor-button-border-start-start-radius: var(--radius-md);
      --cindor-button-border-start-end-radius: 0px;
      --cindor-button-border-end-start-radius: var(--radius-md);
      --cindor-button-border-end-end-radius: 0px;
    }

    details {
      position: relative;
      margin-inline-start: -1px;
    }

    summary {
      display: block;
      list-style: none;
      cursor: pointer;
    }

    summary::-webkit-details-marker {
      display: none;
    }

    summary cindor-button {
      --cindor-button-border-start-start-radius: 0px;
      --cindor-button-border-start-end-radius: var(--radius-md);
      --cindor-button-border-end-start-radius: 0px;
      --cindor-button-border-end-end-radius: var(--radius-md);
      --cindor-button-gap: 0;
      --cindor-button-padding-inline: var(--space-3);
      --cindor-button-icon-min-size: 44px;
      --cindor-button-min-width: 44px;
    }

    cindor-menu.menu {
      position: fixed;
      max-height: calc(100vh - 16px);
      z-index: 20;
      opacity: 0;
      transform: translateY(-4px);
    }

    details[open] cindor-menu.menu {
      animation: cindor-split-button-enter var(--duration-base) var(--ease-out) forwards;
    }

    @keyframes cindor-split-button-enter {
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
    disabled: { type: Boolean, reflect: true },
    menuLabel: { type: String, reflect: true, attribute: "menu-label" },
    open: { type: Boolean, reflect: true },
    type: { reflect: true },
    variant: { reflect: true }
  };

  /** Disables the primary action and secondary action menu trigger. */
  disabled = false;

  /** Accessible label applied to the secondary action menu trigger. */
  menuLabel = "More actions";

  /** Controls whether the secondary action menu is open. */
  open = false;

  /** Maps through to the primary native button type. */
  type: ButtonType = "button";

  /** Visual treatment shared by the primary action and menu trigger. */
  variant: ButtonVariant = "solid";

  private candidateFormId?: string;
  private floatingCleanup?: () => void;
  private floatingMenu: HTMLElement | null = null;
  private updateFloatingPosition?: () => void;

  override disconnectedCallback(): void {
    this.destroyFloatingPosition();
    super.disconnectedCallback();
  }

  override focus(options?: FocusOptions): void {
    this.primaryButton?.focus(options);
  }

  override click(): void {
    this.primaryButton?.click();
  }

  /** Opens the secondary action menu. */
  showMenu(): void {
    if (this.disabled) {
      return;
    }

    this.detailsElement?.setAttribute("open", "");
    this.open = true;
  }

  /** Closes the secondary action menu. */
  hideMenu(): void {
    this.detailsElement?.removeAttribute("open");
    this.open = false;
  }

  /** Toggles the secondary action menu. */
  toggleMenu(): void {
    if (this.open) {
      this.hideMenu();
      return;
    }

    this.showMenu();
  }

  protected override render() {
    return html`
      <div class="group" part="group">
        <cindor-button
          class="primary"
          part="primary-button"
          ?disabled=${this.disabled}
          form=${ifDefined(this.associatedFormId)}
          type=${this.type}
          variant=${this.variant}
        >
          <slot name="start-icon" slot="start-icon"></slot>
          <slot></slot>
          <slot name="end-icon" slot="end-icon"></slot>
        </cindor-button>
        <details ?open=${this.open} @toggle=${this.handleToggle}>
          <summary part="menu-trigger" @click=${this.handleSummaryClick}>
            <cindor-button
              aria-label=${ifDefined(this.menuLabel || undefined)}
              ?disabled=${this.disabled}
              ?icon-only=${true}
              type="button"
              variant=${this.variant}
            >
              <slot name="menu-icon">
                <cindor-icon name="chevron-down" size="16"></cindor-icon>
              </slot>
            </cindor-button>
          </summary>
          <cindor-menu class="menu" part="menu" @menu-item-select=${this.handleItemSelect}>
            <slot name="menu"></slot>
          </cindor-menu>
        </details>
      </div>
    `;
  }

  protected override updated(): void {
    this.syncMenuA11y();
    this.syncFloatingPosition();
  }

  private handleItemSelect = (): void => {
    this.hideMenu();
  };

  private handleSummaryClick = (event: MouseEvent): void => {
    if (!this.disabled) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
  };

  private handleToggle = (event: Event): void => {
    event.stopPropagation();

    const details = event.currentTarget as HTMLDetailsElement;
    if (this.disabled && details.open) {
      details.open = false;
      this.open = false;
      return;
    }

    this.open = details.open;
    this.dispatchEvent(new Event("toggle", { bubbles: true, composed: true }));
  };

  private syncFloatingPosition(): void {
    const trigger = this.summaryElement;
    const menu = this.menuElement;

    if (!this.open || !trigger || !menu) {
      this.destroyFloatingPosition();
      return;
    }

    if (this.floatingMenu !== menu) {
      this.destroyFloatingPosition();
      const handle = attachFloatingPosition({
        floating: menu,
        placement: "bottom-end",
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

  private syncMenuA11y(): void {
    const menu = this.menuElement;
    if (!menu) {
      return;
    }

    syncA11yAttribute(this, menu, "aria-label");
    syncA11yAttribute(this, menu, "aria-labelledby");
    syncA11yAttribute(this, menu, "aria-describedby");
  }

  private get menuElement(): HTMLElement | null {
    return this.renderRoot.querySelector("cindor-menu");
  }

  private get associatedForm(): HTMLFormElement | null {
    const explicitFormId = this.getAttribute("form");
    if (explicitFormId) {
      const explicitForm = this.ownerDocument.getElementById(explicitFormId);
      return explicitForm instanceof HTMLFormElement ? explicitForm : null;
    }

    return this.closest("form");
  }

  private get associatedFormId(): string | undefined {
    const form = this.associatedForm;
    if (!form) {
      return undefined;
    }

    if (!form.id) {
      this.candidateFormId ||= `cindor-split-button-form-${CindorSplitButton.nextFormIdCounter++}`;
      form.id = this.candidateFormId;
    }

    return form.id;
  }

  private get primaryButton(): HTMLElement | null {
    return this.renderRoot.querySelector("cindor-button.primary");
  }

  private get summaryElement(): HTMLElement | null {
    return this.renderRoot.querySelector("summary");
  }

  private get detailsElement(): HTMLDetailsElement | null {
    return this.renderRoot.querySelector("details");
  }
}

function syncA11yAttribute(source: Element, target: Element, attribute: "aria-describedby" | "aria-label" | "aria-labelledby"): void {
  const value = source.getAttribute(attribute);
  if (value === null || value === "") {
    target.removeAttribute(attribute);
    return;
  }

  target.setAttribute(attribute, value);
}
