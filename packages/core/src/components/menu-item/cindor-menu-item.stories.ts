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
    <cindor-menu aria-label="Item actions" style="width:min(100%, 240px);">
      <cindor-menu-item ${disabled ? "disabled" : ""}>${label}</cindor-menu-item>
    </cindor-menu>
  `
};

export default meta;

export const Default = {};
