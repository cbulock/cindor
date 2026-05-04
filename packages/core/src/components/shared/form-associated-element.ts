import { LitElement } from "lit";

import { normalizeA11yText, ReferencedTextObserver, resolveReferencedText, syncA11yMirror } from "./a11y-mirror.js";

type SyncControlA11yOptions = {
  skipLabel?: boolean;
};

export abstract class FormAssociatedElement extends LitElement {
  static readonly formAssociated = true;
  private static nextControlId = 0;
  private static nextFormId = 0;

  protected internals?: ElementInternals;
  private readonly generatedControlIdBase = `${this.localName}-${FormAssociatedElement.nextControlId++}`;
  private readonly generatedFormId = `cindor-form-${FormAssociatedElement.nextFormId++}`;
  private readonly hostAttributeObserver = new MutationObserver(() => {
    this.syncReferencedTextObserver();
    this.requestUpdate();
  });
  private readonly referencedTextObserver = new ReferencedTextObserver(this, () => {
    this.requestUpdate();
  });

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

  override connectedCallback(): void {
    super.connectedCallback();
    this.hostAttributeObserver.observe(this, {
      attributeFilter: ["aria-describedby", "aria-description", "aria-label", "aria-labelledby", "id"],
      attributes: true
    });
    this.syncReferencedTextObserver();
  }

  override disconnectedCallback(): void {
    this.hostAttributeObserver.disconnect();
    this.referencedTextObserver.disconnect();
    super.disconnectedCallback();
  }

  protected syncControlA11y(control: HTMLElement | null, options: SyncControlA11yOptions = {}): void {
    if (!control) {
      return;
    }

    control.id ||= this.controlId;

    if (!options.skipLabel) {
      const ariaLabelledBy = this.resolveReferencedText(this.getAttribute("aria-labelledby"));
      const ariaLabel = this.normalizeA11yText(this.getAttribute("aria-label"));
      const resolvedLabel = ariaLabelledBy || ariaLabel;
      if (resolvedLabel) {
        control.setAttribute("aria-label", resolvedLabel);
        control.removeAttribute("aria-labelledby");
      } else {
        control.removeAttribute("aria-label");
        control.removeAttribute("aria-labelledby");
      }
    }

    const describedByText = this.resolveReferencedText(this.getAttribute("aria-describedby"));
    const ariaDescription = this.normalizeA11yText(
      [this.getAttribute("aria-description"), describedByText].filter((value) => value && value.trim() !== "").join(" ")
    );
    const descriptionReferenceId = this.syncA11yMirror(control, "description", ariaDescription);
    if (descriptionReferenceId) {
      control.setAttribute("aria-describedby", descriptionReferenceId);
    } else {
      control.removeAttribute("aria-describedby");
    }
    control.removeAttribute("aria-description");
  }

  protected resolveReferencedText(attributeValue: string | null): string {
    return resolveReferencedText(this, attributeValue);
  }

  protected normalizeA11yText(value: string | null): string {
    return normalizeA11yText(value);
  }

  private syncA11yMirror(control: HTMLElement, kind: "description" | "label", text: string): string | null {
    return syncA11yMirror(this.renderRoot, control.id, kind, text);
  }

  private syncReferencedTextObserver(): void {
    this.referencedTextObserver.observe(this.getAttribute("aria-labelledby"), this.getAttribute("aria-describedby"));
  }

  protected get controlId(): string {
    return `${this.id || this.generatedControlIdBase}-native-control`;
  }

  protected get associatedForm(): HTMLFormElement | null {
    return this.internals?.form ?? this.closest("form");
  }

  protected get associatedFormId(): string | undefined {
    const form = this.associatedForm;
    if (!form) {
      return undefined;
    }

    form.id ||= this.generatedFormId;
    return form.id;
  }
}
