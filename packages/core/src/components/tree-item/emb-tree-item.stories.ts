type TreeItemStoryArgs = {
  expanded: boolean;
  label: string;
};

const meta = {
  title: "Navigation/Tree Item",
  args: {
    expanded: true,
    label: "Guides"
  },
  argTypes: {
    expanded: {
      control: "boolean"
    }
  },
  render: ({ expanded, label }: TreeItemStoryArgs) => `
    <emb-tree-item label="${label}" ${expanded ? "expanded" : ""}>
      <emb-tree-item label="Getting started"></emb-tree-item>
      <emb-tree-item label="Theming"></emb-tree-item>
    </emb-tree-item>
  `
};

export default meta;

export const Default = {};
