import { css, html, LitElement, nothing } from "lit";

import { normalizeA11yText, ReferencedTextObserver, resolveReferencedText, syncA11yMirror } from "../shared/a11y-mirror.js";

const managedA11yAttributes = ["aria-describedby", "aria-description", "aria-label", "aria-labelledby"] as const;
type ManagedA11yAttribute = (typeof managedA11yAttributes)[number];
const focusableSelector = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export type DrawerSide = "start" | "end";

export class CindorDrawer extends LitElement {
  private static nextDrawerId = 0;

  static override get observedAttributes(): string[] {
    return [...super.observedAttributes, ...managedA11yAttributes];
  }

  static styles = css`
    :host {
      display: contents;
    }

    .backdrop {
      position: fixed;
      inset: 0;
      background: rgb(15 14 12 / 45%);
      z-index: 30;
      animation: cindor-drawer-backdrop-enter var(--duration-base) var(--ease-out);
    }

    aside {
      position: fixed;
      inset-block: 0;
      inline-size: min(420px, 90vw);
      padding: var(--space-5);
      background: var(--surface);
      color: var(--fg);
      box-shadow: var(--shadow-lg);
      z-index: 31;
      display: grid;
      grid-template-rows: auto 1fr;
      gap: var(--space-4);
      animation: cindor-drawer-enter-end var(--duration-base) var(--ease-out);
    }

    :host([side="start"]) aside {
      inset-inline-start: 0;
      border-inline-end: 1px solid var(--border);
      animation-name: cindor-drawer-enter-start;
    }

    :host([side="end"]) aside {
      inset-inline-end: 0;
      border-inline-start: 1px solid var(--border);
    }

    cindor-icon-button {
      justify-self: end;
      color: var(--fg-muted);
      transition:
        color var(--duration-base) var(--ease-out),
        transform var(--duration-base) var(--ease-out);
    }

    cindor-icon-button:hover {
      color: var(--fg);
      transform: rotate(90deg);
    }

    cindor-icon-button:active {
      transform: rotate(90deg) scale(0.96);
    }

    @keyframes cindor-drawer-backdrop-enter {
      from {
        opacity: 0;
      }

      to {
        opacity: 1;
      }
    }

    @keyframes cindor-drawer-enter-end {
      from {
        opacity: 0;
        transform: translateX(16px);
      }

      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    @keyframes cindor-drawer-enter-start {
      from {
        opacity: 0;
        transform: translateX(-16px);
      }

      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
  `;

  static properties = {
    open: { type: Boolean, reflect: true },
    side: { reflect: true }
  };

  open = false;
  side: DrawerSide = "end";

  private readonly generatedDrawerId = `${this.localName}-${CindorDrawer.nextDrawerId++}`;
  private hostAriaDescription = "";
  private hostAriaDescribedBy = "";
  private hostAriaLabel = "";
  private hostAriaLabelledBy = "";
  private managedA11yDirty = false;
  private previousFocusedElement: HTMLElement | null = null;
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

  close = (): void => {
    this.open = false;
    this.dispatchEvent(new Event("close", { bubbles: true, composed: true }));
  };

  protected override updated(changedProperties: Map<PropertyKey, unknown>): void {
    this.syncPanelA11y();

    if (this.managedA11yDirty) {
      this.stripHostA11yAttributes();
      this.managedA11yDirty = false;
    }

    if (changedProperties.has("open")) {
      if (this.open) {
        this.previousFocusedElement = getDeepestActiveElement(this.ownerDocument);
        queueMicrotask(() => {
          this.panelElement?.focus();
        });
        return;
      }

      this.previousFocusedElement?.focus();
      this.previousFocusedElement = null;
    }
  }

  protected override render() {
    if (!this.open) {
      return nothing;
    }

    return html`
      <div class="backdrop" part="backdrop" @click=${this.close}></div>
      <aside
        part="panel"
        aria-modal="true"
        role="dialog"
        tabindex="-1"
        @keydown=${this.handlePanelKeyDown}
      >
        <cindor-icon-button label="Close drawer" name="x" part="close-button" @click=${this.close}></cindor-icon-button>
        <slot></slot>
      </aside>
    `;
  }

