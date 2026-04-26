import { css, html, LitElement } from "lit";

export class EmbBreadcrumbs extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    nav {
      color: var(--fg-muted);
    }

    ol {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--space-2);
      margin: 0;
      padding: 0;
      list-style: none;
    }

    ::slotted(li) {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
    }
  `;

  protected override render() {
    return html`
      <nav part="nav" aria-label="Breadcrumb">
        <ol part="list">
          <slot></slot>
        </ol>
      </nav>
    `;
  }
}
