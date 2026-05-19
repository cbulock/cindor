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
const nativeFormAssociatedSelector = "button, fieldset, input, output, select, textarea";

export class CindorForm extends LitElement {
  private static nextOwnedFormId = 0;

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
      font-weight: var(--weight-semibold);
    }

    .status-list {
      margin: 0;
      padding-inline-start: 1.25rem;
      color: var(--fg-subtle);
    }

    form,
    ::slotted(form) {
      display: grid;
      gap: var(--cindor-form-content-gap, var(--space-4));
      width: 100%;
      max-width: 100%;
      min-width: 0;
    }

    slot {
      display: contents;
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
  private legacyForm: HTMLFormElement | null = null;
  private readonly managedDisabledElements = new Set<DisableCapableElement>();
  private readonly managedFormAssociations = new Set<Element>();
  private readonly ownedFormId = `cindor-form-host-${CindorForm.nextOwnedFormId++}`;

  override connectedCallback(): void {
    super.connectedCallback();
    this.legacyForm = this.getLegacyForm();
    this.addEventListener("change", this.handleControlInteraction);
    this.addEventListener("click", this.handleFormActionClick);
    this.addEventListener("input", this.handleControlInteraction);
    this.addEventListener("invalid", this.handleInvalid, true);
  }

  override disconnectedCallback(): void {
    this.removeEventListener("change", this.handleControlInteraction);
    this.removeEventListener("click", this.handleFormActionClick);
    this.removeEventListener("input", this.handleControlInteraction);
    this.removeEventListener("invalid", this.handleInvalid, true);
    this.clearManagedFormAssociations();
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
      ${this.legacyForm
        ? html`<slot @slotchange=${this.handleSlotChange}></slot>`
        : html`
            <form
              id=${this.ownedFormId}
              accept-charset=${ifDefined(this.getAttribute("accept-charset") ?? undefined)}
              action=${ifDefined(this.getAttribute("action") ?? undefined)}
              autocomplete=${ifDefined(this.getAttribute("autocomplete") ?? undefined)}
              enctype=${ifDefined(this.getAttribute("enctype") ?? undefined)}
              method=${ifDefined(this.getAttribute("method") ?? undefined)}
              name=${ifDefined(this.getAttribute("name") ?? undefined)}
              ?novalidate=${this.hasAttribute("novalidate")}
              part="form"
              target=${ifDefined(this.getAttribute("target") ?? undefined)}
            >
              <slot @slotchange=${this.handleSlotChange}></slot>
            </form>
          `}
    `;
  }

  protected override updated(changedProperties: Map<string, unknown>): void {
    this.syncManagedFormAssociations();
    this.attachForm();

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

  private handleFormActionClick = (event: Event): void => {
    if (!(event instanceof MouseEvent) || event.defaultPrevented || this.submitting) {
      return;
    }

    const actionTarget = this.getFormActionTarget(event);
    if (!actionTarget || this.isNativeFormActionHandled(actionTarget)) {
      return;
    }

    const action = this.getFormActionType(actionTarget);
    if (!action) {
      return;
    }

    event.preventDefault();

    if (action === "reset") {
      this.reset();
      return;
    }

    this.requestSubmit(actionTarget instanceof HTMLButtonElement || actionTarget instanceof HTMLInputElement ? actionTarget : undefined);
  };

  private handleReset = (event: Event): void => {
    this.clearValidationState();

    if (!this.isUsingOwnedForm || event.target !== this.currentForm) {
      return;
    }

    this.dispatchEvent(new Event("reset", { bubbles: true, composed: true }));
  };

  private handleSlotChange = (): void => {
    const nextLegacyForm = this.getLegacyForm();
    const modeChanged = nextLegacyForm !== this.legacyForm;
    this.legacyForm = nextLegacyForm;

    if (modeChanged) {
      this.requestUpdate();
      return;
    }

    this.syncManagedFormAssociations();
    this.attachForm();
  };

  private handleSubmit = (event: Event): void => {
    this.clearValidationState();

    if (!this.isUsingOwnedForm || event.target !== this.currentForm) {
      return;
    }

    const forwardedEvent = new Event("submit", {
      bubbles: true,
      cancelable: true,
      composed: true
    });

    if (!this.dispatchEvent(forwardedEvent)) {
      event.preventDefault();
    }
  };

  private attachForm(): void {
    const nextForm = this.legacyForm ?? this.ownedFormElement;
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
    this.syncSubmittingState();
  }

  private clearFieldValidationErrors(): void {
    for (const field of this.getManagedFields()) {
      field.validationError = "";
    }
  }

  private clearManagedFormAssociations(): void {
    for (const element of this.managedFormAssociations) {
      if (element.getAttribute("form") === this.ownedFormId) {
        element.removeAttribute("form");
      }
    }

    this.managedFormAssociations.clear();
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
    for (const entry of event.composedPath()) {
      if (!(entry instanceof HTMLElement) || !this.isManagedValidatableControl(entry)) {
        continue;
      }

      return entry as ValidatableElement;
    }

    return null;
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

  private getFormActionTarget(event: Event): HTMLElement | null {
    for (const entry of event.composedPath()) {
      if (!(entry instanceof HTMLElement) || !this.isManagedElement(entry)) {
        continue;
      }

      if (entry.localName === "cindor-button") {
        return entry;
      }

      if (entry instanceof HTMLButtonElement || (entry instanceof HTMLInputElement && /^(reset|submit)$/i.test(entry.type))) {
        return entry;
      }
    }

    return null;
  }

  private getFormActionType(element: HTMLElement): "reset" | "submit" | null {
    const rawType = (element.getAttribute("type") || "").toLowerCase();

    if (rawType === "button") {
      return null;
    }

    if (rawType === "reset") {
      return "reset";
    }

    if (element instanceof HTMLInputElement && rawType !== "submit") {
      return null;
    }

    return "submit";
  }

  private getLegacyForm(): HTMLFormElement | null {
    return Array.from(this.children).find((element): element is HTMLFormElement => element instanceof HTMLFormElement) ?? null;
  }

  private getManagedElements(): HTMLElement[] {
    const scope = this.legacyForm ?? this;
    return Array.from(scope.querySelectorAll("*")).filter((element): element is HTMLElement => element instanceof HTMLElement && this.isManagedElement(element));
  }

  private getManagedFields(): FormFieldElement[] {
    const scope = this.legacyForm ?? this;
    return Array.from(scope.querySelectorAll("cindor-form-field")).filter(
      (element): element is FormFieldElement => element instanceof HTMLElement && this.isManagedElement(element)
    );
  }

  private getOwningField(control: ValidatableElement): FormFieldElement | null {
    return control.closest("cindor-form-field") as FormFieldElement | null;
  }

  private getValidatableControls(): ValidatableElement[] {
    const scope = this.legacyForm ?? this;

    return Array.from(scope.querySelectorAll("*")).filter((element): element is ValidatableElement => {
      if (!(element instanceof HTMLElement) || !this.isManagedValidatableControl(element) || element.matches("button, fieldset, form, output")) {
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

  private isManagedElement(element: Element): boolean {
    if (this.legacyForm) {
      return this.legacyForm.contains(element);
    }

    if (!this.contains(element)) {
      return false;
    }

    const parentForm = element.closest("form");
    return !parentForm;
  }

  private isManagedValidatableControl(element: HTMLElement): element is ValidatableElement {
    if (!this.isManagedElement(element)) {
      return false;
    }

    if (typeof (element as ValidatableElement).checkValidity !== "function") {
      return false;
    }

    const explicitForm = element.getAttribute("form");
    return !explicitForm || explicitForm === this.ownedFormId || this.legacyForm !== null;
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

  private syncManagedFormAssociations(): void {
    if (this.legacyForm || !this.ownedFormElement) {
      this.clearManagedFormAssociations();
      return;
    }

    const nextManagedElements = new Set(
      Array.from(this.querySelectorAll("*")).filter((element) => {
        if (!(element instanceof HTMLElement) || element.closest("form") || !this.isManagedAssociationCandidate(element)) {
          return false;
        }

        return !element.hasAttribute("form");
      })
    );

    for (const element of Array.from(this.managedFormAssociations)) {
      if (nextManagedElements.has(element)) {
        continue;
      }

      if (element.getAttribute("form") === this.ownedFormId) {
        element.removeAttribute("form");
      }

      this.managedFormAssociations.delete(element);
    }

    for (const element of nextManagedElements) {
      if (this.managedFormAssociations.has(element)) {
        continue;
      }

      element.setAttribute("form", this.ownedFormId);
      this.managedFormAssociations.add(element);
    }
  }

  private syncSubmittingState(): void {
    if (!this.currentForm) {
      return;
    }

    if (this.submitting) {
      this.currentForm.setAttribute("aria-busy", "true");

      for (const element of this.getManagedElements()) {
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

  private get ownedFormElement(): HTMLFormElement | null {
    return this.renderRoot.querySelector("form");
  }

  private isManagedAssociationCandidate(element: HTMLElement): boolean {
    return element.matches(nativeFormAssociatedSelector) || element.localName.includes("-");
  }

  private isDisableCapableElement(element: Element): element is DisableCapableElement {
    return element instanceof HTMLElement && "disabled" in element;
  }

  private isNativeFormActionHandled(element: HTMLElement): boolean {
    if (element.localName === "cindor-button") {
      return false;
    }

    if (this.legacyForm) {
      return element.closest("form") === this.legacyForm;
    }

    return element.closest("form") === this.ownedFormElement;
  }

  private get isUsingOwnedForm(): boolean {
    return this.legacyForm === null;
  }
}
