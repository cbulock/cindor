import { css, html, LitElement } from "lit";

import { normalizeA11yText, ReferencedTextObserver, resolveReferencedText, syncA11yMirror } from "../shared/a11y-mirror.js";
import { handleLinearKeyboardNavigation } from "../shared/linear-navigation.js";

type TabPanel = {
  buttonId: string;
  label: string;
  panelId: string;
  slotName: string;
  value: string;
};

const DEFAULT_MOBILE_BREAKPOINT = 640;

export class CindorTabs extends LitElement {
  private static nextA11yId = 0;

  static styles = css`
    :host {
      display: grid;
      gap: var(--space-4);
      color: var(--fg);
    }

    .mobile-picker {
      --cindor-field-inline-size: 100%;
    }

    [part="list"] {
      display: flex;
      gap: var(--space-2);
      overflow-x: auto;
      overscroll-behavior-x: contain;
      scrollbar-width: thin;
      border-bottom: 1px solid var(--border);
      padding-bottom: var(--space-2);
    }

    button {
      font: inherit;
      flex: none;
      min-height: 44px;
      padding: var(--space-2) var(--space-3);
      border: 1px solid transparent;
      border-radius: var(--radius-md);
      background: transparent;
      color: var(--fg-muted);
      cursor: pointer;
      white-space: nowrap;
      transition:
        color var(--duration-base) var(--ease-out),
        background var(--duration-base) var(--ease-out),
        border-color var(--duration-base) var(--ease-out),
        box-shadow var(--duration-base) var(--ease-out);
    }

    button[aria-selected="true"] {
      color: var(--fg);
      background: var(--bg-subtle);
      border-color: var(--border);
    }

    button:hover:not([aria-selected="true"]) {
      color: var(--fg);
      background: color-mix(in srgb, var(--bg-subtle) 72%, transparent);
      border-color: color-mix(in srgb, var(--border) 70%, transparent);
    }

    button:focus-visible {
      outline: none;
      box-shadow: var(--ring-focus);
    }

    .panels ::slotted(*) {
      display: block;
    }

    .panels ::slotted([hidden]) {
      display: none;
    }

    @media (max-width: 640px) {
      :host {
        gap: var(--space-3);
      }

      [part="list"] {
        padding-bottom: var(--space-1);
      }
    }
  `;

  static properties = {
    value: { reflect: true }
  };

  value = "";

  private compactModeActive = false;
  private readonly panelObserver = new MutationObserver(() => {
    this.refreshPanels();
  });
  private readonly hostA11yObserver = new MutationObserver(() => {
    this.requestUpdate();
  });
  private readonly referencedTextObserver = new ReferencedTextObserver(this, () => {
    this.requestUpdate();
  });
  private readonly generatedA11yId = `${this.localName}-${CindorTabs.nextA11yId++}-tablist`;
  private panels: TabPanel[] = [];
  private panelIndex = 0;

  override connectedCallback(): void {
    super.connectedCallback();
    this.panelObserver.observe(this, {
      attributes: true,
      attributeFilter: ["data-label", "data-value", "id"],
      childList: true,
      subtree: true
    });
    this.hostA11yObserver.observe(this, {
      attributeFilter: ["aria-describedby", "aria-description", "aria-label", "aria-labelledby", "id"],
      attributes: true
    });
    window.addEventListener("resize", this.handleViewportResize);
    this.refreshPanels();
  }

  protected override firstUpdated(): void {
    queueMicrotask(() => {
      this.syncResponsiveMode();
    });
  }

  override disconnectedCallback(): void {
    window.removeEventListener("resize", this.handleViewportResize);
    this.panelObserver.disconnect();
    this.hostA11yObserver.disconnect();
    this.referencedTextObserver.disconnect();
    super.disconnectedCallback();
  }

  protected override render() {
    return html`
      ${this.compactModeActive ? this.renderMobilePicker() : this.renderTabList()}
      <div class="panels" part="panels">
        ${this.panels.map(
          (panel) => html`
            <div
              part="panel"
              id=${panel.panelId}
              role="tabpanel"
              aria-labelledby=${panel.buttonId}
              ?hidden=${this.value !== panel.value}
              tabindex="0"
            >
              <slot name=${panel.slotName} @slotchange=${this.handleSlotChange}></slot>
            </div>
          `
        )}
      </div>
    `;
  }

  protected override updated(): void {
    this.syncA11y();
    this.syncPanels();
  }

  private renderTabList() {
    return html`
      <div part="list" role="tablist" aria-orientation="horizontal">
        ${this.panels.map(
          (panel) => html`
            <button
              part="tab"
              id=${panel.buttonId}
              role="tab"
              type="button"
              aria-controls=${panel.panelId}
              aria-selected=${String(this.value === panel.value)}
              tabindex=${this.value === panel.value ? "0" : "-1"}
              @keydown=${this.handleTabKeydown}
              @click=${() => this.select(panel.value)}
            >
              ${panel.label}
            </button>
          `
        )}
      </div>
    `;
  }

  private renderMobilePicker() {
    return html`
      <cindor-form-field class="mobile-picker" label="Section" part="mobile-picker">
        <cindor-select aria-label="Select tab" part="mobile-control" .value=${this.value} @change=${this.handleMobileChange}>
          ${this.panels.map(
            (panel) => html`
              <option value=${panel.value}>${panel.label}</option>
            `
          )}
        </cindor-select>
      </cindor-form-field>
    `;
  }

  private handleSlotChange = (): void => {
    this.refreshPanels();
  };

