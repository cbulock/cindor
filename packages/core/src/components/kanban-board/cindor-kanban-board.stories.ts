const boardColumns = [
  {
    id: "triage",
    title: "Triage",
    description: "Incoming requests that still need owner and scope.",
    meta: "Updated 8 minutes ago",
    accent: "warning",
    cards: [
      {
        id: "triage-1",
        title: "Review billing edge cases",
        description: "Confirm the retry flow and dispute handoff before release cutover.",
        eyebrow: "Needs owner",
        meta: "2 contributors",
        tags: ["Revenue", "API"],
        actions: [{ key: "assign", label: "Assign" }]
      },
      {
        id: "triage-2",
        title: "Document import limits",
        description: "Capture file-size limits and parser failure recovery in the admin guide.",
        eyebrow: "Docs",
        meta: "Today",
        tags: ["Docs"]
      }
    ]
  },
  {
    id: "building",
    title: "Building",
    description: "Work already in implementation.",
    meta: "Capacity 3",
    accent: "accent",
    limit: 3,
    cards: [
      {
        id: "build-1",
        title: "Ship kanban board preview",
        description: "Wire core component behavior, wrappers, and examples in one pass.",
        eyebrow: "In progress",
        meta: "Design systems",
        tags: ["UI", "Docs"],
        actions: [{ key: "open-pr", label: "Open PR", variant: "solid" }]
      }
    ]
  },
  {
    id: "done",
    title: "Done",
    description: "Recently completed work ready for follow-up.",
    meta: "This week",
    accent: "success",
    cards: [
      {
        id: "done-1",
        title: "Merge workspace switcher",
        description: "Keyboard support, grouped search results, and docs wiring are all in place.",
        eyebrow: "Shipped",
        meta: "Production",
        tags: ["Navigation"]
      }
    ]
  }
];

const meta = {
  title: "Data/Kanban Board",
  render: () => `
    <div style="display:grid;gap:var(--space-4);">
      <cindor-kanban-board id="storybook-kanban-board" selected-card-id="build-1"></cindor-kanban-board>
      <div style="padding:var(--space-3);border:1px solid var(--border);border-radius:var(--radius-xl);background:var(--surface);">
        <strong style="display:block;margin-bottom:var(--space-2);">Latest board event</strong>
        <div id="storybook-kanban-board-event" style="color:var(--fg-muted);font-size:var(--text-sm);">Drag a card to reorder it or move it into another column.</div>
      </div>
    </div>
    <script type="module">
      const board = document.querySelector("#storybook-kanban-board");
      const eventOutput = document.querySelector("#storybook-kanban-board-event");
      board.columns = ${JSON.stringify(boardColumns, null, 2)};
      const renderEvent = (label, detail) => {
        eventOutput.textContent = label + ": " + JSON.stringify(detail);
      };
      board.addEventListener("reorder", (event) => renderEvent("reorder", event.detail));
      board.addEventListener("move", (event) => renderEvent("move", event.detail));
    </script>
  `
};

export default meta;

export const Default = {};
