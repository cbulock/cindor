import { css, html, LitElement, nothing } from "lit";

import { attachFloatingPosition } from "../shared/floating-position.js";

export class CindorTooltip extends LitElement {
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

  private static nextId = 0;
  private floatingBubble: HTMLElement | null = null;
  private floatingCleanup?: () => void;
  private tooltipId = `cindor-tooltip-${CindorTooltip.nextId++}`;
  private triggerNode: HTMLElement | null = null;
  private updateFloatingPosition?: () => void;

  protected override render() {
    return html`
      <span class="trigger" part="trigger">
        <slot @slotchange=${this.handleSlotChange}></slot>
      </span>
      ${this.open ? html`<span class="bubble" part="tooltip" id=${this.tooltipId} role="tooltip">${this.text}</span>` : nothing}
    `;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    queueMicrotask(() => {
      this.syncTriggerNode();
    });
  }

  protected override firstUpdated(): void {
    this.syncTriggerNode();
  }

  protected override updated(): void {
    if (!this.triggerNode) {
      this.syncTriggerNode();
    }
    this.syncFloatingPosition();
    this.syncTriggerDescription();
  }

  override disconnectedCallback(): void {
    this.detachTriggerListeners();
    this.destroyFloatingPosition();
    super.disconnectedCallback();
  }

  private show = (): void => {
    this.open = true;
  };

  private hide = (): void => {
    this.open = false;
  };

  private handleSlotChange = (): void => {
    this.syncTriggerNode();
  };

  private handleTriggerKeyDown = (event: KeyboardEvent): void => {
    if (event.key === "Escape") {
      this.hide();
    }
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
    return this.triggerNode ?? this.renderRoot.querySelector(".trigger");
  }

  private detachTriggerListeners(): void {
    if (!this.triggerNode) {
      return;
    }

    this.triggerNode.removeEventListener("mouseenter", this.show);
    this.triggerNode.removeEventListener("mouseleave", this.hide);
    this.triggerNode.removeEventListener("focusin", this.show);
    this.triggerNode.removeEventListener("focusout", this.hide);
    this.triggerNode.removeEventListener("keydown", this.handleTriggerKeyDown);
    this.removeTooltipDescription(this.triggerNode);
    this.triggerNode = null;
  }

  private syncTriggerDescription(): void {
    if (!this.triggerNode) {
      return;
    }

    if (this.open && this.text) {
      this.writeTriggerDescriptionTokens([...this.getTriggerDescriptionTokens(this.triggerNode), this.tooltipId]);
      return;
    }

    this.removeTooltipDescription(this.triggerNode);
  }

  private syncTriggerNode(): void {
    const slot = this.renderRoot.querySelector("slot");
    const nextTrigger = slot?.assignedElements({ flatten: true }).find((element): element is HTMLElement => element instanceof HTMLElement) ?? null;

    if (nextTrigger === this.triggerNode) {
      this.syncTriggerDescription();
      return;
    }

    this.detachTriggerListeners();
    if (!nextTrigger) {
      return;
    }

    this.triggerNode = nextTrigger;
    this.triggerNode.addEventListener("mouseenter", this.show);
    this.triggerNode.addEventListener("mouseleave", this.hide);
    this.triggerNode.addEventListener("focusin", this.show);
    this.triggerNode.addEventListener("focusout", this.hide);
    this.triggerNode.addEventListener("keydown", this.handleTriggerKeyDown);
    this.syncTriggerDescription();
  }

  private getTriggerDescriptionTokens(trigger: HTMLElement): string[] {
    return (trigger.getAttribute("aria-describedby") ?? "")
      .split(/\s+/)
      .map((token) => token.trim())
      .filter((token) => token !== "" && token !== this.tooltipId);
  }

  private removeTooltipDescription(trigger: HTMLElement): void {
    this.writeTriggerDescriptionTokens(this.getTriggerDescriptionTokens(trigger));
  }

  private writeTriggerDescriptionTokens(tokens: string[]): void {
    if (!this.triggerNode) {
      return;
    }

    const uniqueTokens = Array.from(new Set(tokens));
    if (uniqueTokens.length === 0) {
      this.triggerNode.removeAttribute("aria-describedby");
      return;
    }

    this.triggerNode.setAttribute("aria-describedby", uniqueTokens.join(" "));
  }
}
