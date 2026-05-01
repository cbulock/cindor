import { css, html, LitElement, nothing } from "lit";
import { ifDefined } from "lit/directives/if-defined.js";

type DisableCapableElement = HTMLElement & { disabled: boolean };
type FormFieldElement = HTMLElement & {
  error?: string;
  label?: string;
  validationError?: string;
};
type InvalidField = {
  label: string;
  message: string;
};
type ValidatableElement = HTMLElement & {
  checkValidity?: () => boolean;
  disabled?: boolean;
  name?: string;
  reportValidity?: () => boolean;
  validationMessage?: string;
  validity?: ValidityState;
};

const fallbackValidationMessage = "Check this field and try again.";

export class CindorForm extends LitElement {
  static styles = css`
    :host {
      display: grid;
      gap: var(--cindor-form-gap, var(--space-4));
      width: var(--cindor-form-inline-size, min(100%, 48rem));
      max-width: 100%;
      min-width: 0;
      color: var(--fg);
    }

    .description {
      margin: 0;
      color: var(--fg-subtle);
      font-size: var(--text-sm);
    }

    .status {
      display: grid;
      gap: var(--space-2);
      padding: var(--space-3);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      background: var(--surface);
      color: var(--fg);
    }

    .status[data-tone="danger"] {
      border-color: color-mix(in srgb, var(--danger) 40%, var(--border));
      background: color-mix(in srgb, var(--danger) 10%, var(--surface));
    }

    .status[data-tone="info"] {
      border-color: color-mix(in srgb, var(--accent) 40%, var(--border));
      background: color-mix(in srgb, var(--accent) 8%, var(--surface));
    }

    .status[data-tone="success"] {
      border-color: color-mix(in srgb, var(--success, var(--accent)) 40%, var(--border));
      background: color-mix(in srgb, var(--success, var(--accent)) 8%, var(--surface));
    }

    .status-copy {
      font-weight: 600;
    }

    .status-list {
      margin: 0;
      padding-inline-start: 1.25rem;
      color: var(--fg-subtle);
    }

    ::slotted(form) {
      display: grid;
      gap: var(--cindor-form-content-gap, var(--space-4));
      width: 100%;
      max-width: 100%;
      min-width: 0;
    }
  `;

  static properties = {
    description: { reflect: true },
    error: { reflect: true },
    submitting: { type: Boolean, reflect: true },
    submittingLabel: { reflect: true, attribute: "submitting-label" },
    success: { reflect: true },
    validateOnSubmit: { type: Boolean, reflect: true, attribute: "validate-on-submit" }
  };

  description = "";
  error = "";
  submitting = false;
  submittingLabel = "Submitting…";
  success = "";
  validateOnSubmit = true;

  private autoError = "";
  private currentForm: HTMLFormElement | null = null;
  private invalidFields: InvalidField[] = [];
  private readonly managedDisabledElements = new Set<DisableCapableElement>();

  override connectedCallback(): void {
    super.connectedCallback();
    this.attachForm();
  }

  override disconnectedCallback(): void {
    this.detachForm();
    super.disconnectedCallback();
  }

  checkValidity(): boolean {
    return this.getValidatableControls().every((control) => this.checkControlValidity(control));
  }

  reportValidity(): boolean {
    let valid = true;

    for (const control of this.getValidatableControls()) {
      const controlValid = this.reportControlValidity(control);
      this.syncFieldValidation(control, controlValid);
      valid = controlValid && valid;
    }

    this.refreshValidationSummary();
    return valid;
  }

  requestSubmit(submitter?: HTMLElement): void {
    if (!this.reportValidity()) {
      return;
    }

    if (submitter instanceof HTMLButtonElement || submitter instanceof HTMLInputElement) {
      this.currentForm?.requestSubmit(submitter);
      return;
    }

    this.currentForm?.requestSubmit();
  }

  reset(): void {
    this.currentForm?.reset();
    this.clearValidationState();
  }

  protected override render() {
    const statusMessage = this.submitting ? this.submittingLabel : this.error || this.autoError || this.success;
    const statusTone = this.submitting ? "info" : this.error || this.autoError ? "danger" : "success";
    const showInvalidList = !this.submitting && this.invalidFields.length > 0;

    return html`
      ${this.description ? html`<p class="description" part="description">${this.description}</p>` : nothing}
      ${statusMessage
        ? html`
            <div
              class="status"
              part="status"
              data-tone=${statusTone}
              role=${statusTone === "danger" ? "alert" : "status"}
              aria-live=${ifDefined(statusTone === "danger" ? "assertive" : "polite")}
            >
              <span class="status-copy">${statusMessage}</span>
              ${showInvalidList
                ? html`
                    <ul class="status-list" part="status-list">
                      ${this.invalidFields.map(
                        (item) => html`<li><strong>${item.label}:</strong> ${item.message}</li>`
                      )}
                    </ul>
                  `
                : nothing}
            </div>
          `
        : nothing}
      <slot @slotchange=${this.handleSlotChange}></slot>
    `;
  }

