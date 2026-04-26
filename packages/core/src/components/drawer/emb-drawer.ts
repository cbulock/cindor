import { css, html, LitElement, nothing } from "lit";

import { renderLucideIcon } from "../icon/lucide.js";

export type DrawerSide = "start" | "end";

export class EmbDrawer extends LitElement {
  static styles = css`
    :host {
      display: contents;
    }

    .backdrop {
      position: fixed;
      inset: 0;
      background: rgb(15 14 12 / 45%);
      z-index: 30;
      animation: emb-drawer-backdrop-enter var(--duration-base) var(--ease-out);
    }

    aside {
      position: fixed;
      inset-block: 0;
      inline-size: min(420px, 90vw);
      padding: var(--space-5);
      background: var(--surface);
      color: var(--fg);
      box-shadow: var(--shadow-lg);
      z-index: 31;
      display: grid;
      grid-template-rows: auto 1fr;
      gap: var(--space-4);
      animation: emb-drawer-enter-end var(--duration-base) var(--ease-out);
    }

    :host([side="start"]) aside {
      inset-inline-start: 0;
      border-inline-end: 1px solid var(--border);
      animation-name: emb-drawer-enter-start;
    }

    :host([side="end"]) aside {
      inset-inline-end: 0;
      border-inline-start: 1px solid var(--border);
    }

    button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font: inherit;
      justify-self: end;
      border: 0;
      background: transparent;
      color: var(--fg-muted);
      cursor: pointer;
      padding: var(--space-1);
      border-radius: var(--radius-sm);
      transition:
        background var(--duration-base) var(--ease-out),
        color var(--duration-base) var(--ease-out),
        transform var(--duration-base) var(--ease-out);
    }

    button:hover:not(:disabled) {
      background: var(--bg-subtle);
      color: var(--fg);
      transform: rotate(90deg);
    }

    button:focus-visible {
      outline: none;
      box-shadow: var(--ring-focus);
    }

    button:active:not(:disabled) {
      transform: rotate(90deg) scale(0.96);
    }

    @keyframes emb-drawer-backdrop-enter {
      from {
        opacity: 0;
      }

      to {
        opacity: 1;
      }
    }

    @keyframes emb-drawer-enter-end {
      from {
        opacity: 0;
        transform: translateX(16px);
      }

      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    @keyframes emb-drawer-enter-start {
      from {
        opacity: 0;
        transform: translateX(-16px);
      }

      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
  `;

  static properties = {
    open: { type: Boolean, reflect: true },
    side: { reflect: true }
  };

  open = false;
  side: DrawerSide = "end";

  close = (): void => {
    this.open = false;
    this.dispatchEvent(new Event("close", { bubbles: true, composed: true }));
  };

  protected override render() {
    if (!this.open) {
      return nothing;
    }

    return html`
      <div class="backdrop" part="backdrop" @click=${this.close}></div>
      <aside part="panel">
        <button type="button" part="close-button" aria-label="Close drawer" @click=${this.close}>
          ${renderLucideIcon({
            name: "x",
            size: 16,
            attributes: {
              part: "close-icon"
            }
          })}
        </button>
        <slot></slot>
      </aside>
    `;
  }
}
