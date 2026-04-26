import { css, html, LitElement } from "lit";

export class EmbEmptyState extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    section {
      display: grid;
      justify-items: start;
      gap: var(--space-3);
      padding: var(--space-6);
      border: 1px dashed var(--border);
      border-radius: var(--radius-lg);
      background: var(--bg-subtle);
      color: var(--fg);
    }

    .media {
      color: var(--accent);
    }

    .actions {
      display: flex;
      gap: var(--space-2);
      flex-wrap: wrap;
    }
  `;

  protected override render() {
    return html`
      <section part="surface">
        <div class="media" part="media"><slot name="media"></slot></div>
        <div part="content"><slot></slot></div>
        <div class="actions" part="actions"><slot name="actions"></slot></div>
      </section>
    `;
  }
}
