import { css, html, LitElement } from "lit";

export class EmbCard extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    article {
      display: grid;
      gap: var(--space-3);
      padding: var(--space-4);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      background: var(--surface);
      color: var(--fg);
      box-shadow: var(--shadow-xs);
    }
  `;

  protected override render() {
    return html`
      <article part="surface">
        <slot></slot>
      </article>
    `;
  }
}
