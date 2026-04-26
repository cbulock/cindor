import { css, html, LitElement, nothing } from "lit";

export class EmbFieldset extends LitElement {
  static styles = css`
    :host {
      display: block;
      inline-size: var(--emb-fieldset-inline-size, min(100%, 29rem));
      max-inline-size: 100%;
      min-inline-size: 0;
    }

    fieldset {
      display: grid;
      gap: var(--space-4);
      inline-size: 100%;
      min-inline-size: 0;
      margin: 0;
      padding: var(--space-4);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      background: var(--surface);
      color: var(--fg);
      box-sizing: border-box;
    }

    legend {
      padding: 0 var(--space-2);
      color: var(--fg);
      font-weight: 600;
    }

    .content {
      display: grid;
      gap: var(--space-4);
      inline-size: 100%;
      min-inline-size: 0;
      --emb-field-inline-size: 100%;
    }

    ::slotted(*) {
      box-sizing: border-box;
      display: block;
      inline-size: 100% !important;
      min-inline-size: 0;
      max-inline-size: 100% !important;
    }
  `;

  static properties = {
    disabled: { type: Boolean, reflect: true },
    legend: { reflect: true }
  };

  disabled = false;
  legend = "";

  protected override render() {
    return html`
      <fieldset part="control" ?disabled=${this.disabled}>
        ${this.legend ? html`<legend part="legend">${this.legend}</legend>` : nothing}
        <slot name="legend"></slot>
        <div class="content" part="content">
          <slot></slot>
        </div>
      </fieldset>
    `;
  }
}
