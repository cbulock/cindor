import { css, html, LitElement } from "lit";
import { ifDefined } from "lit/directives/if-defined.js";

import { normalizeA11yText, ReferencedTextObserver, resolveReferencedText, syncA11yMirror } from "../shared/a11y-mirror.js";

export type ButtonVariant = "solid" | "ghost";
export type ButtonType = "button" | "submit" | "reset";

export class CindorButton extends LitElement {
  private static nextFormId = 0;
  private static nextA11yId = 0;

  static styles = css`
    :host {
      display: inline-block;
      color: var(--fg);
    }

    button {
      font: inherit;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--cindor-button-gap, var(--space-2));
      min-width: var(--cindor-button-min-width, auto);
      min-height: var(--cindor-button-min-height, 36px);
      padding: var(--cindor-button-padding-block, 0) var(--cindor-button-padding-inline, var(--space-4));
      border: 1px solid var(--cindor-button-border-color, var(--border));
      border-start-start-radius: var(--cindor-button-border-start-start-radius, var(--cindor-button-radius, var(--radius-md)));
      border-start-end-radius: var(--cindor-button-border-start-end-radius, var(--cindor-button-radius, var(--radius-md)));
      border-end-start-radius: var(--cindor-button-border-end-start-radius, var(--cindor-button-radius, var(--radius-md)));
      border-end-end-radius: var(--cindor-button-border-end-end-radius, var(--cindor-button-radius, var(--radius-md)));
      background: var(--cindor-button-background, var(--surface));
      color: var(--cindor-button-color, var(--fg));
      cursor: pointer;
      transition:
        background var(--duration-base) var(--ease-out),
        border-color var(--duration-base) var(--ease-out),
        color var(--duration-base) var(--ease-out),
        box-shadow var(--duration-base) var(--ease-out),
        transform var(--duration-base) var(--ease-out);
    }

    :host([variant="solid"]) button {
      background: var(--cindor-button-solid-background, var(--accent));
      border-color: var(--cindor-button-solid-border-color, var(--accent));
      color: var(--cindor-button-solid-color, var(--accent-fg));
    }

    :host([variant="ghost"]) button {
      background: var(--cindor-button-ghost-background, transparent);
      border-color: var(--cindor-button-ghost-border-color, var(--border));
      color: var(--cindor-button-ghost-color, var(--fg));
    }

    button:hover:not(:disabled) {
      border-color: var(--cindor-button-hover-border-color, var(--border-strong));
      background: var(--cindor-button-hover-background, var(--bg-subtle));
      color: var(--cindor-button-hover-color, currentColor);
      transform: translateY(-1px);
    }

    :host([variant="solid"]) button:hover:not(:disabled) {
      background: var(--cindor-button-solid-hover-background, var(--accent-hover));
      border-color: var(--cindor-button-solid-hover-border-color, var(--accent-hover));
      color: var(--cindor-button-solid-hover-color, var(--cindor-button-solid-color, var(--accent-fg)));
    }

    button:disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }

    button:focus-visible {
      outline: none;
      box-shadow: var(--ring-focus);
    }

    button:active:not(:disabled) {
      transform: translateY(0);
    }

    :host([icon-only]) button {
      min-width: var(--cindor-button-icon-min-size, 2rem);
      padding-inline: 0;
    }

    .icon-slot {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      line-height: 0;
    }

    .icon-slot::slotted(*) {
      flex: none;
    }

    .label {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
  `;

  static properties = {
    disabled: { type: Boolean, reflect: true },
    iconOnly: { type: Boolean, reflect: true, attribute: "icon-only" },
    type: {},
    variant: { reflect: true }
  };

  disabled = false;
  iconOnly = false;
  type: ButtonType = "button";
  variant: ButtonVariant = "solid";
  private readonly generatedA11yId = `${this.localName}-${CindorButton.nextA11yId++}-control`;
  private readonly generatedFormId = `cindor-form-${CindorButton.nextFormId++}`;
  private readonly hostA11yObserver = new MutationObserver(() => {
    this.requestUpdate();
  });
  private readonly referencedTextObserver = new ReferencedTextObserver(this, () => {
    this.requestUpdate();
  });

