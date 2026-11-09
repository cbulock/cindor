import { css, html, LitElement } from "lit";

import { attachFloatingPosition } from "../shared/floating-position.js";
import { bridgeNativeEvent } from "../shared/native-events.js";

/** @fires {ToggleEvent} toggle - Fired after the popover opens or closes. */
export class CindorPopover extends LitElement {
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

    .panel {
      box-sizing: border-box;
      position: fixed;
      min-width: min(220px, calc(100vw - 16px));
      max-width: min(28rem, calc(100vw - 16px));
      max-height: calc(100vh - 16px);
      overflow: auto;
      padding: var(--space-4);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      background: var(--surface);
      color: var(--fg);
      box-shadow: var(--shadow-md);
      z-index: 20;
    }
  `;

  static properties = {
    open: { type: Boolean, reflect: true }
  };

  open = false;

  private floatingCleanup?: () => void;
  private floatingPanel: HTMLElement | null = null;
  private updateFloatingPosition?: () => void;

  protected override render() {
    return html`
      <details ?open=${this.open} @toggle=${this.handleToggle}>
        <summary part="trigger">
          <slot name="trigger"></slot>
        </summary>
        <div class="panel" part="panel">
          <slot></slot>
        </div>
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
    if (event.target === event.currentTarget) {
      this.open = (event.currentTarget as HTMLDetailsElement).open;
      bridgeNativeEvent(this, event);
    }
  };

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

  private get panelElement(): HTMLElement | null {
    return this.renderRoot.querySelector(".panel");
  }

  private get triggerElement(): HTMLElement | null {
    return this.renderRoot.querySelector("summary");
  }
}
