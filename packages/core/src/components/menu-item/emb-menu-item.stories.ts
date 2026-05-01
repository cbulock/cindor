type MenuItemStoryArgs = {
  disabled: boolean;
  label: string;
};

const meta = {
  title: "Primitives/Menu Item",
  args: {
    disabled: false,
    label: "Edit"
  },
  render: ({ disabled, label }: MenuItemStoryArgs) => `
    <emb-menu aria-label="Item actions" style="width:min(100%, 240px);">
      <emb-menu-item ${disabled ? "disabled" : ""}>${label}</emb-menu-item>
    </emb-menu>
  `
};

export default meta;

export const Default = {};
