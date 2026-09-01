import { autoUpdate, computePosition, flip, offset, shift, type Placement } from "@floating-ui/dom";
import { css, html, LitElement, nothing } from "lit";

const focusableSelector = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export type CoachmarkTourStep = {
  description: string;
  nextLabel?: string;
  placement?: Placement;
  previousLabel?: string;
  target: string;
  title: string;
};

/**
 * Guided onboarding overlay that spotlights existing UI and walks the user through contextual product hints.
 *
 * Provide `steps` with CSS selectors for each target and call `show()` to open the sequence at a specific step.
 *
 * @summary Guided spotlight overlay for anchored onboarding and education flows.
 * @fires {CustomEvent<{ open: boolean }>} open-change - Fired whenever the tour opens or closes.
 * @fires {CustomEvent<{ currentStep: number; step: CoachmarkTourStep | null }>} step-change - Fired when the active step changes.
 * @fires close - Fired when the tour is dismissed before completion.
 * @fires complete - Fired when the final step finishes.
 */
export class CindorCoachmarkTour extends LitElement {
  static styles = css`
    :host {
      display: contents;
      color: var(--fg);
    }

    .backdrop,
    .spotlight {
      position: fixed;
      inset: 0;
      z-index: 39;
      pointer-events: none;
    }

    .backdrop {
      background: rgb(15 14 12 / 52%);
    }

    .spotlight {
      inset: auto;
      border: 2px solid color-mix(in srgb, var(--accent) 72%, white);
      border-radius: calc(var(--radius-lg) + 2px);
      box-shadow:
        0 0 0 9999px rgb(15 14 12 / 52%),
        0 0 0 6px color-mix(in srgb, var(--accent) 22%, transparent);
      transition:
        left var(--duration-base) var(--ease-out),
        top var(--duration-base) var(--ease-out),
        width var(--duration-base) var(--ease-out),
        height var(--duration-base) var(--ease-out);
    }

    .surface {
      box-sizing: border-box;
      position: fixed;
      z-index: 40;
      display: grid;
      gap: var(--space-4);
      inline-size: min(24rem, calc(100vw - 2rem));
      max-inline-size: calc(100vw - 2rem);
      padding: var(--space-4);
      border: 1px solid var(--border);
      border-radius: var(--radius-xl);
      background: var(--surface);
      color: var(--fg);
      box-shadow: var(--shadow-lg);
      outline: none;
    }

    .eyebrow {
      color: var(--fg-muted);
      font-size: var(--text-xs);
      font-weight: var(--weight-semibold);
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .header {
      display: grid;
      gap: var(--space-2);
    }

    .title {
      margin: 0;
      font-size: var(--text-lg);
      font-weight: var(--weight-semibold);
    }

    .description {
      margin: 0;
      color: var(--fg-muted);
      font-size: var(--text-sm);
      line-height: 1.5;
    }

    .footer {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      gap: var(--space-3);
    }

    .footer-group {
      display: inline-flex;
      flex-wrap: wrap;
      gap: var(--space-2);
    }

    button {
      font: inherit;
    }

    .button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-block-size: 2.5rem;
      padding: 0 var(--space-3);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      background: var(--surface);
      color: var(--fg);
      cursor: pointer;
      transition:
        background var(--duration-base) var(--ease-out),
        border-color var(--duration-base) var(--ease-out),
        transform var(--duration-fast) var(--ease-out);
    }

    .button:hover:not(:disabled) {
      border-color: color-mix(in srgb, var(--accent) 32%, var(--border));
      background: color-mix(in srgb, var(--accent) 6%, var(--surface));
    }

    .button:active:not(:disabled) {
      transform: scale(0.98);
    }

    .button:focus-visible,
    .surface:focus-visible {
      outline: none;
      box-shadow: var(--ring-focus);
    }

    .button:disabled {
      cursor: not-allowed;
      opacity: 0.56;
    }

    .button[data-variant="primary"] {
      border-color: var(--accent);
      background: var(--accent);
      color: var(--accent-fg);
    }

    .button[data-variant="primary"]:hover:not(:disabled) {
      background: var(--accent-hover);
      border-color: var(--accent-hover);
      color: var(--accent-fg);
    }

    .button[data-variant="ghost"] {
      border-color: transparent;
      background: transparent;
      color: var(--fg-muted);
    }

    .target-note {
      color: var(--fg-muted);
      font-size: var(--text-xs);
    }
  `;

  static properties = {
    currentStep: { type: Number, reflect: true, attribute: "current-step" },
    dismissLabel: { reflect: true, attribute: "dismiss-label" },
    finishLabel: { reflect: true, attribute: "finish-label" },
    nextLabel: { reflect: true, attribute: "next-label" },
    open: { type: Boolean, reflect: true },
    previousLabel: { reflect: true, attribute: "previous-label" },
    steps: { attribute: false }
  };

