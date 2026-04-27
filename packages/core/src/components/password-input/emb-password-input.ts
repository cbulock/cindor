import { css, html, type CSSResultGroup } from "lit";

import { BaseInputElement } from "../input/emb-input.js";

export class EmbPasswordInput extends BaseInputElement {
  static override styles: CSSResultGroup = [
    BaseInputElement.styles,
    css`
    .toggle {
      position: absolute;
      inset-block-start: 50%;
      inset-inline-end: var(--space-2);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      inline-size: calc(1rem + var(--space-2));
      block-size: calc(1rem + var(--space-2));
      padding: 0;
      border: 0;
      border-radius: var(--radius-sm);
      background: transparent;
      color: var(--fg-muted);
      cursor: pointer;
      transform: translateY(-50%);
      transition:
        background var(--duration-base) var(--ease-out),
        color var(--duration-base) var(--ease-out),
        transform var(--duration-base) var(--ease-out);
    }

    .toggle:hover:not(:disabled) {
      background: var(--bg-subtle);
      color: var(--fg);
      transform: translateY(-50%) scale(1.04);
    }

    .toggle:disabled {
      cursor: not-allowed;
      color: var(--fg-subtle);
    }

    .toggle:focus-visible {
      outline: none;
      box-shadow: var(--ring-focus);
    }

    .toggle:active:not(:disabled) {
      transform: translateY(-50%) scale(0.98);
    }

    `
  ];

  static properties = {
    ...BaseInputElement.properties,
    revealPassword: { state: true },
  };

  autocomplete = "current-password";
  private revealPassword = false;

  private handleToggleClick = (): void => {
    if (this.disabled) {
      return;
    }

    this.revealPassword = !this.revealPassword;
    this.inputElement?.focus();
  };

  protected override get hasEndAdornment(): boolean {
    return true;
  }

  protected override renderEndAdornment() {
    return html`
      <button
        class="toggle"
        part="toggle"
        type="button"
        ?disabled=${this.disabled}
        aria-label=${this.revealPassword ? "Hide password" : "Show password"}
        aria-pressed=${String(this.revealPassword)}
        @click=${this.handleToggleClick}
      >
        <emb-icon
          aria-hidden="true"
          class="toggle-icon"
          part="toggle-icon"
          name=${this.revealPassword ? "eye-off" : "eye"}
          size="16"
        ></emb-icon>
      </button>
    `;
  }

  protected override get inputType(): string {
    return this.revealPassword ? "text" : "password";
  }
}
