import { css, html, LitElement } from "lit";

export type ChipTone = "neutral" | "accent" | "success";

export class CindorChip extends LitElement {
  static styles = css`
    :host {
      display: inline-block;
    }

    .surface {
      display: inline-flex;
      align-items: center;
      min-height: 28px;
      padding: 0 var(--space-3);
      border-radius: var(--radius-full);
      border: 1px solid var(--border);
      background: var(--bg-subtle);
      color: var(--fg);
      font-size: var(--text-sm);
      line-height: 1.2;
      white-space: nowrap;
    }

    :host([tone="accent"]) .surface {
      border-color: var(--accent);
      background: var(--accent-muted);
      color: var(--accent);
    }

    :host([tone="success"]) .surface {
      border-color: color-mix(in srgb, var(--success) 45%, var(--border));
      background: color-mix(in srgb, var(--success) 14%, transparent);
      color: var(--success);
    }
  `;

  static properties = {
    tone: { reflect: true }
  };

  tone: ChipTone = "neutral";

  protected override render() {
    return html`
      <span class="surface" part="surface">
        <slot></slot>
      </span>
    `;
  }
}
