import { css, html, LitElement } from "lit";

/**
 * Key-value description list for metadata and detail pages.
 *
 * @slot - `emb-description-item` children.
 */
export class EmbDescriptionList extends LitElement {
  static styles = css`
    :host {
      display: block;
      color: var(--fg);
    }

    dl {
      display: grid;
      grid-template-columns: minmax(10rem, 14rem) minmax(0, 1fr);
      gap: var(--space-2) var(--space-4);
      margin: 0;
    }

    ::slotted(emb-description-item) {
      display: contents;
    }
  `;

  protected override render() {
    return html`<dl part="list"><slot></slot></dl>`;
  }
}
