import { css, html, LitElement, nothing } from "lit";
import { ifDefined } from "lit/directives/if-defined.js";

export type DrawerSide = "start" | "end";

export class CindorDrawer extends LitElement {
  static styles = css`
    :host {
      display: contents;
    }

    .backdrop {
      position: fixed;
      inset: 0;
      background: rgb(15 14 12 / 45%);
      z-index: 30;
      animation: cindor-drawer-backdrop-enter var(--duration-base) var(--ease-out);
    }

    aside {
      position: fixed;
      inset-block: 0;
      inline-size: min(420px, 90vw);
      padding: var(--space-5);
      background: var(--surface);
      color: var(--fg);
      box-shadow: var(--shadow-lg);
      z-index: 31;
      display: grid;
      grid-template-rows: auto 1fr;
      gap: var(--space-4);
      animation: cindor-drawer-enter-end var(--duration-base) var(--ease-out);
    }

    :host([side="start"]) aside {
      inset-inline-start: 0;
      border-inline-end: 1px solid var(--border);
      animation-name: cindor-drawer-enter-start;
    }

    :host([side="end"]) aside {
      inset-inline-end: 0;
      border-inline-start: 1px solid var(--border);
    }

    cindor-icon-button {
      justify-self: end;
      color: var(--fg-muted);
      transition:
        color var(--duration-base) var(--ease-out),
        transform var(--duration-base) var(--ease-out);
    }

    cindor-icon-button:hover {
      color: var(--fg);
      transform: rotate(90deg);
    }

    cindor-icon-button:active {
      transform: rotate(90deg) scale(0.96);
    }

    @keyframes cindor-drawer-backdrop-enter {
      from {
        opacity: 0;
      }

      to {
        opacity: 1;
      }
    }

    @keyframes cindor-drawer-enter-end {
      from {
        opacity: 0;
        transform: translateX(16px);
      }

      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    @keyframes cindor-drawer-enter-start {
      from {
        opacity: 0;
        transform: translateX(-16px);
      }

      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
  `;

  static properties = {
    open: { type: Boolean, reflect: true },
    side: { reflect: true }
  };

  open = false;
  side: DrawerSide = "end";

  private previousFocusedElement: HTMLElement | null = null;

  close = (): void => {
    this.open = false;
    this.dispatchEvent(new Event("close", { bubbles: true, composed: true }));
  };

  protected override updated(changedProperties: Map<PropertyKey, unknown>): void {
    if (changedProperties.has("open")) {
      if (this.open) {
        this.previousFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        queueMicrotask(() => {
          this.panelElement?.focus();
        });
        return;
      }

      this.previousFocusedElement?.focus();
      this.previousFocusedElement = null;
    }
  }

  protected override render() {
    if (!this.open) {
      return nothing;
    }

    return html`
      <div class="backdrop" part="backdrop" @click=${this.close}></div>
      <div
        part="panel"
        aria-describedby=${ifDefined(this.hostAriaDescribedBy)}
        aria-label=${ifDefined(this.hostAriaLabel)}
        aria-labelledby=${ifDefined(this.hostAriaLabelledBy)}
        aria-modal="true"
        role="dialog"
        tabindex="-1"
        @keydown=${this.handlePanelKeyDown}
      >
        <cindor-icon-button label="Close drawer" name="x" part="close-button" @click=${this.close}></cindor-icon-button>
        <slot></slot>
      </div>
    `;
  }

  private handlePanelKeyDown = (event: KeyboardEvent): void => {
    if (event.key === "Escape") {
      event.preventDefault();
      this.close();
      return;
    }

    if (event.key !== "Tab") {
      return;
    }

    const focusableElements = this.focusableElements;
    if (focusableElements.length === 0) {
      event.preventDefault();
      this.panelElement?.focus();
      return;
    }

    const shadowRoot = this.shadowRoot;
    const currentIndex = focusableElements.indexOf(shadowRoot?.activeElement as HTMLElement);
    const activeIndex = currentIndex >= 0 ? currentIndex : focusableElements.indexOf(document.activeElement as HTMLElement);

    if (event.shiftKey) {
      if (activeIndex <= 0) {
        event.preventDefault();
        focusableElements.at(-1)?.focus();
      }
      return;
    }

    if (activeIndex === focusableElements.length - 1) {
      event.preventDefault();
      focusableElements[0]?.focus();
    }
  };

  private get hostAriaDescribedBy(): string | undefined {
    return this.getAttribute("aria-describedby") ?? undefined;
  }

  private get hostAriaLabel(): string | undefined {
    return this.getAttribute("aria-label") ?? undefined;
  }

  private get hostAriaLabelledBy(): string | undefined {
    return this.getAttribute("aria-labelledby") ?? undefined;
  }

  private get focusableElements(): HTMLElement[] {
    const panel = this.panelElement;
    if (!panel) {
      return [];
    }

    return Array.from(
      panel.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    );
  }

  private get panelElement(): HTMLElement | null {
    return this.renderRoot.querySelector('[part="panel"]');
  }
}
