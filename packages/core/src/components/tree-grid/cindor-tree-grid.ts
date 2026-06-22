import { css, html, LitElement } from "lit";

import type {
  DataTableCellRenderDetail,
  DataTableColumn,
  DataTableDensity,
  DataTablePageChangeDetail,
  DataTableRow,
  DataTableSearchChangeDetail,
  DataTableSortComparator,
  DataTableSortDirection,
  DataTableSortValueAccessor
} from "../data-table/cindor-data-table.js";

const TREE_ORDER_KEY = "__cindorTreeGridOrder";
const TREE_INDENT_KEY = "__cindorTreeGridIndent";
const TREE_HAS_CHILDREN_KEY = "__cindorTreeGridHasChildren";
const TREE_EXPANDED_KEY = "__cindorTreeGridExpanded";

type TreeGridInternalRow = DataTableRow & {
  [TREE_EXPANDED_KEY]: boolean;
  [TREE_HAS_CHILDREN_KEY]: boolean;
  [TREE_INDENT_KEY]: number;
  [TREE_ORDER_KEY]: number;
};

export type TreeGridRow = DataTableRow & {
  children?: TreeGridRow[];
};

export type TreeGridToggleDetail = {
  expanded: boolean;
  expandedRowIds: string[];
  hasChildren: boolean;
  level: number;
  row: TreeGridRow;
  rowId: string;
  rowIndex: number;
};

/**
 * Hierarchical table surface that composes the shared data-table behaviors.
 *
 * @summary Tree-aware table for nested operational data.
 * @tag cindor-tree-grid
 * @fires {CustomEvent<DataTablePageChangeDetail>} page-change - Fired when the current page changes.
 * @fires {CustomEvent<DataTableSearchChangeDetail>} search-change - Fired when the search query changes.
 * @fires {CustomEvent<{ sortDirection: DataTableSortDirection; sortKey: string }>} sort-change - Fired when the active sort column or direction changes.
 * @fires {CustomEvent<TreeGridToggleDetail>} row-toggle - Fired when a branch row expands or collapses.
 */
export class CindorTreeGrid extends LitElement {
  static styles = css`
    :host {
      display: block;
      --cindor-tree-grid-indent-step: 1rem;
    }

    .tree-cell {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      min-width: 0;
    }

    .tree-indent {
      flex: 0 0 auto;
      inline-size: calc(max(var(--cindor-tree-grid-level, 1) - 1, 0) * var(--cindor-tree-grid-indent-step));
      block-size: 1px;
    }

    .tree-toggle,
    .tree-spacer {
      flex: 0 0 auto;
      inline-size: 1.75rem;
      block-size: 1.75rem;
    }

    .tree-toggle {
      display: inline-grid;
      place-items: center;
      padding: 0;
      border: 1px solid var(--border-strong);
      border-radius: var(--radius-sm);
      background: color-mix(in srgb, var(--bg-subtle) 72%, var(--surface));
      color: var(--fg);
      font: inherit;
      line-height: 1;
      cursor: pointer;
      transition:
        background var(--duration-base) var(--ease-out),
        border-color var(--duration-base) var(--ease-out);
    }

    .tree-toggle:hover {
      background: color-mix(in srgb, var(--accent-muted) 35%, var(--surface));
      border-color: color-mix(in srgb, var(--accent) 45%, var(--border-strong));
    }

    .tree-toggle:focus-visible {
      outline: none;
      box-shadow: var(--ring-focus);
    }

    .tree-label {
      min-width: 0;
      flex: 1 1 auto;
    }
  `;

  static properties = {
    caption: { reflect: true },
    columns: { attribute: false },
    currentPage: { type: Number, reflect: true, attribute: "current-page" },
    density: { reflect: true },
    emptyMessage: { reflect: true, attribute: "empty-message" },
    expandedRowIds: { attribute: false },
    loading: { type: Boolean, reflect: true },
    pageSize: { type: Number, reflect: true, attribute: "page-size" },
    rowChildrenKey: { reflect: true, attribute: "row-children-key" },
    rowIdKey: { reflect: true, attribute: "row-id-key" },
    rows: { attribute: false },
    searchable: { type: Boolean, reflect: true },
    searchLabel: { reflect: true, attribute: "search-label" },
    searchPlaceholder: { reflect: true, attribute: "search-placeholder" },
    searchQuery: { reflect: true, attribute: "search-query" },
    sortDirection: { reflect: true, attribute: "sort-direction" },
    sortKey: { reflect: true, attribute: "sort-key" },
    treeColumnKey: { reflect: true, attribute: "tree-column-key" },
    treeToggleLabel: { reflect: true, attribute: "tree-toggle-label" }
  };

