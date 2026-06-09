import { css, html, nothing } from "lit";

import { FormAssociatedElement } from "../shared/form-associated-element.js";

export type FieldArrayRenderDetail<T = unknown> = {
  index: number;
  item: T;
  list: CindorFieldArray<T>;
};

export type FieldArrayCreateItem<T = unknown> = (detail: { items: T[]; list: CindorFieldArray<T> }) => T;
export type FieldArrayItemRenderer<T = unknown> = (detail: FieldArrayRenderDetail<T>) => unknown;
export type FieldArrayAction = "add" | "remove" | "reorder" | "reset";

export type FieldArrayChangeDetail<T = unknown> = {
  action: FieldArrayAction;
  fromIndex?: number;
  index?: number;
  item?: T;
  items: T[];
  toIndex?: number;
  value: string;
};

type FieldArrayRecord = Record<string, unknown>;

/**
 * Repeated field-group shell for append, remove, and reorder workflows.
 *
 * The `items` property is the working array, and `value` mirrors that state as serialized JSON for forms.
 *
 * @fires {CustomEvent<FieldArrayChangeDetail>} input - Fired when the item array changes.
 * @fires {CustomEvent<FieldArrayChangeDetail>} change - Fired when the item array changes.
 */
export class CindorFieldArray<T = unknown> extends FormAssociatedElement {
  static styles = css`
    :host {
      display: block;
      color: var(--fg);
    }

    .surface,
    .empty {
      display: grid;
      gap: var(--space-4);
    }

    .rows {
      display: grid;
      gap: var(--space-3);
    }

    .row {
      display: grid;
      gap: var(--space-3);
      padding: var(--space-4);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      background: var(--surface);
    }

    .row-header {
      display: flex;
      flex-wrap: wrap;
      align-items: start;
      justify-content: space-between;
      gap: var(--space-3);
    }

    .row-copy {
      display: grid;
      gap: var(--space-1);
      min-width: 0;
    }

    .row-label {
      font-weight: var(--weight-semibold);
    }

    .row-meta,
    .row-description,
    .empty-copy,
    .helper {
      color: var(--fg-muted);
    }

    .row-description,
    .empty-copy,
    .helper {
      margin: 0;
    }

    .row-controls,
    .footer {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2);
    }

    .empty {
      padding: var(--space-5);
      border: 1px dashed var(--border);
      border-radius: var(--radius-xl);
      background: var(--bg-subtle);
    }

    .empty-title {
      margin: 0;
      color: var(--fg);
      font-size: var(--text-base);
      font-weight: var(--weight-semibold);
    }

    .action-button {
      --cindor-button-min-height: 2.5rem;
      --cindor-button-ghost-background: var(--surface);
      --cindor-button-ghost-border-color: var(--border);
      --cindor-button-ghost-color: var(--fg);
      --cindor-button-hover-background: var(--bg-subtle);
      --cindor-button-hover-border-color: var(--border-strong);
    }
  `;

  static properties = {
    addLabel: { reflect: true, attribute: "add-label" },
    disabled: { type: Boolean, reflect: true },
    emptyCopy: { reflect: true, attribute: "empty-copy" },
    emptyTitle: { reflect: true, attribute: "empty-title" },
    items: { attribute: false },
    maxItems: { type: Number, reflect: true, attribute: "max-items" },
    minItems: { type: Number, reflect: true, attribute: "min-items" },
    moveDownLabel: { reflect: true, attribute: "move-down-label" },
    moveUpLabel: { reflect: true, attribute: "move-up-label" },
    name: { reflect: true },
    removeLabel: { reflect: true, attribute: "remove-label" },
    value: {}
  };

  addLabel = "Add item";
  disabled = false;
  emptyCopy = "Add the first item to start building this repeated field group.";
  emptyTitle = "No items yet";
  items: T[] = [];
  maxItems?: number;
  minItems = 0;
  moveDownLabel = "Move item down";
  moveUpLabel = "Move item up";
  name = "";
  removeLabel = "Remove item";
  value = "";

  createItem?: FieldArrayCreateItem<T>;
  renderItem?: FieldArrayItemRenderer<T>;

  private defaultItems: T[] = [];
  private initialized = false;

