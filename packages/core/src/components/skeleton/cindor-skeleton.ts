import { css, html, LitElement } from "lit";

export type SkeletonVariant = "line" | "block" | "circle";

export class CindorSkeleton extends LitElement {
  static styles = css`
    :host {
      display: block;
      inline-size: var(--cindor-skeleton-width, 100%);
      max-inline-size: 100%;
    }

    span {
      display: block;
      inline-size: 100%;
      block-size: var(--cindor-skeleton-height, 1rem);
      border-radius: var(--radius-md);
      background:
        linear-gradient(
          90deg,
          color-mix(in srgb, var(--border) 32%, transparent) 25%,
          color-mix(in srgb, var(--border-strong) 20%, transparent) 50%,
          color-mix(in srgb, var(--border) 32%, transparent) 75%
        );
      background-size: 200% 100%;
      animation: cindor-skeleton-pulse 1.2s ease-in-out infinite;
    }

    :host([variant="line"]) span {
      block-size: var(--cindor-skeleton-height, 1rem);
    }

    :host([variant="block"]) span {
      block-size: var(--cindor-skeleton-height, 4rem);
    }

    :host([variant="circle"]) span {
      inline-size: 100%;
      block-size: var(--cindor-skeleton-size, 2.5rem);
      border-radius: 50%;
    }

    :host([variant="circle"]) {
      inline-size: var(--cindor-skeleton-size, 2.5rem);
    }

    @keyframes cindor-skeleton-pulse {
      0% {
        background-position: 100% 0;
      }

      100% {
        background-position: -100% 0;
      }
    }
  `;

  static properties = {
    variant: { reflect: true }
  };

  variant: SkeletonVariant = "line";

  protected override render() {
    return html`<span part="surface" aria-hidden="true"></span>`;
  }
}