  caption = "";
  columns: DataTableColumn[] = [];
  currentPage = 1;
  density: DataTableDensity = "comfortable";
  emptyMessage = "No rows to display.";
  expandedRowIds: string[] = [];
  loading = false;
  pageSize = 0;
  rowChildrenKey = "children";
  rowIdKey = "id";
  rows: TreeGridRow[] = [];
  searchable = false;
  searchLabel = "Search rows";
  searchPlaceholder = "Search rows";
  searchQuery = "";
  sortDirection: DataTableSortDirection = "ascending";
  sortKey = "";
  treeColumnKey = "";
  treeToggleLabel = "Children";

  protected override render() {
    return html`
      <cindor-data-table
        caption=${this.caption}
        .columns=${this.renderedColumns}
        current-page=${String(this.currentPage)}
        density=${this.density}
        empty-message=${this.emptyMessage}
        ?loading=${this.loading}
        page-size=${String(this.pageSize)}
        row-id-key=${this.rowIdKey}
        .rows=${this.flattenedRows}
        ?searchable=${this.searchable}
        search-label=${this.searchLabel}
        search-placeholder=${this.searchPlaceholder}
        search-query=${this.searchQuery}
        sort-direction=${this.sortDirection}
        sort-key=${this.sortKey}
        @page-change=${this.handlePageChange}
        @search-change=${this.handleSearchChange}
        @sort-change=${this.handleSortChange}
      ></cindor-data-table>
    `;
  }

  private handlePageChange = (event: Event): void => {
    const detail = (event as CustomEvent<DataTablePageChangeDetail>).detail;
    this.currentPage = detail.currentPage;
  };

  private handleSearchChange = (event: Event): void => {
    const detail = (event as CustomEvent<DataTableSearchChangeDetail>).detail;
    this.searchQuery = detail.searchQuery;
  };

  private handleSortChange = (event: Event): void => {
    const detail = (event as CustomEvent<{ sortDirection: DataTableSortDirection; sortKey: string }>).detail;
    this.sortDirection = detail.sortDirection;
    this.sortKey = detail.sortKey;
  };

  private get hierarchyColumnKey(): string {
    if (this.treeColumnKey.trim() !== "") {
      return this.treeColumnKey;
    }

    return this.columns[0]?.key ?? "";
  }

  private get flattenedRows(): TreeGridInternalRow[] {
    const rows = this.sortRows(this.rows);
    const flattened: TreeGridInternalRow[] = [];
    let order = 0;

    const visit = (entries: TreeGridRow[], level: number): void => {
      for (const row of entries) {
        const children = this.childRows(row);
        const rowId = this.getRowId(row);
        const expanded = children.length > 0 && this.expandedRowIds.includes(rowId);
        flattened.push({
          ...row,
          [TREE_EXPANDED_KEY]: expanded,
          [TREE_HAS_CHILDREN_KEY]: children.length > 0,
          [TREE_INDENT_KEY]: level,
          [TREE_ORDER_KEY]: order++
        });

        if (expanded) {
          visit(this.sortRows(children), level + 1);
        }
      }
    };

    visit(rows, 1);
    return flattened;
  }

  private get renderedColumns(): DataTableColumn[] {
    return this.columns.map((column) => {
      const stableComparator: DataTableSortComparator = (_leftValue, _rightValue, detail) =>
        Number((detail.leftRow as TreeGridInternalRow)[TREE_ORDER_KEY] ?? 0) -
        Number((detail.rightRow as TreeGridInternalRow)[TREE_ORDER_KEY] ?? 0);

      if (column.key !== this.hierarchyColumnKey) {
        return column.sortable ? { ...column, sortComparator: stableComparator } : column;
      }

      const originalCellRenderer = column.cellRenderer;
      return {
        ...column,
        cellRenderer: (detail: DataTableCellRenderDetail) => this.renderTreeCell(detail, originalCellRenderer),
        sortComparator: column.sortable ? stableComparator : column.sortComparator
      };
    });
  }