  override connectedCallback(): void {
    super.connectedCallback();

    if (!this.initialized) {
      this.items = this.normalizeItems(this.items);
      this.defaultItems = [...this.items];
      this.value = this.serializeItems(this.items);
      this.initialized = true;
    }

    this.syncFormState();
  }

  checkValidity(): boolean {
    if (this.internals && typeof this.internals.checkValidity === "function") {
      return this.internals.checkValidity();
    }

    return this.validationMessage === "";
  }

  override focus(options?: FocusOptions): void {
    this.addButtonElement?.focus(options);
  }

  formDisabledCallback(disabled: boolean): void {
    this.disabled = disabled;
  }

  formResetCallback(): void {
    this.items = [...this.defaultItems];
    this.value = this.serializeItems(this.items);
    this.syncFormState();
    this.dispatchValueEvents({ action: "reset", items: this.items, value: this.value });
  }

  reportValidity(): boolean {
    if (this.internals && typeof this.internals.reportValidity === "function") {
      return this.internals.reportValidity();
    }

    const valid = this.checkValidity();
    if (!valid) {
      this.focus();
    }
    return valid;
  }

  protected override render() {
    if (this.items.length === 0) {
      return html`
        <div class="empty" part="empty">
          <p class="empty-title">${this.emptyTitle}</p>
          <p class="empty-copy">${this.emptyCopy}</p>
          ${this.validationMessage
            ? html`<p class="helper" part="helper" role="status">${this.validationMessage}</p>`
            : nothing}
          ${this.canAdd
            ? html`
                <div class="footer" part="footer">
                  <cindor-button class="action-button" part="add-button" ?disabled=${this.disabled} @click=${this.handleAddClick}>
                    ${this.addLabel}
                  </cindor-button>
                </div>
              `
            : nothing}
        </div>
      `;
    }

    return html`
      <div class="surface" part="surface">
        <div class="rows" part="rows">
          ${this.items.map((item, index) => this.renderRow(item, index))}
        </div>
        <div class="footer" part="footer">
          <cindor-button class="action-button" part="add-button" ?disabled=${!this.canAdd} @click=${this.handleAddClick}>
            ${this.addLabel}
          </cindor-button>
          ${this.validationMessage
            ? html`<p class="helper" part="helper" role="status">${this.validationMessage}</p>`
            : nothing}
        </div>
      </div>
    `;
  }

  protected override updated(changedProperties: Map<string, unknown>): void {
    if (changedProperties.has("value")) {
      const parsed = this.parseValue(this.value);
      const serializedParsed = this.serializeItems(parsed ?? []);
      if (serializedParsed !== this.serializeItems(this.items)) {
        this.items = parsed ?? [];
        return;
      }
    }

    if (changedProperties.has("items")) {
      const normalized = this.normalizeItems(this.items);
      const serialized = this.serializeItems(normalized);
      if (serialized !== this.value) {
        this.value = serialized;
      }
    }

    this.syncFormState();
  }

  private renderRow(item: T, index: number) {
    const detail = { index, item, list: this };
    const record = this.asRecord(item);
    const label = this.getDisplayValue(record, ["label", "title", "name"]) ?? `Item ${index + 1}`;
    const meta = this.getDisplayValue(record, ["meta", "status", "category"]);
    const description = this.getDisplayValue(record, ["description", "summary", "subtitle"]);

    return html`
      <section class="row" part="row">
        <div class="row-header">
          <div class="row-copy">
            <span class="row-label">${label}</span>
            ${meta ? html`<span class="row-meta">${meta}</span>` : nothing}
            ${description ? html`<p class="row-description">${description}</p>` : nothing}
          </div>
          <div class="row-controls" part="row-controls">
            <cindor-icon-button
              ?disabled=${this.disabled || index === 0}
              label=${this.moveUpLabel}
              name="arrow-up"
              @click=${() => this.moveItem(index, index - 1)}
            ></cindor-icon-button>
            <cindor-icon-button
              ?disabled=${this.disabled || index === this.items.length - 1}
              label=${this.moveDownLabel}
              name="arrow-down"
              @click=${() => this.moveItem(index, index + 1)}
            ></cindor-icon-button>
            <cindor-icon-button
              ?disabled=${this.disabled || !this.canRemove}
              label=${this.removeLabel}
              name="trash-2"
              @click=${() => this.removeItem(index)}
            ></cindor-icon-button>
          </div>
        </div>
        ${this.renderItem ? this.renderItem(detail) : nothing}
      </section>
    `;
  }

