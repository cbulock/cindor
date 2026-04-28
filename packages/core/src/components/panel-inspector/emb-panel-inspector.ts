import { css, html, LitElement } from "lit";
import { ifDefined } from "lit/directives/if-defined.js";

/**
 * Reusable details panel surface for inspector, properties, and supplemental context.
 *
 * @slot - Main panel body content.
 * @slot actions - Optional trailing header actions.
 * @slot footer - Optional footer content such as buttons or summaries.
 * @slot meta - Optional metadata shown below the title copy.
 */
export class EmbPanelInspector extends LitElement {
  static styles = css`
    :host {
      display: block;
      color: var(--fg);
    }

    :host([sticky]) {
      position: sticky;
      inset-block-start: var(--space-4);
    }

    .surface {
      display: grid;
      gap: var(--space-4);
      padding: var(--space-4);
      border: 1px solid var(--border);
      border-radius: var(--radius-xl);
      background: var(--surface);
      box-shadow: var(--shadow-xs);
    }

    .header {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: var(--space-3);
      align-items: start;
    }

    .copy {
      display: grid;
      gap: var(--space-2);
      min-width: 0;
    }

    .title {
      margin: 0;
      font-size: var(--text-lg);
      font-weight: 600;
    }

    .description,
    .meta,
    .footer {
      color: var(--fg-muted);
      font-size: var(--text-sm);
    }

    .description {
      margin: 0;
    }

    .actions {
      display: inline-flex;
      flex-wrap: wrap;
      justify-content: flex-end;
      gap: var(--space-2);
    }

    .body {
      display: grid;
      gap: var(--space-3);
    }

    @media (max-width: 720px) {
      .header {
        grid-template-columns: minmax(0, 1fr);
      }

      .actions {
        justify-content: flex-start;
      }
    }
  `;

  static properties = {
    description: { reflect: true },
    sticky: { type: Boolean, reflect: true },
    title: { reflect: true }
  };

  description = "";
  sticky = false;
  title = "";

  protected override render() {
    return html`
      <aside aria-label=${ifDefined(this.accessibleLabel)} class="surface" part="surface">
        <div class="header" part="header">
          <div class="copy" part="copy">
            ${this.title ? html`<h2 class="title" part="title">${this.title}</h2>` : null}
            ${this.description ? html`<p class="description" part="description">${this.description}</p>` : null}
            <div class="meta" part="meta"><slot name="meta"></slot></div>
          </div>
          <div class="actions" part="actions"><slot name="actions"></slot></div>
        </div>
        <div class="body" part="body"><slot></slot></div>
        <div class="footer" part="footer"><slot name="footer"></slot></div>
      </aside>
    `;
  }

  private get accessibleLabel(): string | undefined {
    return this.getAttribute("aria-label") ?? (this.title || undefined);
  }
}
