import { css, html, LitElement, nothing } from "lit";

export type KanbanBoardAccent = "accent" | "danger" | "neutral" | "success" | "warning";
export type KanbanBoardActionVariant = "ghost" | "solid";

export type KanbanBoardCardAction = {
  disabled?: boolean;
  key: string;
  label: string;
  variant?: KanbanBoardActionVariant;
};

export type KanbanBoardCard = {
  actions?: KanbanBoardCardAction[];
  description?: string;
  disabled?: boolean;
  eyebrow?: string;
  id: string;
  meta?: string;
  tags?: string[];
  title: string;
};

export type KanbanBoardColumn = {
  accent?: KanbanBoardAccent;
  cards: KanbanBoardCard[];
  description?: string;
  id: string;
  limit?: number;
  meta?: string;
  title: string;
};

export type KanbanBoardSelectDetail = {
  card: KanbanBoardCard;
  cardId: string;
  column: KanbanBoardColumn;
  columnId: string;
  columns: KanbanBoardColumn[];
};

export type KanbanBoardActionDetail = KanbanBoardSelectDetail & {
  action: KanbanBoardCardAction;
  actionKey: string;
};

export type KanbanBoardReorderDetail = {
  card: KanbanBoardCard;
  cardId: string;
  column: KanbanBoardColumn;
  columnId: string;
  columns: KanbanBoardColumn[];
  newIndex: number;
  oldIndex: number;
};

export type KanbanBoardMoveDetail = {
  card: KanbanBoardCard;
  cardId: string;
  columns: KanbanBoardColumn[];
  fromColumn: KanbanBoardColumn;
  fromColumnId: string;
  newIndex: number;
  oldIndex: number;
  toColumn: KanbanBoardColumn;
  toColumnId: string;
};

type KanbanBoardDragState = {
  card: KanbanBoardCard;
  cardId: string;
  columnId: string;
  index: number;
};

type KanbanBoardDropTarget = {
  columnId: string;
  index: number;
};

/**
 * Board-style planning surface for grouped workflow cards.
 *
 * Pass `columns` to render board lanes and use `selectedCardId` to reflect the current active card.
 *
 * @summary Board-style planning and status surface for workflow apps.
 * @tag cindor-kanban-board
 * @fires {CustomEvent<KanbanBoardSelectDetail>} select - Fired when a card is selected.
 * @fires {CustomEvent<KanbanBoardActionDetail>} card-action - Fired when a card action button is pressed.
 * @fires {CustomEvent<KanbanBoardReorderDetail>} reorder - Fired when a card is reordered within a column.
 * @fires {CustomEvent<KanbanBoardMoveDetail>} move - Fired when a card moves to a different column.
 */
