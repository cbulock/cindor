import { css, html, LitElement } from "lit";

export class EmbProgress extends LitElement {
  static styles = css`
    :host {
      display: grid;
      gap: var(--space-2);
    }

    progress {
      inline-size: 100%;
      block-size: 12px;
      overflow: hidden;
      border: 0;
      border-radius: var(--radius-full);
      background: var(--bg-subtle);
      color: var(--accent);
    }

    progress::-webkit-progress-bar {
      background: var(--bg-subtle);
      border-radius: var(--radius-full);
    }

    progress::-webkit-progress-value {
      background: currentColor;
      border-radius: var(--radius-full);
    }

    progress::-moz-progress-bar {
      background: currentColor;
      border-radius: var(--radius-full);
    }

    .label {
      color: var(--fg-muted);
      font-size: var(--text-sm);
    }
  `;

  static properties = {
    max: { type: Number, reflect: true },
    value: { type: Number, reflect: true }
  };

  max = 100;
  value = 0;

  protected override render() {
    return html`
      <span class="label" part="label"><slot></slot></span>
      <progress part="control" .max=${this.normalizedMax} .value=${this.clampedValue}></progress>
    `;
  }

  private get normalizedMax(): number {
    return this.max > 0 ? this.max : 100;
  }

  private get clampedValue(): number {
    return Math.min(Math.max(this.value, 0), this.normalizedMax);
  }
}
