import { css, html, LitElement } from "lit";

export class EmbCodeBlock extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    pre {
      margin: 0;
      padding: var(--space-4);
      overflow: auto;
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      background: var(--surface-inverse);
      color: var(--bg);
      font-family: var(--font-mono);
      font-size: var(--text-sm);
      line-height: var(--leading-relaxed);
    }

    code {
      font: inherit;
      white-space: pre;
    }
  `;

  static properties = {
    code: { reflect: true }
  };

  code = "";

  protected override render() {
    return html`
      <pre part="surface"><code part="code">${this.code}<slot></slot></code></pre>
    `;
  }
}
