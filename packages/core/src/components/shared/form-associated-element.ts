import { LitElement } from "lit";

export abstract class FormAssociatedElement extends LitElement {
  static readonly formAssociated = true;

  protected internals?: ElementInternals;

  constructor() {
    super();
    if (typeof this.attachInternals === "function") {
      this.internals = this.attachInternals();
    }
  }

  protected setFormValue(value: string | File | FormData | null): void {
    if (this.internals && typeof this.internals.setFormValue === "function") {
      this.internals.setFormValue(value);
    }
  }

  protected setValidityFrom(control: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement): void {
    if (this.internals && typeof this.internals.setValidity === "function") {
      this.internals.setValidity(control.validity, control.validationMessage, control);
    }
  }

  protected syncControlA11y(control: HTMLElement | null): void {
    if (!control) {
      return;
    }

    for (const attributeName of ["aria-label", "aria-labelledby", "aria-describedby"]) {
      const attributeValue = this.getAttribute(attributeName);
      if (attributeValue === null || attributeValue === "") {
        control.removeAttribute(attributeName);
        continue;
      }

      control.setAttribute(attributeName, attributeValue);
    }
  }
}
