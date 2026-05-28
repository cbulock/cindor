type DataViewToolbarStoryArgs = {
  itemCount: number;
  selectionCount: number;
};

const meta = {
  title: "Data/Data View Toolbar",
  args: {
    itemCount: 128,
    selectionCount: 3
  },
  argTypes: {
    itemCount: {
      control: { type: "number", min: 0, step: 1 }
    },
    selectionCount: {
      control: { type: "number", min: 0, step: 1 }
    }
  },
  render: ({ itemCount, selectionCount }: DataViewToolbarStoryArgs) => `
    <cindor-data-view-toolbar
      title="Projects"
      description="Review active work, narrow the current scope, and run batch actions without leaving the collection view."
      item-count="${itemCount}"
      selection-count="${selectionCount}"
    >
      <cindor-badge slot="meta" tone="accent">Active workspace</cindor-badge>
      <cindor-search slot="filters" placeholder="Search projects"></cindor-search>
      <cindor-button-group slot="view-controls" attached>
        <cindor-button variant="ghost">All</cindor-button>
        <cindor-button variant="ghost">Owned</cindor-button>
        <cindor-button variant="ghost">Shared</cindor-button>
      </cindor-button-group>
      <cindor-segmented-control slot="view-controls" aria-label="View mode"></cindor-segmented-control>
      <cindor-button slot="actions" variant="ghost">Export</cindor-button>
      <cindor-button slot="actions">Create project</cindor-button>
      <span>${selectionCount > 0 ? "Bulk actions apply to the selected projects immediately." : "Select rows to unlock batch actions."}</span>
    </cindor-data-view-toolbar>
  `
};

export default meta;

export const Default = {};
