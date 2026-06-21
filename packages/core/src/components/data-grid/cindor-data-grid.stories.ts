const rows = [
  {
    id: "row-1",
    owner: "Release Ops",
    status: "Healthy",
    window: "Today",
    enabled: true
  },
  {
    id: "row-2",
    owner: "Analytics",
    status: "Needs review",
    window: "Tomorrow",
    enabled: false
  },
  {
    id: "row-3",
    owner: "Support",
    status: "Blocked",
    window: "This week",
    enabled: true
  }
];

const columns = [
  { key: "owner", label: "Owner", sticky: "start", width: "16rem" },
  {
    key: "status",
    label: "Status",
    editor: {
      type: "select",
      options: [
        { label: "Healthy", value: "Healthy" },
        { label: "Needs review", value: "Needs review" },
        { label: "Blocked", value: "Blocked" }
      ]
    }
  },
  { key: "window", label: "Window", editor: { type: "input", placeholder: "Delivery window" } },
  { key: "enabled", label: "Enabled", align: "center", editor: { type: "switch" }, width: "8rem" }
];

const meta = {
  title: "Data/Data Grid",
  render: () => `
    <cindor-data-grid id="storybook-data-grid"></cindor-data-grid>
    <script type="module">
      const grid = document.querySelector("#storybook-data-grid");
      grid.columns = ${JSON.stringify(columns, null, 2)};
      grid.rows = ${JSON.stringify(rows, null, 2)};
    </script>
  `
};

export default meta;

export const Default = {};
