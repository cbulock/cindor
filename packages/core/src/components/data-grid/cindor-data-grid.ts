import { css, html, LitElement, nothing } from "lit";

export type DataGridRow = Record<string, unknown>;
export type DataGridCellAlign = "center" | "end" | "start";
export type DataGridSortDirection = "ascending" | "descending";

export type DataGridEditorOption = {
  label: string;
  value: string;
};

export type DataGridCellRenderDetail = {
  column: DataGridColumn;
  columnIndex: number;
  row: DataGridRow;
  rowId: string;
  rowIndex: number;
  value: unknown;
  grid: CindorDataGrid;
};

export type DataGridCellEditDetail = {
  column: DataGridColumn;
  columnIndex: number;
  columnKey: string;
  row: DataGridRow;
  rowId: string;
  rowIndex: number;
  value: unknown;
};

export type DataGridActiveCellDetail = {
  column: DataGridColumn;
  columnIndex: number;
  row: DataGridRow;
  rowId: string;
  rowIndex: number;
};

export type DataGridSortChangeDetail = {
  sortDirection: DataGridSortDirection;
  sortKey: string;
};

export type DataGridCellEditor =
  | {
      autocomplete?: string;
      placeholder?: string;
      type: "input";
    }
  | {
      options: DataGridEditorOption[] | ((detail: DataGridCellRenderDetail) => DataGridEditorOption[]);
      type: "select";
    }
  | {
      type: "switch";
    };

export type DataGridColumn = {
  align?: DataGridCellAlign;
  cellRenderer?: (detail: DataGridCellRenderDetail) => unknown;
  editor?: DataGridCellEditor;
  headerLabel?: string;
  key: string;
  label: string;
  sortable?: boolean;
  sticky?: "start";
  width?: string;
};

type DataGridRenderedColumn = {
  column: DataGridColumn;
  stickyOffset: string | null;
};

type SelectHost = HTMLElement & { value: string };
type SwitchHost = HTMLElement & { checked: boolean };
type TextInputHost = HTMLElement & { value: string };

/**
 * Keyboard-navigable editable grid for dense operational data.
 *
 * @summary Editable grid foundation with sticky columns and active-cell navigation.
 * @tag cindor-data-grid
 * @fires {CustomEvent<DataGridActiveCellDetail>} active-cell-change - Fired when the active cell changes.
 * @fires {CustomEvent<DataGridCellEditDetail>} cell-edit - Fired when an inline editor updates a cell value.
 * @fires {CustomEvent<DataGridSortChangeDetail>} sort-change - Fired when the active sort column or direction changes.
 */
export class CindorDataGrid extends LitElement {
  static styles = css`
    :host {
      display: block;
      width: 100%;
      color: var(--fg);
    }

    .surface {
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      background: var(--surface);
      overflow: hidden;
    }

    .region {
      overflow: auto;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th,
    td {
      border-top: 1px solid var(--border);
      padding: var(--space-3) var(--space-4);
      text-align: left;
      vertical-align: top;
      min-width: 0;
    }

    thead th {
      border-top: 0;
      background: color-mix(in srgb, var(--bg-subtle) 65%, var(--surface));
      font-size: var(--text-sm);
      font-weight: var(--weight-semibold);
    }

    th[data-sticky="start"],
    td[data-sticky="start"] {
      position: sticky;
      left: var(--cindor-data-grid-sticky-offset, 0px);
      z-index: 1;
      background: var(--surface);
    }

    thead th[data-sticky="start"] {
      z-index: 2;
      background: color-mix(in srgb, var(--bg-subtle) 65%, var(--surface));
    }

    th[data-align="center"],
    td[data-align="center"] {
      text-align: center;
    }

    th[data-align="end"],
    td[data-align="end"] {
      text-align: right;
    }

    .cell-button {
      display: block;
      width: 100%;
      min-height: 2.5rem;
      padding: 0;
      border: 0;
      background: transparent;
      color: inherit;
      font: inherit;
      text-align: inherit;
      cursor: pointer;
    }

    .cell-button[data-active="true"] {
      outline: none;
      box-shadow: inset 0 0 0 2px color-mix(in srgb, var(--accent) 65%, transparent);
      border-radius: var(--radius-sm);
    }

    .cell-button:focus-visible {
      outline: none;
      box-shadow: inset 0 0 0 2px color-mix(in srgb, var(--accent) 65%, transparent);
      border-radius: var(--radius-sm);
    }

    .message {
      padding: var(--space-4);
      color: var(--fg-muted);
    }

    .sort-button {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      padding: 0;
      border: 0;
      background: transparent;
      color: inherit;
      font: inherit;
      cursor: pointer;
    }
  `;

