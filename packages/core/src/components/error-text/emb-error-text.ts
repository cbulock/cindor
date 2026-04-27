import { css, html, LitElement } from "lit";

export class EmbErrorText extends LitElement {
  static styles = css`
    :host {
      display: block;
      color: var(--danger);
      font-size: var(--text-sm);
      line-height: 1.5;
    }
  `;

  protected override render() {
    return html`<span role="alert" aria-live="polite"><slot></slot></span>`;
  }
}