  protected override updated(changedProperties: Map<string, unknown>): void {
    if (changedProperties.has("submitting")) {
      this.syncSubmittingState();
    }

    if (this.submitting) {
      this.setAttribute("aria-busy", "true");
    } else {
      this.removeAttribute("aria-busy");
    }
  }

  private handleControlInteraction = (event: Event): void => {
    const control = this.getEventControl(event);
    if (!control) {
      return;
    }

    this.syncFieldValidation(control, this.checkControlValidity(control));
    this.refreshValidationSummary();
  };

  private handleInvalid = (event: Event): void => {
    if (!this.validateOnSubmit) {
      return;
    }

    const control = this.getEventControl(event);
    if (!control) {
      return;
    }

    this.syncFieldValidation(control, false);
    this.refreshValidationSummary();
  };

  private handleReset = (): void => {
    this.clearValidationState();
  };

  private handleSlotChange = (): void => {
    this.attachForm();
  };

  private handleSubmit = (): void => {
    this.clearValidationState();
  };

  private attachForm(): void {
    const nextForm = this.formElement;
    if (nextForm === this.currentForm) {
      this.syncSubmittingState();
      return;
    }

    this.detachForm();
    this.currentForm = nextForm;

    if (!this.currentForm) {
      return;
    }

    this.currentForm.addEventListener("submit", this.handleSubmit);
    this.currentForm.addEventListener("reset", this.handleReset);
    this.currentForm.addEventListener("invalid", this.handleInvalid, true);
    this.currentForm.addEventListener("input", this.handleControlInteraction);
    this.currentForm.addEventListener("change", this.handleControlInteraction);
    this.syncSubmittingState();
  }

  private clearFieldValidationErrors(): void {
    for (const field of this.getManagedFields()) {
      field.validationError = "";
    }
  }

  private clearValidationState(): void {
    this.autoError = "";
    this.invalidFields = [];
    this.clearFieldValidationErrors();
    this.requestUpdate();
  }

  private collectInvalidFields(): InvalidField[] {
    const invalidFields: InvalidField[] = [];
    const seenFields = new Set<string>();

    this.clearFieldValidationErrors();

    for (const control of this.getValidatableControls()) {
      if (this.checkControlValidity(control)) {
        continue;
      }

      const message = this.getValidationMessage(control);
      const label = this.getControlLabel(control);
      const key = `${label}::${message}`;

      this.syncFieldValidation(control, false);

      if (seenFields.has(key)) {
        continue;
      }

      seenFields.add(key);
      invalidFields.push({ label, message });
    }

    return invalidFields;
  }

  private detachForm(): void {
    if (!this.currentForm) {
      return;
    }

    this.currentForm.removeEventListener("submit", this.handleSubmit);
    this.currentForm.removeEventListener("reset", this.handleReset);
    this.currentForm.removeEventListener("invalid", this.handleInvalid, true);
    this.currentForm.removeEventListener("input", this.handleControlInteraction);
    this.currentForm.removeEventListener("change", this.handleControlInteraction);
    this.currentForm.removeAttribute("aria-busy");
    this.releaseManagedDisabledState();
    this.currentForm = null;
  }

  private getControlLabel(control: ValidatableElement): string {
    const field = this.getOwningField(control);
    const fieldLabel = this.getFieldLabel(field);
    if (fieldLabel) {
      return fieldLabel;
    }

    if (
      (control instanceof HTMLInputElement || control instanceof HTMLSelectElement || control instanceof HTMLTextAreaElement) &&
      control.labels &&
      control.labels.length > 0 &&
      control.labels[0]?.textContent?.trim()
    ) {
      return control.labels[0].textContent.trim();
    }

    return control.getAttribute("aria-label") || control.name || control.id || "Field";
  }

  private getEventControl(event: Event): ValidatableElement | null {
    if (!(event.target instanceof HTMLElement) || !this.currentForm?.contains(event.target)) {
      return null;
    }

    return event.target as ValidatableElement;
  }

