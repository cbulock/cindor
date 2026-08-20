import { css, html, LitElement } from "lit";
import { ifDefined } from "lit/directives/if-defined.js";

/**
 * Durable inbox surface for notifications that need to persist beyond transient toast messaging.
 *
 * @slot - Notification items such as `cindor-activity-item`, cards, or custom rows.
 * @slot actions - Optional trailing header actions.
 * @slot empty - Optional custom empty state content shown when no notification items are slotted.
 * @slot filters - Optional controls such as tabs, segmented controls, or buttons for filtering the inbox.
 * @slot footer - Optional footer content such as pagination, status, or archive actions.
 * @slot meta - Optional supporting metadata shown below the title copy.
 */
export class CindorNotificationCenter extends LitElement {
  static styles = css`
    :host {
      display: block;
      color: var(--fg);
    }

    .surface {
      display: grid;
      gap: var(--space-4);
      padding: var(--space-4);
      border: 1px solid var(--border);
      border-radius: var(--radius-xl);
      background:
        linear-gradient(
          180deg,
          color-mix(in srgb, var(--surface-raised, var(--surface)) 88%, var(--accent) 5%),
          var(--surface)
        );
      box-shadow: var(--shadow-sm);
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

    .eyebrow {
      color: color-mix(in srgb, var(--accent) 32%, var(--fg-muted));
      font-size: var(--text-eyebrow-size);
      font-weight: var(--text-eyebrow-weight);
      letter-spacing: var(--text-eyebrow-tracking);
      line-height: var(--text-eyebrow-leading);
      text-transform: uppercase;
    }

    .title {
      margin: 0;
      font-size: clamp(1.25rem, 2vw, 1.75rem);
      line-height: 1.1;
    }

    .description,
    .meta,
    .footer,
    .empty-message {
      color: var(--fg-muted);
      font-size: var(--text-sm);
      line-height: var(--text-body-leading);
    }

    .description,
    .empty-message {
      margin: 0;
    }

    .meta {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2);
    }

    .actions {
      display: inline-flex;
      flex-wrap: wrap;
      justify-content: flex-end;
      gap: var(--space-2);
    }

    .toolbar {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: var(--space-3);
      align-items: center;
      padding-block-end: var(--space-2);
      border-block-end: 1px solid color-mix(in srgb, var(--border) 82%, transparent);
    }

    .summary {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2);
    }

    .summary-chip {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      min-height: 2rem;
      padding-inline: var(--space-3);
      border: 1px solid var(--border);
      border-radius: 999px;
      background: color-mix(in srgb, var(--surface-raised, var(--surface)) 86%, var(--bg-subtle));
      font-size: var(--text-sm);
      white-space: nowrap;
    }

    .summary-chip--accent {
      border-color: color-mix(in srgb, var(--accent) 24%, var(--border));
      background: color-mix(in srgb, var(--accent) 10%, var(--surface-raised, var(--surface)));
      color: color-mix(in srgb, var(--accent) 56%, var(--fg));
    }

    .summary-chip strong {
      color: var(--fg);
      font-weight: var(--weight-semibold);
    }

    .filters {
      display: inline-flex;
      flex-wrap: wrap;
      justify-content: flex-end;
      gap: var(--space-2);
    }

    .content {
      min-width: 0;
    }

    .list {
      display: grid;
      gap: var(--space-3);
    }

    .empty {
      display: grid;
      gap: var(--space-2);
      justify-items: start;
      padding: var(--space-5);
      border: 1px dashed var(--border);
      border-radius: var(--radius-lg);
      background: color-mix(in srgb, var(--bg-subtle) 80%, var(--surface));
    }

    .empty-title {
      margin: 0;
      font-size: var(--text-lg);
      font-weight: var(--weight-semibold);
      line-height: 1.2;
    }

    .footer {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2);
      justify-content: space-between;
      padding-block-start: var(--space-2);
      border-block-start: 1px solid color-mix(in srgb, var(--border) 82%, transparent);
    }

    @media (max-width: 720px) {
      .header,
      .toolbar {
        grid-template-columns: minmax(0, 1fr);
      }

      .actions,
      .filters {
        justify-content: flex-start;
      }
    }
  `;

  static properties = {
    description: { reflect: true },
    emptyHeadline: { reflect: true, attribute: "empty-headline" },
    emptyMessage: { reflect: true, attribute: "empty-message" },
    eyebrow: { reflect: true },
    hasActionsContent: { state: true },
    hasEmptyContent: { state: true },
    hasFiltersContent: { state: true },
    hasFooterContent: { state: true },
    hasItemsContent: { state: true },
    hasMetaContent: { state: true },
    headingLevel: { type: Number, reflect: true, attribute: "heading-level" },
    title: { reflect: true },
    totalCount: { type: Number, reflect: true, attribute: "total-count" },
    unreadCount: { type: Number, reflect: true, attribute: "unread-count" }
  };

