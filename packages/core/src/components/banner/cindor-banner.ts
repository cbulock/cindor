import { css, html, LitElement, nothing } from "lit";

export type BannerTone = "info" | "success" | "warning" | "danger";
export type BannerRoleType = "status" | "alert";

/**
 * Persistent page or app-level feedback surface with optional actions and dismiss control.
 *
 * @slot - Default banner body content.
 * @slot icon - Optional leading icon or media.
 * @slot actions - Optional trailing actions such as buttons or links.
 */
export class CindorBanner extends LitElement {
  static styles = css`
    :host {
      display: block;
      color: var(--fg);
    }

    :host([sticky]) {
      position: sticky;
      inset-block-start: var(--space-4);
      z-index: 10;
    }

    .surface {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr) auto;
      gap: var(--space-3);
      align-items: start;
      padding: var(--space-4);
      border: 1px solid var(--border);
      border-inline-start-width: 4px;
      border-radius: var(--radius-xl);
      background: color-mix(in srgb, var(--surface-raised, var(--surface)) 88%, var(--bg-subtle));
      box-shadow: var(--shadow-sm);
    }

    :host([tone="info"]) .surface {
      border-inline-start-color: var(--accent);
    }

    :host([tone="success"]) .surface {
      border-inline-start-color: var(--success);
      border-color: color-mix(in srgb, var(--success) 22%, var(--border));
      background: color-mix(in srgb, var(--success) 8%, var(--surface-raised, var(--surface)));
    }

    :host([tone="warning"]) .surface {
      border-inline-start-color: var(--warning);
      border-color: color-mix(in srgb, var(--warning) 24%, var(--border));
      background: color-mix(in srgb, var(--warning) 10%, var(--surface-raised, var(--surface)));
    }

    :host([tone="danger"]) .surface {
      border-inline-start-color: var(--danger);
      border-color: color-mix(in srgb, var(--danger) 24%, var(--border));
      background: color-mix(in srgb, var(--danger) 8%, var(--surface-raised, var(--surface)));
    }

    .icon {
      display: grid;
      align-items: center;
      color: var(--fg-muted);
      padding-block-start: 2px;
    }

    .copy {
      display: grid;
      gap: var(--space-2);
      min-width: 0;
    }

    .title {
      margin: 0;
      font-size: var(--text-base);
      font-weight: var(--weight-semibold);
      line-height: 1.25;
    }

    .body {
      display: grid;
      gap: var(--space-2);
      color: var(--fg-muted);
      font-size: var(--text-sm);
      line-height: var(--text-body-leading);
    }

    .body ::slotted(*) {
      margin: 0;
    }

    .actions {
      display: inline-flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: flex-end;
      gap: var(--space-2);
    }

    .actions-dismiss {
      display: inline-flex;
      align-items: start;
      gap: var(--space-2);
    }

    cindor-icon-button {
      color: var(--fg-muted);
    }

    @media (max-width: 720px) {
      .surface {
        grid-template-columns: auto minmax(0, 1fr);
      }

      .actions-dismiss {
        grid-column: 1 / -1;
        justify-content: space-between;
        flex-wrap: wrap;
      }

      .actions {
        justify-content: flex-start;
      }
    }
  `;

  static properties = {
    dismissible: { type: Boolean, reflect: true },
    open: { type: Boolean, reflect: true },
    roleType: { reflect: true, attribute: "role-type" },
    sticky: { type: Boolean, reflect: true },
    title: { reflect: true },
    tone: { reflect: true }
  };

  dismissible = false;
  open = true;
  roleType = "";
  sticky = false;
  title = "";
  tone: BannerTone = "info";

  private hasActions = false;
  private hasIcon = false;

  close = (): void => {
    if (!this.open) {
      return;
    }

    this.open = false;
    this.dispatchEvent(new CustomEvent("dismiss", { bubbles: true, composed: true }));
    this.dispatchEvent(
      new CustomEvent("open-change", {
        bubbles: true,
        composed: true,
        detail: { open: this.open }
      })
    );
  };

  protected override render() {
    if (!this.open) {
      return nothing;
    }

    return html`
      <section class="surface" part="surface" role=${this.computedRole} aria-live=${this.computedLive}>
        ${this.hasIcon
          ? html`
              <div class="icon" part="icon">
                <slot name="icon" @slotchange=${this.handleIconSlotChange}></slot>
              </div>
            `
          : html`<slot name="icon" hidden @slotchange=${this.handleIconSlotChange}></slot>`}
        <div class="copy" part="copy">
          ${this.title ? html`<p class="title" part="title">${this.title}</p>` : null}
          <div class="body" part="body"><slot></slot></div>
        </div>
        ${(this.hasActions || this.dismissible)
          ? html`
              <div class="actions-dismiss" part="actions-dismiss">
                ${this.hasActions
                  ? html`
                      <div class="actions" part="actions">
                        <slot name="actions" @slotchange=${this.handleActionsSlotChange}></slot>
                      </div>
                    `
                  : html`<slot name="actions" hidden @slotchange=${this.handleActionsSlotChange}></slot>`}
                ${this.dismissible
                  ? html`
                      <cindor-icon-button
                        part="close-button"
                        label="Dismiss banner"
                        name="x"
                        @click=${this.close}
                      ></cindor-icon-button>
                    `
                  : nothing}
              </div>
            `
          : nothing}
      </section>
      ${!this.hasActions && !this.dismissible ? html`<slot name="actions" hidden @slotchange=${this.handleActionsSlotChange}></slot>` : nothing}
    `;
  }

  override firstUpdated(): void {
    this.syncSlotState();
  }

  private handleActionsSlotChange = (): void => {
    this.syncActionsSlotState();
  };

  private handleIconSlotChange = (): void => {
    this.syncIconSlotState();
  };

  private syncSlotState(): void {
    this.syncActionsSlotState();
    this.syncIconSlotState();
  }

  private syncActionsSlotState(): void {
    const slot = this.renderRoot.querySelector<HTMLSlotElement>('slot[name="actions"]');
    const nextHasActions = (slot?.assignedNodes({ flatten: true }) ?? []).some((node) => hasVisibleAssignedContent(node));
    if (nextHasActions !== this.hasActions) {
      this.hasActions = nextHasActions;
      this.requestUpdate();
    }
  }

  private syncIconSlotState(): void {
    const slot = this.renderRoot.querySelector<HTMLSlotElement>('slot[name="icon"]');
    const nextHasIcon = (slot?.assignedNodes({ flatten: true }) ?? []).some((node) => hasVisibleAssignedContent(node));
    if (nextHasIcon !== this.hasIcon) {
      this.hasIcon = nextHasIcon;
      this.requestUpdate();
    }
  }

  private get computedLive(): "assertive" | "polite" {
    return this.computedRole === "alert" ? "assertive" : "polite";
  }

  private get computedRole(): BannerRoleType {
    if (this.roleType === "status" || this.roleType === "alert") {
      return this.roleType;
    }

    return this.tone === "warning" || this.tone === "danger" ? "alert" : "status";
  }
}

function hasVisibleAssignedContent(node: Node): boolean {
  if (node.nodeType === Node.ELEMENT_NODE) {
    return true;
  }

  if (node.nodeType === Node.TEXT_NODE) {
    return Boolean(node.textContent?.trim());
  }

  return false;
}