  static properties = {
    columns: { attribute: false },
    emptyMessage: { reflect: true, attribute: "empty-message" },
    rowIdKey: { reflect: true, attribute: "row-id-key" },
    rows: { attribute: false },
    sortDirection: { reflect: true, attribute: "sort-direction" },
    sortKey: { reflect: true, attribute: "sort-key" }
  };

  columns: DataGridColumn[] = [];
  emptyMessage = "No rows to display.";
  rowIdKey = "id";
  rows: DataGridRow[] = [];
  sortDirection: DataGridSortDirection = "ascending";
  sortKey = "";

  private activeColumnIndex = 0;
  private activeRowIndex = 0;
  private editingCellKey: string | null = null;

  protected override render() {
    const rows = this.sortedRows;
    const renderedColumns = this.renderedColumns;

    if (rows.length === 0 || this.columns.length === 0) {
      return html`<div class="surface"><div class="message" part="empty">${this.emptyMessage}</div></div>`;
    }

    return html`
      <div class="surface" part="surface">
        <div class="region" part="region">
          <table aria-label=${this.getAttribute("aria-label") ?? "Data grid"} role="grid">
            <thead>
              <tr role="row">
                ${renderedColumns.map(({ column, stickyOffset }) => {
                  const align = this.resolveAlign(column);
                  const active = Boolean(column.sortable && column.key === this.sortKey);
                  return html`
                    <th
                      role="columnheader"
                      aria-sort=${column.sortable ? (active ? this.sortDirection : "none") : nothing}
                      data-align=${align}
                      data-sticky=${stickyOffset ? "start" : nothing}
                      style=${this.columnCellStyle(column, stickyOffset)}
                    >
                      ${this.renderHeaderCell(column, active)}
                    </th>
                  `;
                })}
              </tr>
            </thead>
            <tbody>
              ${rows.map((row, rowIndex) => this.renderRow(row, rowIndex))}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  private renderHeaderCell(column: DataGridColumn, active: boolean) {
    const label = column.headerLabel || column.label;
    if (!column.sortable) {
      return label;
    }

    return html`
      <button class="sort-button" type="button" @click=${() => this.toggleSort(column)}>
        <span>${label}</span>
        <span aria-hidden="true">${active ? (this.sortDirection === "ascending" ? "↑" : "↓") : "↕"}</span>
      </button>
    `;
  }

  private renderRow(row: DataGridRow, rowIndex: number) {
    const rowId = this.getRowId(row, rowIndex);
    const renderedColumns = this.renderedColumns;

    return html`
      <tr role="row">
        ${renderedColumns.map(({ column, stickyOffset }, columnIndex) => {
          const detail = this.createCellDetail(column, columnIndex, row, rowId, rowIndex);
          const active = this.activeRowIndex === rowIndex && this.activeColumnIndex === columnIndex;
          const editing = this.editingCellKey === this.getCellKey(rowIndex, columnIndex);
          const align = this.resolveAlign(column);

          return html`
            <td
              role="gridcell"
              aria-colindex=${String(columnIndex + 1)}
              aria-rowindex=${String(rowIndex + 1)}
              data-align=${align}
              data-sticky=${stickyOffset ? "start" : nothing}
              style=${this.columnCellStyle(column, stickyOffset)}
            >
              ${editing ? this.renderCellEditor(detail) : this.renderCellButton(detail, active)}
            </td>
          `;
        })}
      </tr>
    `;
  }

  private renderCellButton(detail: DataGridCellRenderDetail, active: boolean) {
    const content = detail.column.cellRenderer ? detail.column.cellRenderer(detail) : this.normalizeTextValue(detail.value);

    return html`
      <button
        class="cell-button"
        data-active=${String(active)}
        tabindex=${active ? "0" : "-1"}
        type="button"
        @click=${() => this.activateCell(detail.rowIndex, detail.columnIndex)}
        @keydown=${(event: KeyboardEvent) => this.handleCellKeydown(event, detail)}
      >
        ${content}
      </button>
    `;
  }

  private renderCellEditor(detail: DataGridCellRenderDetail) {
    const editor = detail.column.editor;
    if (!editor) {
      return nothing;
    }

    const ariaLabel = `${detail.column.headerLabel || detail.column.label} for row ${detail.rowId}`;

    if (editor.type === "input") {
      return html`
        <cindor-input
          aria-label=${ariaLabel}
          autocomplete=${editor.autocomplete ?? ""}
          placeholder=${editor.placeholder ?? ""}
          .value=${this.normalizeTextValue(detail.value)}
          @change=${(event: Event) => this.handleTextEditorChange(detail, event)}
          @keydown=${this.handleEditorKeydown}
        ></cindor-input>
      `;
    }

    if (editor.type === "select") {
      const options = typeof editor.options === "function" ? editor.options(detail) : editor.options;
      return html`
        <cindor-select
          aria-label=${ariaLabel}
          .value=${this.normalizeTextValue(detail.value)}
          @change=${(event: Event) => this.handleSelectEditorChange(detail, event)}
          @keydown=${this.handleEditorKeydown}
        >
          ${options.map((option) => html`<option value=${option.value}>${option.label}</option>`)}
        </cindor-select>
      `;
    }

    return html`
      <cindor-switch
        aria-label=${ariaLabel}
        ?checked=${Boolean(detail.value)}
        @change=${(event: Event) => this.handleSwitchEditorChange(detail, event)}
        @keydown=${this.handleEditorKeydown}
      ></cindor-switch>
    `;
  }

  private handleCellKeydown(event: KeyboardEvent, detail: DataGridCellRenderDetail): void {
    if (event.key === "Enter" || event.key === " ") {
      if (detail.column.editor) {
        event.preventDefault();
        this.startEditing(detail.rowIndex, detail.columnIndex);
      }
      return;
    }

    const next = this.getNextCell(detail.rowIndex, detail.columnIndex, event.key);
    if (!next) {
      return;
    }

    event.preventDefault();
    this.activateCell(next.rowIndex, next.columnIndex);
  }

  private handleEditorKeydown = (event: KeyboardEvent): void => {
    if (event.key !== "Escape") {
      return;
    }

    event.preventDefault();
    this.editingCellKey = null;
    this.requestUpdate();
  };

  private handleTextEditorChange(detail: DataGridCellRenderDetail, event: Event): void {
    const input = event.currentTarget as TextInputHost;
    this.commitCellEdit(detail, input.value);
  }

  private handleSelectEditorChange(detail: DataGridCellRenderDetail, event: Event): void {
    const select = event.currentTarget as SelectHost;
    this.commitCellEdit(detail, select.value);
  }

  private handleSwitchEditorChange(detail: DataGridCellRenderDetail, event: Event): void {
    const control = event.currentTarget as SwitchHost;
    this.commitCellEdit(detail, control.checked);
  }

  private commitCellEdit(detail: DataGridCellRenderDetail, nextValue: unknown): void {
    const nextRow = {
      ...detail.row,
      [detail.column.key]: nextValue
    };
    const nextRows = [...this.rows];
    nextRows[detail.rowIndex] = nextRow;
    this.rows = nextRows;
    this.editingCellKey = null;

    this.dispatchEvent(
      new CustomEvent<DataGridCellEditDetail>("cell-edit", {
        bubbles: true,
        composed: true,
        detail: {
          column: detail.column,
          columnIndex: detail.columnIndex,
          columnKey: detail.column.key,
          row: nextRow,
          rowId: detail.rowId,
          rowIndex: detail.rowIndex,
          value: nextValue
        }
      })
    );
  }

  private activateCell(rowIndex: number, columnIndex: number): void {
    this.activeRowIndex = clamp(rowIndex, 0, this.rows.length - 1);
    this.activeColumnIndex = clamp(columnIndex, 0, this.columns.length - 1);
    this.editingCellKey = null;
    this.requestUpdate();
    queueMicrotask(() => this.focusActiveCell());

    const detail = this.createCellDetail(
      this.columns[this.activeColumnIndex] as DataGridColumn,
      this.activeColumnIndex,
      this.rows[this.activeRowIndex] as DataGridRow,
      this.getRowId(this.rows[this.activeRowIndex] as DataGridRow, this.activeRowIndex),
      this.activeRowIndex
    );

    this.dispatchEvent(
      new CustomEvent<DataGridActiveCellDetail>("active-cell-change", {
        bubbles: true,
        composed: true,
        detail: {
          column: detail.column,
          columnIndex: detail.columnIndex,
          row: detail.row,
          rowId: detail.rowId,
          rowIndex: detail.rowIndex
        }
      })
    );
  }

  private startEditing(rowIndex: number, columnIndex: number): void {
    this.activeRowIndex = rowIndex;
    this.activeColumnIndex = columnIndex;
    this.editingCellKey = this.getCellKey(rowIndex, columnIndex);
    this.requestUpdate();
  }

  private getNextCell(rowIndex: number, columnIndex: number, key: string): { rowIndex: number; columnIndex: number } | null {
    if (key === "ArrowRight") {
      return { rowIndex, columnIndex: clamp(columnIndex + 1, 0, this.columns.length - 1) };
    }

    if (key === "ArrowLeft") {
      return { rowIndex, columnIndex: clamp(columnIndex - 1, 0, this.columns.length - 1) };
    }

    if (key === "ArrowDown") {
      return { rowIndex: clamp(rowIndex + 1, 0, this.rows.length - 1), columnIndex };
    }

    if (key === "ArrowUp") {
      return { rowIndex: clamp(rowIndex - 1, 0, this.rows.length - 1), columnIndex };
    }

    return null;
  }

  private createCellDetail(
    column: DataGridColumn,
    columnIndex: number,
    row: DataGridRow,
    rowId: string,
    rowIndex: number
  ): DataGridCellRenderDetail {
    return {
      column,
      columnIndex,
      row,
      rowId,
      rowIndex,
      value: row[column.key],
      grid: this
    };
  }

  private getRowId(row: DataGridRow, rowIndex: number): string {
    const value = row[this.rowIdKey];
    return value === undefined || value === null || value === "" ? `row-${rowIndex + 1}` : String(value);
  }

  private getCellKey(rowIndex: number, columnIndex: number): string {
    return `${rowIndex}:${columnIndex}`;
  }

  private normalizeTextValue(value: unknown): string {
    return value === undefined || value === null ? "" : String(value);
  }

  private resolveAlign(column: DataGridColumn): DataGridCellAlign {
    return column.align ?? "start";
  }

  private toggleSort(column: DataGridColumn): void {
    if (!column.sortable) {
      return;
    }

    if (this.sortKey === column.key) {
      this.sortDirection = this.sortDirection === "ascending" ? "descending" : "ascending";
    } else {
      this.sortKey = column.key;
      this.sortDirection = "ascending";
    }

    this.dispatchEvent(
      new CustomEvent<DataGridSortChangeDetail>("sort-change", {
        bubbles: true,
        composed: true,
        detail: {
          sortDirection: this.sortDirection,
          sortKey: this.sortKey
        }
      })
    );
  }

  private get sortedRows(): DataGridRow[] {
    const rows = [...this.rows];
    const column = this.columns.find((entry) => entry.key === this.sortKey && entry.sortable);

    if (!column) {
      return rows;
    }

    return rows.sort((left, right) => {
      const leftValue = left[column.key];
      const rightValue = right[column.key];
      const comparison = this.defaultSortComparison(leftValue, rightValue);
      return this.sortDirection === "ascending" ? comparison : -comparison;
    });
  }

  private defaultSortComparison(leftValue: unknown, rightValue: unknown): number {
    const leftString = leftValue === null || leftValue === undefined ? "" : String(leftValue);
    const rightString = rightValue === null || rightValue === undefined ? "" : String(rightValue);
    return leftString.localeCompare(rightString, undefined, { numeric: true, sensitivity: "base" });
  }

  private get renderedColumns(): DataGridRenderedColumn[] {
    let stickyOffset = "0px";

    return this.columns.map((column) => {
      const nextColumn: DataGridRenderedColumn = {
        column,
        stickyOffset: column.sticky === "start" ? stickyOffset : null
      };

      if (column.sticky === "start") {
        stickyOffset = `calc(${stickyOffset} + ${this.stickyColumnWidth(column)})`;
      }

      return nextColumn;
    });
  }

  private columnCellStyle(column: DataGridColumn, stickyOffset: string | null): string | typeof nothing {
    const styles: string[] = [];

    if (column.width) {
      styles.push(`width:${column.width};max-width:${column.width};`);
    }

    if (stickyOffset) {
      styles.push(`--cindor-data-grid-sticky-offset:${stickyOffset};`);
    }

    return styles.length > 0 ? styles.join("") : nothing;
  }

  private stickyColumnWidth(column: DataGridColumn): string {
    return column.width ?? "12rem";
  }

  private focusActiveCell(): void {
    const button = this.renderRoot.querySelector<HTMLButtonElement>(
      `.cell-button[data-active="true"][tabindex="0"]`
    );
    button?.focus();
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
