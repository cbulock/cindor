import { css, html, LitElement } from "lit";
import { ifDefined } from "lit/directives/if-defined.js";

/**
 * Composite toolbar shell for collection pages, tables, and grid views.
 *
 * @slot - Optional supporting copy rendered below the main toolbar row.
 * @slot meta - Inline metadata such as badges, status chips, or scope labels.
 * @slot filters - Search, filter, or scope controls anchored on the leading side.
 * @slot view-controls - Layout, density, or sort controls rendered after filters.
 * @slot actions - Primary and secondary actions rendered on the trailing edge.
 */
export class CindorDataViewToolbar extends LitElement {
  static styles = css`
    :host {
      display: block;
      color: var(--fg);
    }

    .surface {
      display: grid;
      gap: var(--space-4);
      padding: var(--space-4);
      border: 1px solid var(--border);
      border-radius: var(--radius-xl);
      background: var(--surface);
      box-shadow: var(--shadow-sm);
    }

    .header {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: var(--space-4);
      align-items: start;
    }

    .copy {
      display: grid;
      gap: var(--space-2);
      min-width: 0;
    }

    .title-row,
    .meta,
    .summary {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--space-2);
    }

    .title {
      margin: 0;
      font-size: var(--text-2xl);
      line-height: 1.15;
    }

    .description,
    .supporting {
      margin: 0;
      color: var(--fg-muted);
      font-size: var(--text-sm);
      line-height: var(--text-helper-leading);
    }

    .count {
      display: inline-flex;
      align-items: center;
      min-height: 1.75rem;
      padding: 0 var(--space-2);
      border-radius: var(--radius-full);
      background: var(--bg-subtle);
      color: var(--fg);
      font-size: var(--text-sm);
      font-weight: var(--weight-medium);
      white-space: nowrap;
    }

    .count[data-tone="accent"] {
      background: color-mix(in srgb, var(--accent) 12%, var(--surface));
      color: var(--accent);
    }

    .meta {
      justify-content: flex-end;
    }

    .controls {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: var(--space-3);
      align-items: center;
    }

    .leading,
    .trailing {
      display: inline-flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--space-2);
      min-width: 0;
    }

    .trailing {
      justify-content: flex-end;
    }

    .supporting {
      min-width: 0;
    }

    @media (max-width: 720px) {
      .header,
      .controls {
        grid-template-columns: minmax(0, 1fr);
      }

      .meta,
      .trailing {
        justify-content: flex-start;
      }
    }
  `;

  static properties = {
    description: { reflect: true },
    itemCount: { type: Number, reflect: true, attribute: "item-count" },
    itemLabel: { reflect: true, attribute: "item-label" },
    selectionCount: { type: Number, reflect: true, attribute: "selection-count" },
    selectionLabel: { reflect: true, attribute: "selection-label" },
    title: { reflect: true }
  };

  description = "";
  itemCount = 0;
  itemLabel = "items";
  selectionCount = 0;
  selectionLabel = "selected";
  title = "";

  protected override render() {
    return html`
      <section aria-label=${ifDefined(this.accessibleLabel)} class="surface" part="surface" role="region">
        <div class="header" part="header">
          <div class="copy" part="copy">
            ${this.title || this.hasSummary
              ? html`
                  <div class="title-row" part="title-row">
                    ${this.title ? html`<h2 class="title" part="title">${this.title}</h2>` : null}
                    <div class="summary" part="summary">
                      ${this.itemCount > 0 ? html`<span class="count" part="item-count">${this.itemCount} ${this.itemLabel}</span>` : null}
                      ${this.selectionCount > 0
                        ? html`<span class="count" data-tone="accent" part="selection-count">${this.selectionCount} ${this.selectionLabel}</span>`
                        : null}
                    </div>
                  </div>
                `
              : null}
            ${this.description ? html`<p class="description" part="description">${this.description}</p>` : null}
          </div>
          <div class="meta" part="meta"><slot name="meta"></slot></div>
        </div>
        <div class="controls" part="controls">
          <div class="leading" part="leading">
            <slot name="filters"></slot>
            <slot name="view-controls"></slot>
          </div>
          <div class="trailing" part="actions"><slot name="actions"></slot></div>
        </div>
        <div class="supporting" part="supporting"><slot></slot></div>
      </section>
    `;
  }

  private get accessibleLabel(): string | undefined {
    return this.getAttribute("aria-label") ?? (this.title || undefined);
  }

  private get hasSummary(): boolean {
    return this.itemCount > 0 || this.selectionCount > 0;
  }
}
