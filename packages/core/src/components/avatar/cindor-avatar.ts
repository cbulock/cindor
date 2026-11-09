import { css, html, LitElement } from "lit";

import { bridgeNativeEvent } from "../shared/native-events.js";

/**
 * @fires {Event} load - Fired when the avatar image loads.
 * @fires {Event} error - Fired when the avatar image fails to load.
 */
export class CindorAvatar extends LitElement {
  static styles = css`
    :host {
      display: inline-block;
    }

    .surface {
      inline-size: 40px;
      block-size: 40px;
      display: grid;
      place-items: center;
      overflow: hidden;
      border-radius: 50%;
      border: 1px solid var(--border);
      background: var(--bg-subtle);
      color: var(--fg);
      font-family: var(--font-mono);
      font-size: var(--text-data-value-size);
      font-weight: var(--text-data-value-weight);
      line-height: var(--text-data-value-leading);
      letter-spacing: var(--text-data-value-tracking);
      text-transform: uppercase;
    }

    img {
      inline-size: 100%;
      block-size: 100%;
      object-fit: cover;
    }
  `;

  static properties = {
    alt: { reflect: true },
    name: { reflect: true },
    src: { reflect: true }
  };

  alt = "";
  name = "";
  src = "";

  protected override render() {
    const label = this.alt || this.name || "Avatar";

    if (this.src) {
      return html`
        <span class="surface" part="surface">
          <img part="image" src=${this.src} alt=${label} @load=${this.handleImageEvent} @error=${this.handleImageEvent} />
        </span>
      `;
    }

    return html`
      <span class="surface" part="surface" role="img" aria-label=${label}>
        <span part="fallback">${this.initials}</span>
      </span>
    `;
  }

  private handleImageEvent = (event: Event): void => {
    bridgeNativeEvent(this, event, { bubbles: false });
  };

  private get initials(): string {
    const words = this.name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2);

    if (words.length === 0) {
      return "?";
    }

    return words.map((word) => word.charAt(0)).join("").toUpperCase();
  }
}