  private refreshPanels(): void {
    const children = Array.from(this.children).filter((child): child is HTMLElement => child instanceof HTMLElement);

    this.panels = children.map((child, index) => {
      if (!child.id) {
        this.panelIndex += 1;
        child.id = `cindor-tab-panel-${this.panelIndex}`;
      }

      return {
        buttonId: `${child.id}-tab`,
        label: child.dataset.label ?? child.getAttribute("label") ?? `Tab ${index + 1}`,
        panelId: `${child.id}-panel`,
        slotName: `${child.id}-content`,
        value: child.dataset.value ?? child.getAttribute("value") ?? child.id
      };
    });

    if (!this.value && this.panels[0]) {
      this.value = this.panels[0].value;
    }

    if (this.value && !this.panels.some((panel) => panel.value === this.value) && this.panels[0]) {
      this.value = this.panels[0].value;
    }

    this.syncPanels();
    this.requestUpdate();
  }

  private select(value: string): void {
    if (value === this.value) {
      return;
    }

    this.value = value;
    this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
  }

  private handleMobileChange = (event: Event): void => {
    const currentTarget = event.currentTarget;
    if (currentTarget && typeof currentTarget === "object" && "value" in currentTarget) {
      const value = (currentTarget as { value: unknown }).value;
      this.select(typeof value === "string" ? value : String(value ?? ""));
    }
  };

  private focusTabAt(index: number): void {
    const tabs = this.tabElements;
    const target = tabs[index];
    if (!target) {
      return;
    }

    target.focus();
  }

  private handleTabKeydown = (event: KeyboardEvent): void => {
    if (this.panels.length === 0) {
      return;
    }

    const currentIndex = this.panels.findIndex((panel) => panel.value === this.value);
    const fallbackIndex = currentIndex >= 0 ? currentIndex : 0;
    handleLinearKeyboardNavigation({
      currentIndex: fallbackIndex,
      event,
      items: this.panels,
      nextKeys: ["ArrowRight", "ArrowDown"],
      onNavigate: (panel, nextIndex) => {
        this.select(panel.value);
        void this.updateComplete.then(() => {
          this.focusTabAt(nextIndex);
        });
      },
      previousKeys: ["ArrowLeft", "ArrowUp"]
    });
  };

  private syncPanels(): void {
    const children = Array.from(this.children).filter((child): child is HTMLElement => child instanceof HTMLElement);

    for (const child of children) {
      const panel = this.panels.find((entry) => entry.buttonId === `${child.id}-tab`);
      const selected = panel?.value === this.value;
      child.hidden = !selected;
      if (panel) {
        child.slot = panel.slotName;
      }

      if (child.getAttribute("role") === "tabpanel") {
        child.removeAttribute("role");
      }
      if (child.getAttribute("tabindex") === "0") {
        child.removeAttribute("tabindex");
      }
      if (child.getAttribute("aria-labelledby") === `${child.id}-tab`) {
        child.removeAttribute("aria-labelledby");
      }
    }
  }

  private syncA11y(): void {
    this.referencedTextObserver.observe(this.getAttribute("aria-labelledby"), this.getAttribute("aria-describedby"));
    this.syncA11yTarget(this.tabListElement, this.tabListA11yIdBase, undefined);
    this.syncA11yTarget(this.mobileControlElement, `${this.tabListA11yIdBase}-mobile`, "Select tab");
  }

  private get tabElements(): HTMLButtonElement[] {
    return Array.from(this.renderRoot.querySelectorAll('button[role="tab"]'));
  }

  private get tabListElement(): HTMLElement | null {
    return this.renderRoot.querySelector('[part="list"]');
  }

  private get mobileControlElement(): HTMLSelectElement | null {
    return this.renderRoot.querySelector('select[part="mobile-control"]');
  }

  private get tabListA11yIdBase(): string {
    return `${this.id || this.generatedA11yId}`;
  }

  private handleViewportResize = (): void => {
    this.syncResponsiveMode();
  };

  private syncResponsiveMode(): void {
    const nextCompactMode = typeof window !== "undefined" && window.innerWidth <= DEFAULT_MOBILE_BREAKPOINT;

    if (this.compactModeActive === nextCompactMode) {
      return;
    }

    this.compactModeActive = nextCompactMode;
    this.requestUpdate();
  }

  private syncA11yTarget(target: HTMLElement | null, idBase: string, fallbackLabel?: string): void {
    if (!target) {
      syncA11yMirror(this.renderRoot, idBase, "label", "");
      syncA11yMirror(this.renderRoot, idBase, "description", "");
      return;
    }

    const labelledByText = resolveReferencedText(this, this.getAttribute("aria-labelledby"));
    const ariaLabel = normalizeA11yText(this.getAttribute("aria-label")) || fallbackLabel || "";
    if (labelledByText) {
      const labelId = syncA11yMirror(this.renderRoot, idBase, "label", labelledByText);
      if (labelId) {
        target.setAttribute("aria-labelledby", labelId);
      }
      target.removeAttribute("aria-label");
    } else {
      syncA11yMirror(this.renderRoot, idBase, "label", "");
      target.removeAttribute("aria-labelledby");
      if (ariaLabel) {
        target.setAttribute("aria-label", ariaLabel);
      } else {
        target.removeAttribute("aria-label");
      }
    }

    const describedByText = resolveReferencedText(this, this.getAttribute("aria-describedby"));
    const descriptionText = normalizeA11yText([this.getAttribute("aria-description"), describedByText].filter((value) => value).join(" "));
    const descriptionId = syncA11yMirror(this.renderRoot, idBase, "description", descriptionText);
    if (descriptionId) {
      target.setAttribute("aria-describedby", descriptionId);
    } else {
      target.removeAttribute("aria-describedby");
    }
  }
}
