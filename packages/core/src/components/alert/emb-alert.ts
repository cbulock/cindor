import { css, html, LitElement } from "lit";

export type AlertTone = "info" | "success" | "warning" | "danger";

export class EmbAlert extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    div {
      display: grid;
      gap: var(--space-2);
      padding: var(--space-4);
      border: 1px solid var(--border);
      border-left-width: 3px;
      border-radius: var(--radius-lg);
      background: var(--surface);
      color: var(--fg);
    }

    :host([tone="info"]) div {
      border-left-color: var(--accent);
    }

    :host([tone="success"]) div {
      border-left-color: var(--success);
    }

    :host([tone="warning"]) div {
      border-left-color: var(--warning);
    }

    :host([tone="danger"]) div {
      border-left-color: var(--danger);
    }
  `;

  static properties = {
    tone: { reflect: true }
  };

  tone: AlertTone = "info";

  protected override render() {
    return html`<div part="surface" role="alert"><slot></slot></div>`;
  }
}
