import { css, html, LitElement } from "lit";

export type StackDirection = "vertical" | "horizontal";
export type StackGap = "0" | "1" | "2" | "3" | "4" | "5" | "6";
export type StackAlign = "start" | "center" | "end" | "stretch" | "baseline";
export type StackJustify = "start" | "center" | "end" | "between";

/**
 * Flexible spacing primitive for stacking, clustering, and wrapped inline layouts.
 *
 * @slot - Child elements arranged by the configured flex settings.
 */
export class EmbStack extends LitElement {
  static styles = css`
    :host {
      display: block;
      min-width: 0;
    }

    .stack {
      display: flex;
      min-width: 0;
      gap: var(--emb-stack-gap, var(--space-3));
      flex-direction: column;
      align-items: stretch;
      justify-content: flex-start;
    }

    :host([direction="horizontal"]) .stack {
      flex-direction: row;
    }

    :host([wrap]) .stack {
      flex-wrap: wrap;
    }
  `;

  static properties = {
    align: { reflect: true },
    direction: { reflect: true },
    gap: { reflect: true },
    justify: { reflect: true },
    wrap: { type: Boolean, reflect: true }
  };

  align: StackAlign = "stretch";
  direction: StackDirection = "vertical";
  gap: StackGap = "3";
  justify: StackJustify = "start";
  wrap = false;

  protected override render() {
    const style = [
      `--emb-stack-gap: ${spaceToken(this.gap)}`,
      `align-items: ${alignValue(this.align)}`,
      `justify-content: ${justifyValue(this.justify)}`
    ].join("; ");

    return html`
      <div class="stack" part="stack" style=${style}>
        <slot></slot>
      </div>
    `;
  }
}

function alignValue(value: StackAlign): string {
  switch (value) {
    case "start":
      return "flex-start";
    case "center":
      return "center";
    case "end":
      return "flex-end";
    case "baseline":
      return "baseline";
    default:
      return "stretch";
  }
}

function justifyValue(value: StackJustify): string {
  switch (value) {
    case "center":
      return "center";
    case "end":
      return "flex-end";
    case "between":
      return "space-between";
    default:
      return "flex-start";
  }
}

function spaceToken(value: StackGap): string {
  return `var(--space-${value})`;
}
