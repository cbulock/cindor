import { css, html, LitElement } from "lit";

import { renderLucideIcon } from "../icon/lucide.js";

export class EmbDialog extends LitElement {
  static styles = css`
    :host {
      display: contents;
    }

    dialog {
      min-width: min(90vw, 480px);
      padding: var(--space-5);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      background: var(--surface);
      color: var(--fg);
      box-shadow: var(--shadow-lg);
    }

    dialog::backdrop {
      background: rgb(15 14 12 / 45%);
      backdrop-filter: blur(2px);
    }

    .surface {
      position: relative;
      display: grid;
      gap: var(--space-4);
      padding-inline-end: calc(1rem + var(--space-3));
    }

    .close-button {
      position: absolute;
      inset-block-start: 0;
      inset-inline-end: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      inline-size: 2rem;
      block-size: 2rem;
      padding: 0;
      border: 0;
      border-radius: var(--radius-sm);
      background: transparent;
      color: var(--fg-muted);
      cursor: pointer;
      transition:
        background var(--duration-base) var(--ease-out),
        color var(--duration-base) var(--ease-out),
        transform var(--duration-base) var(--ease-out);
    }

    .close-button:hover {
      background: var(--bg-subtle);
      color: var(--fg);
      transform: scale(1.05);
    }

    .close-button:focus-visible {
      outline: none;
      box-shadow: var(--ring-focus);
    }

    .close-button:active {
      transform: scale(0.98);
    }

    .close-icon {
      display: block;
      inline-size: 1rem;
      block-size: 1rem;
    }
  `;

  static properties = {
    modal: { type: Boolean, reflect: true },
    open: { type: Boolean, reflect: true }
  };

  modal = true;
  open = false;

  private ignoreDialogClose = false;
  private presentedModal: boolean | null = null;

  override focus(options?: FocusOptions): void {
    this.dialogElement?.focus(options);
  }

  close(returnValue?: string): void {
    const dialog = this.dialogElement;
    if (!dialog) {
      return;
    }

    if (typeof dialog.close === "function") {
      dialog.close(returnValue);
    } else {
      dialog.removeAttribute("open");
    }

    this.open = false;
  }

  show(): void {
    this.modal = false;
    this.open = true;
  }

  showModal(): void {
    this.modal = true;
    this.open = true;
  }

  protected override firstUpdated(): void {
    this.syncOpenState();
  }

  protected override render() {
    return html`
      <dialog part="dialog" @close=${this.handleClose} @cancel=${this.handleCancel}>
        <div class="surface">
          <button class="close-button" part="close-button" type="button" aria-label="Close dialog" @click=${this.handleDismiss}>
            ${renderLucideIcon({
              name: "x",
              size: 16,
              attributes: {
                class: "close-icon",
                part: "close-icon"
              }
            })}
          </button>
          <slot></slot>
        </div>
      </dialog>
    `;
  }

  protected override updated(changedProperties: Map<PropertyKey, unknown>): void {
    if (changedProperties.has("open") || changedProperties.has("modal")) {
      this.syncOpenState();
    }
  }

  private handleCancel = (event: Event): void => {
    event.stopPropagation();
    this.open = false;
    this.dispatchEvent(new Event("cancel", { bubbles: true, composed: true }));
  };

  private handleClose = (event: Event): void => {
    event.stopPropagation();
    if (this.ignoreDialogClose) {
      return;
    }

    this.open = false;
    this.presentedModal = null;
    this.dispatchEvent(new Event("close", { bubbles: true, composed: true }));
  };

  private handleDismiss = (): void => {
    this.close();
  };

  private syncOpenState(): void {
    const dialog = this.dialogElement;
    if (!dialog) {
      return;
    }

    if (this.open) {
      if (dialog.hasAttribute("open") && this.presentedModal === this.modal) {
        return;
      }

      if (dialog.hasAttribute("open")) {
        this.ignoreDialogClose = true;
        if (typeof dialog.close === "function") {
          dialog.close();
        } else {
          dialog.removeAttribute("open");
        }
        this.ignoreDialogClose = false;
      }

      if (this.modal && typeof dialog.showModal === "function") {
        dialog.showModal();
      } else if (typeof dialog.show === "function") {
        dialog.show();
      } else {
        dialog.setAttribute("open", "");
      }

      this.presentedModal = this.modal;
      return;
    }

    if (!dialog.hasAttribute("open")) {
      return;
    }

    if (typeof dialog.close === "function") {
      dialog.close();
    } else {
      dialog.removeAttribute("open");
    }

    this.presentedModal = null;
  }

  private get dialogElement(): HTMLDialogElement | null {
    return this.renderRoot.querySelector("dialog");
  }
}
