import { css, html, LitElement, nothing, type PropertyValues } from "lit";

export type DataTableRow = Record<string, unknown>;
export type DataTableSortDirection = "ascending" | "descending";
export type DataTableCellAlign = "center" | "end" | "start";
export type DataTablePageChangeDetail = {
  currentPage: number;
  totalPages: number;
};
export type DataTableSearchChangeDetail = {
  matchingRows: number;
  searchQuery: string;
};

export type DataTableCellRenderDetail = {
  column: DataTableColumn;
  row: DataTableRow;
  rowId: string;
  rowIndex: number;
  table: EmbDataTable;
  value: unknown;
};

export type DataTableCellEditDetail = {
  column: DataTableColumn;
  columnKey: string;
  row: DataTableRow;
  rowId: string;
  rowIndex: number;
  value: unknown;
};

export type DataTableRowActionDetail = {
  action: DataTableRowAction;
  actionKey: string;
  column: DataTableColumn;
  columnKey: string;
  row: DataTableRow;
  rowId: string;
  rowIndex: number;
};

export type DataTableSortComparator = (
  leftValue: unknown,
  rightValue: unknown,
  detail: {
    column: DataTableColumn;
    leftRow: DataTableRow;
    rightRow: DataTableRow;
    table: EmbDataTable;
  }
) => number;

export type DataTableSortValueAccessor = (
  row: DataTableRow,
  detail: {
    column: DataTableColumn;
    rowIndex: number;
    table: EmbDataTable;
  }
) => unknown;

export type DataTableTooltipText =
  | boolean
  | string
  | ((detail: DataTableCellRenderDetail) => string | null | undefined);

export type DataTableEditorOption = {
  label: string;
  value: string;
};

export type DataTableEditorDisablePredicate = boolean | ((detail: DataTableCellRenderDetail) => boolean);

export type DataTableCellEditor =
  | {
      autocomplete?: string;
      disabled?: DataTableEditorDisablePredicate;
      placeholder?: string;
      type: "input";
    }
  | {
      disabled?: DataTableEditorDisablePredicate;
      options: DataTableEditorOption[] | ((detail: DataTableCellRenderDetail) => DataTableEditorOption[]);
      type: "select";
    }
  | {
      disabled?: DataTableEditorDisablePredicate;
      type: "switch";
    };

export type DataTableRowAction = {
  disabled?: boolean | ((detail: DataTableCellRenderDetail) => boolean);
  icon?: string;
  key: string;
  label: string;
  variant?: "ghost" | "solid";
};

export type DataTableColumn = {
  actions?: DataTableRowAction[];
  align?: DataTableCellAlign;
  cellRenderer?: (detail: DataTableCellRenderDetail) => unknown;
  cellSlot?: string;
  editor?: DataTableCellEditor;
  key: string;
  label: string;
  numeric?: boolean;
  sortable?: boolean;
  sortComparator?: DataTableSortComparator;
  sortValue?: DataTableSortValueAccessor;
  tooltip?: DataTableTooltipText;
  truncate?: boolean;
  width?: string;
};

type SearchHost = HTMLElement & { value: string };
type PaginationHost = HTMLElement & { currentPage: number };
type SelectHost = HTMLElement & { value: string };
type TextInputHost = HTMLElement & { value: string };
type SwitchHost = HTMLElement & { checked: boolean };

/**
 * Searchable, sortable application data table built from native table semantics.
 *
 * @summary Searchable, sortable data table for application records.
 * @tag emb-data-table
 * @fires {CustomEvent<DataTableCellEditDetail>} cell-edit - Fired when an inline editor updates a row value.
 * @fires {CustomEvent<DataTablePageChangeDetail>} page-change - Fired when the current page changes through pagination.
 * @fires {CustomEvent<DataTableRowActionDetail>} row-action - Fired when a row action button is pressed.
 * @fires {CustomEvent<DataTableSearchChangeDetail>} search-change - Fired when the search query changes and the matching row count updates.
 * @fires {CustomEvent<{ sortDirection: DataTableSortDirection; sortKey: string }>} sort-change - Fired when the active sort column or direction changes.
 */
