import { css, html, LitElement, type PropertyValues } from "lit";

export type DataTableColumn = {
  key: string;
  label: string;
  numeric?: boolean;
  sortable?: boolean;
};

export type DataTableRow = Record<string, unknown>;
export type DataTableSortDirection = "ascending" | "descending";
export type DataTablePageChangeDetail = {
  currentPage: number;
  totalPages: number;
};
export type DataTableSearchChangeDetail = {
  matchingRows: number;
  searchQuery: string;
};

type SearchHost = HTMLElement & { value: string };
type PaginationHost = HTMLElement & { currentPage: number };

/**
 * Searchable, sortable application data table built from native table semantics.
 *
 * @summary Searchable, sortable data table for application records.
 * @tag emb-data-table
 * @fires {CustomEvent<DataTablePageChangeDetail>} page-change - Fired when the current page changes through pagination.
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

    th[data-numeric="true"],
    td[data-numeric="true"] {
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
    rows: { attribute: false },
    searchable: { type: Boolean, reflect: true },
    searchLabel: { reflect: true, attribute: "search-label" },
    searchPlaceholder: { reflect: true, attribute: "search-placeholder" },
    searchQuery: { reflect: true, attribute: "search-query" },
    sortDirection: { reflect: true, attribute: "sort-direction" },
    sortKey: { reflect: true, attribute: "sort-key" }
  };

  /** Caption rendered above the table when provided. */
  caption = "";

  /** Column definitions assigned as a property from JavaScript. */
  columns: DataTableColumn[] = [];

  /** Current 1-based page index. */
  currentPage = 1;

  /** Message shown when no visible rows remain after filtering or loading completes. */
  emptyMessage = "No rows to display.";

  /** Shows the loading state instead of row data. */
  loading = false;

  /** Maximum number of rows shown per page. Set to 0 to disable pagination. */
  pageSize = 10;

  /** Row data assigned as a property from JavaScript. */
  rows: DataTableRow[] = [];

  /** Enables the built-in search toolbar and filtering behavior. */
  searchable = false;

  /** Accessible label applied to the internal search control. */
  searchLabel = "Search rows";

  /** Placeholder text shown in the internal search control. */
  searchPlaceholder = "Search rows";

  /** Current search query used to filter visible rows. */
  searchQuery = "";

  /** Active sort direction for the current sort key. */
  sortDirection: DataTableSortDirection = "ascending";

  /** Column key currently used for sorting. */
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
          : null}
        <div class="table-region" part="table-region">
          <table part="table">
            ${this.caption ? html`<caption part="caption">${this.caption}</caption>` : null}
            <thead part="head">
              <tr part="head-row">
                ${this.columns.map((column) => {
                  const active = column.key === this.sortKey;

                  return html`
                    <th
                      part="head-cell"
                      scope="col"
                      data-numeric=${String(Boolean(column.numeric))}
                      aria-sort=${column.sortable ? (active ? this.sortDirection : "none") : null}
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
                  : visibleRows.map(
                      (row) => html`
                        <tr part="row">
                          ${this.columns.map(
                            (column) => html`
                              <td part="cell" data-numeric=${String(Boolean(column.numeric))}>${this.formatCellValue(row[column.key])}</td>
                            `
                          )}
                        </tr>
                      `
                    )}
            </tbody>
          </table>
        </div>
        ${showPagination
          ? html`
              <div class="footer" part="footer">
                ${this.searchable ? null : html`<p class="summary" part="summary" aria-live="polite">${this.summaryText(filteredRows.length, visibleRows.length)}</p>`}
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
          : null}
      </div>
    `;
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

    return rows.filter((row) =>
      this.columns.some((column) => this.formatCellValue(row[column.key]).toLocaleLowerCase().includes(query))
    );
  }

  private get sortedRows(): DataTableRow[] {
    const rows = [...this.filteredRows];
    const column = this.columns.find((entry) => entry.key === this.sortKey && entry.sortable);

    if (!column) {
      return rows;
    }

    return rows.sort((left, right) => {
      const leftValue = left[column.key];
      const rightValue = right[column.key];
      const leftString = leftValue === null || leftValue === undefined ? "" : String(leftValue);
      const rightString = rightValue === null || rightValue === undefined ? "" : String(rightValue);
      const comparison = leftString.localeCompare(rightString, undefined, { numeric: true, sensitivity: "base" });

      return this.sortDirection === "ascending" ? comparison : -comparison;
    });
  }

  private get visibleRows(): DataTableRow[] {
    if (!this.paginationEnabled) {
      return this.sortedRows;
    }

    const startIndex = (this.currentPage - 1) * this.normalizedPageSize;
    return this.sortedRows.slice(startIndex, startIndex + this.normalizedPageSize);
  }

  private get totalPages(): number {
    if (!this.paginationEnabled) {
      return 1;
    }

    return Math.max(Math.ceil(this.sortedRows.length / this.normalizedPageSize), 1);
  }

  private get paginationEnabled(): boolean {
    return this.normalizedPageSize > 0;
  }

  private get normalizedPageSize(): number {
    return Math.max(Math.floor(this.pageSize) || 0, 0);
  }

  private get clampedCurrentPage(): number {
    return Math.min(Math.max(Math.floor(this.currentPage) || 1, 1), this.totalPages);
  }
}
