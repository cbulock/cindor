import { css, html, LitElement } from "lit";
import { ifDefined } from "lit/directives/if-defined.js";

/**
 * Persistent contextual action bar for bulk actions and page-level commands.
 *
 * @slot - Optional supporting content shown with the summary copy.
 * @slot actions - Action controls rendered on the trailing edge.
 */
export class CindorCommandBar extends LitElement {
  static styles = css`
    :host {
      display: block;
      color: var(--fg);
    }

    :host([sticky]) {
      position: sticky;
      inset-block-end: var(--space-4);
      z-index: 10;
    }

    .surface {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: var(--space-4);
      align-items: center;
      padding: var(--space-4);
      border: 1px solid color-mix(in srgb, var(--accent) 18%, var(--border));
      border-radius: var(--radius-xl);
      background: color-mix(in srgb, var(--accent) 10%, var(--surface));
      box-shadow: var(--shadow-sm);
    }

    .summary {
      display: grid;
      gap: var(--space-2);
      min-width: 0;
    }

    .summary-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--space-2);
    }

    .label {
      font-size: var(--text-base);
      font-weight: 600;
    }

    .count {
      display: inline-flex;
      align-items: center;
      min-height: 1.75rem;
      padding: 0 var(--space-2);
      border-radius: var(--radius-full);
      background: var(--surface);
      color: var(--accent);
      font-size: var(--text-sm);
      font-weight: var(--weight-medium);
      white-space: nowrap;
    }

    .description,
    .meta {
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

    @media (max-width: 720px) {
      .surface {
        grid-template-columns: minmax(0, 1fr);
      }

      .actions {
        justify-content: flex-start;
      }
    }
  `;

  static properties = {
    count: { type: Number, reflect: true },
    countLabel: { reflect: true, attribute: "count-label" },
    description: { reflect: true },
    label: { reflect: true },
    sticky: { type: Boolean, reflect: true }
  };

  count = 0;
  countLabel = "selected";
  description = "";
  label = "";
  sticky = false;

  protected override render() {
    return html`
      <section aria-label=${ifDefined(this.accessibleLabel)} class="surface" part="surface" role="region">
        <div class="summary" part="summary">
          ${this.label || this.count > 0
            ? html`
                <div class="summary-row" part="summary-row">
                  ${this.label ? html`<strong class="label" part="label">${this.label}</strong>` : null}
                  ${this.count > 0 ? html`<span class="count" part="count">${this.count} ${this.countLabel}</span>` : null}
                </div>
              `
            : null}
          ${this.description ? html`<p class="description" part="description">${this.description}</p>` : null}
          <div class="meta" part="meta"><slot></slot></div>
        </div>
        <div class="actions" part="actions"><slot name="actions"></slot></div>
      </section>
    `;
  }

  private get accessibleLabel(): string | undefined {
    return this.getAttribute("aria-label") ?? (this.label || undefined);
  }
}
