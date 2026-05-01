import { css, html, LitElement } from "lit";

export class CindorAccordion extends LitElement {
  static styles = css`
    :host {
      display: block;
      color: var(--fg);
    }

    details {
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      background: var(--surface);
      overflow: clip;
    }

    summary {
      list-style: none;
      cursor: pointer;
      padding: var(--space-4);
      font-weight: var(--weight-medium);
      transition:
        background var(--duration-base) var(--ease-out),
        color var(--duration-base) var(--ease-out);
    }

    summary::-webkit-details-marker {
      display: none;
    }

    summary:focus-visible {
      outline: none;
      box-shadow: inset var(--ring-focus);
    }

    summary:hover {
      background: var(--bg-subtle);
    }

    .content {
      padding: 0 var(--space-4) var(--space-4);
      color: var(--fg-muted);
    }
  `;

  static properties = {
    open: { type: Boolean, reflect: true }
  };

  open = false;

  toggle(open?: boolean): void {
    this.open = open ?? !this.open;
  }

  protected override render() {
    return html`
      <details part="container" ?open=${this.open} @toggle=${this.handleToggle}>
        <summary part="summary">
          <slot name="summary"></slot>
        </summary>
        <div class="content" part="content">
          <slot></slot>
        </div>
      </details>
    `;
  }

  private handleToggle = (event: Event): void => {
    event.stopPropagation();
    const details = event.currentTarget as HTMLDetailsElement;
    this.open = details.open;
    this.dispatchEvent(new Event("toggle", { bubbles: true, composed: true }));
  };
}
