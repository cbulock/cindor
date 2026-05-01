import { html } from "lit";

import type { FilterBuilderField } from "./emb-filter-builder.js";

const fields: FilterBuilderField[] = [
  {
    label: "Status",
    options: [
      { label: "Open", value: "open" },
      { label: "Closed", value: "closed" },
      { label: "Escalated", value: "escalated" }
    ],
    type: "select",
    value: "status"
  },
  {
    label: "Priority",
    options: [
      { label: "High", value: "high" },
      { label: "Medium", value: "medium" },
      { label: "Low", value: "low" }
    ],
    type: "select",
    value: "priority"
  },
  {
    label: "Owner",
    placeholder: "Teammate name",
    type: "text",
    value: "owner"
  },
  {
    label: "Created",
    type: "date",
    value: "created"
  }
];

const initialValue = JSON.stringify({
  children: [
    {
      field: "status",
      id: "rule-0",
      operator: "is",
      type: "rule",
      value: "open"
    },
    {
      children: [
        {
          field: "priority",
          id: "rule-1",
          operator: "is",
          type: "rule",
          value: "high"
        },
        {
          field: "owner",
          id: "rule-2",
          operator: "contains",
          type: "rule",
          value: "Cam"
        }
      ],
      id: "group-1",
      logic: "or",
      type: "group"
    }
  ],
  id: "group-0",
  logic: "and",
  type: "group"
});

const meta = {
  title: "Forms/Filter Builder",
  render: () => html`
    <emb-filter-builder
      aria-label="Issue filters"
      .fields=${fields}
      value=${initialValue}
    ></emb-filter-builder>
  `
};

export default meta;

export const Default = {};
