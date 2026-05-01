import { css, html, LitElement } from "lit";

export class CindorHelperText extends LitElement {
  static styles = css`
    :host {
      display: block;
      color: var(--fg-muted);
      font-size: var(--text-sm);
      line-height: 1.5;
    }
  `;

  protected override render() {
    return html`<slot></slot>`;
  }
}
