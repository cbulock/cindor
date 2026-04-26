import { css, html, LitElement } from "lit";

export class EmbSpinner extends LitElement {
  static styles = css`
    :host {
      display: inline-flex;
      color: var(--accent);
    }

    span {
      inline-size: 16px;
      block-size: 16px;
      border-radius: 50%;
      border: 2px solid color-mix(in srgb, currentColor 20%, transparent);
      border-top-color: currentColor;
      animation: emb-spinner-rotate 0.7s linear infinite;
    }

    @keyframes emb-spinner-rotate {
      to {
        transform: rotate(360deg);
      }
    }
  `;

  protected override render() {
    return html`<span part="indicator" aria-hidden="true"></span>`;
  }
}
