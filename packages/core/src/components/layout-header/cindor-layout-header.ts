import { css, html, LitElement } from "lit";

/**
 * Header region for page-level titles, controls, and supporting metadata.
 *
 * @slot - Header copy, actions, or composition primitives.
 */
export class CindorLayoutHeader extends LitElement {
  static styles = css`
    :host {
      display: block;
      min-width: 0;
      color: var(--fg);
    }

    .header {
      display: grid;
      gap: var(--space-4);
      min-width: 0;
      align-content: start;
    }
  `;

  protected override render() {
    return html`
      <header class="header" part="header">
        <slot></slot>
      </header>
    `;
  }
}
