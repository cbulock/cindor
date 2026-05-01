import { css, html, LitElement } from "lit";

/**
 * Single event row used inside {@link CindorActivityFeed}.
 *
 * @slot leading - Leading avatar, icon, or status mark.
 * @slot title - Main activity title.
 * @slot timestamp - Time or date associated with the event.
 * @slot meta - Supplemental metadata such as actor, environment, or destination.
 * @slot actions - Optional trailing actions for the activity.
 * @slot - Main event description.
 */
export class CindorActivityItem extends LitElement {
  static styles = css`
    :host {
      display: block;
      color: var(--fg);
    }

    .row {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr);
      gap: var(--space-3);
      align-items: start;
    }

    .leading {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 2.5rem;
      padding-block-start: var(--space-1);
    }

    .leading::before {
      content: "";
      width: 0.75rem;
      height: 0.75rem;
      border-radius: 999px;
      background: color-mix(in srgb, var(--accent) 30%, var(--border));
      box-shadow: 0 0 0 4px color-mix(in srgb, var(--accent) 12%, transparent);
    }

    .leading.has-custom::before {
      content: none;
    }

    .surface {
      display: grid;
      gap: var(--space-2);
      min-width: 0;
      padding: var(--space-4);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      background: var(--surface);
    }

    :host([unread]) .surface {
      border-color: color-mix(in srgb, var(--accent) 35%, var(--border));
      box-shadow: inset 3px 0 0 color-mix(in srgb, var(--accent) 70%, transparent);
    }

    .header {
      display: flex;
      flex-wrap: wrap;
      align-items: start;
      justify-content: space-between;
      gap: var(--space-2) var(--space-3);
    }

    .title-group {
      display: grid;
      gap: var(--space-1);
      min-width: 0;
    }

    .title-line {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      gap: var(--space-2);
      min-width: 0;
    }

    .title {
      color: var(--fg);
      font-weight: var(--weight-medium);
    }

    .timestamp,
    .meta,
    .body {
      color: var(--fg-muted);
      font-size: var(--text-sm);
    }

    .actions {
      display: inline-flex;
      flex-wrap: wrap;
      gap: var(--space-2);
      justify-content: end;
    }

    .body {
      margin: 0;
    }
  `;

  static properties = {
    unread: { type: Boolean, reflect: true }
  };

  unread = false;

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute("role", "listitem");
  }

  protected override render() {
    const hasCustomLeading = this.querySelector('[slot="leading"]') !== null;

    return html`
      <div class="row" part="row">
        <div class="leading ${hasCustomLeading ? "has-custom" : ""}" part="leading">
          <slot name="leading"></slot>
        </div>
        <article class="surface" part="surface">
          <div class="header" part="header">
            <div class="title-group" part="title-group">
              <div class="title-line" part="title-line">
                <span class="title" part="title"><slot name="title"></slot></span>
                <span class="timestamp" part="timestamp"><slot name="timestamp"></slot></span>
              </div>
              <span class="meta" part="meta"><slot name="meta"></slot></span>
            </div>
            <div class="actions" part="actions"><slot name="actions"></slot></div>
          </div>
          <p class="body" part="body"><slot></slot></p>
        </article>
      </div>
    `;
  }
}
