import { css, html, LitElement } from "lit";

/**
 * Main content region for page sections, forms, and data views.
 *
 * @slot - Primary content for the current layout section.
 */
export class EmbLayoutContent extends LitElement {
  static styles = css`
    :host {
      display: block;
      min-width: 0;
      color: var(--fg);
    }

    .content {
      display: grid;
      gap: var(--space-4);
      min-width: 0;
      align-content: start;
    }
  `;

  protected override render() {
    return html`
      <section class="content" part="content">
        <slot></slot>
      </section>
    `;
  }
}