export class CindorKanbanBoard extends LitElement {
  static styles = css`
    :host {
      display: block;
      color: var(--fg);
    }

    .board {
      display: grid;
      grid-auto-columns: minmax(18rem, 1fr);
      grid-auto-flow: column;
      gap: var(--space-4);
      overflow-x: auto;
      padding-block-end: var(--space-2);
      scrollbar-width: thin;
    }

    .empty-board,
    .empty-column {
      display: grid;
      place-items: center;
      min-block-size: 9rem;
      padding: var(--space-4);
      border: 1px dashed var(--border);
      border-radius: var(--radius-xl);
      background: color-mix(in srgb, var(--bg-subtle) 72%, var(--surface));
      color: var(--fg-muted);
      text-align: center;
      font-size: var(--text-sm);
      line-height: var(--text-helper-leading);
    }

    .column {
      --kanban-accent: var(--border-strong);
      display: grid;
      align-content: start;
      gap: var(--space-3);
      min-block-size: 100%;
      padding: var(--space-4);
      border: 1px solid var(--border);
      border-top: 3px solid var(--kanban-accent);
      border-radius: var(--radius-2xl);
      background: color-mix(in srgb, var(--surface) 92%, var(--bg-subtle));
      box-shadow: var(--shadow-sm);
    }

    .column[data-accent="accent"] {
      --kanban-accent: var(--accent);
    }

    .column[data-accent="success"] {
      --kanban-accent: var(--success, #0f766e);
    }

    .column[data-accent="warning"] {
      --kanban-accent: var(--warning, #b45309);
    }

    .column[data-accent="danger"] {
      --kanban-accent: var(--danger, #b91c1c);
    }

    .column-header,
    .column-copy,
    .column-heading,
    .card-surface,
    .card-copy {
      display: grid;
      gap: var(--space-2);
    }

    .column-heading {
      grid-template-columns: minmax(0, 1fr) auto;
      gap: var(--space-3);
      align-items: start;
    }

    .column-title,
    .card-title {
      margin: 0;
      color: var(--fg);
      font-weight: var(--weight-semibold);
      line-height: 1.2;
    }

    .column-title {
      font-size: var(--text-lg);
    }

    .card-title {
      font-size: var(--text-base);
    }

    .column-count,
    .card-eyebrow,
    .card-meta,
    .tag {
      font-size: var(--text-xs);
      line-height: 1.2;
    }

    .column-count {
      display: inline-flex;
      align-items: center;
      min-block-size: 1.625rem;
      padding-inline: var(--space-2);
      border-radius: var(--radius-full);
      background: color-mix(in srgb, var(--kanban-accent) 12%, var(--surface));
      color: var(--kanban-accent);
      font-weight: var(--weight-semibold);
      white-space: nowrap;
    }

    .column-description,
    .column-meta,
    .card-description {
      margin: 0;
      color: var(--fg-muted);
      font-size: var(--text-sm);
      line-height: var(--text-helper-leading);
    }

    .column-meta,
    .card-meta,
    .card-eyebrow {
      color: var(--fg-subtle);
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }

    .column-cards {
      display: grid;
      gap: var(--space-3);
      align-content: start;
      min-block-size: 6rem;
    }

    .column-cards[data-drop-target="true"] {
      border-radius: var(--radius-xl);
      box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--accent) 28%, transparent);
    }

    .card {
      display: grid;
      gap: var(--space-3);
      padding: var(--space-3);
      border: 1px solid var(--border);
      border-radius: var(--radius-xl);
      background: var(--surface);
      box-shadow: var(--shadow-sm);
      transition:
        border-color var(--duration-base) var(--ease-out),
        box-shadow var(--duration-base) var(--ease-out),
        transform var(--duration-base) var(--ease-out);
    }

    .card[data-draggable="true"] {
      cursor: grab;
    }

    .card[data-selectable="true"] {
      cursor: pointer;
    }

    .card[data-selectable="true"]:hover,
    .card[data-selected="true"] {
      border-color: color-mix(in srgb, var(--accent) 45%, var(--border-strong));
      box-shadow: var(--shadow-md);
      transform: translateY(-1px);
    }

    .card[data-drop-target="true"] {
      border-color: color-mix(in srgb, var(--accent) 50%, var(--border-strong));
      box-shadow: 0 0 0 1px color-mix(in srgb, var(--accent) 30%, transparent);
    }

    .card[data-dragging="true"] {
      opacity: 0.65;
    }

    .card[data-disabled="true"] {
      opacity: 0.72;
    }

    .card-layout {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr);
      gap: var(--space-3);
      align-items: start;
    }

    .card-content,
    .card-surface {
      min-width: 0;
    }

    .card-surface {
      display: grid;
      gap: var(--space-2);
      width: 100%;
      padding: 0;
      border: 0;
      background: transparent;
      color: inherit;
      font: inherit;
      text-align: start;
    }

    .card-surface:not(:disabled) {
      cursor: pointer;
    }

    .card-surface:focus-visible,
    .action-button:focus-visible {
      outline: none;
      box-shadow: var(--ring-focus);
      border-radius: var(--radius-lg);
    }

    .card-header {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      gap: var(--space-2);
      align-items: center;
    }

    .card-tags,
    .card-actions {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2);
      align-items: center;
    }

    .drag-handle {
      display: grid;
      align-self: start;
      justify-items: center;
      gap: 2px;
      margin-block-start: 0.125rem;
      color: var(--fg-muted);
      cursor: grab;
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

    .tag {
      display: inline-flex;
      align-items: center;
      min-block-size: 1.5rem;
      padding-inline: var(--space-2);
      border-radius: var(--radius-full);
      background: color-mix(in srgb, var(--bg-subtle) 74%, var(--surface));
      color: var(--fg-muted);
      font-weight: var(--weight-medium);
      white-space: nowrap;
    }

    .action-button {
      min-block-size: 2rem;
      padding: 0 var(--space-3);
      border: 1px solid var(--border);
      border-radius: var(--radius-full);
      background: transparent;
      color: var(--fg);
      font: inherit;
      font-size: var(--text-sm);
      cursor: pointer;
      transition:
        border-color var(--duration-base) var(--ease-out),
        background var(--duration-base) var(--ease-out),
        color var(--duration-base) var(--ease-out);
    }

    .action-button:hover:not(:disabled) {
      border-color: var(--border-strong);
      background: color-mix(in srgb, var(--bg-subtle) 75%, var(--surface));
    }

    .action-button[data-variant="solid"] {
      border-color: var(--accent);
      background: var(--accent);
      color: var(--accent-contrast, white);
    }

    .action-button[data-variant="solid"]:hover:not(:disabled) {
      background: color-mix(in srgb, var(--accent) 90%, black);
    }

    .action-button:disabled {
      cursor: not-allowed;
      opacity: 0.55;
    }

    @media (max-width: 720px) {
      .board {
        grid-auto-columns: minmax(16rem, 90vw);
      }
    }
  `;