  private getFieldLabel(field: FormFieldElement | null): string {
    if (!field) {
      return "";
    }

    if (typeof field.label === "string" && field.label.trim() !== "") {
      return field.label.trim();
    }

    const labelElement = field.shadowRoot?.querySelector("label");
    return labelElement?.textContent?.trim() ?? "";
  }

  private getManagedFields(): FormFieldElement[] {
    if (!this.currentForm) {
      return [];
    }

    return Array.from(this.currentForm.querySelectorAll("cindor-form-field")) as FormFieldElement[];
  }

  private getOwningField(control: ValidatableElement): FormFieldElement | null {
    return control.closest("cindor-form-field") as FormFieldElement | null;
  }

  private getValidatableControls(): ValidatableElement[] {
    if (!this.currentForm) {
      return [];
    }

    return Array.from(this.currentForm.querySelectorAll("*")).filter((element): element is ValidatableElement => {
      if (!(element instanceof HTMLElement) || element.matches("button, fieldset, form, output")) {
        return false;
      }

      return typeof (element as ValidatableElement).checkValidity === "function";
    });
  }

  private getValidationMessage(control: ValidatableElement): string {
    if (typeof control.validationMessage === "string" && control.validationMessage.trim() !== "") {
      return control.validationMessage;
    }

    const validationTarget = this.getValidationTarget(control);
    if (validationTarget?.validationMessage) {
      return validationTarget.validationMessage;
    }

    return fallbackValidationMessage;
  }

  private getValidationTarget(control: ValidatableElement): HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null {
    if (control instanceof HTMLInputElement || control instanceof HTMLSelectElement || control instanceof HTMLTextAreaElement) {
      return control;
    }

    const target = control.shadowRoot?.querySelector("input, select, textarea");
    return target instanceof HTMLInputElement || target instanceof HTMLSelectElement || target instanceof HTMLTextAreaElement ? target : null;
  }

  private checkControlValidity(control: ValidatableElement): boolean {
    if (this.isDisableCapableElement(control) && control.disabled) {
      return true;
    }

    const validationTarget = this.getValidationTarget(control);
    if (validationTarget) {
      return validationTarget.validity.valid;
    }

    if (control.matches(":invalid")) {
      return false;
    }

    if (control.validity) {
      return control.validity.valid;
    }

    return control.checkValidity?.() ?? true;
  }

  private refreshValidationSummary(): void {
    if (!this.validateOnSubmit || this.submitting) {
      this.clearValidationState();
      return;
    }

    this.invalidFields = this.collectInvalidFields();
    this.autoError = this.invalidFields.length === 0 ? "" : `${this.invalidFields.length} field${this.invalidFields.length === 1 ? "" : "s"} still need attention.`;
    this.requestUpdate();
  }

  private releaseManagedDisabledState(): void {
    for (const element of this.managedDisabledElements) {
      element.disabled = false;
    }

    this.managedDisabledElements.clear();
  }

  private reportControlValidity(control: ValidatableElement): boolean {
    if (this.isDisableCapableElement(control) && control.disabled) {
      return true;
    }

    return control.reportValidity?.() ?? this.checkControlValidity(control);
  }

  private syncFieldValidation(control: ValidatableElement, valid: boolean): void {
    const field = this.getOwningField(control);
    if (!field) {
      return;
    }

    field.validationError = valid ? "" : this.getValidationMessage(control);
  }

  private syncSubmittingState(): void {
    if (!this.currentForm) {
      return;
    }

    if (this.submitting) {
      this.currentForm.setAttribute("aria-busy", "true");

      for (const element of Array.from(this.currentForm.querySelectorAll("*"))) {
        if (!this.isDisableCapableElement(element) || element.disabled) {
          continue;
        }

        element.disabled = true;
        this.managedDisabledElements.add(element);
      }

      return;
    }

    this.currentForm.removeAttribute("aria-busy");
    this.releaseManagedDisabledState();
  }

  private get formElement(): HTMLFormElement | null {
    const slot = this.renderRoot.querySelector("slot");
    if (slot instanceof HTMLSlotElement) {
      const assignedForm = slot.assignedElements({ flatten: true }).find((element): element is HTMLFormElement => element instanceof HTMLFormElement);
      if (assignedForm) {
        return assignedForm;
      }
    }

    return this.querySelector("form");
  }

  private isDisableCapableElement(element: Element): element is DisableCapableElement {
    return element instanceof HTMLElement && "disabled" in element;
  }
}
