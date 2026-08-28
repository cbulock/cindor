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

export type KanbanBoardMoveDetail = {
  card: KanbanBoardCard;
  cardId: string;
  columns: KanbanBoardColumn[];
  fromColumnId: string;
  fromIndex: number;
  toColumnId: string;
  toIndex: number;
};

type KanbanBoardDragSource = {
  cardId: string;
  columnId: string;
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
 * @fires {CustomEvent<KanbanBoardMoveDetail>} card-move - Fired when a card is moved with drag and drop.
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
      padding: var(--space-1);
      border-radius: var(--radius-xl);
      transition:
        background var(--duration-base) var(--ease-out),
        box-shadow var(--duration-base) var(--ease-out);
    }

    .column-cards[data-drop-target="true"] {
      background: color-mix(in srgb, var(--accent) 10%, transparent);
      box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--accent) 32%, transparent);
    }

    .card {
      position: relative;
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

    .card[data-selectable="true"] {
      cursor: pointer;
    }

    .card[data-selectable="true"]:hover,
    .card[data-selected="true"] {
      border-color: color-mix(in srgb, var(--accent) 45%, var(--border-strong));
      box-shadow: var(--shadow-md);
      transform: translateY(-1px);
    }

    .card[data-disabled="true"] {
      opacity: 0.72;
    }

    .card[data-draggable="true"] {
      cursor: grab;
    }

    .card[data-dragging="true"] {
      opacity: 0.58;
    }

    .card[data-drop-before="true"]::before,
    .card[data-drop-after="true"]::after {
      content: "";
      position: absolute;
      inset-inline: 0;
      height: 3px;
      border-radius: 999px;
      background: var(--accent);
      box-shadow: 0 0 0 1px color-mix(in srgb, var(--accent) 25%, transparent);
    }

    .card[data-drop-before="true"]::before {
      inset-block-start: calc(var(--space-1) * -1);
    }

    .card[data-drop-after="true"]::after {
      inset-block-end: calc(var(--space-1) * -1);
    }

    .card-surface {
      min-width: 0;
    }

    .card-surface[role="button"] {
      cursor: pointer;
    }

    .card-surface[role="button"]:focus-visible,
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

  private dragSource: KanbanBoardDragSource | null = null;
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
          data-drop-target=${String(this.showColumnDropTarget(column))}
          part="column-cards"
          role="list"
          aria-label=${column.title}
          @dragover=${(event: DragEvent) => this.handleColumnDragOver(event, column)}
          @drop=${(event: DragEvent) => this.handleColumnDrop(event, column)}
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
    const isDragging = this.dragSource?.cardId === card.id;
    const dropBefore = this.dropTarget?.columnId === column.id && this.dropTarget.index === index;
    const dropAfter = this.dropTarget?.columnId === column.id && this.dropTarget.index === index + 1;

    return html`
      <article
        class="card"
        data-card-id=${card.id}
        data-disabled=${String(isDisabled)}
        data-draggable=${String(!isDisabled)}
        data-dragging=${String(isDragging)}
        data-drop-before=${String(dropBefore)}
        data-drop-after=${String(dropAfter)}
        data-selectable=${String(!isDisabled)}
        data-selected=${String(isSelected)}
        part="card"
        role="listitem"
        .draggable=${!isDisabled}
        @dragstart=${(event: DragEvent) => this.handleCardDragStart(event, column, card)}
        @dragover=${(event: DragEvent) => this.handleCardDragOver(event, column, index)}
        @drop=${(event: DragEvent) => this.handleCardDrop(event, column, index)}
        @dragend=${this.handleDragEnd}
      >
        <div
          class="card-surface"
          part="card-surface"
          ?aria-disabled=${isDisabled}
          aria-current=${isSelected ? "true" : nothing}
          role=${isDisabled ? "group" : "button"}
          tabindex=${isDisabled ? "-1" : "0"}
          @click=${() => this.selectCard(column, card)}
          @keydown=${(event: KeyboardEvent) => this.handleCardKeyDown(event, column, card)}
        >
          <div class="card-copy">
            <div class="card-header">
              ${card.eyebrow ? html`<span class="card-eyebrow" part="card-eyebrow">${card.eyebrow}</span>` : html`<span></span>`}
              ${card.meta ? html`<span class="card-meta" part="card-meta">${card.meta}</span>` : nothing}
            </div>
            <h4 class="card-title" part="card-title">${card.title}</h4>
            ${card.description ? html`<p class="card-description" part="card-description">${card.description}</p>` : nothing}
          </div>
          ${card.tags?.length
            ? html`
                <div class="card-tags" part="card-tags">
                  ${card.tags.map((tag) => html`<span class="tag" part="tag">${tag}</span>`)}
                </div>
              `
            : nothing}
        </div>

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
    return Array.from(this.renderRoot.querySelectorAll<HTMLElement>('[part="card-surface"][role="button"]'));
  }

  private handleCardDragStart(event: DragEvent, column: KanbanBoardColumn, card: KanbanBoardCard): void {
    if (card.disabled) {
      event.preventDefault();
      return;
    }

    this.dragSource = { cardId: card.id, columnId: column.id };
    const sourceIndex = column.cards.findIndex((item) => item.id === card.id);
    this.dropTarget = sourceIndex === -1 ? null : { columnId: column.id, index: sourceIndex };

    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", card.id);
    }

    this.requestUpdate();
  }

  private handleCardDragOver(event: DragEvent, column: KanbanBoardColumn, index: number): void {
    if (!this.dragSource) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = "move";
    }

    const card = event.currentTarget;
    if (!(card instanceof HTMLElement)) {
      return;
    }

    const rect = card.getBoundingClientRect();
    const midpoint = rect.top + rect.height / 2;
    const targetIndex = event.clientY > midpoint ? index + 1 : index;
    this.setDropTarget(column.id, targetIndex);
  }

  private handleCardDrop(event: DragEvent, column: KanbanBoardColumn, index: number): void {
    if (!this.dragSource) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    const card = event.currentTarget;
    if (card instanceof HTMLElement) {
      const rect = card.getBoundingClientRect();
      const midpoint = rect.top + rect.height / 2;
      const targetIndex = event.clientY > midpoint ? index + 1 : index;
      this.moveDraggedCard(column.id, targetIndex);
      return;
    }

    this.moveDraggedCard(column.id, index);
  }

  private handleColumnDragOver(event: DragEvent, column: KanbanBoardColumn): void {
    if (!this.dragSource) {
      return;
    }

    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = "move";
    }

    const target = event.target;
    if (target instanceof HTMLElement && target.closest("[data-card-id]")) {
      return;
    }

    this.setDropTarget(column.id, column.cards.length);
  }

  private handleColumnDrop(event: DragEvent, column: KanbanBoardColumn): void {
    if (!this.dragSource) {
      return;
    }

    event.preventDefault();
    this.moveDraggedCard(column.id, column.cards.length);
  }

  private handleDragEnd = (): void => {
    this.clearDragState();
  };

  private setDropTarget(columnId: string, index: number): void {
    if (this.dropTarget?.columnId === columnId && this.dropTarget.index === index) {
      return;
    }

    this.dropTarget = { columnId, index };
    this.requestUpdate();
  }

  private moveDraggedCard(toColumnId: string, toIndex: number): void {
    const dragSource = this.dragSource;
    this.clearDragState();

    if (!dragSource) {
      return;
    }

    const fromColumnIndex = this.columns.findIndex((column) => column.id === dragSource.columnId);
    const toColumnIndex = this.columns.findIndex((column) => column.id === toColumnId);
    if (fromColumnIndex === -1 || toColumnIndex === -1) {
      return;
    }

    const fromColumn = this.columns[fromColumnIndex];
    const sourceIndex = fromColumn.cards.findIndex((card) => card.id === dragSource.cardId);
    if (sourceIndex === -1) {
      return;
    }

    const movingCard = fromColumn.cards[sourceIndex];
    if (!movingCard || movingCard.disabled) {
      return;
    }

    const nextColumns = this.columns.map((column) => ({
      ...column,
      cards: [...column.cards]
    }));
    const [removedCard] = nextColumns[fromColumnIndex]?.cards.splice(sourceIndex, 1) ?? [];
    if (!removedCard) {
      return;
    }

    const destinationCards = nextColumns[toColumnIndex]?.cards;
    if (!destinationCards) {
      return;
    }

    const normalizedIndex =
      fromColumnIndex === toColumnIndex && sourceIndex < toIndex ? Math.max(0, toIndex - 1) : toIndex;
    const boundedIndex = Math.max(0, Math.min(normalizedIndex, destinationCards.length));

    if (fromColumnIndex === toColumnIndex && sourceIndex === boundedIndex) {
      return;
    }

    destinationCards.splice(boundedIndex, 0, removedCard);
    this.columns = nextColumns;

    this.dispatchEvent(
      new CustomEvent<KanbanBoardMoveDetail>("card-move", {
        bubbles: true,
        composed: true,
        detail: {
          card: removedCard,
          cardId: removedCard.id,
          columns: nextColumns,
          fromColumnId: dragSource.columnId,
          fromIndex: sourceIndex,
          toColumnId,
          toIndex: boundedIndex
        }
      })
    );
  }

  private clearDragState(): void {
    this.dragSource = null;
    this.dropTarget = null;
    this.requestUpdate();
  }

  private showColumnDropTarget(column: KanbanBoardColumn): boolean {
    if (!this.dropTarget || this.dropTarget.columnId !== column.id) {
      return false;
    }

    return column.cards.length === 0 || this.dropTarget.index === column.cards.length;
  }
}
