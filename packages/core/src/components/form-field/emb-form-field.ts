import { css, html, LitElement, nothing } from "lit";

export class EmbFormField extends LitElement {
  static styles = css`
    :host {
      display: grid;
      gap: var(--space-2);
      width: var(--emb-field-inline-size, min(100%, 320px));
      max-width: 100%;
      min-width: 0;
      color: var(--fg);
    }

    .label-row {
      display: flex;
      align-items: baseline;
      gap: var(--space-1);
      min-width: 0;
    }

    label {
      color: var(--fg);
      font-size: var(--text-sm);
      font-weight: 600;
    }

    .required {
      color: var(--danger);
    }

    .control {
      min-width: 0;
      --emb-field-inline-size: 100%;
    }

    .control ::slotted(*) {
      box-sizing: border-box;
      display: block;
      width: 100% !important;
      min-width: 0;
      max-width: 100% !important;
    }
  `;

  static properties = {
    description: { reflect: true },
    error: { reflect: true },
    label: { reflect: true },
    required: { type: Boolean, reflect: true }
  };

  private static nextId = 0;

  description = "";
  error = "";
  label = "";
  required = false;

  private readonly fieldId = `emb-form-field-${EmbFormField.nextId++}`;
  private hasDescriptionSlot = false;
  private hasErrorSlot = false;
  private hasLabelSlot = false;

  protected override render() {
    const hasLabel = this.label !== "" || this.hasLabelSlot;
    const hasDescription = this.description !== "" || this.hasDescriptionSlot;
    const hasError = this.error !== "" || this.hasErrorSlot;

    return html`
      ${hasLabel
        ? html`
            <div class="label-row" part="label-row">
              <label id=${this.labelId} part="label">
                ${this.hasLabelSlot ? html`<slot name="label" @slotchange=${this.handleLabelSlotChange}></slot>` : this.label}
              </label>
              ${this.required ? html`<span class="required" part="required-indicator" aria-hidden="true">*</span>` : nothing}
            </div>
          `
        : html`<slot name="label" hidden @slotchange=${this.handleLabelSlotChange}></slot>`}
      <div class="control" part="control">
        <slot @slotchange=${this.handleControlSlotChange}></slot>
      </div>
      ${hasDescription
        ? html`
            <div id=${this.descriptionId} part="description">
              ${this.hasDescriptionSlot
                ? html`<slot name="description" @slotchange=${this.handleDescriptionSlotChange}></slot>`
                : this.description}
            </div>
          `
        : html`<slot name="description" hidden @slotchange=${this.handleDescriptionSlotChange}></slot>`}
      ${hasError
        ? html`
            <div id=${this.errorId} part="error">
              ${this.hasErrorSlot ? html`<slot name="error" @slotchange=${this.handleErrorSlotChange}></slot>` : this.error}
            </div>
          `
        : html`<slot name="error" hidden @slotchange=${this.handleErrorSlotChange}></slot>`}
    `;
  }

  protected override updated(): void {
    this.syncControlAssociations();
  }

  private handleControlSlotChange = (): void => {
    this.syncControlAssociations();
  };

  private handleDescriptionSlotChange = (): void => {
    this.hasDescriptionSlot = this.getAssignedElements("description").length > 0;
    this.syncControlAssociations();
  };

  private handleErrorSlotChange = (): void => {
    this.hasErrorSlot = this.getAssignedElements("error").length > 0;
    this.syncControlAssociations();
  };

  private handleLabelSlotChange = (): void => {
    this.hasLabelSlot = this.getAssignedElements("label").length > 0;
    this.syncControlAssociations();
  };

  private syncControlAssociations(): void {
    const control = this.controlElement;
    if (!control) {
      return;
    }

    if (!control.id) {
      control.id = `${this.fieldId}-control`;
    }

    const labelElement = this.renderRoot.querySelector("label");
    if (labelElement instanceof HTMLLabelElement) {
      if (this.isLabelableControl(control)) {
        labelElement.htmlFor = control.id;
      } else {
        labelElement.removeAttribute("for");
      }
    }

    const describedBy = [];
    if (this.description !== "" || this.hasDescriptionSlot) {
      describedBy.push(this.descriptionId);
    }
    if (this.error !== "" || this.hasErrorSlot) {
      describedBy.push(this.errorId);
    }

    this.syncManagedTokens(control, "aria-labelledby", this.label !== "" || this.hasLabelSlot ? [this.labelId] : []);
    this.syncManagedTokens(control, "aria-describedby", describedBy);
  }

  private getAssignedElements(slotName?: string): HTMLElement[] {
    const selector = slotName ? `slot[name="${slotName}"]` : "slot:not([name])";
    const slot = this.renderRoot.querySelector(selector);
    if (!(slot instanceof HTMLSlotElement)) {
      return [];
    }

    return slot.assignedElements({ flatten: true }).filter((element): element is HTMLElement => element instanceof HTMLElement);
  }

  private syncManagedTokens(control: HTMLElement, attributeName: "aria-describedby" | "aria-labelledby", managedTokens: string[]): void {
    const managedTokenSet = new Set([this.labelId, this.descriptionId, this.errorId]);
    const existingTokens = (control.getAttribute(attributeName) ?? "")
      .split(/\s+/)
      .filter((token) => token !== "" && !managedTokenSet.has(token));

    const tokens = [...existingTokens, ...managedTokens];

    if (tokens.length === 0) {
      control.removeAttribute(attributeName);
      return;
    }

    control.setAttribute(attributeName, Array.from(new Set(tokens)).join(" "));
  }

  private isLabelableControl(control: HTMLElement): control is
    | HTMLButtonElement
    | HTMLInputElement
    | HTMLMeterElement
    | HTMLOutputElement
    | HTMLProgressElement
    | HTMLSelectElement
    | HTMLTextAreaElement {
    return (
      control instanceof HTMLButtonElement ||
      control instanceof HTMLInputElement ||
      control instanceof HTMLMeterElement ||
      control instanceof HTMLOutputElement ||
      control instanceof HTMLProgressElement ||
      control instanceof HTMLSelectElement ||
      control instanceof HTMLTextAreaElement
    );
  }

  private get controlElement(): HTMLElement | null {
    return this.getAssignedElements()[0] ?? null;
  }

  private get descriptionId(): string {
    return `${this.fieldId}-description`;
  }

  private get errorId(): string {
    return `${this.fieldId}-error`;
  }

  private get labelId(): string {
    return `${this.fieldId}-label`;
  }
}