  private handleAddClick = (): void => {
    this.addItem();
  };

  private addItem(): void {
    if (!this.canAdd) {
      return;
    }

    const item = this.createItem ? this.createItem({ items: this.items, list: this }) : ({} as T);
    const nextItems = [...this.items, item];
    const value = this.serializeItems(nextItems);
    this.items = nextItems;
    this.value = value;
    this.syncFormState();
    this.dispatchValueEvents({ action: "add", index: nextItems.length - 1, item, items: nextItems, value });
  }

  private removeItem(index: number): void {
    if (!this.canRemove || index < 0 || index >= this.items.length) {
      return;
    }

    const nextItems = this.items.filter((_, itemIndex) => itemIndex !== index);
    const item = this.items[index];
    const value = this.serializeItems(nextItems);
    this.items = nextItems;
    this.value = value;
    this.syncFormState();
    this.dispatchValueEvents({ action: "remove", index, item, items: nextItems, value });
  }

  private moveItem(fromIndex: number, toIndex: number): void {
    if (this.disabled || fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= this.items.length || toIndex >= this.items.length) {
      return;
    }

    const nextItems = [...this.items];
    const [movedItem] = nextItems.splice(fromIndex, 1);
    nextItems.splice(toIndex, 0, movedItem as T);
    const value = this.serializeItems(nextItems);
    this.items = nextItems;
    this.value = value;
    this.syncFormState();
    this.dispatchValueEvents({ action: "reorder", fromIndex, item: movedItem as T, items: nextItems, toIndex, value });
  }

  private dispatchValueEvents(detail: FieldArrayChangeDetail<T>): void {
    this.dispatchEvent(new CustomEvent("input", { bubbles: true, composed: true, detail }));
    this.dispatchEvent(new CustomEvent("change", { bubbles: true, composed: true, detail }));
  }

  private syncFormState(): void {
    this.setFormValue(!this.disabled && this.name ? this.value : null);

    if (!this.internals || typeof this.internals.setValidity !== "function") {
      return;
    }

    if (this.validationMessage === "") {
      this.internals.setValidity({}, "");
      return;
    }

    this.internals.setValidity({ customError: true }, this.validationMessage, this.addButtonElement ?? undefined);
  }

  private normalizeItems(items: T[]): T[] {
    return Array.isArray(items) ? items : [];
  }

  private parseValue(value: string): T[] | null {
    if (value.trim() === "") {
      return null;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(value);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Invalid cindor-field-array value JSON: ${message}`);
    }

    if (!Array.isArray(parsed)) {
      throw new Error("Invalid cindor-field-array value JSON: expected an array.");
    }

    return parsed as T[];
  }

  private serializeItems(items: T[]): string {
    return JSON.stringify(this.normalizeItems(items));
  }

  private asRecord(item: T): FieldArrayRecord {
    return typeof item === "object" && item !== null ? (item as FieldArrayRecord) : {};
  }

  private getDisplayValue(record: FieldArrayRecord, keys: string[]): string | null {
    for (const key of keys) {
      const value = record[key];
      if (value === undefined || value === null || value === "") {
        continue;
      }
      return String(value);
    }
    return null;
  }

  private get canAdd(): boolean {
    return !this.disabled && (this.normalizedMaxItems === undefined || this.items.length < this.normalizedMaxItems);
  }

  private get canRemove(): boolean {
    return !this.disabled && this.items.length > this.minItems;
  }

  private get validationMessage(): string {
    if (this.items.length < this.minItems) {
      return this.minItems === 1 ? "Add at least one item." : `Add at least ${this.minItems} items.`;
    }

    if (this.normalizedMaxItems !== undefined && this.items.length > this.normalizedMaxItems) {
      return `Keep this list to ${this.normalizedMaxItems} items or fewer.`;
    }

    return "";
  }

  private get normalizedMaxItems(): number | undefined {
    return typeof this.maxItems === "number" && Number.isFinite(this.maxItems) && this.maxItems > 0 ? this.maxItems : undefined;
  }

  private get addButtonElement(): HTMLElement | null {
    return this.renderRoot.querySelector('[part="add-button"]');
  }
}
