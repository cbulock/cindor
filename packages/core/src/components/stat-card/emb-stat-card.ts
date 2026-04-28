import { css, html, LitElement } from "lit";

export type StatCardTone = "neutral" | "positive" | "negative";

/**
 * Summary metric card for dashboards and KPI surfaces.
 *
 * @slot - Optional supporting description or actions.
 */
export class EmbStatCard extends LitElement {
  static styles = css`
    :host {
      display: block;
      color: var(--fg);
    }

    article {
      display: grid;
      gap: var(--space-2);
      padding: var(--space-4);
      border: 1px solid var(--border);
      border-radius: var(--radius-xl);
      background: var(--surface);
      box-shadow: var(--shadow-xs);
    }

    .label {
      color: var(--fg-muted);
      font-size: var(--text-sm);
      font-weight: var(--weight-medium);
    }

    .value {
      font-size: clamp(1.75rem, 4vw, 2.5rem);
      font-weight: 700;
      line-height: 1;
    }

    .change {
      font-size: var(--text-sm);
      font-weight: var(--weight-medium);
    }

    :host([tone="positive"]) .change {
      color: var(--success);
    }

    :host([tone="negative"]) .change {
      color: var(--danger);
    }

    .meta {
      color: var(--fg-muted);
      font-size: var(--text-sm);
    }
  `;

  static properties = {
    change: { reflect: true },
    label: { reflect: true },
    tone: { reflect: true },
    value: { reflect: true }
  };

  change = "";
  label = "";
  tone: StatCardTone = "neutral";
  value = "";

  protected override render() {
    return html`
      <article part="surface">
        <span class="label" part="label">${this.label}</span>
        <strong class="value" part="value">${this.value}</strong>
        ${this.change ? html`<span class="change" part="change">${this.change}</span>` : null}
        <div class="meta" part="meta"><slot></slot></div>
      </article>
    `;
  }
}
