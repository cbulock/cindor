import { css, html, LitElement } from "lit";

import { handleLinearKeyboardNavigation } from "../shared/linear-navigation.js";

type TabPanel = {
  buttonId: string;
  label: string;
  panelId: string;
  slotName: string;
  value: string;
};

export class CindorTabs extends LitElement {
  static styles = css`
    :host {
      display: grid;
      gap: var(--space-4);
      color: var(--fg);
    }

    [part="list"] {
      display: flex;
      gap: var(--space-2);
      border-bottom: 1px solid var(--border);
      padding-bottom: var(--space-2);
    }

    button {
      font: inherit;
      padding: var(--space-2) var(--space-3);
      border: 1px solid transparent;
      border-radius: var(--radius-md);
      background: transparent;
      color: var(--fg-muted);
      cursor: pointer;
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
  `;

  static properties = {
    value: { reflect: true }
  };

  value = "";

  private readonly panelObserver = new MutationObserver(() => {
    this.refreshPanels();
  });
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
    this.refreshPanels();
  }

  override disconnectedCallback(): void {
    this.panelObserver.disconnect();
    super.disconnectedCallback();
  }

  protected override render() {
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
    this.syncListA11y();
    this.syncPanels();
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
    this.value = value;
    this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
  }

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

  private syncListA11y(): void {
    const list = this.tabListElement;
    if (!list) {
      return;
    }

    for (const attributeName of ["aria-label", "aria-labelledby", "aria-describedby"]) {
      const attributeValue = this.getAttribute(attributeName);
      if (attributeValue === null || attributeValue === "") {
        list.removeAttribute(attributeName);
      } else {
        list.setAttribute(attributeName, attributeValue);
      }
    }
  }

  private get tabElements(): HTMLButtonElement[] {
    return Array.from(this.renderRoot.querySelectorAll('button[role="tab"]'));
  }

  private get tabListElement(): HTMLElement | null {
    return this.renderRoot.querySelector('[part="list"]');
  }
}
