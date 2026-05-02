import { LitElement } from "lit";

export abstract class FormAssociatedElement extends LitElement {
  static readonly formAssociated = true;
  private static nextControlId = 0;
  private static readonly visuallyHiddenStyles = [
    "position:absolute",
    "inline-size:1px",
    "block-size:1px",
    "padding:0",
    "margin:-1px",
    "overflow:hidden",
    "clip:rect(0 0 0 0)",
    "white-space:nowrap",
    "border:0"
  ].join(";");

  protected internals?: ElementInternals;
  private readonly generatedControlIdBase = `${this.localName}-${FormAssociatedElement.nextControlId++}`;
  private readonly hostAttributeObserver = new MutationObserver(() => {
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
  }

  override disconnectedCallback(): void {
    this.hostAttributeObserver.disconnect();
    super.disconnectedCallback();
  }

  protected syncControlA11y(control: HTMLElement | null): void {
    if (!control) {
      return;
    }

    control.id ||= this.controlId;

    const ariaLabelledBy = this.resolveReferencedText(this.getAttribute("aria-labelledby"));
    const ariaLabel = this.normalizeA11yText(this.getAttribute("aria-label"));
    const labelReferenceId = this.syncA11yMirror(control, "label", ariaLabelledBy);
    if (labelReferenceId) {
      control.setAttribute("aria-labelledby", labelReferenceId);
      control.removeAttribute("aria-label");
    } else if (ariaLabel) {
      control.setAttribute("aria-label", ariaLabel);
      control.removeAttribute("aria-labelledby");
    } else {
      control.removeAttribute("aria-label");
      control.removeAttribute("aria-labelledby");
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

  private resolveReferencedText(attributeValue: string | null): string {
    if (!attributeValue) {
      return "";
    }

    const roots = this.getReferenceRoots();
    const resolvedText = attributeValue
      .split(/\s+/)
      .map((token) => token.trim())
      .filter((token) => token !== "")
      .map((token) => this.findReferenceText(token, roots))
      .filter((text) => text !== "");

    return this.normalizeA11yText(resolvedText.join(" "));
  }

  private findReferenceText(id: string, roots: Array<Document | ShadowRoot>): string {
    for (const root of roots) {
      const element = root.getElementById(id);
      if (element) {
        return this.normalizeA11yText(element.textContent);
      }
    }

    return "";
  }

  private getReferenceRoots(): Array<Document | ShadowRoot> {
    const roots: Array<Document | ShadowRoot> = [];
    const seenRoots = new Set<Document | ShadowRoot>();

    const pushRoot = (root: Document | ShadowRoot | null): void => {
      if (!root || seenRoots.has(root)) {
        return;
      }

      seenRoots.add(root);
      roots.push(root);
    };

    let slot: HTMLSlotElement | null = this.assignedSlot;
    while (slot) {
      const slotRoot = slot.getRootNode();
      pushRoot(slotRoot instanceof ShadowRoot ? slotRoot : slotRoot instanceof Document ? slotRoot : null);

      const host = slotRoot instanceof ShadowRoot ? slotRoot.host : null;
      slot = host?.assignedSlot ?? null;
    }

    const ownRoot = this.getRootNode();
    pushRoot(ownRoot instanceof ShadowRoot ? ownRoot : ownRoot instanceof Document ? ownRoot : null);
    pushRoot(this.ownerDocument);

    return roots;
  }

  private normalizeA11yText(value: string | null): string {
    return (value ?? "").replace(/\s+/g, " ").trim();
  }

  private syncA11yMirror(control: HTMLElement, kind: "description" | "label", text: string): string | null {
    const mirrorRoot = this.getA11yMirrorRoot();
    const mirrorId = `${control.id}-${kind}`;
    const selector = `[data-cindor-a11y="${kind}"][data-cindor-a11y-control="${control.id}"]`;
    const existingMirror = mirrorRoot.querySelector(selector);

    if (text === "") {
      existingMirror?.remove();
      return null;
    }

    const mirror = existingMirror instanceof HTMLSpanElement ? existingMirror : document.createElement("span");
    mirror.dataset.cindorA11y = kind;
    mirror.dataset.cindorA11yControl = control.id;
    mirror.id = mirrorId;
    mirror.setAttribute("style", FormAssociatedElement.visuallyHiddenStyles);
    mirror.textContent = text;

    if (mirror.parentElement !== mirrorRoot) {
      mirrorRoot.append(mirror);
    }

    return mirrorId;
  }

  private getA11yMirrorRoot(): HTMLElement {
    const renderRoot = this.renderRoot;
    const existingRoot = renderRoot.querySelector('[data-cindor-a11y-root="true"]');
    if (existingRoot instanceof HTMLDivElement) {
      return existingRoot;
    }

    const mirrorRoot = document.createElement("div");
    mirrorRoot.dataset.cindorA11yRoot = "true";
    mirrorRoot.setAttribute("aria-hidden", "true");
    renderRoot.append(mirrorRoot);
    return mirrorRoot;
  }

  private get controlId(): string {
    return `${this.id || this.generatedControlIdBase}-native-control`;
  }
}