  static properties = {
    columns: { attribute: false },
    emptyMessage: { attribute: "empty-message", reflect: true },
    selectedCardId: { attribute: "selected-card-id", reflect: true }
  };

  /** Ordered columns rendered by the board. */
  columns: KanbanBoardColumn[] = [];

  /** Message rendered when a column has no cards. */
  emptyMessage = "No cards in this column.";

  /** Current selected card identifier. */
  selectedCardId = "";

  private draggedCard: KanbanBoardDragState | null = null;

  private dropTarget: KanbanBoardDropTarget | null = null;

  protected override render() {
    if (this.columns.length === 0) {
      return html`<div class="empty-board" part="empty-board">Add columns to render a kanban board.</div>`;
    }

    return html`
      <div class="board" part="board">
        ${this.columns.map((column) => this.renderColumn(column))}
      </div>
    `;
  }

  private renderColumn(column: KanbanBoardColumn) {
    const cardCountLabel = typeof column.limit === "number" ? `${column.cards.length}/${column.limit}` : `${column.cards.length}`;
    const isColumnDropTarget = this.dropTarget?.columnId === column.id && this.dropTarget.index === column.cards.length;

    return html`
      <section class="column" data-accent=${column.accent ?? "neutral"} data-column-id=${column.id} part="column">
        <header class="column-header" part="column-header">
          <div class="column-copy">
            <div class="column-heading">
              <h3 class="column-title" part="column-title">${column.title}</h3>
              <span class="column-count" part="column-count">${cardCountLabel}</span>
            </div>
            ${column.description ? html`<p class="column-description" part="column-description">${column.description}</p>` : nothing}
            ${column.meta ? html`<div class="column-meta" part="column-meta">${column.meta}</div>` : nothing}
          </div>
        </header>

        <div
          class="column-cards"
          data-drop-target=${String(isColumnDropTarget)}
          part="column-cards"
          role="list"
          aria-label=${column.title}
          @dragover=${(event: DragEvent) => this.handleDropTargetDragOver(event, column.id, column.cards.length)}
          @drop=${(event: DragEvent) => this.handleDrop(event, column.id, column.cards.length)}
        >
          ${column.cards.length > 0
            ? column.cards.map((card, index) => this.renderCard(column, card, index))
            : html`<div class="empty-column" part="empty-column">${this.emptyMessage}</div>`}
        </div>
      </section>
    `;
  }

