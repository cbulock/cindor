type SortableListStoryArgs = {
  disabled: boolean;
};

const sampleItems = [
  {
    id: "backlog",
    label: "Backlog grooming",
    description: "Review incoming requests and trim duplicates before triage.",
    meta: "Today"
  },
  {
    id: "design-review",
    label: "Design review",
    description: "Confirm responsive spacing and states before implementation.",
    meta: "Needs review"
  },
  {
    id: "release-checklist",
    label: "Release checklist",
    description: "Verify cutover tasks, rollback notes, and ownership handoff.",
    meta: "Ready"
  }
];

const meta = {
  title: "Data/Sortable List",
  args: {
    disabled: false
  },
  argTypes: {
    disabled: {
      control: "boolean"
    }
  },
  render: ({ disabled }: SortableListStoryArgs) => `
    <cindor-sortable-list id="storybook-sortable-list" ${disabled ? "disabled" : ""}></cindor-sortable-list>
    <script type="module">
      const list = document.querySelector("#storybook-sortable-list");
      list.items = ${JSON.stringify(sampleItems, null, 2)};
    </script>
  `
};

export default meta;

export const Default = {};
