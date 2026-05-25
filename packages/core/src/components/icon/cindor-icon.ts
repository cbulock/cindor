import { css, LitElement } from "lit";

import type { IconNode } from "lucide";

import { loadLucideIcon, normalizeIconName, renderLucideIcon, type LucideIconName } from "./lucide.js";

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
  strokeWidth = 2.25;
  private iconNode: IconNode | null = null;
  private iconRequestToken = 0;

  override connectedCallback(): void {
    super.connectedCallback();
    void this.syncIcon();
  }

  protected override willUpdate(changedProperties: Map<PropertyKey, unknown>): void {
    if (changedProperties.has("name")) {
      void this.syncIcon();
    }
  }

  protected override render() {
    return renderLucideIcon({
      iconNode: this.iconNode,
      label: this.label,
      size: this.size,
      strokeWidth: this.strokeWidth,
      attributes: {
        part: "icon"
      }
    });
  }

  private async syncIcon(): Promise<void> {
    const requestToken = ++this.iconRequestToken;
    const iconName = normalizeIconName(this.name);

    if (!iconName) {
      this.iconNode = null;
      return;
    }

    const iconNode = await loadLucideIcon(iconName);

    if (requestToken !== this.iconRequestToken) {
      return;
    }

    this.iconNode = iconNode;
    this.requestUpdate();
  }
}