  private handlePanelKeyDown = (event: KeyboardEvent): void => {
    if (event.key === "Escape") {
      event.preventDefault();
      this.close();
      return;
    }

    if (event.key !== "Tab") {
      return;
    }

    const focusableElements = this.focusableElements;
    if (focusableElements.length === 0) {
      event.preventDefault();
      this.panelElement?.focus();
      return;
    }

    const activeElement = getDeepestActiveElement(this.ownerDocument);
    const activeIndex = activeElement ? focusableElements.indexOf(activeElement) : -1;

    if (event.shiftKey) {
      if (activeIndex <= 0) {
        event.preventDefault();
        focusableElements.at(-1)?.focus();
      }
      return;
    }

    if (activeIndex === focusableElements.length - 1) {
      event.preventDefault();
      focusableElements[0]?.focus();
    }
  };

  private syncPanelA11y(): void {
    const panel = this.panelElement;
    if (!panel) {
      return;
    }

    const labelledByText = resolveReferencedText(this, this.hostAriaLabelledBy);
    const ariaLabel = normalizeA11yText(this.hostAriaLabel);
    if (labelledByText) {
      const labelId = syncA11yMirror(this.renderRoot, this.panelA11yIdBase, "label", labelledByText);
      if (labelId) {
        panel.setAttribute("aria-labelledby", labelId);
      }
      panel.removeAttribute("aria-label");
    } else {
      syncA11yMirror(this.renderRoot, this.panelA11yIdBase, "label", "");
      panel.removeAttribute("aria-labelledby");
      if (ariaLabel) {
        panel.setAttribute("aria-label", ariaLabel);
      } else {
        panel.removeAttribute("aria-label");
      }
    }

    const describedByText = resolveReferencedText(this, this.hostAriaDescribedBy);
    const descriptionText = normalizeA11yText([this.hostAriaDescription, describedByText].filter((value) => value).join(" "));
    const descriptionId = syncA11yMirror(this.renderRoot, this.panelA11yIdBase, "description", descriptionText);
    if (descriptionId) {
      panel.setAttribute("aria-describedby", descriptionId);
    } else {
      panel.removeAttribute("aria-describedby");
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

  private get panelA11yIdBase(): string {
    return `${this.id || this.generatedDrawerId}-panel`;
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

  private get focusableElements(): HTMLElement[] {
    const panel = this.panelElement;
    if (!panel) {
      return [];
    }

    return collectFocusableElements(panel);
  }

  private get panelElement(): HTMLElement | null {
    return this.renderRoot.querySelector('[part="panel"]');
  }

  private syncReferencedTextObserver(): void {
    this.referencedTextObserver.observe(this.hostAriaLabelledBy, this.hostAriaDescribedBy);
  }
}

function collectFocusableElements(root: Element | ShadowRoot): HTMLElement[] {
  const focusableElements: HTMLElement[] = [];
  const seenElements = new Set<HTMLElement>();

  const visitNode = (node: Element | ShadowRoot): void => {
    if (node instanceof HTMLElement && node.matches(focusableSelector) && !seenElements.has(node)) {
      seenElements.add(node);
      focusableElements.push(node);
    }

    const children = node instanceof ShadowRoot ? Array.from(node.children) : Array.from(node.children);
    for (const child of children) {
      if (!(child instanceof HTMLElement)) {
        continue;
      }

      if (child instanceof HTMLSlotElement) {
        for (const assignedElement of child.assignedElements({ flatten: true })) {
          if (assignedElement instanceof HTMLElement) {
            visitNode(assignedElement);
          }
        }
        continue;
      }

      if (child.shadowRoot) {
        visitNode(child.shadowRoot);
      }

      visitNode(child);
    }
  };

  visitNode(root);
  return focusableElements;
}

function getDeepestActiveElement(root: Document | ShadowRoot): HTMLElement | null {
  let activeElement = root.activeElement instanceof HTMLElement ? root.activeElement : null;
  while (activeElement?.shadowRoot?.activeElement instanceof HTMLElement) {
    activeElement = activeElement.shadowRoot.activeElement;
  }

  return activeElement;
}
