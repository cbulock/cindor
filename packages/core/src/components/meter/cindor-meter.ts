import { css, html, LitElement } from "lit";

export class CindorMeter extends LitElement {
  static styles = css`
    :host {
      display: grid;
      gap: var(--space-2);
    }

    meter {
      inline-size: 100%;
      block-size: 12px;
    }

    .label {
      color: var(--fg-muted);
      font-size: var(--text-sm);
    }
  `;

  static properties = {
    high: { type: Number, reflect: true },
    low: { type: Number, reflect: true },
    max: { type: Number, reflect: true },
    min: { type: Number, reflect: true },
    optimum: { type: Number, reflect: true },
    value: { type: Number, reflect: true }
  };

  high = 100;
  low = 0;
  max = 100;
  min = 0;
  optimum = 100;
  value = 0;

  protected override render() {
    return html`
      <span class="label" part="label"><slot></slot></span>
      <meter
        part="control"
        .high=${this.high}
        .low=${this.low}
        .max=${this.max}
        .min=${this.min}
        .optimum=${this.optimum}
        .value=${this.value}
      ></meter>
    `;
  }
}
