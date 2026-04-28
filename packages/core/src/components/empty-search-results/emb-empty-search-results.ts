import { css, html, LitElement } from "lit";

/**
 * Search-specific zero-state messaging with optional suggestions and actions.
 *
 * @slot - Optional guidance or search tips shown below the main copy.
 * @slot media - Optional custom leading media.
 * @slot actions - Action controls for retry or broaden-search flows.
 */
export class EmbEmptySearchResults extends LitElement {
  static styles = css`
    :host {
      display: block;
      color: var(--fg);
    }

    .surface {
      display: grid;
      justify-items: start;
      gap: var(--space-3);
      padding: var(--space-6);
      border: 1px dashed var(--border);
      border-radius: var(--radius-xl);
      background: var(--bg-subtle);
    }

    .media {
      display: inline-grid;
      place-items: center;
      width: 3rem;
      height: 3rem;
      border-radius: var(--radius-full);
      background: color-mix(in srgb, var(--accent) 10%, var(--surface));
      color: var(--accent);
    }

    .copy {
      display: grid;
      gap: var(--space-2);
    }

    .heading {
      margin: 0;
      font-size: var(--text-lg);
      font-weight: 600;
    }

    .description,
    .tips {
      color: var(--fg-muted);
      font-size: var(--text-sm);
    }

    .description {
      margin: 0;
    }

    .query {
      font-weight: 600;
    }

    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2);
    }
  `;

  static properties = {
    description: { reflect: true },
    heading: { reflect: true },
    query: { reflect: true }
  };

  description = "";
  heading = "No matching results";
  query = "";

  protected override render() {
    return html`
      <section aria-live="polite" class="surface" part="surface">
        <div class="media" part="media">
          <slot name="media">
            <emb-icon aria-hidden="true" name="search"></emb-icon>
          </slot>
        </div>
        <div class="copy" part="copy">
          <h2 class="heading" part="heading">${this.heading}</h2>
          <p class="description" part="description">${this.message}</p>
          <div class="tips" part="tips"><slot></slot></div>
        </div>
        <div class="actions" part="actions"><slot name="actions"></slot></div>
      </section>
    `;
  }

  private get message(): unknown {
    if (this.description) {
      return this.description;
    }

    if (this.query.trim()) {
      return html`
        No results matched <span class="query">"${this.query.trim()}"</span>. Try a broader term, fewer filters, or a different keyword.
      `;
    }

    return "Try a broader term, fewer filters, or a different keyword.";
  }
}
