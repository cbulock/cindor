import { css, html, LitElement, nothing, type PropertyValues } from "lit";

export type DataTableRow = Record<string, unknown>;
export type DataTableSortDirection = "ascending" | "descending";
export type DataTableCellAlign = "center" | "end" | "start";
export type DataTableDensity = "comfortable" | "compact";
export type DataTableHeaderDisplay = "visible" | "sr-only" | "none";

const TABLET_COLUMN_PRIORITY_BREAKPOINT = 840;
const MOBILE_COLUMN_PRIORITY_BREAKPOINT = 640;
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
  table: CindorDataTable;
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

export type DataTableRowExpandDetail = {
  expanded: boolean;
  row: DataTableRow;
  rowId: string;
  rowIndex: number;
  table: CindorDataTable;
};

export type DataTableRowExpandEventDetail = DataTableRowExpandDetail & {
  expandedRowIds: string[];
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

export type DataTableRowExpansionRenderer = (detail: DataTableRowExpandDetail) => unknown;

export type DataTableSortComparator = (
  leftValue: unknown,
  rightValue: unknown,
  detail: {
    column: DataTableColumn;
    leftRow: DataTableRow;
    rightRow: DataTableRow;
    table: CindorDataTable;
  }
) => number;

export type DataTableSortValueAccessor = (
  row: DataTableRow,
  detail: {
    column: DataTableColumn;
    rowIndex: number;
    table: CindorDataTable;
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
  headerDisplay?: DataTableHeaderDisplay;
  headerLabel?: string;
  key: string;
  label: string;
  minWidth?: string;
  numeric?: boolean;
  priority?: number;
  sortable?: boolean;
  sortComparator?: DataTableSortComparator;
  sortValue?: DataTableSortValueAccessor;
  sticky?: "start";
  tooltip?: DataTableTooltipText;
  truncate?: boolean;
  width?: string;
};

type DataTableRenderedColumn = {
  column: DataTableColumn;
  stickyOffset: string | null;
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
 * @tag cindor-data-table
 * @fires {CustomEvent<DataTableCellEditDetail>} cell-edit - Fired when an inline editor updates a row value.
 * @fires {CustomEvent<DataTablePageChangeDetail>} page-change - Fired when the current page changes through pagination.
 * @fires {CustomEvent<DataTableRowExpandEventDetail>} row-expand - Fired when a row's expanded state changes.
 * @fires {CustomEvent<DataTableRowActionDetail>} row-action - Fired when a row action button is pressed.
 * @fires {CustomEvent<DataTableSearchChangeDetail>} search-change - Fired when the search query changes and the matching row count updates.
 * @fires {CustomEvent<{ sortDirection: DataTableSortDirection; sortKey: string }>} sort-change - Fired when the active sort column or direction changes.
 */
export class CindorDataTable extends LitElement {
  static styles = css`
    :host {
      display: block;
      width: 100%;
      color: var(--fg);
      --cindor-data-table-cell-padding-block: var(--space-3);
      --cindor-data-table-cell-padding-inline: var(--space-4);
      --cindor-data-table-column-min-width: 12rem;
    }

    :host([density="compact"]) {
      --cindor-data-table-cell-padding-block: var(--space-2);
      --cindor-data-table-cell-padding-inline: var(--space-3);
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
      font-weight: var(--weight-semibold);
    }

    th,
    td {
      padding: var(--cindor-data-table-cell-padding-block) var(--cindor-data-table-cell-padding-inline);
      border-top: 1px solid var(--border);
      text-align: left;
      vertical-align: top;
    }

    thead th {
      border-top: 0;
      color: var(--fg);
      background: color-mix(in srgb, var(--bg-subtle) 65%, var(--surface));
      font-size: var(--text-sm);
      font-weight: var(--weight-semibold);
    }

    th[data-sticky="start"],
    td[data-sticky="start"] {
      position: sticky;
      left: var(--cindor-data-table-sticky-offset, 0px);
      background: var(--surface);
      z-index: 1;
    }

    thead th[data-sticky="start"] {
      background: color-mix(in srgb, var(--bg-subtle) 65%, var(--surface));
      z-index: 2;
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
      position: relative;
      overflow-x: auto;
      overscroll-behavior-x: contain;
    }

    .table-region[data-mobile-layout="true"] {
      overflow-x: visible;
    }

    .table-region::before,
    .table-region::after {
      content: "";
      position: sticky;
      top: 0;
      bottom: 0;
      display: block;
      width: 1.5rem;
      pointer-events: none;
      opacity: 0;
      transition: opacity var(--duration-base) var(--ease-out);
      z-index: 1;
    }

    .table-region::before {
      left: 0;
      float: left;
      background: linear-gradient(to right, color-mix(in srgb, var(--surface) 96%, transparent), transparent);
    }

    .table-region::after {
      right: 0;
      float: right;
      background: linear-gradient(to left, color-mix(in srgb, var(--surface) 96%, transparent), transparent);
    }

    .table-region[data-overflow-start="true"]::before,
    .table-region[data-overflow-end="true"]::after {
      opacity: 1;
    }

    .table-region[data-mobile-layout="true"]::before,
    .table-region[data-mobile-layout="true"]::after {
      display: none;
    }

    .overflow-hint {
      padding: var(--space-2) var(--space-4);
      border-top: 1px solid var(--border);
      color: var(--fg-muted);
      font-size: var(--text-sm);
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
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: flex-start;
      gap: var(--space-2);
      max-width: 100%;
      min-width: 0;
    }

    .cell-actions cindor-button,
    .cell-actions cindor-icon-button {
      flex: 0 1 auto;
      min-width: 0;
      max-width: 100%;
    }

    .cell-actions cindor-button {
      --cindor-button-min-width: 0;
      overflow: hidden;
    }

    .cell-editor {
      --cindor-field-inline-size: 100%;
      display: block;
      min-width: 0;
    }

    cindor-search {
      --cindor-field-inline-size: min(100%, 18rem);
    }

    .summary {
      margin: 0;
      color: var(--fg-muted);
      font-size: var(--text-sm);
    }

    .visually-hidden {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0 0 0 0);
      clip-path: inset(50%);
      white-space: nowrap;
      border: 0;
    }

    .row-toggle-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 2rem;
      min-width: 2rem;
      height: 2rem;
      padding: 0;
      border: 1px solid var(--border-strong);
      border-radius: var(--radius-sm);
      background: color-mix(in srgb, var(--bg-subtle) 70%, var(--surface));
      color: var(--fg);
      font: inherit;
      line-height: 1;
      cursor: pointer;
      transition:
        background var(--duration-base) var(--ease-out),
        border-color var(--duration-base) var(--ease-out);
    }

    .row-toggle-button:hover:not(:disabled) {
      background: color-mix(in srgb, var(--accent-muted) 35%, var(--surface));
      border-color: color-mix(in srgb, var(--accent) 45%, var(--border-strong));
    }

    .row-toggle-button:focus-visible {
      outline: none;
      box-shadow: var(--ring-focus);
    }

    .row-toggle-button:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }

    .row-expansion-cell {
      padding: var(--space-4);
      background: color-mix(in srgb, var(--bg-subtle) 45%, var(--surface));
    }

    .row-expansion-content {
      display: grid;
      gap: var(--space-3);
    }

    @media (max-width: 640px) {
      table {
        display: block;
      }

      colgroup {
        display: none;
      }

      caption {
        display: block;
      }

      thead {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0 0 0 0);
        clip-path: inset(50%);
        white-space: nowrap;
        border: 0;
      }

      tbody {
        display: grid;
        gap: var(--space-3);
        padding: var(--space-3);
      }

      tbody tr {
        display: grid;
        gap: 0;
        border: 1px solid var(--border);
        border-radius: var(--radius-md);
        background: var(--surface);
        overflow: hidden;
      }

      tbody td {
        display: grid;
        gap: var(--space-2) var(--space-3);
        align-items: start;
        padding: var(--space-3) var(--space-4);
        border-top: 1px solid var(--border);
        text-align: left;
      }

      tbody td[data-column-label] {
        grid-template-columns: minmax(0, 8rem) minmax(0, 1fr);
      }

      tbody td:not([data-column-label]) {
        grid-template-columns: minmax(0, 1fr);
      }

      tbody td:first-child {
        border-top: 0;
      }

      tbody tr[data-expansion-row="true"] {
        gap: 0;
      }

      tbody tr[data-expansion-row="true"] td {
        display: block;
        grid-template-columns: none;
      }

      tbody tr[data-expansion-row="true"] td::before {
        content: none;
      }

      tbody td::before {
        content: attr(data-column-label);
        color: var(--fg-muted);
        font-size: var(--text-sm);
        font-weight: var(--weight-semibold);
      }

      th[data-sticky="start"],
      td[data-sticky="start"] {
        position: static;
        left: auto;
      }

      td[data-align="center"],
      td[data-align="end"] {
        text-align: left;
      }

      .cell-content {
        white-space: normal;
      }

      .cell-content[data-truncate="true"] {
        overflow: visible;
        text-overflow: initial;
        white-space: normal;
      }

      .footer,
      .toolbar {
        align-items: stretch;
      }
    }
  `;

  static properties = {
    caption: { reflect: true },
    columns: { attribute: false },
    currentPage: { type: Number, reflect: true, attribute: "current-page" },
    density: { reflect: true },
    emptyMessage: { reflect: true, attribute: "empty-message" },
    expandableRows: { type: Boolean, reflect: true, attribute: "expandable-rows" },
    expandedRowIds: { attribute: false },
    loading: { type: Boolean, reflect: true },
    pageSize: { type: Number, reflect: true, attribute: "page-size" },
    rowIdKey: { reflect: true, attribute: "row-id-key" },
    rowExpansionLabel: { reflect: true, attribute: "row-expansion-label" },
    rowExpansionRenderer: { attribute: false },
    rowExpansionSlot: { reflect: true, attribute: "row-expansion-slot" },
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
  density: DataTableDensity = "comfortable";
  emptyMessage = "No rows to display.";
  expandableRows = false;
  expandedRowIds: string[] = [];
  loading = false;
  pageSize = 10;
  rowIdKey = "id";
  rowExpansionLabel = "Row details";
  rowExpansionRenderer: DataTableRowExpansionRenderer | null = null;
  rowExpansionSlot = "row-expansion";
  rows: DataTableRow[] = [];
  searchable = false;
  searchLabel = "Search rows";
  searchPlaceholder = "Search rows";
  searchQuery = "";
  sortDirection: DataTableSortDirection = "ascending";
  sortKey = "";
  private overflowHintVisible = false;
  private overflowStartVisible = false;
  private overflowEndVisible = false;
  private hiddenResponsiveColumnKeys: string[] = [];
  private mobileLayoutActive = false;
  private resizeObserver?: ResizeObserver;
  private readonly handleViewportResize = (): void => {
    this.syncResponsiveMode();
    this.syncResponsiveColumns();
    this.syncResponsiveOverflow();
  };

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

  protected override firstUpdated(): void {
    this.setupResizeObserver();
    window.addEventListener("resize", this.handleViewportResize);
    queueMicrotask(() => {
      this.syncResponsiveMode();
      this.syncResponsiveColumns();
      this.syncResponsiveOverflow();
    });
  }

  override disconnectedCallback(): void {
    window.removeEventListener("resize", this.handleViewportResize);
    this.resizeObserver?.disconnect();
    this.resizeObserver = undefined;
    super.disconnectedCallback();
  }

  protected override render() {
    const filteredRows = this.filteredRows;
    const renderedColumns = this.renderedColumns;
    const visibleRows = this.visibleRows;
    const visibleColumns = renderedColumns.map((entry) => entry.column);
    const totalPages = this.totalPages;
    const showPagination = !this.loading && totalPages > 1;
    const columnCount = visibleColumns.length + (this.expandableRows ? 1 : 0);

    return html`
      <div class="surface" part="surface">
        ${this.searchable
          ? html`
              <div class="toolbar" part="toolbar">
                <cindor-search
                  part="search"
                  aria-label=${this.searchLabel}
                  placeholder=${this.searchPlaceholder}
                  .value=${this.searchQuery}
                  @input=${this.handleSearchInput}
                ></cindor-search>
                <p class="summary" part="summary" aria-live="polite">${this.summaryText(filteredRows.length, visibleRows.length)}</p>
              </div>
            `
          : nothing}
        <div
          class="table-region"
          part="table-region"
          data-mobile-layout=${String(this.mobileLayoutActive)}
          data-overflow-start=${String(this.overflowStartVisible)}
          data-overflow-end=${String(this.overflowEndVisible)}
          @scroll=${this.handleTableRegionScroll}
        >
          <table part="table">
            <colgroup>
              ${renderedColumns.map(
                ({ column }) => html`<col style=${this.columnWidthStyle(column)} />`
              )}
            </colgroup>
            ${this.caption ? html`<caption part="caption">${this.caption}</caption>` : nothing}
            <thead part="head">
              <tr part="head-row">
                ${this.expandableRows
                  ? html`
                      <th part="head-cell head-cell-expansion" scope="col">
                        <span class="visually-hidden">${this.rowExpansionLabel}</span>
                      </th>
                    `
                  : nothing}
                ${renderedColumns.map(({ column, stickyOffset }) => {
                  const active = column.key === this.sortKey;

                  return html`
                    <th
                      part=${stickyOffset ? "head-cell head-cell-sticky" : "head-cell"}
                      scope="col"
                      data-align=${this.columnAlign(column)}
                      data-sticky=${stickyOffset ? "start" : nothing}
                      aria-sort=${column.sortable ? (active ? this.sortDirection : "none") : nothing}
                      style=${this.columnCellStyle(column, stickyOffset)}
                    >
                      ${this.renderHeaderCell(column, active)}
                    </th>
                  `;
                })}
              </tr>
            </thead>
            <tbody part="body">
              ${this.loading
                ? html`
                    <tr part="row">
                      <td class="message" part="cell message" colspan=${String(Math.max(columnCount, 1))}>Loading rows...</td>
                    </tr>
                  `
                : visibleRows.length === 0
                  ? html`
                      <tr part="row">
                        <td class="message" part="cell message" colspan=${String(Math.max(columnCount, 1))}>${this.emptyMessage}</td>
                      </tr>
                    `
                  : visibleRows.map((row, visibleIndex) => {
                      const rowIndex = this.getRowIndex(row, visibleIndex);
                      const rowId = this.getRowId(row, rowIndex);
                      const expandDetail = this.createRowExpandDetail(row, rowId, rowIndex);
                      const expansionRowId = this.getExpansionRowId(rowId);

                      return [
                        html`
                          <tr part="row" data-row-id=${rowId} data-expanded=${String(expandDetail.expanded)}>
                            ${this.expandableRows
                              ? html`
                                  <td part="cell cell-expansion-toggle" class="cell" data-column-label=${this.rowExpansionLabel}>
                                    <button
                                      class="row-toggle-button"
                                      type="button"
                                      part="row-toggle-button"
                                      aria-controls=${expansionRowId}
                                      aria-expanded=${String(expandDetail.expanded)}
                                      aria-label=${this.rowExpansionButtonLabel(expandDetail)}
                                      @click=${() => this.toggleRowExpansion(expandDetail)}
                                    >
                                      <span aria-hidden="true">${expandDetail.expanded ? "−" : "+"}</span>
                                    </button>
                                  </td>
                                `
                              : nothing}
                            ${renderedColumns.map(({ column, stickyOffset }) => {
                              const detail = this.createCellDetail(column, row, rowId, rowIndex);

                              return html`
                                <td
                                  part=${stickyOffset ? "cell cell-sticky" : "cell"}
                                  class="cell"
                                  data-align=${this.columnAlign(column)}
                                  data-column-label=${this.columnMobileLabel(column) ?? nothing}
                                  data-sticky=${stickyOffset ? "start" : nothing}
                                  style=${this.columnCellStyle(column, stickyOffset)}
                                >
                                  ${this.renderCell(detail)}
                                </td>
                              `;
                            })}
                          </tr>
                        `,
                        this.expandableRows && expandDetail.expanded
                          ? html`
                              <tr part="row expansion-row" data-expansion-row="true" id=${expansionRowId}>
                                <td class="row-expansion-cell" part="expansion-cell" colspan=${String(Math.max(columnCount, 1))}>
                                  <div class="row-expansion-content" part="expansion-content">
                                    ${this.renderRowExpansion(expandDetail)}
                                  </div>
                                </td>
                              </tr>
                            `
                          : nothing
                      ];
                    })}
            </tbody>
          </table>
        </div>
        ${this.overflowHintVisible
          ? html`<div class="overflow-hint" part="overflow-hint">Scroll horizontally to view more columns.</div>`
          : nothing}
        ${showPagination
          ? html`
              <div class="footer" part="footer">
                ${this.searchable ? nothing : html`<p class="summary" part="summary" aria-live="polite">${this.summaryText(filteredRows.length, visibleRows.length)}</p>`}
                <cindor-pagination
                  part="pagination"
                  aria-label="Table pagination"
                  current-page=${String(this.currentPage)}
                  max-visible-pages="5"
                  total-pages=${String(totalPages)}
                  @change=${this.handlePaginationChange}
                ></cindor-pagination>
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

  private renderHeaderCell(column: DataTableColumn, active: boolean) {
    if (!column.sortable) {
      return this.renderHeaderLabel(column);
    }

    const ariaLabel = this.columnAccessibleHeaderLabel(column);

    return html`
      <button
        class="sort-button"
        type="button"
        part="sort-button"
        aria-label=${ariaLabel || nothing}
        @click=${() => this.toggleSort(column)}
      >
        ${this.renderHeaderLabel(column)}
        <span aria-hidden="true">${active ? (this.sortDirection === "ascending" ? "↑" : "↓") : "↕"}</span>
      </button>
    `;
  }

  private renderHeaderLabel(column: DataTableColumn) {
    const headerLabel = this.columnAccessibleHeaderLabel(column);

    if (!headerLabel) {
      return nothing;
    }

    if (this.columnHeaderDisplay(column) === "visible") {
      return html`<span>${this.columnVisibleHeaderLabel(column)}</span>`;
    }

    return html`<span class="visually-hidden">${headerLabel}</span>`;
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

    return html`<cindor-tooltip text=${tooltipText}>${content}</cindor-tooltip>`;
  }

  private renderActionButton(detail: DataTableCellRenderDetail, action: DataTableRowAction) {
    const disabled = this.resolveActionDisabled(action, detail);

    if (action.icon && action.label === "") {
      return html`
        <cindor-icon-button
          ?disabled=${disabled}
          label=${action.key}
          name=${action.icon}
          @click=${() => this.handleRowAction(detail, action)}
        ></cindor-icon-button>
      `;
    }

    return html`
      <cindor-button
        ?disabled=${disabled}
        type="button"
        variant=${action.variant ?? "ghost"}
        @click=${() => this.handleRowAction(detail, action)}
      >
        ${action.icon ? html`<cindor-icon slot="start-icon" name=${action.icon}></cindor-icon>` : nothing}
        ${action.label}
      </cindor-button>
    `;
  }

  private renderCellEditor(detail: DataTableCellRenderDetail) {
    const editor = detail.column.editor;
    if (!editor) {
      return nothing;
    }

    const disabled = this.resolveEditorDisabled(editor, detail);
    const columnLabel = this.columnAccessibleHeaderLabel(detail.column) || detail.column.key;
    const ariaLabel = `${columnLabel} for row ${detail.rowId}`;

    if (editor.type === "input") {
      return html`
        <cindor-input
          class="cell-editor"
          aria-label=${ariaLabel}
          autocomplete=${editor.autocomplete ?? ""}
          ?disabled=${disabled}
          placeholder=${editor.placeholder ?? ""}
          .value=${this.normalizeTextValue(detail.value)}
          @change=${(event: Event) => this.handleTextEditorChange(detail, event)}
        ></cindor-input>
      `;
    }

    if (editor.type === "select") {
      const options = typeof editor.options === "function" ? editor.options(detail) : editor.options;

      return html`
        <cindor-select
          class="cell-editor"
          aria-label=${ariaLabel}
          ?disabled=${disabled}
          .value=${this.normalizeTextValue(detail.value)}
          @change=${(event: Event) => this.handleSelectEditorChange(detail, event)}
        >
          ${options.map((option) => html`<option value=${option.value}>${option.label}</option>`)}
        </cindor-select>
      `;
    }

    return html`
      <cindor-switch
        aria-label=${ariaLabel}
        ?checked=${Boolean(detail.value)}
        ?disabled=${disabled}
        @change=${(event: Event) => this.handleSwitchEditorChange(detail, event)}
      ></cindor-switch>
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

  private createRowExpandDetail(row: DataTableRow, rowId: string, rowIndex: number): DataTableRowExpandDetail {
    return {
      expanded: this.expandedRowIds.includes(rowId),
      row,
      rowId,
      rowIndex,
      table: this
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

  private renderRowExpansion(detail: DataTableRowExpandDetail) {
    const slotName = this.getRowExpansionSlotName(detail.rowId);
    const renderedContent = this.rowExpansionRenderer ? this.rowExpansionRenderer(detail) : nothing;

    if (!slotName) {
      return renderedContent;
    }

    return html`<slot name=${slotName}>${renderedContent}</slot>`;
  }

  private canExpandRow(): boolean {
    return this.expandableRows;
  }

  private getRowExpansionSlotName(rowId: string): string | null {
    const baseName = this.rowExpansionSlot.trim();
    return baseName ? `${baseName}-${rowId}` : null;
  }

  private getExpansionRowId(rowId: string): string {
    return `row-expansion-${rowId}`;
  }

  private rowExpansionButtonLabel(detail: DataTableRowExpandDetail): string {
    const primaryColumn = this.columns[0];
    const primaryValue = primaryColumn ? this.formatCellValue(detail.row[primaryColumn.key]) : "";
    const rowLabel = primaryValue || detail.rowId;
    return `${detail.expanded ? "Collapse" : "Expand"} ${this.rowExpansionLabel.toLocaleLowerCase()} for ${rowLabel}`;
  }

  private toggleRowExpansion(detail: DataTableRowExpandDetail): void {
    if (!this.canExpandRow()) {
      return;
    }

    const expandedRowIds = detail.expanded
      ? this.expandedRowIds.filter((rowId) => rowId !== detail.rowId)
      : [...this.expandedRowIds, detail.rowId];

    this.expandedRowIds = expandedRowIds;
    const nextDetail = { ...detail, expanded: !detail.expanded };
    this.dispatchEvent(
      new CustomEvent<DataTableRowExpandEventDetail>("row-expand", {
        bubbles: true,
        composed: true,
        detail: {
          ...nextDetail,
          expandedRowIds
        }
      })
    );
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

  protected override updated(): void {
    queueMicrotask(() => {
      this.syncResponsiveMode();
      this.syncResponsiveColumns();
      this.syncResponsiveOverflow();
    });
  }

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

  private columnAccessibleHeaderLabel(column: DataTableColumn): string {
    const headerLabel = column.headerLabel?.trim();
    return headerLabel && headerLabel.length > 0 ? headerLabel : column.label.trim();
  }

  private columnHeaderDisplay(column: DataTableColumn): DataTableHeaderDisplay {
    return column.headerDisplay ?? "visible";
  }

  private columnMobileLabel(column: DataTableColumn): string | null {
    if (this.columnHeaderDisplay(column) === "none") {
      return null;
    }

    const label = this.columnAccessibleHeaderLabel(column);
    return label ? label : null;
  }

  private columnVisibleHeaderLabel(column: DataTableColumn): string {
    const visibleLabel = column.label.trim();
    return visibleLabel || this.columnAccessibleHeaderLabel(column);
  }

  private columnWidthStyle(column: DataTableColumn): string {
    const minWidth = column.minWidth ?? column.width ?? "var(--cindor-data-table-column-min-width)";
    const styles = [`min-width:${minWidth};`];

    if (column.width) {
      styles.push(`width:${column.width};max-width:${column.width};`);
    }

    return styles.join("");
  }

  private cellContentStyle(column: DataTableColumn): string {
    if (!column.width) {
      return "";
    }

    return `max-width:${column.width};`;
  }

  private handleTableRegionScroll = (): void => {
    this.syncResponsiveOverflow();
  };

  private setupResizeObserver(): void {
    if (this.resizeObserver || typeof ResizeObserver !== "function") {
      return;
    }

    this.resizeObserver = new ResizeObserver(() => {
      this.syncResponsiveColumns();
      this.syncResponsiveOverflow();
    });
    this.resizeObserver.observe(this);

    const region = this.tableRegionElement;
    if (region) {
      this.resizeObserver.observe(region);
    }
  }

  private syncResponsiveOverflow(): void {
    if (this.mobileLayoutActive) {
      this.updateOverflowState(false, false, false);
      return;
    }

    const region = this.tableRegionElement;
    if (!region) {
      this.updateOverflowState(false, false, false);
      return;
    }

    const maxScrollLeft = Math.max(region.scrollWidth - region.clientWidth, 0);
    const hasOverflow = maxScrollLeft > 1;
    const showStart = hasOverflow && region.scrollLeft > 1;
    const showEnd = hasOverflow && region.scrollLeft < maxScrollLeft - 1;

    this.updateOverflowState(hasOverflow, showStart, showEnd);
  }

  private syncResponsiveColumns(): void {
    const width = this.viewportWidth;
    const nextHiddenColumnKeys = this.getResponsiveHiddenColumnKeys(width);

    if (
      this.hiddenResponsiveColumnKeys.length === nextHiddenColumnKeys.length &&
      this.hiddenResponsiveColumnKeys.every((key, index) => key === nextHiddenColumnKeys[index])
    ) {
      return;
    }

    this.hiddenResponsiveColumnKeys = nextHiddenColumnKeys;
    this.requestUpdate();
  }

  private getResponsiveHiddenColumnKeys(width: number): string[] {
    if (width <= 0 || width <= MOBILE_COLUMN_PRIORITY_BREAKPOINT) {
      return [];
    }

    const priorityThreshold = width <= TABLET_COLUMN_PRIORITY_BREAKPOINT ? 2 : Number.POSITIVE_INFINITY;

    return this.columns
      .filter((column) => typeof column.priority === "number" && column.priority > priorityThreshold)
      .map((column) => column.key);
  }

  private syncResponsiveMode(): void {
    const nextMobileLayoutActive = this.viewportWidth > 0 && this.viewportWidth <= MOBILE_COLUMN_PRIORITY_BREAKPOINT;

    if (this.mobileLayoutActive === nextMobileLayoutActive) {
      return;
    }

    this.mobileLayoutActive = nextMobileLayoutActive;
    this.requestUpdate();
  }

  private updateOverflowState(hintVisible: boolean, startVisible: boolean, endVisible: boolean): void {
    if (
      this.overflowHintVisible === hintVisible &&
      this.overflowStartVisible === startVisible &&
      this.overflowEndVisible === endVisible
    ) {
      return;
    }

    this.overflowHintVisible = hintVisible;
    this.overflowStartVisible = startVisible;
    this.overflowEndVisible = endVisible;
    this.requestUpdate();
  }

  private get tableRegionElement(): HTMLElement | null {
    return this.renderRoot.querySelector('[part="table-region"]');
  }

  private get viewportWidth(): number {
    if (typeof window !== "undefined") {
      return window.innerWidth;
    }

    return this.clientWidth || this.tableRegionElement?.clientWidth || 0;
  }

  private get visibleColumns(): DataTableColumn[] {
    if (this.hiddenResponsiveColumnKeys.length === 0) {
      return this.columns;
    }

    return this.columns.filter((column) => !this.hiddenResponsiveColumnKeys.includes(column.key));
  }

  private get renderedColumns(): DataTableRenderedColumn[] {
    let stickyOffset = "0px";

    return this.visibleColumns.map((column) => {
      const nextColumn: DataTableRenderedColumn = {
        column,
        stickyOffset: column.sticky === "start" ? stickyOffset : null
      };

      if (column.sticky === "start") {
        stickyOffset = `calc(${stickyOffset} + ${this.stickyColumnWidth(column)})`;
      }

      return nextColumn;
    });
  }

  private columnCellStyle(column: DataTableColumn, stickyOffset: string | null): string {
    const baseStyle = this.columnWidthStyle(column);

    if (!stickyOffset) {
      return baseStyle;
    }

    return `${baseStyle}--cindor-data-table-sticky-offset:${stickyOffset};`;
  }

  private stickyColumnWidth(column: DataTableColumn): string {
    return column.width ?? column.minWidth ?? "var(--cindor-data-table-column-min-width)";
  }
}
