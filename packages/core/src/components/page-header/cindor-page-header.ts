import { css, html, LitElement } from "lit";

/**
 * Reusable page header with breadcrumbs, metadata, and page-level actions.
 *
 * @slot - Optional supporting content rendered below the main heading row.
 * @slot breadcrumbs - Optional breadcrumb or parent-navigation content.
 * @slot meta - Optional metadata such as badges or supporting facts.
 * @slot actions - Optional trailing actions such as buttons or segmented controls.
 */
export class CindorPageHeader extends LitElement {
  static styles = css`
    :host {
      display: block;
      color: var(--fg);
    }

    .surface {
      display: grid;
      gap: var(--space-4);
      padding-block: var(--space-2);
    }

    .top,
    .bottom {
      display: grid;
      gap: var(--space-3);
    }

    .main {
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

    .eyebrow {
      display: inline-block;
      max-width: 100%;
      overflow-wrap: anywhere;
      color: color-mix(in srgb, var(--accent) 32%, var(--fg-muted));
      font-size: var(--text-eyebrow-size);
      font-weight: var(--text-eyebrow-weight);
      letter-spacing: var(--text-eyebrow-tracking);
      line-height: var(--text-eyebrow-leading);
    }

    .title-row,
    .meta {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--space-2);
    }

    .title {
      margin: 0;
      font-size: clamp(1.875rem, 3vw, 2.5rem);
      line-height: 1.1;
    }

    .description {
      margin: 0;
      color: var(--fg-muted);
      max-width: 72ch;
    }

    .actions {
      display: inline-flex;
      flex-wrap: wrap;
      justify-content: flex-end;
      gap: var(--space-2);
    }

    .bottom {
      color: var(--fg-muted);
      font-size: var(--text-helper-size);
      line-height: var(--text-helper-leading);
    }

    @media (max-width: 720px) {
      .main {
        grid-template-columns: minmax(0, 1fr);
      }

      .title {
        font-size: var(--text-3xl);
      }

      .actions {
        justify-content: flex-start;
      }
    }
  `;

  static properties = {
    description: { reflect: true },
    eyebrow: { reflect: true },
    title: { reflect: true }
  };

  description = "";
  eyebrow = "";
  title = "";

  protected override render() {
    return html`
      <header class="surface" part="surface">
        <div class="top" part="top">
          <slot name="breadcrumbs"></slot>
          <div class="main" part="main">
            <div class="copy" part="copy">
              ${this.eyebrow ? html`<span class="eyebrow" part="eyebrow">${this.eyebrow}</span>` : null}
              <div class="title-row" part="title-row">
                ${this.title ? html`<h1 class="title" part="title">${this.title}</h1>` : null}
                <div class="meta" part="meta"><slot name="meta"></slot></div>
              </div>
              ${this.description ? html`<p class="description" part="description">${this.description}</p>` : null}
            </div>
            <div class="actions" part="actions"><slot name="actions"></slot></div>
          </div>
        </div>
        <div class="bottom" part="bottom"><slot></slot></div>
      </header>
    `;
  }
}
