import { css, html, LitElement } from "lit";

/**
 * Vertical layout container for page and workflow composition.
 *
 * @slot - Layout regions such as `emb-layout-header`, `emb-layout-content`, or adjacent primitives.
 */
export class EmbLayout extends LitElement {
  static styles = css`
    :host {
      display: block;
      min-width: 0;
      color: var(--fg);
    }

    .layout {
      display: grid;
      gap: var(--space-6);
      min-width: 0;
      align-content: start;
    }
  `;

  protected override render() {
    return html`
      <div class="layout" part="layout">
        <slot></slot>
      </div>
    `;
  }
}