  description = "";
  emptyHeadline = "No notifications";
  emptyMessage = "You're all caught up. Durable updates will appear here.";
  eyebrow = "";
  protected hasActionsContent = false;
  protected hasEmptyContent = false;
  protected hasFiltersContent = false;
  protected hasFooterContent = false;
  protected hasItemsContent = false;
  protected hasMetaContent = false;
  headingLevel = 2;
  totalCount: number | null = null;
  title = "";
  unreadCount: number | null = null;

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
      <section aria-label=${ifDefined(this.accessibleLabel)} class="surface" part="surface" role="region">
        <div class="header" part="header">
          <div class="copy" part="copy">
            ${this.eyebrow ? html`<span class="eyebrow" part="eyebrow">${this.eyebrow}</span>` : null}
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
        ${this.shouldRenderToolbar
          ? html`
              <div class="toolbar" part="toolbar">
                ${this.hasSummary
                  ? html`
                      <div class="summary" part="summary">
                        ${this.renderSummaryChip("Total", this.totalCount)}
                        ${this.renderSummaryChip("Unread", this.unreadCount, true)}
                      </div>
                    `
                  : null}
                ${this.hasFiltersContent
                  ? html`<div class="filters" part="filters"><slot name="filters" @slotchange=${this.handleFiltersSlotChange}></slot></div>`
                  : html`<slot name="filters" hidden @slotchange=${this.handleFiltersSlotChange}></slot>`}
              </div>
            `
          : html`<slot name="filters" hidden @slotchange=${this.handleFiltersSlotChange}></slot>`}
        <div class="content" part="content">
          ${this.hasItemsContent
            ? html`<div class="list" part="list" role="list"><slot @slotchange=${this.handleDefaultSlotChange}></slot></div>`
            : this.hasEmptyContent
              ? html`<div class="empty" part="empty"><slot name="empty" @slotchange=${this.handleEmptySlotChange}></slot></div>`
              : html`
                  <div class="empty" part="empty">
                    <p class="empty-title" part="empty-title">${this.emptyHeadline}</p>
                    <p class="empty-message" part="empty-message">${this.emptyMessage}</p>
                  </div>
                  <slot hidden @slotchange=${this.handleDefaultSlotChange}></slot>
                  <slot name="empty" hidden @slotchange=${this.handleEmptySlotChange}></slot>
                `}
        </div>
        ${this.hasFooterContent
          ? html`<div class="footer" part="footer"><slot name="footer" @slotchange=${this.handleFooterSlotChange}></slot></div>`
          : html`<slot name="footer" hidden @slotchange=${this.handleFooterSlotChange}></slot>`}
      </section>
    `;
  }

  protected override firstUpdated(): void {
    this.syncSlotState();
  }

  private get accessibleLabel(): string | undefined {
    return this.getAttribute("aria-label") ?? (this.title || undefined);
  }

  private get hasSummary(): boolean {
    return Number.isFinite(this.totalCount) || Number.isFinite(this.unreadCount);
  }

  private get resolvedHeadingLevel(): number {
    const level = Number.isFinite(this.headingLevel) ? Math.trunc(this.headingLevel) : 2;
    return Math.min(6, Math.max(1, level));
  }

  private get shouldRenderToolbar(): boolean {
    return this.hasSummary || this.hasFiltersContent;
  }

  private readonly handleActionsSlotChange = (event: Event): void => {
    this.updateSlotPresence("hasActionsContent", event);
  };

  private readonly handleDefaultSlotChange = (event: Event): void => {
    this.updateSlotPresence("hasItemsContent", event);
  };

  private readonly handleEmptySlotChange = (event: Event): void => {
    this.updateSlotPresence("hasEmptyContent", event);
  };

  private readonly handleFiltersSlotChange = (event: Event): void => {
    this.updateSlotPresence("hasFiltersContent", event);
  };

  private readonly handleFooterSlotChange = (event: Event): void => {
    this.updateSlotPresence("hasFooterContent", event);
  };

  private readonly handleMetaSlotChange = (event: Event): void => {
    this.updateSlotPresence("hasMetaContent", event);
  };

  private renderSummaryChip(label: string, value: number | null, emphasize = false) {
    if (!Number.isFinite(value)) {
      return null;
    }

    return html`
      <span class="summary-chip ${emphasize ? "summary-chip--accent" : ""}" part=${emphasize ? "summary-chip summary-chip-unread" : "summary-chip"}>
        <strong>${value}</strong>
        <span>${label}</span>
      </span>
    `;
  }

  private slotHasContent(selector: string): boolean {
    const slot = this.renderRoot.querySelector(selector);
    return slot instanceof HTMLSlotElement ? this.hasAssignedContent(slot) : false;
  }

  private syncSlotState(): void {
    this.hasMetaContent = this.slotHasContent('slot[name="meta"]');
    this.hasActionsContent = this.slotHasContent('slot[name="actions"]');
    this.hasFiltersContent = this.slotHasContent('slot[name="filters"]');
    this.hasFooterContent = this.slotHasContent('slot[name="footer"]');
    this.hasEmptyContent = this.slotHasContent('slot[name="empty"]');
    this.hasItemsContent = this.slotHasContent("slot:not([name])");
  }

  private updateSlotPresence(
    key:
      | "hasActionsContent"
      | "hasEmptyContent"
      | "hasFiltersContent"
      | "hasFooterContent"
      | "hasItemsContent"
      | "hasMetaContent",
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
