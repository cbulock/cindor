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
    <cindor-kanban-board id="storybook-kanban-board" selected-card-id="build-1"></cindor-kanban-board>
    <script type="module">
      const board = document.querySelector("#storybook-kanban-board");
      board.columns = ${JSON.stringify(boardColumns, null, 2)};
      board.addEventListener("card-move", (event) => {
        console.log("Card moved", event.detail);
      });
    </script>
  `
};

export default meta;

export const Default = {};
