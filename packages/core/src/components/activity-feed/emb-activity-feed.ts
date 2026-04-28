import { css, html, LitElement } from "lit";

/**
 * Vertical feed for richer activity history, updates, and audit-style event streams.
 *
 * @slot - `emb-activity-item` children.
 */
export class EmbActivityFeed extends LitElement {
  static styles = css`
    :host {
      display: block;
      color: var(--fg);
    }

    .feed {
      display: grid;
      gap: var(--space-3);
    }
  `;

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute("role", "list");
  }

  protected override render() {
    return html`<div class="feed" part="feed"><slot></slot></div>`;
  }
}
