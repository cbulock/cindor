type CommandBarStoryArgs = {
  count: number;
  sticky: boolean;
};

const meta = {
  title: "Actions/Command Bar",
  args: {
    count: 3,
    sticky: false
  },
  argTypes: {
    count: {
      control: { type: "number", min: 0, step: 1 }
    },
    sticky: {
      control: "boolean"
    }
  },
  render: ({ count, sticky }: CommandBarStoryArgs) => `
    <emb-command-bar
      label="Bulk actions"
      description="Apply actions to the currently selected records."
      count="${count}"
      ${sticky ? "sticky" : ""}
    >
      <span>${count > 0 ? "Selection updates are applied immediately." : "Choose one or more rows to enable actions."}</span>
      <emb-button slot="actions" variant="ghost">Clear</emb-button>
      <emb-button slot="actions">Archive</emb-button>
    </emb-command-bar>
  `
};

export default meta;

export const Default = {};
