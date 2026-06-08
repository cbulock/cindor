const meta = {
  title: "Navigation/Tree View",
  render: () => `
    <cindor-tree-view aria-label="Project navigation">
      <cindor-tree-item label="Overview" value="overview">
        <cindor-icon slot="start" name="layout-dashboard" size="16"></cindor-icon>
      </cindor-tree-item>
      <cindor-tree-item label="Guides" expanded value="guides">
        <cindor-icon slot="start" name="book-open" size="16"></cindor-icon>
        <cindor-tree-item label="Getting started" value="guides-getting-started">
          <cindor-icon slot="start" name="flag" size="16"></cindor-icon>
        </cindor-tree-item>
        <cindor-tree-item label="Design tokens" value="guides-design-tokens">
          <cindor-icon slot="start" name="palette" size="16"></cindor-icon>
        </cindor-tree-item>
      </cindor-tree-item>
      <cindor-tree-item label="Components" expanded value="components">
        <cindor-icon slot="start" name="blocks" size="16"></cindor-icon>
        <cindor-tree-item label="Button" value="components-button">
          <cindor-icon slot="start" name="mouse-pointer-click" size="16"></cindor-icon>
        </cindor-tree-item>
        <cindor-tree-item label="Dialog" value="components-dialog">
          <cindor-icon slot="start" name="square-stack" size="16"></cindor-icon>
        </cindor-tree-item>
      </cindor-tree-item>
      <cindor-tree-item disabled label="Archived" value="archived">
        <cindor-icon slot="start" name="archive" size="16"></cindor-icon>
      </cindor-tree-item>
    </cindor-tree-view>
  `
};

export default meta;

export const Default = {};
