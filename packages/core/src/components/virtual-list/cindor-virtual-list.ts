import { css, html, LitElement, nothing } from "lit";

export type VirtualListRangeChangeDetail = {
  renderedEndIndex: number;
  renderedStartIndex: number;
  totalItems: number;
  visibleEndIndex: number;
  visibleStartIndex: number;
};

export type VirtualListRenderDetail<T = unknown> = {
  index: number;
  item: T;
  list: CindorVirtualList<T>;
};

export type VirtualListItemRenderer<T = unknown> = (detail: VirtualListRenderDetail<T>) => unknown;
export type VirtualListItemKey<T = unknown> = (detail: VirtualListRenderDetail<T>) => string;

type VirtualListRecord = Record<string, unknown>;

/**
 * Virtualized list surface for very large collections.
 *
 * Use `items` with either the default object rendering or a custom `renderItem`
 * callback when a richer row layout is needed.
 *
 * @summary Virtualized list surface for large collections.
 * @tag cindor-virtual-list
 * @fires {CustomEvent<VirtualListRangeChangeDetail>} range-change - Fired when the visible or rendered item range changes.
 */
export class CindorVirtualList<T = unknown> extends LitElement {
  static styles = css`
    :host {
      display: block;
      color: var(--fg);
      --cindor-virtual-list-row-padding-block: var(--space-3);
      --cindor-virtual-list-row-padding-inline: var(--space-4);
      --cindor-virtual-list-row-gap: var(--space-2);
    }

    .surface {
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      background: var(--surface);
      overflow: hidden;
    }

    .viewport {
      position: relative;
      overflow: auto;
      overscroll-behavior: contain;
      block-size: 100%;
    }

    .canvas {
      position: relative;
      min-block-size: 100%;
    }

    .row {
      position: absolute;
      inset-inline: 0;
      display: grid;
      gap: var(--cindor-virtual-list-row-gap);
      align-content: center;
      padding: var(--cindor-virtual-list-row-padding-block) var(--cindor-virtual-list-row-padding-inline);
      box-sizing: border-box;
      border-block-end: 1px solid var(--border);
      background: var(--surface);
    }

    .row:last-child {
      border-block-end: 0;
    }

    .row-header {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      gap: var(--space-2);
      align-items: baseline;
    }

    .row-label {
      font-weight: var(--weight-semibold);
    }

    .row-meta,
    .row-description,
    .empty {
      color: var(--fg-muted);
    }

    .row-description {
      margin: 0;
    }

    .empty {
      padding: var(--space-5);
    }
  `;

  static properties = {
    emptyMessage: { reflect: true, attribute: "empty-message" },
    height: { reflect: true },
    itemHeight: { type: Number, reflect: true, attribute: "item-height" },
    items: { attribute: false },
    overscan: { type: Number, reflect: true }
  };

  emptyMessage = "No items to display.";
  height = "24rem";
  itemHeight = 72;
  items: T[] = [];
  itemKey?: VirtualListItemKey<T>;
  overscan = 4;
  renderItem?: VirtualListItemRenderer<T>;

