import { html } from "lit";

import type { DataTableColumn } from "../data-table/cindor-data-table.js";
import type { TreeGridRow } from "./cindor-tree-grid.js";

const columns: DataTableColumn[] = [
  { key: "name", label: "Name", sortable: true, width: "18rem" },
  { key: "owner", label: "Owner", sortable: true, width: "12rem" },
  { key: "status", label: "Status", sortable: true, width: "10rem" }
];

const rows: TreeGridRow[] = [
  {
    id: "platform",
    name: "Platform",
    owner: "Jordan Lee",
    status: "Active",
    children: [
      { id: "platform-api", name: "API", owner: "Avery Smith", status: "Stable" },
      { id: "platform-auth", name: "Auth", owner: "Riley Patel", status: "Reviewing" }
    ]
  },
  {
    id: "workspace",
    name: "Workspace",
    owner: "Morgan Diaz",
    status: "Planning",
    children: [{ id: "workspace-shell", name: "Shell", owner: "Taylor Chen", status: "Draft" }]
  }
];

const meta = {
  title: "Data/Tree Grid",
  render: () => html`
    <cindor-tree-grid
      caption="Product surface map"
      .columns=${columns}
      .expandedRowIds=${["platform"]}
      .rows=${rows}
      sort-key="name"
      tree-column-key="name"
    ></cindor-tree-grid>
  `
};

export default meta;

export const Default = {};
