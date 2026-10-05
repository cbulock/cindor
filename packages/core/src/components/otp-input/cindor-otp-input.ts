import { css, html, type PropertyValues } from "lit";
import { live } from "lit/directives/live.js";

import { createFieldHostStyles, createTextControlStyles } from "../shared/control-styles.js";
import { FormAssociatedElement } from "../shared/form-associated-element.js";

/**
 * A grouped, form-associated one-time code control. Verification belongs to the application.
 * @fires input - An effective user edit changed the aggregate value.
 * @fires change - An edited value was committed by Enter or focus leaving the group.
 * @fires complete - A user edit produced a new full code; detail.value contains the code.
 * @csspart group - The labelled input group.
 * @csspart control - Each character input.
 */
export class CindorOtpInput extends FormAssociatedElement {
  static properties = {
    length: { type: Number, reflect: true },
    mode: { reflect: true },
    value: {},
    name: { reflect: true },
    required: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    readonly: { type: Boolean, reflect: true },
    invalid: { type: Boolean, reflect: true },
    masked: { type: Boolean, reflect: true },
    active: { state: true },
    formDisabled: { state: true }
  };

  static styles = [createFieldHostStyles("fit-content"), createTextControlStyles("input"), css`
    [role="group"] { display: flex; gap: var(--space-2, 0.5rem); flex-wrap: wrap; }
    input { inline-size: 2.75rem; text-align: center; padding: 0; }
    input[aria-invalid="true"] { border-color: var(--danger, var(--border)); }
  `];

  /** Number of characters. Non-positive, non-integer and non-finite values fall back to six. */
  length = 6;
  /** ASCII digits, or case-preserving ASCII letters and digits. */
  mode: "numeric" | "alphanumeric" = "numeric";
  /** Aggregate code. Property changes are silent; live values are never reflected. */
  value = "";
  name = "";
  required = false;
  disabled = false;
  readonly = false;
  /** Application-owned error state, e.g. a rejected verification code. */
  invalid = false;
  /** Conceals display with native password inputs; value and events still contain the code. */
  masked = false;
  private active = 0;
  private formDisabled = false;
  private initialValue = "";
  private committedValue = "";
  private dirty = false;
  private composing = false;
  private pendingUserValue: string | undefined;

  private get count(): number {
    return Number.isInteger(this.length) && this.length > 0 ? this.length : 6;
  }

  private get unavailable(): boolean { return this.disabled || this.formDisabled; }
  private get cells(): HTMLInputElement[] { return Array.from(this.renderRoot.querySelectorAll("input")); }
  private normalizeCode(value: string): string {
    return String(value ?? "").replace(this.mode === "alphanumeric" ? /[^a-zA-Z0-9]/g : /[^0-9]/g, "").slice(0, this.count);
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.initialValue = this.value;
    this.committedValue = this.normalizeCode(this.value);
  }

  protected override willUpdate(changes: PropertyValues): void {
    if (changes.has("value") || changes.has("length") || changes.has("mode")) {
      this.value = this.normalizeCode(this.value);
      if (this.pendingUserValue !== this.value) this.dirty = false;
      if (!this.dirty) this.committedValue = this.value;
      this.pendingUserValue = undefined;
    }
    this.active = Math.min(this.active, this.count - 1);
  }

  protected override render() {
    const bad = this.invalid || Boolean(this.validationMessage);
    return html`<div id=${this.controlId} part="group" role="group" aria-invalid=${String(bad)}
      @focusout=${this.handleFocusOut}>
      ${Array.from({ length: this.count }, (_, index) => html`<input part="control"
        .value=${live(this.value[index] ?? "")} type=${this.masked ? "password" : "text"}
        aria-label=${`Character ${index + 1} of ${this.count}`} aria-invalid=${String(bad)}
        tabindex=${!this.unavailable && index === this.active ? 0 : -1}
        inputmode=${this.mode === "alphanumeric" ? "text" : "numeric"}
        autocomplete=${index === 0 ? "one-time-code" : "off"}
        ?disabled=${this.unavailable} ?readonly=${this.readonly}
        @focus=${() => { this.active = index; this.cells[index]?.select(); }}
        @keydown=${(event: KeyboardEvent) => this.handleKey(event, index)}
        @paste=${(event: ClipboardEvent) => this.handlePaste(event, index)}
        @beforeinput=${(event: InputEvent) => {
          if (event.isComposing || this.composing || !event.cancelable) return;
          if (["deleteContentBackward", "deleteContentForward"].includes(event.inputType)) {
            event.preventDefault();
            if (!this.unavailable && !this.readonly) this.deleteCharacter(index, event.inputType === "deleteContentBackward");
            return;
          }
          // Native insertion can append to a cell when its selection is collapsed.
          // Replace the character directly, regardless of the caret position.
          if (event.inputType !== "insertText" || event.data?.length !== 1 || event.isComposing || this.composing || !event.cancelable) return;
          event.preventDefault();
          if (!this.unavailable && !this.readonly) this.insert(event.data, index);
        }}
        @compositionstart=${() => { this.composing = true; }}
        @compositionend=${(event: CompositionEvent) => { this.composing = false; this.handleInput(event, index); }}
        @input=${(event: InputEvent) => this.handleInput(event, index)}
        @change=${(event: Event) => event.stopPropagation()}
      />`)}
    </div>`;
  }