  /** Zero-based active step index. */
  currentStep = 0;
  /** Label used for dismiss actions. */
  dismissLabel = "Dismiss";
  /** Label used on the final completion action. */
  finishLabel = "Finish";
  /** Default label used on forward navigation buttons. */
  nextLabel = "Next";
  /** Whether the tour is currently visible. */
  open = false;
  /** Default label used on backward navigation buttons. */
  previousLabel = "Back";
  /** Ordered onboarding steps rendered by the tour. */
  steps: CoachmarkTourStep[] = [];

  private cleanupAutoUpdate?: () => void;
  private lastTarget: HTMLElement | null = null;
  private previousFocusedElement: HTMLElement | null = null;
  private autoUpdatePosition = autoUpdate;
  private surfaceId = `${this.localName}-surface`;
  private titleId = `${this.localName}-title`;
  private descriptionId = `${this.localName}-description`;

  override disconnectedCallback(): void {
    this.teardownPositioning();
    super.disconnectedCallback();
  }

  /** Closes the tour and restores focus to the previously active element. */
  close(): void {
    if (!this.open) {
      return;
    }

    this.open = false;
    this.dispatchOpenChange();
    this.dispatchEvent(new Event("close", { bubbles: true, composed: true }));
  }

  /** Advances to the next step or completes the tour when the last step is active. */
  next(): void {
    if (this.isLastStep) {
      this.open = false;
      this.dispatchOpenChange();
      this.dispatchEvent(new Event("complete", { bubbles: true, composed: true }));
      return;
    }

    this.currentStep += 1;
    this.dispatchStepChange();
  }

  /** Moves back to the previous step when available. */
  previous(): void {
    if (this.currentStep <= 0) {
      return;
    }

    this.currentStep -= 1;
    this.dispatchStepChange();
  }

  /** Opens the tour and optionally jumps to a specific step index. */
  show(stepIndex = 0): void {
    this.currentStep = stepIndex;
    this.open = true;
    this.dispatchOpenChange();
    this.dispatchStepChange();
  }

  protected override render() {
    const step = this.activeStep;

    if (!this.open || !step) {
      return nothing;
    }

    const stepLabel = `${Math.min(this.currentStep + 1, this.steps.length)} of ${this.steps.length}`;

    return html`
      ${this.activeTarget ? html`<div class="spotlight" part="spotlight"></div>` : html`<div class="backdrop" part="backdrop"></div>`}
      <section
        aria-describedby=${this.descriptionId}
        aria-labelledby=${this.titleId}
        aria-modal="true"
        class="surface"
        id=${this.surfaceId}
        part="surface"
        role="dialog"
        tabindex="-1"
        @keydown=${this.handleKeyDown}
      >
        <div class="header">
          <span class="eyebrow" part="eyebrow">Step ${stepLabel}</span>
          <h2 class="title" id=${this.titleId} part="title">${step.title}</h2>
          <p class="description" id=${this.descriptionId} part="description">${step.description}</p>
          ${this.activeTarget ? nothing : html`<span class="target-note" part="target-note">Target unavailable for this step.</span>`}
        </div>

        <div class="footer">
          <div class="footer-group">
            <button
              ?disabled=${this.currentStep === 0}
              class="button"
              part="previous-button"
              type="button"
              @click=${this.previous}
            >
              ${step.previousLabel || this.previousLabel}
            </button>
          </div>

          <div class="footer-group">
            <button
              class="button"
              data-variant="ghost"
              part="dismiss-button"
              type="button"
              @click=${this.close}
            >
              ${this.dismissLabel}
            </button>
            <button
              class="button"
              data-variant="primary"
              part="next-button"
              type="button"
              @click=${this.next}
            >
              ${this.isLastStep ? this.finishLabel : step.nextLabel || this.nextLabel}
            </button>
          </div>
        </div>
      </section>
    `;
  }

  protected override updated(changedProperties: Map<PropertyKey, unknown>): void {
    this.normalizeCurrentStep();

    if (changedProperties.has("open")) {
      if (this.open) {
        this.previousFocusedElement = getDeepestActiveElement(this.ownerDocument);
        this.scrollTargetIntoView();
        queueMicrotask(() => {
          this.surfaceElement?.focus();
        });
      } else {
        this.teardownPositioning();
        this.previousFocusedElement?.focus();
        this.previousFocusedElement = null;
      }
    }

    if (this.open && (changedProperties.has("currentStep") || changedProperties.has("steps"))) {
      this.scrollTargetIntoView();
    }

    this.syncPositioning();
  }

  private handleKeyDown = (event: KeyboardEvent): void => {
    if (event.key === "Escape") {
      event.preventDefault();
      this.close();
      return;
    }

    if (event.key === "ArrowRight" && !this.isLastStep) {
      event.preventDefault();
      this.next();
      return;
    }

    if (event.key === "ArrowLeft" && this.currentStep > 0) {
      event.preventDefault();
      this.previous();
      return;
    }

    if (event.key !== "Tab") {
      return;
    }

    const focusableElements = this.focusableElements;
    if (focusableElements.length === 0) {
      event.preventDefault();
      this.surfaceElement?.focus();
      return;
    }

    const activeElement = getDeepestActiveElement(this.ownerDocument) ?? (event.target instanceof HTMLElement ? event.target : null);
    const activeIndex = activeElement ? focusableElements.indexOf(activeElement) : -1;

    if (event.shiftKey) {
      if (activeIndex <= 0) {
        event.preventDefault();
        focusableElements.at(-1)?.focus();
      }
      return;
    }

    if (activeIndex === -1 || activeIndex === focusableElements.length - 1) {
      event.preventDefault();
      focusableElements[0]?.focus();
    }
  };

