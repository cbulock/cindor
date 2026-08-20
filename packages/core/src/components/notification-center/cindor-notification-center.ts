import { css, html, LitElement, nothing } from "lit";
import { ifDefined } from "lit/directives/if-defined.js";

import type { BadgeTone } from "../badge/cindor-badge.js";

export type NotificationCenterItem = {
  badge?: string;
  badgeTone?: BadgeTone;
  body?: string;
  dismissible?: boolean;
  id: string;
  meta?: string;
  timestamp?: string;
  title: string;
  unread?: boolean;
};

export type NotificationCenterSelectDetail = {
  index: number;
  item: NotificationCenterItem;
  items: NotificationCenterItem[];
};

export type NotificationCenterReadChangeDetail = NotificationCenterSelectDetail & {
  unread: boolean;
};

export type NotificationCenterMarkAllReadDetail = {
  items: NotificationCenterItem[];
};

/**
 * Persistent inbox-style surface for product notifications, alerts, and updates.
 *
 * Pass `notifications` to render rows and listen for emitted events to update application state.
 *
 * @summary Persistent inbox-style notification list with empty, read, and dismiss states.
 * @tag cindor-notification-center
 * @fires {CustomEvent<NotificationCenterSelectDetail>} notification-select - Fired when a notification row is activated.
 * @fires {CustomEvent<NotificationCenterReadChangeDetail>} notification-read-change - Fired when a notification read state is toggled.
 * @fires {CustomEvent<NotificationCenterSelectDetail>} notification-dismiss - Fired when a notification dismiss action is triggered.
 * @fires {CustomEvent<NotificationCenterMarkAllReadDetail>} notification-mark-all-read - Fired when all unread notifications should be marked read.
 * @fires {CustomEvent<Record<string, never>>} notification-empty-action - Fired when the empty-state action is triggered.
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
      background: var(--surface);
      box-shadow: var(--shadow-xs);
    }

    .header {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: var(--space-3);
      align-items: start;
    }

    .copy,
    .summary,
    .list,
    .item-copy {
      display: grid;
    }

    .copy,
    .item-copy {
      gap: var(--space-2);
      min-width: 0;
    }

    .summary {
      gap: var(--space-2);
    }

    .title {
      margin: 0;
      font-size: var(--text-lg);
      font-weight: var(--weight-semibold);
    }

    .description,
    .summary-text,
    .meta,
    .body,
    .timestamp,
    .empty-copy {
      color: var(--fg-muted);
      font-size: var(--text-sm);
    }

    .description,
    .body {
      margin: 0;
    }

    .summary-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--space-2);
    }

    .header-actions,
    .item-actions,
    .item-meta {
      display: inline-flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--space-2);
    }

    .header-actions,
    .item-actions {
      justify-content: flex-end;
    }

    .list {
      gap: var(--space-3);
    }

    .item {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr) auto;
      gap: var(--space-3);
      align-items: start;
      padding: var(--space-4);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      background: color-mix(in srgb, var(--surface) 92%, var(--bg-subtle));
      cursor: pointer;
      transition:
        border-color var(--duration-base) var(--ease-out),
        background var(--duration-base) var(--ease-out),
        box-shadow var(--duration-base) var(--ease-out),
        transform var(--duration-fast, 120ms) var(--ease-out);
    }

    .item:hover {
      border-color: var(--border-strong);
      background: color-mix(in srgb, var(--surface) 80%, var(--bg-subtle));
      transform: translateY(-1px);
    }

    .item:focus-visible {
      outline: none;
      box-shadow: var(--ring-focus);
    }

    .item[data-unread="true"] {
      border-color: color-mix(in srgb, var(--accent) 38%, var(--border));
      background: color-mix(in srgb, var(--accent) 10%, var(--surface));
      box-shadow: inset 3px 0 0 color-mix(in srgb, var(--accent) 82%, transparent);
    }

    .status {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-inline-size: 1rem;
      padding-block-start: 0.375rem;
    }

    .status-dot {
      inline-size: 0.75rem;
      block-size: 0.75rem;
      border-radius: 999px;
      background: color-mix(in srgb, var(--accent) 34%, var(--border));
      box-shadow: 0 0 0 4px color-mix(in srgb, var(--accent) 10%, transparent);
      transition:
        background var(--duration-base) var(--ease-out),
        box-shadow var(--duration-base) var(--ease-out);
    }

    .item[data-unread="true"] .status-dot {
      background: var(--accent);
      box-shadow: 0 0 0 5px color-mix(in srgb, var(--accent) 14%, transparent);
    }

    .item-header {
      display: flex;
      flex-wrap: wrap;
      align-items: start;
      justify-content: space-between;
      gap: var(--space-2) var(--space-3);
    }

    .item-title-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--space-2);
      min-width: 0;
    }

    .item-title {
      font-weight: var(--weight-semibold);
      color: var(--fg);
    }

    .item-title,
    .body {
      overflow-wrap: anywhere;
    }

    .timestamp {
      white-space: nowrap;
    }

    .item-meta {
      color: var(--fg-muted);
      min-height: 1.75rem;
    }

    .action-button {
      --cindor-button-min-height: 2rem;
      --cindor-button-padding-inline: var(--space-3);
    }

    .item[data-unread="false"] .toggle-read::part(label) {
      color: var(--fg-muted);
    }

    cindor-empty-state {
      min-block-size: 16rem;
      align-self: stretch;
    }

    .empty {
      inline-size: 100%;
    }

    .empty-heading {
      margin: 0 0 var(--space-2);
      font-size: var(--text-lg);
      font-weight: var(--weight-semibold);
      color: var(--fg);
    }

    .empty-copy {
      margin: 0;
      max-inline-size: 40ch;
    }

    @media (max-width: 720px) {
      .header,
      .item {
        grid-template-columns: minmax(0, 1fr);
      }

      .header-actions,
      .item-actions {
        justify-content: flex-start;
      }

      .status {
        display: none;
      }
    }
  `;

  static properties = {
    description: { reflect: true },
    emptyActionLabel: { reflect: true, attribute: "empty-action-label" },
    emptyDescription: { reflect: true, attribute: "empty-description" },
    emptyTitle: { reflect: true, attribute: "empty-title" },
    headingLevel: { type: Number, reflect: true, attribute: "heading-level" },
    notifications: { attribute: false },
    showDismissAction: { type: Boolean, reflect: true, attribute: "show-dismiss-action" },
    showMarkAllAction: { type: Boolean, reflect: true, attribute: "show-mark-all-action" },
    showReadAction: { type: Boolean, reflect: true, attribute: "show-read-action" },
    title: { reflect: true }
  };

  description = "";
  emptyActionLabel = "";
  emptyDescription = "New notifications will appear here when activity starts flowing in.";
  emptyTitle = "No notifications";
  headingLevel = 2;
  notifications: NotificationCenterItem[] = [];
  showDismissAction = true;
  showMarkAllAction = true;
  showReadAction = true;
  title = "Notifications";

  protected override render() {
    const unreadCount = this.notifications.filter((item) => item.unread).length;
    const totalCount = this.notifications.length;

    return html`
      <section aria-label=${ifDefined(this.accessibleLabel)} class="surface" part="surface" role="region">
        <div class="header" part="header">
          <div class="copy" part="copy">
            ${this.renderHeading()}
            ${this.description ? html`<p class="description" part="description">${this.description}</p>` : nothing}
            <div class="summary" part="summary">
              <div class="summary-row" part="summary-row">
                ${unreadCount > 0 ? html`<cindor-badge part="unread-count" tone="accent">${unreadCount} unread</cindor-badge>` : nothing}
                <span class="summary-text" part="summary-text">
                  ${totalCount === 0 ? "Inbox is clear" : `${totalCount} notification${totalCount === 1 ? "" : "s"}`}
                </span>
              </div>
            </div>
          </div>
          <div class="header-actions" part="header-actions">
            ${this.showMarkAllAction && unreadCount > 0
              ? html`
                  <cindor-button class="action-button" part="mark-all-read" variant="ghost" @click=${this.handleMarkAllRead}>
                    Mark all read
                  </cindor-button>
                `
              : nothing}
            <slot name="actions"></slot>
          </div>
        </div>
        ${totalCount > 0 ? this.renderList() : this.renderEmptyState()}
      </section>
    `;
  }

  private renderHeading() {
    if (!this.title) {
      return nothing;
    }

    if (this.resolvedHeadingLevel === 1) {
      return html`<h1 class="title" part="title">${this.title}</h1>`;
    }
    if (this.resolvedHeadingLevel === 2) {
      return html`<h2 class="title" part="title">${this.title}</h2>`;
    }
    if (this.resolvedHeadingLevel === 3) {
      return html`<h3 class="title" part="title">${this.title}</h3>`;
    }
    if (this.resolvedHeadingLevel === 4) {
      return html`<h4 class="title" part="title">${this.title}</h4>`;
    }
    if (this.resolvedHeadingLevel === 5) {
      return html`<h5 class="title" part="title">${this.title}</h5>`;
    }

    return html`<h6 class="title" part="title">${this.title}</h6>`;
  }

  private renderList() {
    return html`
      <div class="list" part="list" role="list">
        ${this.notifications.map((item, index) => {
          const titleId = `cindor-notification-center-title-${index}`;

          return html`
            <article
              aria-labelledby=${titleId}
              class="item"
              data-unread=${String(Boolean(item.unread))}
              part=${item.unread ? "item item-unread" : "item"}
              role="listitem"
              tabindex="0"
              @click=${(event: MouseEvent) => this.handleSelect(index, event)}
              @keydown=${(event: KeyboardEvent) => this.handleItemKeyDown(index, event)}
            >
              <div class="status" part="status">
                <span class="status-dot" aria-hidden="true"></span>
              </div>
              <div class="item-copy" part="item-copy">
                <div class="item-header" part="item-header">
                  <div class="item-copy" part="item-heading">
                    <div class="item-title-row" part="item-title-row">
                      <span class="item-title" id=${titleId} part="item-title">${item.title}</span>
                      ${item.badge
                        ? html`<cindor-badge tone=${item.badgeTone ?? "neutral"} part="item-badge">${item.badge}</cindor-badge>`
                        : nothing}
                    </div>
                    ${item.meta || item.timestamp
                      ? html`
                          <div class="item-meta" part="item-meta">
                            ${item.meta ? html`<span part="item-meta-copy">${item.meta}</span>` : nothing}
                            ${item.timestamp ? html`<span class="timestamp" part="item-timestamp">${item.timestamp}</span>` : nothing}
                          </div>
                        `
                      : nothing}
                  </div>
                  <div class="item-actions" part="item-actions">
                    ${this.showReadAction
                      ? html`
                          <cindor-button
                            class="action-button toggle-read"
                            part="toggle-read"
                            variant="ghost"
                            @click=${(event: MouseEvent) => this.handleReadToggle(index, event)}
                          >
                            ${item.unread ? "Mark read" : "Mark unread"}
                          </cindor-button>
                        `
                      : nothing}
                    ${this.showDismissAction && item.dismissible !== false
                      ? html`
                          <cindor-button
                            class="action-button"
                            part="dismiss"
                            variant="ghost"
                            @click=${(event: MouseEvent) => this.handleDismiss(index, event)}
                          >
                            Dismiss
                          </cindor-button>
                        `
                      : nothing}
                  </div>
                </div>
                ${item.body ? html`<p class="body" part="item-body">${item.body}</p>` : nothing}
              </div>
            </article>
          `;
        })}
      </div>
    `;
  }

  private renderEmptyState() {
    return html`
      <cindor-empty-state class="empty" part="empty">
        <cindor-icon name="inbox" part="empty-media" size="28" slot="media"></cindor-icon>
        <div part="empty-content">
          <h3 class="empty-heading">${this.emptyTitle}</h3>
          <p class="empty-copy">${this.emptyDescription}</p>
        </div>
        ${this.emptyActionLabel
          ? html`
              <cindor-button part="empty-action" slot="actions" @click=${this.handleEmptyAction}>${this.emptyActionLabel}</cindor-button>
            `
          : nothing}
      </cindor-empty-state>
    `;
  }

  private get accessibleLabel(): string | undefined {
    return this.getAttribute("aria-label") ?? (this.title || undefined);
  }

  private get resolvedHeadingLevel(): number {
    return Math.min(6, Math.max(1, Math.trunc(this.headingLevel || 2)));
  }

  private readonly handleEmptyAction = (): void => {
    this.dispatchEvent(new CustomEvent<Record<string, never>>("notification-empty-action", { bubbles: true, composed: true, detail: {} }));
  };

  private readonly handleMarkAllRead = (): void => {
    this.dispatchEvent(
      new CustomEvent<NotificationCenterMarkAllReadDetail>("notification-mark-all-read", {
        bubbles: true,
        composed: true,
        detail: {
          items: this.notifications.filter((item) => item.unread)
        }
      })
    );
  };

  private handleDismiss(index: number, event: Event): void {
    event.stopPropagation();
    this.emitSelectionEvent("notification-dismiss", index);
  }

  private handleReadToggle(index: number, event: Event): void {
    event.stopPropagation();
    const item = this.notifications[index];
    if (!item) {
      return;
    }

    this.dispatchEvent(
      new CustomEvent<NotificationCenterReadChangeDetail>("notification-read-change", {
        bubbles: true,
        composed: true,
        detail: {
          index,
          item,
          items: [...this.notifications],
          unread: !item.unread
        }
      })
    );
  }

  private handleSelect(index: number, event: Event): void {
    if (this.isInteractiveTarget(event.target)) {
      return;
    }

    this.emitSelectionEvent("notification-select", index);
  }

  private handleItemKeyDown(index: number, event: KeyboardEvent): void {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    if (this.isInteractiveTarget(event.target)) {
      return;
    }

    event.preventDefault();
    this.emitSelectionEvent("notification-select", index);
  }

  private emitSelectionEvent(name: "notification-dismiss" | "notification-select", index: number): void {
    const item = this.notifications[index];
    if (!item) {
      return;
    }

    this.dispatchEvent(
      new CustomEvent<NotificationCenterSelectDetail>(name, {
        bubbles: true,
        composed: true,
        detail: {
          index,
          item,
          items: [...this.notifications]
        }
      })
    );
  }

  private isInteractiveTarget(target: EventTarget | null): boolean {
    return target instanceof Element && target.closest("cindor-button, cindor-icon-button, button, a, input, select, textarea") !== null;
  }
}