  private renderCard(column: KanbanBoardColumn, card: KanbanBoardCard, index: number) {
    const isDisabled = Boolean(card.disabled);
    const isSelected = this.selectedCardId === card.id;
    const isDragging = this.draggedCard?.cardId === card.id;
    const isDropTarget = this.dropTarget?.columnId === column.id && this.dropTarget.index === index;
    const isDraggable = !isDisabled;

    return html`
      <article
        class="card"
        data-card-id=${card.id}
        data-disabled=${String(isDisabled)}
        data-draggable=${String(isDraggable)}
        data-dragging=${String(isDragging)}
        data-drop-target=${String(isDropTarget)}
        data-selectable=${String(!isDisabled)}
        data-selected=${String(isSelected)}
        part="card"
        .draggable=${isDraggable}
        role="listitem"
        @dragstart=${(event: DragEvent) => this.handleCardDragStart(event, column, card, index)}
        @dragover=${(event: DragEvent) => this.handleDropTargetDragOver(event, column.id, index)}
        @drop=${(event: DragEvent) => this.handleDrop(event, column.id, index)}
        @dragend=${this.handleCardDragEnd}
      >
        <div class="card-layout">
          ${isDraggable ? html`<div class="drag-handle" part="drag-handle" aria-hidden="true"></div>` : nothing}

          <div class="card-content" part="card-content">
            <button
              class="card-surface"
              part="card-surface"
              type="button"
              ?disabled=${isDisabled}
              @click=${() => this.selectCard(column, card)}
              @keydown=${(event: KeyboardEvent) => this.handleCardKeyDown(event, column, card)}
            >
              <span class="card-copy">
                <span class="card-header">
                  ${card.eyebrow ? html`<span class="card-eyebrow" part="card-eyebrow">${card.eyebrow}</span>` : html`<span></span>`}
                  ${card.meta ? html`<span class="card-meta" part="card-meta">${card.meta}</span>` : nothing}
                </span>
                <span class="card-title" part="card-title">${card.title}</span>
                ${card.description ? html`<span class="card-description" part="card-description">${card.description}</span>` : nothing}
              </span>
              ${card.tags?.length
                ? html`
                    <span class="card-tags" part="card-tags">
                      ${card.tags.map((tag) => html`<span class="tag" part="tag">${tag}</span>`)}
                    </span>
                  `
                : nothing}
            </button>

            ${card.actions?.length
              ? html`
                  <div class="card-actions" part="card-actions">
                    ${card.actions.map(
                      (action) => html`
                        <button
                          class="action-button"
                          data-variant=${action.variant ?? "ghost"}
                          part="action-button"
                          type="button"
                          draggable="false"
                          ?disabled=${Boolean(action.disabled)}
                          @click=${(event: Event) => this.handleCardAction(event, column, card, action)}
                        >
                          ${action.label}
                        </button>
                      `
                    )}
                  </div>
                `
              : nothing}
          </div>
        </div>
      </article>
    `;
  }

  private handleCardKeyDown(event: KeyboardEvent, column: KanbanBoardColumn, card: KanbanBoardCard): void {
    if (card.disabled) {
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      this.selectCard(column, card);
      return;
    }

    const focusSurfaces = this.focusableCardSurfaces;
    const currentSurface = event.currentTarget;
    const currentIndex = currentSurface instanceof HTMLElement ? focusSurfaces.indexOf(currentSurface) : -1;

    if (currentIndex === -1) {
      return;
    }

    const previousKey = event.key === "ArrowLeft" || event.key === "ArrowUp";
    const nextKey = event.key === "ArrowRight" || event.key === "ArrowDown";

    if (previousKey) {
      event.preventDefault();
      focusSurfaces[Math.max(0, currentIndex - 1)]?.focus();
      return;
    }

    if (nextKey) {
      event.preventDefault();
      focusSurfaces[Math.min(focusSurfaces.length - 1, currentIndex + 1)]?.focus();
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      focusSurfaces[0]?.focus();
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      focusSurfaces.at(-1)?.focus();
    }
  }

