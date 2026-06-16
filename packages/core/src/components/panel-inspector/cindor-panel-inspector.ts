import { css, html, LitElement } from "lit";
import { ifDefined } from "lit/directives/if-defined.js";

/**
 * Reusable details panel surface for inspector, properties, and supplemental context.
 *
 * @slot - Main panel body content.
 * @slot actions - Optional trailing header actions.
 * @slot footer - Optional footer content such as buttons or summaries.
 * @slot meta - Optional metadata shown below the title copy.
 */
export class CindorPanelInspector extends LitElement {
  static styles = css`
    :host {
      display: block;
      color: var(--fg);
    }

    :host([sticky]) {
      position: sticky;
      inset-block-start: var(--space-4);
    }

    .surface {
      display: grid;
      gap: var(--space-4);
      padding: var(--space-4);
      border: 1px solid var(--border);
      border-radius: var(--radius-xl);
      background: var(--surface);
      box-shadow: var(--shadow-xs);
    }

    .header {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: var(--space-3);
      align-items: start;
    }

    .copy {
      display: grid;
      gap: var(--space-2);
      min-width: 0;
    }

    .title {
      margin: 0;
      font-size: var(--text-lg);
      font-weight: var(--weight-semibold);
    }

    .description,
    .meta,
    .footer {
      color: var(--fg-muted);
      font-size: var(--text-sm);
    }

    .description {
      margin: 0;
    }

    .actions {
      display: inline-flex;
      flex-wrap: wrap;
      justify-content: flex-end;
      gap: var(--space-2);
    }

    .body {
      display: grid;
      gap: var(--space-3);
    }

    @media (max-width: 720px) {
      .header {
        grid-template-columns: minmax(0, 1fr);
      }

      .actions {
        justify-content: flex-start;
      }
    }
  `;

  static properties = {
    description: { reflect: true },
    headingLevel: { type: Number, reflect: true, attribute: "heading-level" },
    hasActionsContent: { state: true },
    hasBodyContent: { state: true },
    hasFooterContent: { state: true },
    hasMetaContent: { state: true },
    sticky: { type: Boolean, reflect: true },
    title: { reflect: true }
  };

  /** Supporting copy shown below the title. */
  description = "";
  /** Heading level used for the inspector title, clamped between 1 and 6. */
  headingLevel = 2;
  protected hasActionsContent = false;
  protected hasBodyContent = false;
  protected hasFooterContent = false;
  protected hasMetaContent = false;
  /** Pins the inspector near the top of the viewport while its container scrolls. */
  sticky = false;
  /** Primary heading text for the inspector. */
  title = "";

  protected override render() {
    const titleTemplate = this.title
      ? this.resolvedHeadingLevel === 1
        ? html`<h1 class="title" part="title">${this.title}</h1>`
        : this.resolvedHeadingLevel === 2
          ? html`<h2 class="title" part="title">${this.title}</h2>`
          : this.resolvedHeadingLevel === 3
            ? html`<h3 class="title" part="title">${this.title}</h3>`
            : this.resolvedHeadingLevel === 4
              ? html`<h4 class="title" part="title">${this.title}</h4>`
              : this.resolvedHeadingLevel === 5
                ? html`<h5 class="title" part="title">${this.title}</h5>`
                : html`<h6 class="title" part="title">${this.title}</h6>`
      : null;

    return html`
      <aside aria-label=${ifDefined(this.accessibleLabel)} class="surface" part="surface">
        <div class="header" part="header">
          <div class="copy" part="copy">
            ${titleTemplate}
            ${this.description ? html`<p class="description" part="description">${this.description}</p>` : null}
            ${this.hasMetaContent
              ? html`<div class="meta" part="meta"><slot name="meta" @slotchange=${this.handleMetaSlotChange}></slot></div>`
              : html`<slot name="meta" hidden @slotchange=${this.handleMetaSlotChange}></slot>`}
          </div>
          ${this.hasActionsContent
            ? html`<div class="actions" part="actions"><slot name="actions" @slotchange=${this.handleActionsSlotChange}></slot></div>`
            : html`<slot name="actions" hidden @slotchange=${this.handleActionsSlotChange}></slot>`}
        </div>
        ${this.hasBodyContent
          ? html`<div class="body" part="body"><slot @slotchange=${this.handleBodySlotChange}></slot></div>`
          : html`<slot hidden @slotchange=${this.handleBodySlotChange}></slot>`}
        ${this.hasFooterContent
          ? html`<div class="footer" part="footer"><slot name="footer" @slotchange=${this.handleFooterSlotChange}></slot></div>`
          : html`<slot name="footer" hidden @slotchange=${this.handleFooterSlotChange}></slot>`}
      </aside>
    `;
  }

  protected override firstUpdated(): void {
    this.syncSlotState();
  }

  private get accessibleLabel(): string | undefined {
    return this.getAttribute("aria-label") ?? (this.title || undefined);
  }

  private get resolvedHeadingLevel(): number {
    const level = Number.isFinite(this.headingLevel) ? Math.trunc(this.headingLevel) : 2;
    return Math.min(6, Math.max(1, level));
  }

  private readonly handleActionsSlotChange = (event: Event): void => {
    this.updateSlotPresence("hasActionsContent", event);
  };

  private readonly handleBodySlotChange = (event: Event): void => {
    this.updateSlotPresence("hasBodyContent", event);
  };

  private readonly handleFooterSlotChange = (event: Event): void => {
    this.updateSlotPresence("hasFooterContent", event);
  };

  private readonly handleMetaSlotChange = (event: Event): void => {
    this.updateSlotPresence("hasMetaContent", event);
  };

  private syncSlotState(): void {
    this.hasMetaContent = this.slotHasContent('slot[name="meta"]');
    this.hasActionsContent = this.slotHasContent('slot[name="actions"]');
    this.hasBodyContent = this.slotHasContent("slot:not([name])");
    this.hasFooterContent = this.slotHasContent('slot[name="footer"]');
  }

  private slotHasContent(selector: string): boolean {
    const slot = this.renderRoot.querySelector(selector);
    return slot instanceof HTMLSlotElement ? this.hasAssignedContent(slot) : false;
  }

  private updateSlotPresence(
    key: "hasActionsContent" | "hasBodyContent" | "hasFooterContent" | "hasMetaContent",
    event: Event
  ): void {
    const slot = event.target;
    if (!(slot instanceof HTMLSlotElement)) {
      return;
    }

    const nextValue = this.hasAssignedContent(slot);
    if (this[key] !== nextValue) {
      this[key] = nextValue;
      this.requestUpdate();
    }
  }

  private hasAssignedContent(slot: HTMLSlotElement): boolean {
    return slot.assignedNodes({ flatten: true }).some((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        return true;
      }

      return node.nodeType === Node.TEXT_NODE && node.textContent?.trim().length;
    });
  }
}
