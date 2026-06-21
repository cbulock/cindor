import { css, html, LitElement } from "lit";

import type { ShowToastOptions, ToastContent, ToastPlacement } from "./toast-manager.js";

type ManagedToastRecord = {
  closeHandler: EventListener;
  timeoutId?: number;
  toast: HTMLElement;
};

export class CindorToastRegion extends LitElement {
  static styles = css`
    :host {
      position: fixed;
      z-index: 50;
      display: block;
      max-inline-size: min(420px, calc(100vw - (var(--space-4) * 2)));
      pointer-events: none;
    }

    :host([placement^="top"]) {
      inset-block-start: var(--space-4);
    }

    :host([placement^="bottom"]) {
      inset-block-end: var(--space-4);
    }

    :host([placement$="start"]) {
      inset-inline-start: var(--space-4);
    }

    :host([placement$="end"]) {
      inset-inline-end: var(--space-4);
    }

    .stack {
      display: grid;
      gap: var(--space-3);
    }

    ::slotted(cindor-toast) {
      display: block;
      max-inline-size: 100%;
      pointer-events: auto;
    }
  `;

  static properties = {
    maxVisible: { type: Number, reflect: true, attribute: "max-visible" },
    placement: { reflect: true }
  };

  private static nextId = 0;

  /** Maximum number of visible managed toasts before the oldest is removed. */
  maxVisible = 5;

  /** Fixed viewport placement for the toast stack. */
  placement: ToastPlacement = "top-end";

  private managedToasts = new Map<string, ManagedToastRecord>();

  clear(): void {
    for (const id of Array.from(this.managedToasts.keys())) {
      this.removeToastById(id);
    }
  }

  /** Dismisses a managed toast by id. */
  dismissToast(id: string): boolean {
    if (!this.managedToasts.has(id)) {
      return false;
    }

    this.removeToastById(id);
    return true;
  }

  showToast(options: ShowToastOptions): string {
    const id = options.id || `cindor-toast-${CindorToastRegion.nextId++}`;
    const existingRecord = this.managedToasts.get(id);
    const toast = existingRecord?.toast ?? document.createElement("cindor-toast");
    const tone = options.tone ?? "neutral";
    const dismissible = options.dismissible ?? true;
    const duration = options.duration ?? 5000;

    toast.setAttribute("data-toast-id", id);
    this.applyToastOptions(toast, { content: options.content, dismissible, tone });

    if (!existingRecord) {
      this.append(toast);
      this.pruneOverflow();
    } else {
      this.append(toast);
      if (existingRecord.timeoutId !== undefined) {
        window.clearTimeout(existingRecord.timeoutId);
      }
      toast.removeEventListener("close", existingRecord.closeHandler);
    }

    const closeHandler = () => {
      this.removeToastById(id);
    };

    toast.addEventListener("close", closeHandler, { once: true });
    const timeoutId = this.scheduleToastRemoval(id, duration);
    this.managedToasts.set(id, { closeHandler, timeoutId, toast });
    this.dispatchEvent(new CustomEvent("toast-show", { detail: { id, tone }, bubbles: true, composed: true }));

    return id;
  }

  protected override render() {
    return html`<div class="stack" part="stack"><slot></slot></div>`;
  }

  override disconnectedCallback(): void {
    this.clear();
    super.disconnectedCallback();
  }

  private assignToastContent(toast: HTMLElement, content: ToastContent): void {
    toast.replaceChildren();

    if (typeof content === "string") {
      toast.textContent = content;
      return;
    }

    toast.append(content);
  }

  private applyToastOptions(
    toast: HTMLElement,
    options: {
      content: ToastContent;
      dismissible: boolean;
      tone: NonNullable<ShowToastOptions["tone"]>;
    }
  ): void {
    toast.setAttribute("tone", options.tone);

    if (options.dismissible) {
      toast.setAttribute("dismissible", "");
    } else {
      toast.removeAttribute("dismissible");
    }

    this.assignToastContent(toast, options.content);
  }

  private scheduleToastRemoval(id: string, duration: number): number | undefined {
    if (duration <= 0) {
      return undefined;
    }

    return window.setTimeout(() => {
      const currentToast = this.managedToasts.get(id)?.toast as (HTMLElement & { close?: () => void }) | undefined;

      if (typeof currentToast?.close === "function") {
        currentToast.close();
        return;
      }

      this.removeToastById(id);
    }, duration);
  }

  private pruneOverflow(): void {
    while (this.managedToasts.size >= this.maxVisible) {
      const oldestId = this.managedToasts.keys().next().value as string | undefined;

      if (!oldestId) {
        return;
      }

      this.removeToastById(oldestId);
    }
  }

  private removeToastById(id: string): void {
    const record = this.managedToasts.get(id);

    if (!record) {
      return;
    }

    if (record.timeoutId !== undefined) {
      window.clearTimeout(record.timeoutId);
    }

    record.toast.removeEventListener("close", record.closeHandler);
    record.toast.remove();
    this.managedToasts.delete(id);
    this.dispatchEvent(new CustomEvent("toast-remove", { detail: { id }, bubbles: true, composed: true }));
  }
}
