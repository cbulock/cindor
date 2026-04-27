import { css, html, LitElement } from "lit";

export type BadgeTone = "neutral" | "accent" | "success";

export class EmbBadge extends LitElement {
  static styles = css`
    :host {
      display: inline-block;
    }

    span {
      display: inline-flex;
      align-items: center;
      min-height: 1.75rem;
      padding: 0.125rem var(--space-2);
      border-radius: var(--radius-full);
      border: 1px solid var(--border);
      background: var(--bg-subtle);
      color: var(--fg);
      box-sizing: border-box;
      font-family: var(--font-mono);
      font-size: var(--text-xs);
      line-height: 1;
      letter-spacing: var(--tracking-mono);
      text-transform: uppercase;
      white-space: nowrap;
    }

    :host([tone="accent"]) span {
      border-color: var(--accent);
      background: var(--accent-muted);
      color: var(--accent);
    }

    :host([tone="success"]) span {
      border-color: color-mix(in srgb, var(--success) 45%, var(--border));
      background: color-mix(in srgb, var(--success) 14%, transparent);
      color: var(--success);
    }
  `;

  static properties = {
    tone: { reflect: true }
  };

  tone: BadgeTone = "neutral";

  protected override render() {
    return html`
      <span part="label">
        <slot></slot>
      </span>
    `;
  }
}
