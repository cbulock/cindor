import { css, html, LitElement } from "lit";

import type { ShowToastOptions, ToastContent, ToastPlacement } from "./toast-manager.js";

type ManagedToastRecord = {
  closeHandler: EventListener;
  timeoutId?: number;
  toast: HTMLElement;
};

export class EmbToastRegion extends LitElement {
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

    ::slotted(emb-toast) {
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

  maxVisible = 5;
  placement: ToastPlacement = "top-end";

  private managedToasts = new Map<string, ManagedToastRecord>();

  clear(): void {
    for (const id of Array.from(this.managedToasts.keys())) {
      this.removeToastById(id);
    }
  }

  dismissToast(id: string): boolean {
    if (!this.managedToasts.has(id)) {
      return false;
    }

    this.removeToastById(id);
    return true;
  }

  showToast(options: ShowToastOptions): string {
    const id = options.id || `emb-toast-${EmbToastRegion.nextId++}`;
    const toast = document.createElement("emb-toast");
    const tone = options.tone ?? "neutral";
    const dismissible = options.dismissible ?? true;
    const duration = options.duration ?? 5000;

    toast.setAttribute("data-toast-id", id);
    toast.setAttribute("tone", tone);

    if (dismissible) {
      toast.setAttribute("dismissible", "");
    }

    this.assignToastContent(toast, options.content);
    this.append(toast);
    this.pruneOverflow();

    const closeHandler = () => {
      this.removeToastById(id);
    };

    let timeoutId: number | undefined;
    if (duration > 0) {
      timeoutId = window.setTimeout(() => {
        const currentToast = this.managedToasts.get(id)?.toast as (HTMLElement & { close?: () => void }) | undefined;

        if (typeof currentToast?.close === "function") {
          currentToast.close();
          return;
        }

        this.removeToastById(id);
      }, duration);
    }

    toast.addEventListener("close", closeHandler, { once: true });
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