  private handleCardAction(event: Event, column: KanbanBoardColumn, card: KanbanBoardCard, action: KanbanBoardCardAction): void {
    event.stopPropagation();

    if (action.disabled) {
      return;
    }

    this.dispatchEvent(
      new CustomEvent<KanbanBoardActionDetail>("card-action", {
        bubbles: true,
        composed: true,
        detail: {
          action,
          actionKey: action.key,
          card,
          cardId: card.id,
          column,
          columnId: column.id,
          columns: this.columns
        }
      })
    );
  }

  private handleCardDragStart(event: DragEvent, column: KanbanBoardColumn, card: KanbanBoardCard, index: number): void {
    if (card.disabled) {
      event.preventDefault();
      return;
    }

    this.draggedCard = {
      card,
      cardId: card.id,
      columnId: column.id,
      index
    };
    this.dropTarget = {
      columnId: column.id,
      index
    };

    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", card.id);
    }

    this.requestUpdate();
  }

  private handleDropTargetDragOver(event: DragEvent, columnId: string, index: number): void {
    if (!this.draggedCard) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = "move";
    }

    if (this.dropTarget?.columnId === columnId && this.dropTarget.index === index) {
      return;
    }

    this.dropTarget = { columnId, index };
    this.requestUpdate();
  }

  private handleDrop(event: DragEvent, columnId: string, index: number): void {
    if (!this.draggedCard) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const draggedCard = this.draggedCard;
    this.clearDragState();
    this.moveCard(draggedCard, { columnId, index });
  }

  private handleCardDragEnd = (): void => {
    this.clearDragState();
  };

  private clearDragState(): void {
    this.draggedCard = null;
    this.dropTarget = null;
    this.requestUpdate();
  }

  private moveCard(draggedCard: KanbanBoardDragState, dropTarget: KanbanBoardDropTarget): void {
    const nextColumns = this.columns.map((column) => ({
      ...column,
      cards: [...column.cards]
    }));
    const fromColumn = nextColumns.find((column) => column.id === draggedCard.columnId);
    const toColumn = nextColumns.find((column) => column.id === dropTarget.columnId);

    if (!fromColumn || !toColumn) {
      return;
    }

    const oldIndex = fromColumn.cards.findIndex((card) => card.id === draggedCard.cardId);
    if (oldIndex === -1) {
      return;
    }

    const [card] = fromColumn.cards.splice(oldIndex, 1);
    if (!card) {
      return;
    }

    const newIndex = Math.max(0, Math.min(dropTarget.index, toColumn.cards.length));
    toColumn.cards.splice(newIndex, 0, card);

    this.columns = nextColumns;

    if (draggedCard.columnId === dropTarget.columnId) {
      if (oldIndex === newIndex) {
        return;
      }

      this.dispatchEvent(
        new CustomEvent<KanbanBoardReorderDetail>("reorder", {
          bubbles: true,
          composed: true,
          detail: {
            card,
            cardId: card.id,
            column: toColumn,
            columnId: toColumn.id,
            columns: nextColumns,
            newIndex,
            oldIndex
          }
        })
      );
      return;
    }

    this.dispatchEvent(
      new CustomEvent<KanbanBoardMoveDetail>("move", {
        bubbles: true,
        composed: true,
        detail: {
          card,
          cardId: card.id,
          columns: nextColumns,
          fromColumn,
          fromColumnId: fromColumn.id,
          newIndex,
          oldIndex,
          toColumn,
          toColumnId: toColumn.id
        }
      })
    );
  }

  private selectCard(column: KanbanBoardColumn, card: KanbanBoardCard): void {
    if (card.disabled) {
      return;
    }

    this.selectedCardId = card.id;
    this.dispatchEvent(
      new CustomEvent<KanbanBoardSelectDetail>("select", {
        bubbles: true,
        composed: true,
        detail: {
          card,
          cardId: card.id,
          column,
          columnId: column.id,
          columns: this.columns
        }
      })
    );
  }

  private get focusableCardSurfaces(): HTMLElement[] {
    return Array.from(this.renderRoot.querySelectorAll<HTMLElement>('[part="card-surface"]:not(:disabled)'));
  }
}
