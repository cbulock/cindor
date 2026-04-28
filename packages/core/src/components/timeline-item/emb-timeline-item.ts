import { css, html, LitElement } from "lit";

/**
 * Single event row used inside {@link EmbTimeline}.
 *
 * @slot title - Main event title.
 * @slot timestamp - Secondary event time or date.
 * @slot - Event body content.
 */
export class EmbTimelineItem extends LitElement {
  static styles = css`
    :host {
      display: block;
      position: relative;
      padding-inline-start: calc(var(--space-4) + 0.75rem);
    }

    :host::before {
      content: "";
      position: absolute;
      inset-block-start: 0.4rem;
      inset-inline-start: 0;
      width: 0.75rem;
      height: 0.75rem;
      border-radius: 999px;
      background: var(--accent);
      box-shadow: 0 0 0 4px color-mix(in srgb, var(--accent) 16%, transparent);
    }

    .surface {
      display: grid;
      gap: var(--space-1);
      padding-block-end: var(--space-5);
    }

    .header {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      gap: var(--space-2);
    }

    .title {
      font-weight: var(--weight-medium);
      color: var(--fg);
    }

    .timestamp,
    .body {
      color: var(--fg-muted);
      font-size: var(--text-sm);
    }
  `;

  protected override render() {
    return html`
      <div class="surface" part="surface">
        <div class="header" part="header">
          <span class="title" part="title"><slot name="title"></slot></span>
          <span class="timestamp" part="timestamp"><slot name="timestamp"></slot></span>
        </div>
        <div class="body" part="body"><slot></slot></div>
      </div>
    `;
  }
}
