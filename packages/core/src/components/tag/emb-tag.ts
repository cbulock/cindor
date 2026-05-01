import { css, html, LitElement, nothing } from "lit";

export type TagTone = "neutral" | "accent" | "success";

/**
 * Compact tag surface for labels, filters, and removable metadata.
 *
 * @fires {Event} remove - Fired when the dismiss button is activated.
 * @slot - Tag label.
 */
export class EmbTag extends LitElement {
  static styles = css`
    :host {
      display: inline-block;
      color: var(--fg);
    }

    .surface {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      min-height: 28px;
      max-width: 100%;
      padding-inline: var(--space-3);
      border: 1px solid color-mix(in srgb, var(--accent) 28%, var(--border));
      border-radius: var(--radius-full);
      background: var(--accent-muted);
      color: inherit;
      box-sizing: border-box;
      font-size: var(--text-sm);
      line-height: 1.2;
      white-space: nowrap;
    }

    .label {
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .remove-button {
      display: inline-grid;
      place-items: center;
      width: 1.5rem;
      height: 1.5rem;
      padding: 0;
      border: 0;
      border-radius: var(--radius-full);
      background: transparent;
      color: inherit;
      font: inherit;
      cursor: pointer;
    }

    .remove-button:hover {
      background: color-mix(in srgb, currentColor 12%, transparent);
    }

    .remove-button:focus-visible {
      outline: none;
      box-shadow: var(--ring-focus);
    }

    :host([tone="neutral"]) .surface {
      border-color: var(--border);
      background: var(--bg-subtle);
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
    dismissible: { type: Boolean, reflect: true },
    removeLabel: { attribute: "remove-label", reflect: true },
    tone: { reflect: true }
  };

  dismissible = false;

  removeLabel = "Remove tag";

  tone: TagTone = "accent";

  protected override render() {
    return html`
      <span class="surface" part="surface">
        <span class="label" part="label">
          <slot></slot>
        </span>
        ${this.dismissible
          ? html`
              <button
                aria-label=${this.removeLabel}
                class="remove-button"
                part="remove-button"
                type="button"
                @click=${this.handleRemoveClick}
              >
                ×
              </button>
            `
          : nothing}
      </span>
    `;
  }

  private handleRemoveClick = (event: MouseEvent): void => {
    event.stopPropagation();
    this.dispatchEvent(new Event("remove", { bubbles: true, composed: true }));
  };
}
