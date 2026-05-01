const meta = {
  title: "Navigation/Tree View",
  render: () => `
    <cindor-tree-view aria-label="Documentation navigation">
      <cindor-tree-item label="Overview"></cindor-tree-item>
      <cindor-tree-item label="Guides" expanded>
        <cindor-tree-item label="Getting started"></cindor-tree-item>
        <cindor-tree-item label="Design tokens"></cindor-tree-item>
      </cindor-tree-item>
      <cindor-tree-item label="Components" expanded>
        <cindor-tree-item label="Button"></cindor-tree-item>
        <cindor-tree-item label="Dialog"></cindor-tree-item>
      </cindor-tree-item>
    </cindor-tree-view>
  `
};

export default meta;

export const Default = {};
