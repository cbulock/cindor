import { css, LitElement } from "lit";

import { type LucideIconName, renderLucideIcon } from "./lucide.js";

export type { LucideIconName } from "./lucide.js";

export class CindorIcon extends LitElement {
  static styles = css`
    :host {
      display: inline-flex;
      inline-size: fit-content;
      block-size: fit-content;
      color: inherit;
      line-height: 0;
      vertical-align: middle;
    }

    :host svg {
      display: block;
      flex: none;
    }
  `;

  static properties = {
    label: { reflect: true },
    name: { reflect: true },
    size: { type: Number, reflect: true },
    strokeWidth: { type: Number, reflect: true, attribute: "stroke-width" }
  };

  label = "";
  name: LucideIconName | string = "";
  size = 20;
  strokeWidth = 2;

  protected override render() {
    return renderLucideIcon({
      label: this.label,
      name: this.name,
      size: this.size,
      strokeWidth: this.strokeWidth,
      attributes: {
        part: "icon"
      }
    });
  }
}
