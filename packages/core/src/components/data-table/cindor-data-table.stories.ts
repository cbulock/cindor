import { html } from "lit";

import type { DataTableColumn, DataTableRow } from "./cindor-data-table.js";

type DataTableStoryArgs = {
  caption: string;
  currentPage: number;
  loading: boolean;
  pageSize: number;
  searchable: boolean;
  searchQuery: string;
};

const columns: DataTableColumn[] = [
  { key: "name", label: "Name", sortable: true },
  { key: "role", label: "Role", sortable: true },
  { key: "tickets", label: "Open tickets", numeric: true, sortable: true }
];

const rows: DataTableRow[] = [
  { id: "avery", name: "Avery Smith", role: "Support", tickets: 12 },
  { id: "jordan", name: "Jordan Lee", role: "Operations", tickets: 4 },
  { id: "morgan", name: "Morgan Diaz", role: "Design", tickets: 7 },
  { id: "taylor", name: "Taylor Chen", role: "Success", tickets: 9 },
  { id: "riley", name: "Riley Patel", role: "Engineering", tickets: 2 },
  { id: "parker", name: "Parker Nguyen", role: "Finance", tickets: 6 },
  { id: "jamie", name: "Jamie Torres", role: "Support", tickets: 5 }
];

const parityColumns: DataTableColumn[] = [
  {
    key: "name",
    label: "Owner",
    sortable: true,
    tooltip: true,
    truncate: true,
    width: "12rem"
  },
  {
    key: "status",
    label: "Status",
    sortable: true,
    cellRenderer: ({ value }) =>
      html`<cindor-badge tone=${value === "Escalated" ? "warning" : "info"}>${String(value)}</cindor-badge>`
  },
  {
    key: "priority",
    label: "Priority",
    sortable: true,
    sortComparator: (left, right) => String(left).localeCompare(String(right)),
    editor: {
      type: "select",
      options: [
        { label: "Low", value: "Low" },
        { label: "Medium", value: "Medium" },
        { label: "High", value: "High" }
      ]
    }
  },
  {
    key: "active",
    label: "Active",
    align: "center",
    editor: { type: "switch" }
  },
  {
    key: "actions",
    label: "Actions",
    actions: [
      { key: "open", label: "Open" },
      { key: "assign", label: "Assign", variant: "solid" }
    ]
  }
];

const parityRows: DataTableRow[] = [
  { id: "ticket-101", name: "Jordan Lee", status: "Open", priority: "High", active: true },
  { id: "ticket-102", name: "Avery Smith", status: "Escalated", priority: "Medium", active: true },
  { id: "ticket-103", name: "Morgan Diaz", status: "Pending", priority: "Low", active: false }
];

const meta = {
  title: "Composites/Data Table",
  args: {
    caption: "Team workload",
    currentPage: 1,
    loading: false,
    pageSize: 4,
    searchable: true,
    searchQuery: ""
  },
  render: ({ caption, currentPage, loading, pageSize, searchable, searchQuery }: DataTableStoryArgs) => html`
    <cindor-data-table
      .columns=${columns}
      .rows=${rows.map((row) => ({ ...row }))}
      caption=${caption}
      current-page=${String(currentPage)}
      page-size=${String(pageSize)}
      search-query=${searchQuery}
      ?loading=${loading}
      ?searchable=${searchable}
      sort-key="name"
    ></cindor-data-table>
  `
};

export default meta;

export const Default = {};

export const Loading = {
  args: {
    loading: true
  }
};

export const Filtered = {
  args: {
    searchQuery: "support"
  }
};

export const CustomCellsAndEditors = {
  render: () => html`
    <cindor-data-table
      caption="Interactive admin table"
      .columns=${parityColumns}
      .rows=${parityRows.map((row) => ({ ...row }))}
      page-size="0"
      searchable
      sort-key="name"
    ></cindor-data-table>
  `
};

export const SlotBackedCells = {
  render: () => html`
    <cindor-data-table
      caption="Slot-backed escalation badges"
      .columns=${[
        { key: "name", label: "Owner" },
        { key: "status", label: "Status", cellSlot: "status-cell" }
      ]}
      .rows=${[
        { id: "ticket-201", name: "Riley Patel", status: "Open" },
        { id: "ticket-202", name: "Jamie Torres", status: "Escalated" }
      ]}
      page-size="0"
      row-id-key="id"
    >
      <cindor-chip slot="status-cell-ticket-201" tone="info">Open</cindor-chip>
      <cindor-chip slot="status-cell-ticket-202" tone="warning">Escalated</cindor-chip>
    </cindor-data-table>
  `
};
