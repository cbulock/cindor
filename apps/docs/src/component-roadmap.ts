export type PlannedComponentStatus = "shipped" | "next" | "queued";

export type PlannedComponent = {
  order: number;
  phase: string;
  rationale: string;
  slug: string;
  status: PlannedComponentStatus;
  summary: string;
  title: string;
};

export const plannedComponents: PlannedComponent[] = [
  {
    order: 1,
    phase: "Collection foundations",
    rationale: "Large record sets already show up across admin and internal tools, and the current catalog has no purpose-built virtualization surface.",
    slug: "virtual-list",
    status: "shipped",
    summary: "Render very large lists efficiently without forcing teams to hand-roll virtualization around raw scroll containers.",
    title: "Virtual list"
  },
  {
    order: 2,
    phase: "Collection foundations",
    rationale: "Teams need drag-to-reorder patterns for rankings, navigation, playlists, and configuration sections without inventing a custom interaction every time.",
    slug: "sortable-list",
    status: "shipped",
    summary: "Provide a standards-based reorderable list primitive for drag and keyboard sorting workflows.",
    title: "Sortable list"
  },
  {
    order: 3,
    phase: "Collection foundations",
    rationale: "Dynamic repeated form groups are common in addresses, rules, links, and team-member editors, but the current form surface stops at individual fields and rows.",
    slug: "field-array",
    status: "shipped",
    summary: "Add a reusable repeated-field workflow for create and edit flows that need append, remove, and reorder behavior.",
    title: "Field array"
  },
  {
    order: 4,
    phase: "Dense data workbenches",
    rationale: "Data-heavy tools eventually outgrow `data-table` and need editable cells, keyboard movement, bulk paste, and pinned columns.",
    slug: "data-grid",
    status: "shipped",
    summary: "Introduce spreadsheet-like editing for dense operational tools and bulk management surfaces.",
    title: "Data grid"
  },
  {
    order: 5,
    phase: "Dense data workbenches",
    rationale: "Cindor already has `tree-view` and `data-table`; combining those patterns would unlock file explorers, outlines, and nested admin data.",
    slug: "tree-grid",
    status: "shipped",
    summary: "Blend hierarchical disclosure with columnar data so nested records stay explorable in-place.",
    title: "Tree grid"
  },
  {
    order: 6,
    phase: "Workspace and authoring",
    rationale: "The docs and patterns already talk about projects and workspaces, but there is no first-class shell switcher for moving between them.",
    slug: "workspace-switcher",
    status: "shipped",
    summary: "Create a dedicated workspace and project switcher that fits the existing app-shell story.",
    title: "Workspace switcher"
  },
  {
    order: 7,
    phase: "Workspace and authoring",
    rationale: "Admin and product tooling constantly needs to inspect structured payloads, and a plain code block is not enough for that job.",
    slug: "json-viewer",
    status: "shipped",
    summary: "Expose collapsible structured JSON inspection for payloads, logs, settings, and API responses.",
    title: "JSON viewer"
  },
  {
    order: 8,
    phase: "Workspace and authoring",
    rationale: "The library has strong display surfaces but no authoring surface for changelogs, issue bodies, comments, or internal docs.",
    slug: "markdown-editor",
    status: "next",
    summary: "Add a structured markdown authoring surface that pairs with the current content-display primitives.",
    title: "Markdown editor"
  },
  {
    order: 9,
    phase: "Guidance and onboarding",
    rationale: "The catalog has `tooltip`, `popover`, `banner`, and `dialog`, but nothing for guided onboarding or progressive feature discovery.",
    slug: "coachmark-tour",
    status: "queued",
    summary: "Support guided onboarding and feature discovery without forcing product teams into bespoke walkthrough code.",
    title: "Coachmark tour"
  },
  {
    order: 10,
    phase: "Guidance and onboarding",
    rationale: "Cindor has strong shell and collection pieces, but there is still no first-class board view for task and status management workflows.",
    slug: "kanban-board",
    status: "queued",
    summary: "Add a board-style planning and status surface for operational and product workflow apps.",
    title: "Kanban board"
  }
];
