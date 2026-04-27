import { css, html, LitElement, nothing } from "lit";

export type StepperOrientation = "horizontal" | "vertical";
export type StepperStatus = "complete" | "current" | "upcoming" | "error";

export type StepperStep = {
  description?: string;
  disabled?: boolean;
  label: string;
  optional?: boolean;
  status?: StepperStatus;
  value: string;
};

export class EmbStepper extends LitElement {
  static styles = css`
    :host {
      display: block;
      color: var(--fg);
    }

    .stepper {
      display: block;
    }

    .list {
      display: grid;
      gap: var(--space-4);
      margin: 0;
      padding: 0;
      list-style: none;
    }

    :host([orientation="horizontal"]) .list {
      grid-auto-columns: minmax(0, 1fr);
      grid-auto-flow: column;
    }

    .step {
      position: relative;
      min-width: 0;
    }

    :host([orientation="horizontal"]) .step:not(:last-child)::after {
      content: "";
      position: absolute;
      inset-block-start: 1rem;
      inset-inline-start: calc(100% - var(--space-2));
      inline-size: calc(100% - var(--space-1));
      block-size: 1px;
      background: var(--border);
    }

    :host([orientation="vertical"]) .step:not(:last-child)::after {
      content: "";
      position: absolute;
      inset-block-start: calc(2rem + var(--space-2));
      inset-inline-start: 1rem;
      inline-size: 1px;
      block-size: calc(100% - 2rem);
      background: var(--border);
    }

    .control {
      position: relative;
      z-index: 1;
      display: grid;
      grid-template-columns: auto minmax(0, 1fr);
      align-items: start;
      gap: var(--space-3);
      inline-size: 100%;
      padding: 0;
      border: 0;
      background: transparent;
      color: inherit;
      font: inherit;
      text-align: start;
    }

    button.control {
      cursor: pointer;
    }

    button.control:focus-visible {
      outline: none;
      border-radius: var(--radius-lg);
      box-shadow: var(--ring-focus);
    }

    button.control:disabled {
      cursor: not-allowed;
      opacity: 0.64;
    }

    .indicator {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      inline-size: 2rem;
      block-size: 2rem;
      border: 1px solid var(--border);
      border-radius: 999px;
      background: var(--surface);
      color: var(--fg-muted);
      font-size: var(--text-sm);
      font-weight: 600;
      box-sizing: border-box;
    }

    .body {
      display: grid;
      gap: var(--space-1);
      min-width: 0;
      padding-block: var(--space-1);
    }

    .label-row {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      flex-wrap: wrap;
    }

    .label {
      font-weight: 600;
    }

    .optional,
    .description {
      color: var(--fg-muted);
      font-size: var(--text-sm);
    }

    .step[data-status="complete"] .indicator,
    .step[data-status="current"] .indicator {
      border-color: var(--accent);
      background: color-mix(in srgb, var(--accent) 12%, var(--surface));
      color: var(--accent);
    }

    .step[data-status="complete"] .indicator {
      background: var(--accent);
      color: var(--accent-fg);
    }

    .step[data-status="error"] .indicator {
      border-color: var(--danger, #dc2626);
      background: color-mix(in srgb, var(--danger, #dc2626) 12%, var(--surface));
      color: var(--danger, #dc2626);
    }

    .step[data-status="current"] .label {
      color: var(--accent);
    }

    .step[data-status="error"] .label {
      color: var(--danger, #dc2626);
    }
  `;

  static properties = {
    disabled: { type: Boolean, reflect: true },
    interactive: { type: Boolean, reflect: true },
    orientation: { reflect: true },
    steps: { attribute: false },
    value: { reflect: true }
  };

  disabled = false;
  interactive = false;
  orientation: StepperOrientation = "horizontal";
  steps: StepperStep[] = [];
  value = "";

  override connectedCallback(): void {
    super.connectedCallback();
    this.normalizeValue();
  }

  override focus(options?: FocusOptions): void {
    this.currentControl?.focus(options);
  }

  protected override render() {
    return html`
      <nav
        class="stepper"
        part="stepper"
        aria-describedby=${this.hostAriaDescribedBy ?? nothing}
        aria-label=${this.hostAriaLabelledBy ? nothing : this.hostAriaLabel}
        aria-labelledby=${this.hostAriaLabelledBy ?? nothing}
      >
        <ol class="list" part="list">
          ${this.steps.map((step, index) => {
            const status = this.getStepStatus(step, index);
            const isCurrent = step.value === this.value;
            const isDisabled = this.disabled || Boolean(step.disabled);
            const interactive = this.interactive && !isDisabled;

            return html`
              <li class="step" data-status=${status} part="step">
                ${interactive
                  ? html`
                      <button
                        class="control"
                        part=${isCurrent ? "control control-current" : "control"}
                        aria-current=${isCurrent ? "step" : nothing}
                        ?disabled=${isDisabled}
                        type="button"
                        @click=${() => this.selectStep(step.value)}
                      >
                        ${this.renderIndicator(status, index)}
                        ${this.renderBody(step)}
                      </button>
                    `
                  : html`
                      <div class="control" part=${isCurrent ? "control control-current" : "control"} aria-current=${isCurrent ? "step" : nothing}>
                        ${this.renderIndicator(status, index)}
                        ${this.renderBody(step)}
                      </div>
                    `}
              </li>
            `;
          })}
        </ol>
      </nav>
    `;
  }

  protected override updated(changedProperties: Map<PropertyKey, unknown>): void {
    if (changedProperties.has("steps")) {
      this.normalizeValue();
    }
  }

  private renderBody(step: StepperStep) {
    return html`
      <span class="body">
        <span class="label-row">
          <span class="label">${step.label}</span>
          ${step.optional ? html`<span class="optional">Optional</span>` : null}
        </span>
        ${step.description ? html`<span class="description">${step.description}</span>` : null}
      </span>
    `;
  }

  private renderIndicator(status: StepperStatus, index: number) {
    if (status === "complete") {
      return html`<span class="indicator" part="indicator"><emb-icon name="check" size="16"></emb-icon></span>`;
    }

    if (status === "error") {
      return html`<span class="indicator" part="indicator"><emb-icon name="circle-alert" size="16"></emb-icon></span>`;
    }

    return html`<span class="indicator" part="indicator">${index + 1}</span>`;
  }

  private getStepStatus(step: StepperStep, index: number): StepperStatus {
    if (step.status) {
      return step.status;
    }

    const currentIndex = this.steps.findIndex((candidate) => candidate.value === this.value);
    if (currentIndex === -1 || index > currentIndex) {
      return "upcoming";
    }

    if (index < currentIndex) {
      return "complete";
    }

    return "current";
  }

  private normalizeValue(): void {
    if (this.value && this.steps.some((step) => step.value === this.value)) {
      return;
    }

    this.value = this.steps.find((step) => !step.disabled)?.value ?? this.steps[0]?.value ?? "";
  }

  private selectStep(value: string): void {
    if (value === this.value) {
      return;
    }

    this.value = value;
    this.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
    this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
  }

  private get currentControl(): HTMLElement | null {
    return this.renderRoot.querySelector('[aria-current="step"]');
  }

  private get hostAriaLabel(): string {
    return this.getAttribute("aria-label") ?? "Progress";
  }

  private get hostAriaDescribedBy(): string | null {
    return this.getAttribute("aria-describedby");
  }

  private get hostAriaLabelledBy(): string | null {
    return this.getAttribute("aria-labelledby");
  }
}
