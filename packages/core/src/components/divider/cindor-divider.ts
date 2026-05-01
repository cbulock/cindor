import { css, html, LitElement } from "lit";

export class CindorDivider extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    hr {
      margin: 0;
      border: 0;
      border-top: 1px solid var(--border);
    }
  `;

  protected override render() {
    return html`<hr part="line" />`;
  }
}