  private dispatchOpenChange(): void {
    this.dispatchEvent(
      new CustomEvent("open-change", {
        bubbles: true,
        composed: true,
        detail: { open: this.open }
      })
    );
  }

  private dispatchStepChange(): void {
    this.dispatchEvent(
      new CustomEvent("step-change", {
        bubbles: true,
        composed: true,
        detail: {
          currentStep: this.currentStep,
          step: this.activeStep
        }
      })
    );
  }

  private normalizeCurrentStep(): void {
    if (this.steps.length === 0) {
      this.currentStep = 0;
      return;
    }

    this.currentStep = Math.max(0, Math.min(this.currentStep, this.steps.length - 1));
  }

  private scrollTargetIntoView(): void {
    const target = this.activeTarget;
    if (!target || typeof target.scrollIntoView !== "function") {
      return;
    }

    target.scrollIntoView({
      block: "center",
      inline: "nearest"
    });
  }

  private syncPositioning(): void {
    const surface = this.surfaceElement;
    const step = this.activeStep;
    const target = this.activeTarget;

    if (!this.open || !surface || !step) {
      this.teardownPositioning();
      return;
    }

    if (!target) {
      this.teardownPositioning();
      this.positionFallbackSurface(surface);
      this.syncSpotlight(null);
      return;
    }

    if (this.lastTarget !== target) {
      this.teardownPositioning();
      this.lastTarget = target;
      this.cleanupAutoUpdate = this.autoUpdatePosition(target, surface, () => {
        void this.positionAgainstTarget(target, surface, this.activeStep?.placement ?? "bottom");
      });
    }

    void this.positionAgainstTarget(target, surface, step.placement ?? "bottom");
  }

  private async positionAgainstTarget(target: HTMLElement, surface: HTMLElement, placement: Placement): Promise<void> {
    const { x, y } = await computePosition(target, surface, {
      middleware: [offset(16), flip(), shift({ padding: 16 })],
      placement,
      strategy: "fixed"
    });

    surface.style.left = `${x}px`;
    surface.style.top = `${y}px`;
    surface.style.transform = "";
    this.syncSpotlight(target);
  }

  private positionFallbackSurface(surface: HTMLElement): void {
    surface.style.left = "50%";
    surface.style.top = "50%";
    surface.style.transform = "translate(-50%, -50%)";
  }

  private syncSpotlight(target: HTMLElement | null): void {
    const spotlight = this.renderRoot.querySelector(".spotlight") as HTMLElement | null;
    if (!spotlight) {
      return;
    }

    if (!target) {
      spotlight.style.left = "";
      spotlight.style.top = "";
      spotlight.style.width = "";
      spotlight.style.height = "";
      return;
    }

    const bounds = target.getBoundingClientRect();
    const padding = 8;
    spotlight.style.left = `${Math.max(8, bounds.left - padding)}px`;
    spotlight.style.top = `${Math.max(8, bounds.top - padding)}px`;
    spotlight.style.width = `${Math.min(window.innerWidth - 16, bounds.width + padding * 2)}px`;
    spotlight.style.height = `${Math.min(window.innerHeight - 16, bounds.height + padding * 2)}px`;
  }

  private teardownPositioning(): void {
    this.cleanupAutoUpdate?.();
    this.cleanupAutoUpdate = undefined;
    this.lastTarget = null;

    const surface = this.surfaceElement;
    if (surface) {
      surface.style.left = "";
      surface.style.top = "";
      surface.style.transform = "";
    }
  }

  private get activeStep(): CoachmarkTourStep | null {
    if (!this.steps.length) {
      return null;
    }

    return this.steps[this.currentStep] ?? null;
  }

  private get activeTarget(): HTMLElement | null {
    const selector = this.activeStep?.target?.trim();
    if (!selector) {
      return null;
    }

    const candidate = this.ownerDocument.querySelector(selector);
    return candidate instanceof HTMLElement ? candidate : null;
  }

  private get focusableElements(): HTMLElement[] {
    return Array.from(this.renderRoot.querySelectorAll<HTMLElement>(focusableSelector));
  }

  private get isLastStep(): boolean {
    return this.currentStep >= this.steps.length - 1;
  }

  private get surfaceElement(): HTMLElement | null {
    return this.renderRoot.querySelector(".surface");
  }
}

function getDeepestActiveElement(root: Document | ShadowRoot): HTMLElement | null {
  const activeElement = root.activeElement;
  if (!(activeElement instanceof HTMLElement)) {
    return null;
  }

  if (activeElement.shadowRoot?.activeElement instanceof HTMLElement) {
    return getDeepestActiveElement(activeElement.shadowRoot);
  }

  return activeElement;
}
