import { css, html, LitElement } from "lit";

/**
 * Panel surface used inside {@link EmbSplitter}.
 *
 * @slot - Panel content.
 */
export class EmbSplitterPanel extends LitElement {
  static styles = css`
    :host {
      display: block;
      min-width: 0;
      min-height: 0;
      overflow: auto;
      box-sizing: border-box;
      background: var(--surface);
      color: var(--fg);
    }
  `;

  static properties = {
    minSize: { attribute: "min-size", type: Number, reflect: true },
    size: { type: Number, reflect: true }
  };

  minSize = 10;
  size = 0;

  protected override render() {
    return html`<slot></slot>`;
  }
}
