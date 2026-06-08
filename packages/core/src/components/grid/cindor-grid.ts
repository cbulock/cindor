import { css, html, LitElement } from "lit";

export type GridGap = "0" | "1" | "2" | "3" | "4" | "5" | "6";
export type GridAlign = "start" | "center" | "end" | "stretch" | "baseline";

/**
 * Responsive grid primitive for cards, summaries, and multi-column layout groupings.
 *
 * @slot - Child elements arranged by the configured grid settings.
 */
export class CindorGrid extends LitElement {
  static styles = css`
    :host {
      display: block;
      width: 100%;
      max-width: 100%;
      min-width: 0;
    }

    .grid {
      display: grid;
      width: 100%;
      max-width: 100%;
      min-width: 0;
      gap: var(--cindor-grid-gap, var(--space-4));
      grid-template-columns: var(--cindor-grid-template-columns, repeat(2, minmax(0, 1fr)));
      align-items: stretch;
      justify-items: stretch;
    }

    ::slotted(*) {
      box-sizing: border-box;
      max-width: 100%;
      min-width: 0;
    }
  `;

  static properties = {
    align: { reflect: true },
    columns: { type: Number, reflect: true },
    gap: { reflect: true },
    justify: { reflect: true },
    minColumnWidth: { reflect: true, attribute: "min-column-width" }
  };

  /** Aligns items along the block axis within each grid cell. */
  align: GridAlign = "stretch";
  /** Fixed column count used when minColumnWidth is not supplied. */
  columns = 2;
  /** Gap token between grid items. */
  gap: GridGap = "4";
  /** Aligns items along the inline axis within each grid cell. */
  justify: GridAlign = "stretch";
  /** When present, switches to an auto-fit responsive grid using this minimum track size. */
  minColumnWidth = "";

  protected override render() {
    const style = [
      `--cindor-grid-gap: ${spaceToken(this.gap)}`,
      `--cindor-grid-template-columns: ${this.templateColumns}`,
      `align-items: ${alignmentValue(this.align)}`,
      `justify-items: ${alignmentValue(this.justify)}`
    ].join("; ");

    return html`
      <div class="grid" part="grid" style=${style}>
        <slot></slot>
      </div>
    `;
  }

  private get templateColumns(): string {
    const minColumnWidth = this.minColumnWidth.trim();

    if (minColumnWidth.length > 0) {
      return `repeat(auto-fit, minmax(min(${minColumnWidth}, 100%), 1fr))`;
    }

    return `repeat(${this.normalizedColumns}, minmax(0, 1fr))`;
  }

  private get normalizedColumns(): number {
    const parsedColumns = Number(this.columns);

    if (!Number.isFinite(parsedColumns) || parsedColumns < 1) {
      return 1;
    }

    return Math.floor(parsedColumns);
  }
}

function alignmentValue(value: GridAlign): string {
  switch (value) {
    case "start":
      return "start";
    case "center":
      return "center";
    case "end":
      return "end";
    case "baseline":
      return "baseline";
    default:
      return "stretch";
  }
}

function spaceToken(value: GridGap): string {
  return `var(--space-${value})`;
}