  private renderTreeCell(
    detail: DataTableCellRenderDetail,
    originalCellRenderer: DataTableColumn["cellRenderer"]
  ) {
    const row = detail.row as TreeGridInternalRow;
    const level = Number(row[TREE_INDENT_KEY] ?? 1);
    const hasChildren = Boolean(row[TREE_HAS_CHILDREN_KEY]);
    const expanded = Boolean(row[TREE_EXPANDED_KEY]);
    const rowId = this.getRowId(detail.row as TreeGridRow);
    const label = originalCellRenderer ? originalCellRenderer(detail) : this.formatValue(detail.value);

    return html`
      <div class="tree-cell" part="tree-cell">
        <span class="tree-indent" style=${`--cindor-tree-grid-level:${level};`}></span>
        ${
          hasChildren
            ? html`
                <button
                  aria-expanded=${String(expanded)}
                  aria-label=${expanded ? `Collapse ${this.treeToggleLabel.toLocaleLowerCase()}` : `Expand ${this.treeToggleLabel.toLocaleLowerCase()}`}
                  class="tree-toggle"
                  part="tree-toggle"
                  type="button"
                  @click=${() => this.toggleRow(detail.row as TreeGridRow, rowId, level)}
                >
                  <span aria-hidden="true">${expanded ? "−" : "+"}</span>
                </button>
              `
            : html`<span aria-hidden="true" class="tree-spacer"></span>`
        }
        <span class="tree-label">${label}</span>
      </div>
    `;
  }

  private toggleRow(row: TreeGridRow, rowId: string, level: number): void {
    const hasChildren = this.childRows(row).length > 0;
    if (!hasChildren) {
      return;
    }

    const expanded = this.expandedRowIds.includes(rowId);
    const rowIndex = this.flattenedRows.findIndex((entry) => this.getRowId(entry) === rowId);
    this.expandedRowIds = expanded
      ? this.expandedRowIds.filter((value) => value !== rowId)
      : [...this.expandedRowIds, rowId];

    this.dispatchEvent(
      new CustomEvent<TreeGridToggleDetail>("row-toggle", {
        bubbles: true,
        composed: true,
        detail: {
          expanded: !expanded,
          expandedRowIds: this.expandedRowIds,
          hasChildren,
          level,
          row,
          rowId,
          rowIndex
        }
      })
    );
  }

  private sortRows(rows: TreeGridRow[]): TreeGridRow[] {
    const column = this.columns.find((entry) => entry.key === this.sortKey && entry.sortable);
    if (!column) {
      return [...rows];
    }

    return [...rows].sort((left, right) => {
      const leftValue = this.getSortValue(column, left, rows.indexOf(left));
      const rightValue = this.getSortValue(column, right, rows.indexOf(right));
      const comparison = column.sortComparator
        ? column.sortComparator(leftValue, rightValue, {
            column,
            leftRow: left,
            rightRow: right,
            table: null as never
          })
        : this.defaultSortComparison(leftValue, rightValue);

      return this.sortDirection === "ascending" ? comparison : -comparison;
    });
  }

  private getSortValue(column: DataTableColumn, row: TreeGridRow, rowIndex: number): unknown {
    const accessor = column.sortValue as DataTableSortValueAccessor | undefined;
    return accessor ? accessor(row, { column, rowIndex, table: null as never }) : row[column.key];
  }

  private defaultSortComparison(leftValue: unknown, rightValue: unknown): number {
    const leftString = this.formatValue(leftValue);
    const rightString = this.formatValue(rightValue);
    return leftString.localeCompare(rightString, undefined, { numeric: true, sensitivity: "base" });
  }

  private childRows(row: TreeGridRow): TreeGridRow[] {
    const children = row[this.rowChildrenKey];
    return Array.isArray(children) ? (children as TreeGridRow[]) : [];
  }

  private getRowId(row: TreeGridRow): string {
    const value = row[this.rowIdKey];
    return value === null || value === undefined || value === "" ? this.formatValue(row[this.hierarchyColumnKey]) : String(value);
  }

  private formatValue(value: unknown): string {
    if (value === null || value === undefined) {
      return "";
    }

    return String(value);
  }
}
