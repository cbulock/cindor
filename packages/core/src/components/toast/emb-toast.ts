import { css, html, LitElement, nothing } from "lit";

export type ToastTone = "neutral" | "success" | "warning" | "danger";

export class EmbToast extends LitElement {
  static styles = css`
    :host {
      display: inline-block;
    }

    div {
      display: grid;
      grid-template-columns: 1fr auto;
      align-items: start;
      gap: var(--space-3);
      min-width: 280px;
      padding: var(--space-4);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      background: var(--surface-raised, var(--surface));
      color: var(--fg);
      box-shadow: var(--shadow-md);
      animation: emb-toast-enter var(--duration-base) var(--ease-out);
    }

    :host([tone="success"]) div {
      border-color: color-mix(in srgb, var(--success) 40%, var(--border));
    }

    :host([tone="warning"]) div {
      border-color: color-mix(in srgb, var(--warning) 40%, var(--border));
    }

    :host([tone="danger"]) div {
      border-color: color-mix(in srgb, var(--danger) 40%, var(--border));
    }

    emb-icon-button {
      color: var(--fg-muted);
      transition:
        color var(--duration-base) var(--ease-out),
        transform var(--duration-base) var(--ease-out);
    }

    emb-icon-button:hover {
      color: var(--fg);
      transform: scale(1.05);
    }

    emb-icon-button:active {
      transform: scale(0.98);
    }

    @keyframes emb-toast-enter {
      from {
        opacity: 0;
        transform: translateY(6px);
      }

      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `;

  static properties = {
    dismissible: { type: Boolean, reflect: true },
    open: { type: Boolean, reflect: true },
    tone: { reflect: true }
  };

  dismissible = false;
  open = true;
  tone: ToastTone = "neutral";

  close = (): void => {
    this.open = false;
    this.dispatchEvent(new Event("close", { bubbles: true, composed: true }));
  };

  protected override render() {
    if (!this.open) {
      return nothing;
    }

    return html`
      <div part="surface" role="status" aria-live="polite">
        <slot></slot>
        ${this.dismissible
          ? html`<emb-icon-button label="Dismiss toast" name="x" part="close-button" @click=${this.close}></emb-icon-button>`
          : nothing}
      </div>
    `;
  }
}
