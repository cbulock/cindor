type ContextMenuStoryArgs = {
  open: boolean;
};

const meta = {
  title: "Overlays/Context Menu",
  args: {
    open: false
  },
  argTypes: {
    open: {
      control: "boolean"
    }
  },
  render: ({ open }: ContextMenuStoryArgs) => `
    <emb-context-menu ${open ? "open" : ""}>
      <div slot="trigger" style="padding: var(--space-6); border: 1px dashed var(--border); border-radius: var(--radius-lg);">
        Right click this surface
      </div>
      <emb-menu-item>Rename</emb-menu-item>
      <emb-menu-item>Duplicate</emb-menu-item>
      <emb-menu-item>Archive</emb-menu-item>
    </emb-context-menu>
  `
};

export default meta;

export const Default = {};
