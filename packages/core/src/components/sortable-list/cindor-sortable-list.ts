import { css, html, LitElement, nothing } from "lit";

export type SortableListRenderDetail<T = unknown> = {
  index: number;
  item: T;
  list: CindorSortableList<T>;
};

export type SortableListItemKey<T = unknown> = (detail: SortableListRenderDetail<T>) => string;
export type SortableListItemRenderer<T = unknown> = (detail: SortableListRenderDetail<T>) => unknown;

export type SortableListReorderReason = "button" | "drag";

export type SortableListReorderDetail<T = unknown> = {
  item: T;
  items: T[];
  newIndex: number;
  oldIndex: number;
  reason: SortableListReorderReason;
};

type SortableListRecord = Record<string, unknown>;

/**
 * Reorderable list surface for ranked items, playlists, and editable collections.
 *
 * Use `items` with the default row rendering or pass `renderItem` for richer layouts.
 *
 * @summary Sortable list surface for drag and button-based reordering.
 * @tag cindor-sortable-list
 * @fires {CustomEvent<SortableListReorderDetail>} reorder - Fired when the item order changes.
 * @fires {CustomEvent<SortableListReorderDetail>} input - Fired when the item order changes.
 * @fires {CustomEvent<SortableListReorderDetail>} change - Fired when the item order changes.
 */
export class CindorSortableList<T = unknown> extends LitElement {
  static styles = css`
    :host {
      display: block;
      color: var(--fg);
    }

    .surface {
      display: grid;
      gap: var(--space-3);
      padding: var(--space-3);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      background: var(--surface);
    }

    .row {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr) auto;
      gap: var(--space-3);
      align-items: center;
      padding: var(--space-3);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      background: color-mix(in srgb, var(--surface) 94%, var(--bg-subtle));
      box-shadow: var(--shadow-xs);
    }

    .row[data-drag-over="true"] {
      border-color: var(--accent);
      box-shadow: 0 0 0 1px color-mix(in srgb, var(--accent) 30%, transparent);
    }

    .row[data-dragging="true"] {
      opacity: 0.65;
    }

    .drag-handle {
      display: grid;
      justify-items: center;
      gap: 2px;
      padding: 0;
      border: 0;
      background: transparent;
      appearance: none;
      cursor: grab;
      color: var(--fg-muted);
      user-select: none;
    }

    .drag-handle::before,
    .drag-handle::after {
      content: "";
      width: 0.25rem;
      height: 0.25rem;
      border-radius: 999px;
      background: currentColor;
      box-shadow:
        0 0.45rem 0 currentColor,
        0 0.9rem 0 currentColor,
        0.45rem 0 0 currentColor,
        0.45rem 0.45rem 0 currentColor,
        0.45rem 0.9rem 0 currentColor;
    }

    .content {
      display: grid;
      gap: var(--space-2);
      min-width: 0;
    }

    .row-header {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2);
      align-items: baseline;
      justify-content: space-between;
    }

    .label {
      font-weight: var(--weight-semibold);
    }

    .meta,
    .description,
    .empty {
      color: var(--fg-muted);
    }

    .description,
    .empty {
      margin: 0;
    }

    .controls {
      display: grid;
      gap: var(--space-1);
    }

    .empty {
      padding: var(--space-3);
    }

    @media (max-width: 640px) {
      .row {
        grid-template-columns: auto minmax(0, 1fr);
      }

      .controls {
        grid-column: 1 / -1;
        grid-template-columns: repeat(2, minmax(0, auto));
        justify-content: end;
      }
    }
  `;

  static properties = {
    disabled: { type: Boolean, reflect: true },
    dragHandleLabel: { reflect: true, attribute: "drag-handle-label" },
    emptyMessage: { reflect: true, attribute: "empty-message" },
    items: { attribute: false },
    moveDownLabel: { reflect: true, attribute: "move-down-label" },
    moveUpLabel: { reflect: true, attribute: "move-up-label" }
  };

  disabled = false;
  dragHandleLabel = "Drag to reorder";
  emptyMessage = "No items to display.";
  items: T[] = [];
  itemKey?: SortableListItemKey<T>;
  moveDownLabel = "Move item down";
  moveUpLabel = "Move item up";
  renderItem?: SortableListItemRenderer<T>;

  private draggedIndex: number | null = null;
  private dragOverIndex: number | null = null;

  protected override render() {
    if (this.items.length === 0) {
      return html`
        <div class="surface" part="surface">
          <p class="empty" part="empty">${this.emptyMessage}</p>
        </div>
      `;
    }

    return html`
      <div class="surface" part="surface" role="list">
        ${this.items.map((item, index) => this.renderRow(item, index))}
      </div>
    `;
  }

