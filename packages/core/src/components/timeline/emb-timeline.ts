import { css, html, LitElement } from "lit";

/**
 * Ordered event timeline for status history and activity summaries.
 *
 * @slot - `emb-timeline-item` children.
 */
export class EmbTimeline extends LitElement {
  static styles = css`
    :host {
      display: block;
      color: var(--fg);
    }

    ol {
      position: relative;
      display: grid;
      gap: 0;
      margin: 0;
      padding: 0;
      list-style: none;
    }

    ol::before {
      content: "";
      position: absolute;
      inset-block: 0 var(--space-4);
      inset-inline-start: 0.35rem;
      width: 2px;
      background: color-mix(in srgb, var(--border) 70%, transparent);
    }
  `;

  protected override render() {
    return html`<ol part="list"><slot></slot></ol>`;
  }
}
