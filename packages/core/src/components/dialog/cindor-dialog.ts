import { css, html, LitElement } from "lit";

import { normalizeA11yText, ReferencedTextObserver, resolveReferencedText, syncA11yMirror } from "../shared/a11y-mirror.js";

const managedA11yAttributes = ["aria-describedby", "aria-description", "aria-label", "aria-labelledby"] as const;
type ManagedA11yAttribute = (typeof managedA11yAttributes)[number];

export class CindorDialog extends LitElement {
  private static nextDialogId = 0;

  static override get observedAttributes(): string[] {
    return [...super.observedAttributes, ...managedA11yAttributes];
  }

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

    cindor-icon-button {
      position: absolute;
      inset-block-start: 0;
      inset-inline-end: 0;
      color: var(--fg-muted);
    }

    cindor-icon-button:hover {
      color: var(--fg);
      transform: scale(1.05);
    }

    cindor-icon-button:active {
      transform: scale(0.98);
    }
  `;

  static properties = {
    modal: { type: Boolean, reflect: true },
    open: { type: Boolean, reflect: true }
  };

  modal = true;
  open = false;

  private readonly generatedDialogId = `${this.localName}-${CindorDialog.nextDialogId++}`;
  private ignoreDialogClose = false;
  private hostAriaDescription = "";
  private hostAriaDescribedBy = "";
  private hostAriaLabel = "";
  private hostAriaLabelledBy = "";
  private managedA11yDirty = false;
  private presentedModal: boolean | null = null;
  private readonly referencedTextObserver = new ReferencedTextObserver(this, () => {
    this.requestUpdate();
  });
  private suppressManagedAttributeRemoval = false;

  override attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (this.suppressManagedAttributeRemoval && managedA11yAttributes.includes(name as ManagedA11yAttribute) && newValue === null) {
      return;
    }

    if (managedA11yAttributes.includes(name as ManagedA11yAttribute)) {
      this.syncManagedA11yState(name as ManagedA11yAttribute, newValue);
    }

    super.attributeChangedCallback(name, oldValue, newValue);
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.stripHostA11yAttributes();
    this.syncReferencedTextObserver();
  }

  override disconnectedCallback(): void {
    this.referencedTextObserver.disconnect();
    super.disconnectedCallback();
  }

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
    this.syncDialogA11y();
    this.syncOpenState();
  }

  protected override render() {
    return html`
      <dialog
        part="dialog"
        @close=${this.handleClose}
        @cancel=${this.handleCancel}
      >
        <div class="surface">
          <cindor-icon-button label="Close dialog" name="x" part="close-button" @click=${this.handleDismiss}></cindor-icon-button>
          <slot></slot>
        </div>
      </dialog>
    `;
  }

  protected override updated(changedProperties: Map<PropertyKey, unknown>): void {
    this.syncDialogA11y();
    if (changedProperties.has("open") || changedProperties.has("modal")) {
      this.syncOpenState();
    }

    if (this.managedA11yDirty) {
      this.stripHostA11yAttributes();
      this.managedA11yDirty = false;
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

  private syncDialogA11y(): void {
    const dialog = this.dialogElement;
    if (!dialog) {
      return;
    }

    const labelledByText = resolveReferencedText(this, this.hostAriaLabelledBy);
    const ariaLabel = normalizeA11yText(this.hostAriaLabel);
    if (labelledByText) {
      const labelId = syncA11yMirror(this.renderRoot, this.dialogA11yIdBase, "label", labelledByText);
      if (labelId) {
        dialog.setAttribute("aria-labelledby", labelId);
      }
      dialog.removeAttribute("aria-label");
    } else {
      syncA11yMirror(this.renderRoot, this.dialogA11yIdBase, "label", "");
      dialog.removeAttribute("aria-labelledby");
      if (ariaLabel) {
        dialog.setAttribute("aria-label", ariaLabel);
      } else {
        dialog.removeAttribute("aria-label");
      }
    }

    const describedByText = resolveReferencedText(this, this.hostAriaDescribedBy);
    const descriptionText = normalizeA11yText([this.hostAriaDescription, describedByText].filter((value) => value).join(" "));
    const descriptionId = syncA11yMirror(this.renderRoot, this.dialogA11yIdBase, "description", descriptionText);
    if (descriptionId) {
      dialog.setAttribute("aria-describedby", descriptionId);
    } else {
      dialog.removeAttribute("aria-describedby");
    }
  }

  private stripHostA11yAttributes(): void {
    if (!this.isConnected) {
      return;
    }

    this.suppressManagedAttributeRemoval = true;
    for (const attributeName of managedA11yAttributes) {
      this.removeAttribute(attributeName);
    }
    this.suppressManagedAttributeRemoval = false;
  }

  private get dialogA11yIdBase(): string {
    return `${this.id || this.generatedDialogId}-native-dialog`;
  }

  private syncManagedA11yState(name: ManagedA11yAttribute, value: string | null): void {
    const nextValue = value ?? "";
    switch (name) {
      case "aria-description":
        this.hostAriaDescription = nextValue;
        break;
      case "aria-describedby":
        this.hostAriaDescribedBy = nextValue;
        break;
      case "aria-label":
        this.hostAriaLabel = nextValue;
        break;
      case "aria-labelledby":
        this.hostAriaLabelledBy = nextValue;
        break;
    }

    this.managedA11yDirty = true;
    this.syncReferencedTextObserver();
    this.requestUpdate();
  }

  private syncReferencedTextObserver(): void {
    this.referencedTextObserver.observe(this.hostAriaLabelledBy, this.hostAriaDescribedBy);
  }
}
