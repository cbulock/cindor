import { css, html, LitElement, nothing } from "lit";

import { attachFloatingPosition } from "../shared/floating-position.js";

export class EmbTooltip extends LitElement {
  static styles = css`
    :host {
      display: inline-block;
    }

    .trigger {
      display: inline-flex;
    }

    .bubble {
      position: fixed;
      min-width: max-content;
      max-width: 240px;
      padding: var(--space-2) var(--space-3);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      background: var(--surface-inverse);
      color: var(--bg);
      font-size: var(--text-xs);
      box-shadow: var(--shadow-sm);
      white-space: nowrap;
      z-index: 10;
    }
  `;

  static properties = {
    open: { type: Boolean, reflect: true },
    text: { reflect: true }
  };

  open = false;
  text = "";

  private floatingBubble: HTMLElement | null = null;
  private floatingCleanup?: () => void;
  private updateFloatingPosition?: () => void;

  protected override render() {
    return html`
      <span
        class="trigger"
        tabindex="0"
        @mouseenter=${this.show}
        @mouseleave=${this.hide}
        @focusin=${this.show}
        @focusout=${this.hide}
      >
        <slot></slot>
      </span>
      ${this.open ? html`<span class="bubble" part="tooltip" role="tooltip">${this.text}</span>` : nothing}
    `;
  }

  protected override updated(): void {
    this.syncFloatingPosition();
  }

  override disconnectedCallback(): void {
    this.destroyFloatingPosition();
    super.disconnectedCallback();
  }

  private show = (): void => {
    this.open = true;
  };

  private hide = (): void => {
    this.open = false;
  };

  private syncFloatingPosition(): void {
    const bubble = this.bubbleElement;
    const trigger = this.triggerElement;

    if (!this.open || !bubble || !trigger) {
      this.destroyFloatingPosition();
      return;
    }

    if (this.floatingBubble !== bubble) {
      this.destroyFloatingPosition();
      const handle = attachFloatingPosition({
        floating: bubble,
        placement: "top",
        reference: trigger
      });

      this.floatingCleanup = handle.cleanup;
      this.updateFloatingPosition = handle.update;
      this.floatingBubble = bubble;
      return;
    }

    this.updateFloatingPosition?.();
  }

  private destroyFloatingPosition(): void {
    this.floatingCleanup?.();
    this.floatingCleanup = undefined;
    this.updateFloatingPosition = undefined;

    if (this.floatingBubble) {
      this.floatingBubble.style.position = "";
      this.floatingBubble.style.left = "";
      this.floatingBubble.style.top = "";
    }

    this.floatingBubble = null;
  }

  private get bubbleElement(): HTMLElement | null {
    return this.renderRoot.querySelector(".bubble");
  }

  private get triggerElement(): HTMLElement | null {
    return this.renderRoot.querySelector(".trigger");
  }
}
