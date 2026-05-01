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
    <cindor-context-menu aria-label="Context actions" ${open ? "open" : ""}>
      <div slot="trigger" style="padding: var(--space-6); border: 1px dashed var(--border); border-radius: var(--radius-lg);">
        Right click this surface
      </div>
      <cindor-menu-item>Rename</cindor-menu-item>
      <cindor-menu-item>Duplicate</cindor-menu-item>
      <cindor-menu-item>Archive</cindor-menu-item>
    </cindor-context-menu>
  `
};

export default meta;

export const Default = {};
