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
    <cindor-tree-item label="${label}" ${expanded ? "expanded" : ""}>
      <cindor-tree-item label="Getting started"></cindor-tree-item>
      <cindor-tree-item label="Theming"></cindor-tree-item>
    </cindor-tree-item>
  `
};

export default meta;

export const Default = {};