  private lastRangeKey = "";
  private resizeObserver?: ResizeObserver;
  private viewportScrollTop = 0;
  private viewportHeight = 0;

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute("role", "list");
  }

  override disconnectedCallback(): void {
    this.resizeObserver?.disconnect();
    this.resizeObserver = undefined;
    super.disconnectedCallback();
  }

  protected override firstUpdated(): void {
    this.measureViewport();
    this.setupResizeObserver();
    this.emitRangeChange();
  }

  protected override updated(): void {
    this.measureViewport();
    this.emitRangeChange();
  }

  protected override render() {
    if (this.items.length === 0) {
      return html`
        <div class="surface" part="surface">
          <div class="empty" part="empty">${this.emptyMessage}</div>
        </div>
      `;
    }

    const range = this.currentRange;

    return html`
      <div class="surface" part="surface" style=${`height:${this.height};`}>
        <div class="viewport" part="viewport" @scroll=${this.handleScroll}>
          <div class="canvas" part="canvas" style=${`height:${this.totalHeight}px;`}>
            ${range.indexes.map((index) => this.renderRow(index))}
          </div>
        </div>
      </div>
    `;
  }

  private renderRow(index: number) {
    const item = this.items[index];
    const detail = { index, item, list: this };
    const top = index * this.itemHeight;

    return html`
      <div
        class="row"
        part="item"
        data-index=${String(index)}
        data-key=${this.getItemKey(detail)}
        role="listitem"
        style=${`top:${top}px;height:${this.itemHeight}px;`}
      >
        ${this.renderItem ? this.renderItem(detail) : this.renderDefaultItem(item)}
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
        <span class="row-label">${label}</span>
        ${meta ? html`<span class="row-meta">${meta}</span>` : nothing}
      </div>
      ${description ? html`<p class="row-description">${description}</p>` : nothing}
    `;
  }

  private get totalHeight(): number {
    return this.items.length * this.itemHeight;
  }

  private get currentRange(): {
    indexes: number[];
    renderedEndIndex: number;
    renderedStartIndex: number;
    visibleEndIndex: number;
    visibleStartIndex: number;
  } {
    if (this.items.length === 0) {
      return {
        indexes: [],
        renderedEndIndex: -1,
        renderedStartIndex: 0,
        visibleEndIndex: -1,
        visibleStartIndex: 0
      };
    }

    const height = this.viewportHeight > 0 ? this.viewportHeight : this.itemHeight * 4;
    const visibleStartIndex = Math.max(0, Math.floor(this.viewportScrollTop / this.itemHeight));
    const visibleCount = Math.max(1, Math.ceil(height / this.itemHeight));
    const visibleEndIndex = Math.min(this.items.length - 1, visibleStartIndex + visibleCount - 1);
    const renderedStartIndex = Math.max(0, visibleStartIndex - this.overscan);
    const renderedEndIndex = Math.min(this.items.length - 1, visibleEndIndex + this.overscan);
    const indexes = Array.from(
      { length: renderedEndIndex - renderedStartIndex + 1 },
      (_, offset) => renderedStartIndex + offset
    );

    return { indexes, renderedEndIndex, renderedStartIndex, visibleEndIndex, visibleStartIndex };
  }

  private handleScroll = (event: Event): void => {
    const target = event.currentTarget as HTMLElement;
    this.viewportScrollTop = target.scrollTop;
    this.requestUpdate();
  };

  private emitRangeChange(): void {
    const range = this.currentRange;
    const nextKey = [
      range.renderedStartIndex,
      range.renderedEndIndex,
      range.visibleStartIndex,
      range.visibleEndIndex,
      this.items.length
    ].join(":");

    if (nextKey === this.lastRangeKey) {
      return;
    }

    this.lastRangeKey = nextKey;
    this.dispatchEvent(
      new CustomEvent<VirtualListRangeChangeDetail>("range-change", {
        bubbles: true,
        composed: true,
        detail: {
          renderedEndIndex: range.renderedEndIndex,
          renderedStartIndex: range.renderedStartIndex,
          totalItems: this.items.length,
          visibleEndIndex: range.visibleEndIndex,
          visibleStartIndex: range.visibleStartIndex
        }
      })
    );
  }

  private setupResizeObserver(): void {
    const viewport = this.viewportElement;
    if (!viewport || this.resizeObserver || typeof ResizeObserver !== "function") {
      return;
    }

    this.resizeObserver = new ResizeObserver(() => {
      this.measureViewport();
      this.requestUpdate();
    });

    this.resizeObserver.observe(viewport);
  }

  private measureViewport(): void {
    this.viewportHeight = this.viewportElement?.clientHeight ?? 0;
  }

  private get viewportElement(): HTMLElement | null {
    return this.renderRoot.querySelector<HTMLElement>(".viewport");
  }

  private getItemKey(detail: VirtualListRenderDetail<T>): string {
    if (this.itemKey) {
      return this.itemKey(detail);
    }

    const record = this.asRecord(detail.item);
    const fallback =
      this.getDisplayValue(record, ["id", "key", "value", "label", "title", "name"]) ?? String(detail.index);

    return fallback;
  }

  private asRecord(item: T): VirtualListRecord {
    return typeof item === "object" && item !== null ? (item as VirtualListRecord) : {};
  }

  private getDisplayValue(record: VirtualListRecord, keys: string[]): string | null {
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
