import { css, html, LitElement } from "lit";

type TabPanel = {
  id: string;
  label: string;
  value: string;
};

export class EmbTabs extends LitElement {
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
              id=${`${panel.id}-tab`}
              role="tab"
              type="button"
              aria-controls=${panel.id}
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
        <slot @slotchange=${this.handleSlotChange}></slot>
      </div>
    `;
  }

  protected override updated(): void {
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
        child.id = `emb-tab-panel-${this.panelIndex}`;
      }

      return {
        id: child.id,
        label: child.dataset.label ?? `Tab ${index + 1}`,
        value: child.dataset.value ?? child.id
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
    let nextIndex: number | null = null;

    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        nextIndex = (fallbackIndex + 1) % this.panels.length;
        break;
      case "ArrowLeft":
      case "ArrowUp":
        nextIndex = (fallbackIndex - 1 + this.panels.length) % this.panels.length;
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = this.panels.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();

    const nextPanel = this.panels[nextIndex];
    if (!nextPanel) {
      return;
    }

    this.select(nextPanel.value);
    void this.updateComplete.then(() => {
      this.focusTabAt(nextIndex);
    });
  };

  private syncPanels(): void {
    const children = Array.from(this.children).filter((child): child is HTMLElement => child instanceof HTMLElement);

    for (const child of children) {
      const panel = this.panels.find((entry) => entry.id === child.id);
      const selected = panel?.value === this.value;
      child.hidden = !selected;
      child.setAttribute("role", "tabpanel");
      child.setAttribute("tabindex", "0");
      if (panel) {
        child.setAttribute("aria-labelledby", `${panel.id}-tab`);
      }
    }
  }

  private get tabElements(): HTMLButtonElement[] {
    return Array.from(this.renderRoot.querySelectorAll('button[role="tab"]'));
  }
}
