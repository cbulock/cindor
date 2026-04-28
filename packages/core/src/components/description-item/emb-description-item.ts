import { css, html, LitElement } from "lit";

/**
 * Term-and-value pair used inside {@link EmbDescriptionList}.
 *
 * @slot term - Label for the value.
 * @slot - Value content.
 */
export class EmbDescriptionItem extends LitElement {
  static styles = css`
    :host {
      display: contents;
    }

    .term {
      color: var(--fg-muted);
      font-size: var(--text-sm);
      font-weight: var(--weight-medium);
    }

    .detail {
      color: var(--fg);
    }
  `;

  protected override render() {
    return html`
      <dt class="term" part="term"><slot name="term"></slot></dt>
      <dd class="detail" part="detail"><slot></slot></dd>
    `;
  }
}