  override connectedCallback(): void {
    super.connectedCallback();
    this.hostA11yObserver.observe(this, {
      attributeFilter: ["aria-describedby", "aria-description", "aria-label", "aria-labelledby", "id"],
      attributes: true
    });
  }

  override disconnectedCallback(): void {
    this.hostA11yObserver.disconnect();
    this.referencedTextObserver.disconnect();
    super.disconnectedCallback();
  }

  override focus(options?: FocusOptions): void {
    this.buttonElement?.focus(options);
  }

  override click(): void {
    this.buttonElement?.click();
  }

  protected override render() {
    return html`
      <button
        class="cindor-button__control"
        part="control"
        ?disabled=${this.disabled}
        form=${ifDefined(this.associatedFormId)}
        type=${this.resolvedType}
        @click=${this.handleButtonClick}
      >
        <slot class="icon-slot" name="start-icon" part="start-icon"></slot>
        <span class="label" part="label"><slot></slot></span>
        <slot class="icon-slot" name="end-icon" part="end-icon"></slot>
      </button>
    `;
  }

  protected override updated(): void {
    this.syncButtonA11y();
  }

  private handleButtonClick = (event: MouseEvent): void => {
    if (event.defaultPrevented || this.disabled || !this.associatedForm) {
      return;
    }

    if (this.resolvedType === "submit") {
      event.preventDefault();
      this.associatedForm.requestSubmit();
      return;
    }

    if (this.resolvedType === "reset") {
      event.preventDefault();
      this.associatedForm.reset();
    }
  };

  private get associatedForm(): HTMLFormElement | null {
    const explicitFormId = this.getAttribute("form");
    if (explicitFormId) {
      const explicitForm = this.ownerDocument.getElementById(explicitFormId);
      return explicitForm instanceof HTMLFormElement ? explicitForm : null;
    }

    return this.closest("form");
  }

  private get associatedFormId(): string | undefined {
    const form = this.associatedForm;
    if (!form) {
      return undefined;
    }

    form.id ||= this.generatedFormId;
    return form.id;
  }

  private get resolvedType(): ButtonType {
    if (this.type === "submit" || this.type === "reset") {
      return this.type;
    }

    if (this.hasAttribute("type")) {
      return "button";
    }

    return this.associatedForm ? "submit" : "button";
  }

  private get buttonElement(): HTMLButtonElement | null {
    return this.renderRoot.querySelector("button");
  }

  private syncButtonA11y(): void {
    const button = this.buttonElement;
    if (!button) {
      return;
    }

    this.referencedTextObserver.observe(this.getAttribute("aria-labelledby"), this.getAttribute("aria-describedby"));

    const labelledByText = resolveReferencedText(this, this.getAttribute("aria-labelledby"));
    const ariaLabel = normalizeA11yText(this.getAttribute("aria-label"));
    if (labelledByText) {
      const labelId = syncA11yMirror(this.renderRoot, this.buttonA11yIdBase, "label", labelledByText);
      if (labelId) {
        button.setAttribute("aria-labelledby", labelId);
      }
      button.removeAttribute("aria-label");
    } else {
      syncA11yMirror(this.renderRoot, this.buttonA11yIdBase, "label", "");
      button.removeAttribute("aria-labelledby");
      if (ariaLabel) {
        button.setAttribute("aria-label", ariaLabel);
      } else {
        button.removeAttribute("aria-label");
      }
    }

    const describedByText = resolveReferencedText(this, this.getAttribute("aria-describedby"));
    const descriptionText = normalizeA11yText([this.getAttribute("aria-description"), describedByText].filter((value) => value).join(" "));
    const descriptionId = syncA11yMirror(this.renderRoot, this.buttonA11yIdBase, "description", descriptionText);
    if (descriptionId) {
      button.setAttribute("aria-describedby", descriptionId);
    } else {
      button.removeAttribute("aria-describedby");
    }
  }

  private get buttonA11yIdBase(): string {
    return `${this.id || this.generatedA11yId}`;
  }
}
