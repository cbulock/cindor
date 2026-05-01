import { css, html, LitElement } from "lit";

export class CindorFormRow extends LitElement {
  static styles = css`
    :host {
      display: block;
      width: 100%;
      max-width: 100%;
      min-width: 0;
    }

    .row {
      display: grid;
      gap: var(--cindor-form-row-gap, var(--space-4));
      grid-template-columns: repeat(var(--cindor-form-row-columns, 2), minmax(0, 1fr));
      align-items: start;
      width: 100%;
      max-width: 100%;
      min-width: 0;
    }

    ::slotted(*) {
      box-sizing: border-box;
      width: 100%;
      max-width: 100%;
      min-width: 0;
      --cindor-field-inline-size: 100%;
    }

    @media (max-width: 720px) {
      .row {
        grid-template-columns: minmax(0, 1fr);
      }
    }
  `;

  static properties = {
    columns: { type: Number, reflect: true }
  };

  columns = 2;

  protected override render() {
    return html`
      <div class="row" part="row" style=${`--cindor-form-row-columns: ${this.normalizedColumns};`}>
        <slot></slot>
      </div>
    `;
  }

  private get normalizedColumns(): number {
    const parsedColumns = Number(this.columns);

    if (!Number.isFinite(parsedColumns) || parsedColumns < 1) {
      return 1;
    }

    return Math.floor(parsedColumns);
  }
}