  private renderRow(item: T, index: number) {
    const detail = { index, item, list: this };
    const key = this.getItemKey(detail);

    return html`
      <div
        class="row"
        part="item"
        data-key=${key}
        data-drag-over=${String(this.dragOverIndex === index)}
        data-dragging=${String(this.draggedIndex === index)}
        .draggable=${!this.disabled}
        role="listitem"
        @dragstart=${(event: DragEvent) => this.handleDragStart(event, index)}
        @dragover=${(event: DragEvent) => this.handleDragOver(event, index)}
        @drop=${(event: DragEvent) => this.handleDrop(event, index)}
        @dragend=${this.handleDragEnd}
      >
        <button
          class="drag-handle"
          part="drag-handle"
          type="button"
          aria-label=${this.dragHandleLabel}
          title=${this.dragHandleLabel}
          ?disabled=${this.disabled}
          draggable="true"
        ></button>

        <div class="content">
          ${this.renderItem ? this.renderItem(detail) : this.renderDefaultItem(item)}
        </div>

        <div class="controls" part="controls">
          <cindor-icon-button
            ?disabled=${this.disabled || index === 0}
            label=${this.moveUpLabel}
            name="arrow-up"
            @click=${() => this.moveItem(index, index - 1, "button")}
          ></cindor-icon-button>
          <cindor-icon-button
            ?disabled=${this.disabled || index === this.items.length - 1}
            label=${this.moveDownLabel}
            name="arrow-down"
            @click=${() => this.moveItem(index, index + 1, "button")}
          ></cindor-icon-button>
        </div>
      </div>
    `;
  }

  private renderDefaultItem(item: T) {
    const record = this.asRecord(item);
    const label = this.getDisplayValue(record, ["label", "title", "name", "value"]) ?? String(item ?? "");
    const meta = this.getDisplayValue(record, ["meta", "status", "category"]);
    const description = this.getDisplayValue(record, ["description", "supportingText", "subtitle", "summary"]);

    return html`
      <div class="row-header">
        <span class="label">${label}</span>
        ${meta ? html`<span class="meta">${meta}</span>` : nothing}
      </div>
      ${description ? html`<p class="description">${description}</p>` : nothing}
    `;
  }

  private handleDragStart(event: DragEvent, index: number): void {
    if (this.disabled) {
      event.preventDefault();
      return;
    }

    this.draggedIndex = index;
    this.dragOverIndex = index;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", String(index));
    }
    this.requestUpdate();
  }

  private handleDragOver(event: DragEvent, index: number): void {
    if (this.disabled || this.draggedIndex === null) {
      return;
    }

    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = "move";
    }
    if (this.dragOverIndex !== index) {
      this.dragOverIndex = index;
      this.requestUpdate();
    }
  }

  private handleDrop(event: DragEvent, index: number): void {
    if (this.disabled || this.draggedIndex === null) {
      return;
    }

    event.preventDefault();
    const fromIndex = this.draggedIndex;
    this.clearDragState();
    this.moveItem(fromIndex, index, "drag");
  }

  private handleDragEnd = (): void => {
    this.clearDragState();
  };

  private clearDragState(): void {
    this.draggedIndex = null;
    this.dragOverIndex = null;
    this.requestUpdate();
  }

  private moveItem(fromIndex: number, toIndex: number, reason: SortableListReorderReason): void {
    if (fromIndex < 0 || toIndex < 0 || fromIndex >= this.items.length || toIndex >= this.items.length || fromIndex === toIndex) {
      return;
    }

    const nextItems = [...this.items];
    const [movedItem] = nextItems.splice(fromIndex, 1);
    nextItems.splice(toIndex, 0, movedItem as T);
    this.items = nextItems;

    const detail: SortableListReorderDetail<T> = {
      item: movedItem as T,
      items: nextItems,
      newIndex: toIndex,
      oldIndex: fromIndex,
      reason
    };

    this.dispatchEvent(
      new CustomEvent<SortableListReorderDetail<T>>("reorder", {
        bubbles: true,
        composed: true,
        detail
      })
    );
    this.dispatchEvent(
      new CustomEvent<SortableListReorderDetail<T>>("input", {
        bubbles: true,
        composed: true,
        detail
      })
    );
    this.dispatchEvent(
      new CustomEvent<SortableListReorderDetail<T>>("change", {
        bubbles: true,
        composed: true,
        detail
      })
    );
  }

  private getItemKey(detail: SortableListRenderDetail<T>): string {
    if (this.itemKey) {
      return this.itemKey(detail);
    }

    const record = this.asRecord(detail.item);
    return this.getDisplayValue(record, ["id", "key", "value", "label", "title", "name"]) ?? String(detail.index);
  }

  private asRecord(item: T): SortableListRecord {
    return typeof item === "object" && item !== null ? (item as SortableListRecord) : {};
  }

  private getDisplayValue(record: SortableListRecord, keys: string[]): string | null {
    for (const key of keys) {
      const value = record[key];
      if (value === undefined || value === null || value === "") {
        continue;
      }

      return String(value);
    }

    return null;
  }
}
