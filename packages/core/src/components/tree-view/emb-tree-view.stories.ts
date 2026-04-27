const meta = {
  title: "Navigation/Tree View",
  render: () => `
    <emb-tree-view>
      <emb-tree-item label="Overview"></emb-tree-item>
      <emb-tree-item label="Guides" expanded>
        <emb-tree-item label="Getting started"></emb-tree-item>
        <emb-tree-item label="Design tokens"></emb-tree-item>
      </emb-tree-item>
      <emb-tree-item label="Components" expanded>
        <emb-tree-item label="Button"></emb-tree-item>
        <emb-tree-item label="Dialog"></emb-tree-item>
      </emb-tree-item>
    </emb-tree-view>
  `
};

export default meta;

export const Default = {};
