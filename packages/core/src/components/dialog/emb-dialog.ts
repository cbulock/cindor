import { css, html, LitElement } from "lit";
import { ifDefined } from "lit/directives/if-defined.js";

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

    emb-icon-button {
      position: absolute;
      inset-block-start: 0;
      inset-inline-end: 0;
      color: var(--fg-muted);
    }

    emb-icon-button:hover {
      color: var(--fg);
      transform: scale(1.05);
    }

    emb-icon-button:active {
      transform: scale(0.98);
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
      <dialog
        part="dialog"
        aria-describedby=${ifDefined(this.hostAriaDescribedBy)}
        aria-label=${ifDefined(this.hostAriaLabel)}
        aria-labelledby=${ifDefined(this.hostAriaLabelledBy)}
        @close=${this.handleClose}
        @cancel=${this.handleCancel}
      >
        <div class="surface">
          <emb-icon-button label="Close dialog" name="x" part="close-button" @click=${this.handleDismiss}></emb-icon-button>
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

  private get hostAriaDescribedBy(): string | undefined {
    return this.getAttribute("aria-describedby") ?? undefined;
  }

  private get hostAriaLabel(): string | undefined {
    return this.getAttribute("aria-label") ?? undefined;
  }

  private get hostAriaLabelledBy(): string | undefined {
    return this.getAttribute("aria-labelledby") ?? undefined;
  }
}