  protected override updated(): void {
    const group = this.renderRoot.querySelector<HTMLElement>('[role="group"]');
    this.syncControlA11y(group);
    if (group && !group.hasAttribute("aria-label")) group.setAttribute("aria-label", "One-time code");
    const description = group?.getAttribute("aria-describedby");
    // Instructions live on the group; only the active cell references them.
    this.cells.forEach((cell, index) => {
      if (description && index === this.active) cell.setAttribute("aria-describedby", description);
      else cell.removeAttribute("aria-describedby");
    });
    this.syncFormState();
  }

  override focus(options?: FocusOptions): void { this.move(this.active, options); }
  private move(index: number, options?: FocusOptions): void {
    this.active = Math.max(0, Math.min(index, this.count - 1));
    if (!this.unavailable) { this.cells[this.active]?.focus(options); this.cells[this.active]?.select(); }
  }

  private edit(next: string): void {
    next = this.normalizeCode(next);
    if (next === this.value) { this.requestUpdate(); return; }
    this.pendingUserValue = next;
    this.value = next;
    this.dirty = true;
    this.syncFormState();
    this.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
    if (next.length === this.count) {
      this.dispatchEvent(new CustomEvent("complete", { bubbles: true, composed: true, detail: { value: next } }));
    }
  }

  private insert(text: string, index: number): void {
    const filtered = this.normalizeCode(text);
    if (!filtered) { this.requestUpdate(); return; }
    const start = filtered.length >= this.count ? 0 : Math.min(index, this.value.length);
    this.edit(this.value.slice(0, start) + filtered + this.value.slice(start + filtered.length));
    this.move(Math.min(start + filtered.length, this.count - 1));
  }

  private handleInput(event: Event, index: number): void {
    event.stopPropagation();
    if (this.composing || (event instanceof InputEvent && event.isComposing)) return;
    if (this.unavailable || this.readonly) { this.requestUpdate(); return; }
    const cell = event.currentTarget as HTMLInputElement;
    if (event instanceof InputEvent && event.inputType === "insertText" && event.data?.length === 1) {
      this.insert(event.data, index);
      return;
    }
    if (!cell.value) this.edit(this.value.slice(0, index) + this.value.slice(index + 1));
    else this.insert(cell.value, index);
  }

  private handlePaste(event: ClipboardEvent, index: number): void {
    event.preventDefault();
    event.stopPropagation();
    if (!this.unavailable && !this.readonly) this.insert(event.clipboardData?.getData("text") ?? "", index);
  }

  private handleKey(event: KeyboardEvent, index: number): void {
    if (event.isComposing || this.composing || this.unavailable) return;
    const positions: Record<string, number> = { ArrowLeft: index - 1, ArrowRight: index + 1, Home: 0, End: this.count - 1 };
    if (event.key in positions) { event.preventDefault(); this.move(positions[event.key]); return; }
    if (event.key === "Enter") { event.preventDefault(); this.commit(); return; }
    if (this.readonly || !["Backspace", "Delete"].includes(event.key)) return;
    event.preventDefault();
    this.deleteCharacter(index, event.key === "Backspace");
  }

  private deleteCharacter(index: number, backward: boolean): void {
    const target = backward && !this.value[index] ? Math.max(0, Math.min(index - 1, this.value.length - 1)) : index;
    this.edit(this.value.slice(0, target) + this.value.slice(target + 1));
    this.move(target);
  }

  private handleFocusOut(event: FocusEvent): void {
    if (event.relatedTarget instanceof Node && this.renderRoot.contains(event.relatedTarget)) return;
    this.commit();
  }

  private commit(): void {
    if (this.dirty && this.value !== this.committedValue) this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
    this.committedValue = this.value;
    this.dirty = false;
  }

  /** Side-effect-free aggregate validity for form summaries. */
  get validity(): ValidityState {
    const message = this.validationMessage;
    const valueMissing = Boolean(message) && !this.value && this.required;
    return {
      valid: !message, valueMissing, customError: Boolean(message) && !valueMissing,
      badInput: false, patternMismatch: false, rangeOverflow: false, rangeUnderflow: false,
      stepMismatch: false, tooLong: false, tooShort: false, typeMismatch: false
    };
  }

  get validationMessage(): string {
    if (this.unavailable || this.readonly) return "";
    if (this.invalid) return "The code is invalid.";
    if (!this.value && this.required) return "Enter the code.";
    if (this.value && this.value.length !== this.count) return `Enter all ${this.count} characters.`;
    return "";
  }

  private syncFormState(): void {
    this.setFormValue(this.unavailable ? null : this.value);
    const message = this.validationMessage;
    const flags = message ? (!this.value && this.required ? { valueMissing: true } : { customError: true }) : {};
    this.internals?.setValidity?.(flags, message, this.cells[0]);
  }

  checkValidity(): boolean { this.syncFormState(); return this.internals?.checkValidity?.() ?? !this.validationMessage; }
  reportValidity(): boolean { this.syncFormState(); return this.internals?.reportValidity?.() ?? !this.validationMessage; }
  formDisabledCallback(disabled: boolean): void { this.formDisabled = disabled; this.syncFormState(); }
  formResetCallback(): void {
    this.dirty = false;
    this.value = this.normalizeCode(this.initialValue);
    this.committedValue = this.value;
    this.active = 0;
    this.syncFormState();
  }
}
