import { html } from "lit";

import type { DataTableColumn, DataTableRow } from "./emb-data-table.js";

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
  { name: "Avery Smith", role: "Support", tickets: 12 },
  { name: "Jordan Lee", role: "Operations", tickets: 4 },
  { name: "Morgan Diaz", role: "Design", tickets: 7 },
  { name: "Taylor Chen", role: "Success", tickets: 9 },
  { name: "Riley Patel", role: "Engineering", tickets: 2 },
  { name: "Parker Nguyen", role: "Finance", tickets: 6 },
  { name: "Jamie Torres", role: "Support", tickets: 5 }
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
    <emb-data-table
      .columns=${columns}
      .rows=${rows}
      caption=${caption}
      current-page=${String(currentPage)}
      page-size=${String(pageSize)}
      search-query=${searchQuery}
      ?loading=${loading}
      ?searchable=${searchable}
      sort-key="name"
    ></emb-data-table>
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