export class EmbDataTable extends LitElement {
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
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    caption {
      padding: var(--space-4);
      text-align: left;
      color: var(--fg);
      font-weight: 600;
    }

    th,
    td {
      padding: var(--space-3) var(--space-4);
      border-top: 1px solid var(--border);
      text-align: left;
      vertical-align: top;
    }

    thead th {
      border-top: 0;
      color: var(--fg);
      background: color-mix(in srgb, var(--bg-subtle) 65%, var(--surface));
      font-size: var(--text-sm);
      font-weight: 600;
    }

    th[data-align="center"],
    td[data-align="center"] {
      text-align: center;
    }

    th[data-align="end"],
    td[data-align="end"] {
      text-align: right;
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

    .sort-button:focus-visible {
      outline: none;
      box-shadow: var(--ring-focus);
      border-radius: var(--radius-sm);
    }

    .message {
      color: var(--fg-muted);
    }

    .toolbar,
    .footer {
      display: flex;
      flex-wrap: wrap;
      align-items: end;
      justify-content: space-between;
      gap: var(--space-3);
      padding: var(--space-4);
    }

    .toolbar {
      border-bottom: 1px solid var(--border);
    }

    .footer {
      border-top: 1px solid var(--border);
    }

    .table-region {
      overflow-x: auto;
    }

    .cell {
      min-width: 0;
    }

    .cell-content {
      display: block;
      min-width: 0;
    }

    .cell-content[data-truncate="true"] {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .cell-actions {
      display: inline-flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--space-2);
    }

    .cell-editor {
      --emb-field-inline-size: 100%;
      display: block;
      min-width: 0;
    }

    emb-search {
      --emb-field-inline-size: min(100%, 18rem);
    }

    .summary {
      margin: 0;
      color: var(--fg-muted);
      font-size: var(--text-sm);
    }
  `;

  static properties = {
    caption: { reflect: true },
    columns: { attribute: false },
    currentPage: { type: Number, reflect: true, attribute: "current-page" },
    emptyMessage: { reflect: true, attribute: "empty-message" },
    loading: { type: Boolean, reflect: true },
    pageSize: { type: Number, reflect: true, attribute: "page-size" },
    rowIdKey: { reflect: true, attribute: "row-id-key" },
    rows: { attribute: false },
    searchable: { type: Boolean, reflect: true },
    searchLabel: { reflect: true, attribute: "search-label" },
    searchPlaceholder: { reflect: true, attribute: "search-placeholder" },
    searchQuery: { reflect: true, attribute: "search-query" },
    sortDirection: { reflect: true, attribute: "sort-direction" },
    sortKey: { reflect: true, attribute: "sort-key" }
  };

  caption = "";
  columns: DataTableColumn[] = [];
  currentPage = 1;
  emptyMessage = "No rows to display.";
  loading = false;
  pageSize = 10;
  rowIdKey = "id";
  rows: DataTableRow[] = [];
  searchable = false;
  searchLabel = "Search rows";
  searchPlaceholder = "Search rows";
  searchQuery = "";
  sortDirection: DataTableSortDirection = "ascending";
  sortKey = "";

  protected override willUpdate(changedProperties: PropertyValues<this>): void {
    if (
      changedProperties.has("currentPage") ||
      changedProperties.has("pageSize") ||
      changedProperties.has("rows") ||
      changedProperties.has("searchQuery") ||
      changedProperties.has("sortDirection") ||
      changedProperties.has("sortKey")
    ) {
      const nextPage = this.clampedCurrentPage;

      if (nextPage !== this.currentPage) {
        this.currentPage = nextPage;
      }
    }
  }

  protected override render() {
    const filteredRows = this.filteredRows;
    const visibleRows = this.visibleRows;
    const totalPages = this.totalPages;
    const showPagination = !this.loading && totalPages > 1;

    return html`
      <div class="surface" part="surface">
        ${this.searchable
          ? html`
              <div class="toolbar" part="toolbar">
                <emb-search
                  part="search"
                  aria-label=${this.searchLabel}
                  placeholder=${this.searchPlaceholder}
                  .value=${this.searchQuery}
                  @input=${this.handleSearchInput}
                ></emb-search>
                <p class="summary" part="summary" aria-live="polite">${this.summaryText(filteredRows.length, visibleRows.length)}</p>
              </div>
            `
          : nothing}
        <div class="table-region" part="table-region">
          <table part="table">
            <colgroup>
              ${this.columns.map(
                (column) => html`<col style=${this.columnWidthStyle(column)} />`
              )}
            </colgroup>
            ${this.caption ? html`<caption part="caption">${this.caption}</caption>` : nothing}
            <thead part="head">
              <tr part="head-row">
                ${this.columns.map((column) => {
                  const active = column.key === this.sortKey;

                  return html`
                    <th
                      part="head-cell"
                      scope="col"
                      data-align=${this.columnAlign(column)}
                      aria-sort=${column.sortable ? (active ? this.sortDirection : "none") : nothing}
                      style=${this.columnWidthStyle(column)}
                    >
                      ${column.sortable
                        ? html`
                            <button class="sort-button" type="button" part="sort-button" @click=${() => this.toggleSort(column)}>
                              <span>${column.label}</span>
                              <span aria-hidden="true">${active ? (this.sortDirection === "ascending" ? "↑" : "↓") : "↕"}</span>
                            </button>
                          `
                        : column.label}
                    </th>
                  `;
                })}
              </tr>
            </thead>
            <tbody part="body">
              ${this.loading
                ? html`
                    <tr part="row">
                      <td class="message" part="cell message" colspan=${String(Math.max(this.columns.length, 1))}>Loading rows...</td>
                    </tr>
                  `
                : visibleRows.length === 0
                  ? html`
                      <tr part="row">
                        <td class="message" part="cell message" colspan=${String(Math.max(this.columns.length, 1))}>${this.emptyMessage}</td>
                      </tr>
                    `
                  : visibleRows.map((row, visibleIndex) => {
                      const rowIndex = this.getRowIndex(row, visibleIndex);
                      const rowId = this.getRowId(row, rowIndex);

                      return html`
                        <tr part="row" data-row-id=${rowId}>
                          ${this.columns.map((column) => {
                            const detail = this.createCellDetail(column, row, rowId, rowIndex);

                            return html`
                              <td
                                part="cell"
                                class="cell"
                                data-align=${this.columnAlign(column)}
                                style=${this.columnWidthStyle(column)}
                              >
                                ${this.renderCell(detail)}
                              </td>
                            `;
                          })}
                        </tr>
                      `;
                    })}
            </tbody>
          </table>
        </div>
        ${showPagination
          ? html`
              <div class="footer" part="footer">
                ${this.searchable ? nothing : html`<p class="summary" part="summary" aria-live="polite">${this.summaryText(filteredRows.length, visibleRows.length)}</p>`}
                <emb-pagination
                  part="pagination"
                  aria-label="Table pagination"
                  current-page=${String(this.currentPage)}
                  max-visible-pages="5"
                  total-pages=${String(totalPages)}
                  @change=${this.handlePaginationChange}
                ></emb-pagination>
              </div>
            `
          : nothing}
      </div>
    `;
  }

  private renderCell(detail: DataTableCellRenderDetail) {
    const slotName = this.getCellSlotName(detail);
    const content = this.renderCellContent(detail);

    if (slotName) {
      return html`<slot name=${slotName}>${content}</slot>`;
    }

    return content;
  }

  private renderCellContent(detail: DataTableCellRenderDetail) {
    if (detail.column.actions && detail.column.actions.length > 0) {
      return html`
        <div class="cell-actions" part="cell-actions">
          ${detail.column.actions.map((action) => this.renderActionButton(detail, action))}
        </div>
      `;
    }

    if (detail.column.editor) {
      return this.renderCellEditor(detail);
    }

    const renderOutput = detail.column.cellRenderer ? detail.column.cellRenderer(detail) : this.formatCellValue(detail.value);
    const tooltipText = this.getTooltipText(detail);

    const content = html`
      <span
        class="cell-content"
        part="cell-content"
        data-truncate=${String(Boolean(detail.column.truncate))}
        style=${this.cellContentStyle(detail.column)}
      >
        ${renderOutput}
      </span>
    `;

    if (!tooltipText) {
      return content;
    }

    return html`<emb-tooltip text=${tooltipText}>${content}</emb-tooltip>`;
  }

  private renderActionButton(detail: DataTableCellRenderDetail, action: DataTableRowAction) {
    const disabled = this.resolveActionDisabled(action, detail);

    if (action.icon && action.label === "") {
      return html`
        <emb-icon-button
          ?disabled=${disabled}
          label=${action.key}
          name=${action.icon}
          @click=${() => this.handleRowAction(detail, action)}
        ></emb-icon-button>
      `;
    }

    return html`
      <emb-button
        ?disabled=${disabled}
        type="button"
        variant=${action.variant ?? "ghost"}
        @click=${() => this.handleRowAction(detail, action)}
      >
        ${action.icon ? html`<emb-icon slot="start-icon" name=${action.icon}></emb-icon>` : nothing}
        ${action.label}
      </emb-button>
    `;
  }

  private renderCellEditor(detail: DataTableCellRenderDetail) {
    const editor = detail.column.editor;
    if (!editor) {
      return nothing;
    }

    const disabled = this.resolveEditorDisabled(editor, detail);
    const ariaLabel = `${detail.column.label} for row ${detail.rowId}`;

    if (editor.type === "input") {
      return html`
        <emb-input
          class="cell-editor"
          aria-label=${ariaLabel}
          autocomplete=${editor.autocomplete ?? ""}
          ?disabled=${disabled}
          placeholder=${editor.placeholder ?? ""}
          .value=${this.normalizeTextValue(detail.value)}
          @change=${(event: Event) => this.handleTextEditorChange(detail, event)}
        ></emb-input>
      `;
    }

    if (editor.type === "select") {
      const options = typeof editor.options === "function" ? editor.options(detail) : editor.options;

      return html`
        <emb-select
          class="cell-editor"
          aria-label=${ariaLabel}
          ?disabled=${disabled}
          .value=${this.normalizeTextValue(detail.value)}
          @change=${(event: Event) => this.handleSelectEditorChange(detail, event)}
        >
          ${options.map((option) => html`<option value=${option.value}>${option.label}</option>`)}
        </emb-select>
      `;
    }

    return html`
      <emb-switch
        aria-label=${ariaLabel}
        ?checked=${Boolean(detail.value)}
        ?disabled=${disabled}
        @change=${(event: Event) => this.handleSwitchEditorChange(detail, event)}
      ></emb-switch>
    `;
  }

  private handleTextEditorChange(detail: DataTableCellRenderDetail, event: Event): void {
    const input = event.currentTarget as TextInputHost;
    this.commitCellEdit(detail, input.value);
  }

  private handleSelectEditorChange(detail: DataTableCellRenderDetail, event: Event): void {
    const select = event.currentTarget as SelectHost;
    this.commitCellEdit(detail, select.value);
  }

  private handleSwitchEditorChange(detail: DataTableCellRenderDetail, event: Event): void {
    const control = event.currentTarget as SwitchHost;
    this.commitCellEdit(detail, control.checked);
  }

  private commitCellEdit(detail: DataTableCellRenderDetail, nextValue: unknown): void {
    const targetIndex = this.rows.indexOf(detail.row);
    if (targetIndex < 0) {
      return;
    }

    const nextRow: DataTableRow = {
      ...detail.row,
      [detail.column.key]: nextValue
    };
    const nextRows = [...this.rows];
    nextRows[targetIndex] = nextRow;
    this.rows = nextRows;

    this.dispatchEvent(
      new CustomEvent<DataTableCellEditDetail>("cell-edit", {
        bubbles: true,
        composed: true,
        detail: {
          column: detail.column,
          columnKey: detail.column.key,
          row: nextRow,
          rowId: detail.rowId,
          rowIndex: detail.rowIndex,
          value: nextValue
        }
      })
    );
  }

  private handleRowAction(detail: DataTableCellRenderDetail, action: DataTableRowAction): void {
    this.dispatchEvent(
      new CustomEvent<DataTableRowActionDetail>("row-action", {
        bubbles: true,
        composed: true,
        detail: {
          action,
          actionKey: action.key,
          column: detail.column,
          columnKey: detail.column.key,
          row: detail.row,
          rowId: detail.rowId,
          rowIndex: detail.rowIndex
        }
      })
    );
  }

  private createCellDetail(column: DataTableColumn, row: DataTableRow, rowId: string, rowIndex: number): DataTableCellRenderDetail {
    return {
      column,
      row,
      rowId,
      rowIndex,
      table: this,
      value: row[column.key]
    };
  }

  private getCellSlotName(detail: DataTableCellRenderDetail): string | null {
    if (!detail.column.cellSlot) {
      return null;
    }

    return `${detail.column.cellSlot}-${detail.rowId}`;
  }

  private getTooltipText(detail: DataTableCellRenderDetail): string | null {
    const tooltip = detail.column.tooltip;

    if (!tooltip) {
      return null;
    }

    if (tooltip === true) {
      const text = this.formatCellValue(detail.value);
      return text === "" ? null : text;
    }

    if (typeof tooltip === "string") {
      return tooltip;
    }

    return tooltip(detail) ?? null;
  }

  private resolveEditorDisabled(editor: DataTableCellEditor, detail: DataTableCellRenderDetail): boolean {
    if (typeof editor.disabled === "function") {
      return editor.disabled(detail);
    }

    return Boolean(editor.disabled);
  }

  private resolveActionDisabled(action: DataTableRowAction, detail: DataTableCellRenderDetail): boolean {
    if (typeof action.disabled === "function") {
      return action.disabled(detail);
    }

    return Boolean(action.disabled);
  }

  private normalizeTextValue(value: unknown): string {
    if (value === null || value === undefined) {
      return "";
    }

    return String(value);
  }

  private formatCellValue(value: unknown): string {
    if (value === null || value === undefined) {
      return "";
    }

    return String(value);
  }

  private handleSearchInput = (event: Event): void => {
    const search = event.currentTarget as SearchHost;
    this.searchQuery = search.value;
    this.setCurrentPage(1);
    this.dispatchEvent(
      new CustomEvent<DataTableSearchChangeDetail>("search-change", {
        bubbles: true,
        composed: true,
        detail: {
          matchingRows: this.filteredRows.length,
          searchQuery: this.searchQuery
        }
      })
    );
  };

  private handlePaginationChange = (event: Event): void => {
    const pagination = event.currentTarget as PaginationHost;
    this.setCurrentPage(pagination.currentPage);
  };

  private summaryText(totalRows: number, visibleRowCount: number): string {
    if (this.loading) {
      return "Loading rows...";
    }

    if (totalRows === 0) {
      return this.searchQuery ? "0 matching rows" : "0 rows";
    }

    if (!this.paginationEnabled) {
      return `${totalRows} row${totalRows === 1 ? "" : "s"}`;
    }

    const startRow = (this.currentPage - 1) * this.normalizedPageSize + 1;
    const endRow = startRow + visibleRowCount - 1;

    return `Showing ${startRow}-${endRow} of ${totalRows}`;
  }

  private toggleSort(column: DataTableColumn): void {
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
      new CustomEvent("sort-change", {
        bubbles: true,
        composed: true,
        detail: {
          sortDirection: this.sortDirection,
          sortKey: this.sortKey
        }
      })
    );
  }

  private setCurrentPage(page: number): void {
    const nextPage = Math.min(Math.max(page, 1), this.totalPages);

    if (nextPage === this.currentPage) {
      return;
    }

    this.currentPage = nextPage;
    this.dispatchEvent(
      new CustomEvent<DataTablePageChangeDetail>("page-change", {
        bubbles: true,
        composed: true,
        detail: {
          currentPage: this.currentPage,
          totalPages: this.totalPages
        }
      })
    );
  }

  private get filteredRows(): DataTableRow[] {
    const query = this.searchQuery.trim().toLocaleLowerCase();
    const rows = [...this.rows];

    if (query.length === 0) {
      return rows;
    }

    return rows.filter((row, rowIndex) =>
      this.columns.some((column) => this.getSearchValue(column, row, rowIndex).toLocaleLowerCase().includes(query))
    );
  }

  private getSearchValue(column: DataTableColumn, row: DataTableRow, rowIndex: number): string {
    const value = column.sortValue ? column.sortValue(row, { column, rowIndex, table: this }) : row[column.key];
    return this.formatCellValue(value);
  }

  private get sortedRows(): DataTableRow[] {
    const rows = [...this.filteredRows];
    const column = this.columns.find((entry) => entry.key === this.sortKey && entry.sortable);

    if (!column) {
      return rows;
    }

    return rows.sort((left, right) => {
      const leftIndex = this.getRowIndex(left, 0);
      const rightIndex = this.getRowIndex(right, 0);
      const leftValue = column.sortValue ? column.sortValue(left, { column, rowIndex: leftIndex, table: this }) : left[column.key];
      const rightValue = column.sortValue ? column.sortValue(right, { column, rowIndex: rightIndex, table: this }) : right[column.key];
      const comparison = column.sortComparator
        ? column.sortComparator(leftValue, rightValue, {
            column,
            leftRow: left,
            rightRow: right,
            table: this
          })
        : this.defaultSortComparison(leftValue, rightValue);

      return this.sortDirection === "ascending" ? comparison : -comparison;
    });
  }

  private defaultSortComparison(leftValue: unknown, rightValue: unknown): number {
    const leftString = leftValue === null || leftValue === undefined ? "" : String(leftValue);
    const rightString = rightValue === null || rightValue === undefined ? "" : String(rightValue);
    return leftString.localeCompare(rightString, undefined, { numeric: true, sensitivity: "base" });
  }

  private get visibleRows(): DataTableRow[] {
    if (!this.paginationEnabled) {
      return this.sortedRows;
    }

    const start = (this.currentPage - 1) * this.normalizedPageSize;
    return this.sortedRows.slice(start, start + this.normalizedPageSize);
  }

  private get normalizedPageSize(): number {
    return this.pageSize > 0 ? this.pageSize : this.rows.length || 1;
  }

  private get paginationEnabled(): boolean {
    return this.pageSize > 0;
  }

  private get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredRows.length / this.normalizedPageSize));
  }

  private get clampedCurrentPage(): number {
    return Math.min(Math.max(this.currentPage, 1), this.totalPages);
  }

  private getRowIndex(row: DataTableRow, fallbackIndex: number): number {
    const sourceIndex = this.rows.indexOf(row);
    return sourceIndex >= 0 ? sourceIndex : fallbackIndex;
  }

  private getRowId(row: DataTableRow, rowIndex: number): string {
    const candidate = row[this.rowIdKey];
    if (typeof candidate === "string" || typeof candidate === "number") {
      return String(candidate);
    }

    return String(rowIndex);
  }

  private columnAlign(column: DataTableColumn): DataTableCellAlign {
    if (column.align) {
      return column.align;
    }

    return column.numeric ? "end" : "start";
  }

  private columnWidthStyle(column: DataTableColumn): string {
    if (!column.width) {
      return "";
    }

    return `width:${column.width};max-width:${column.width};`;
  }

  private cellContentStyle(column: DataTableColumn): string {
    if (!column.width) {
      return "";
    }

    return `max-width:${column.width};`;
  }
}
