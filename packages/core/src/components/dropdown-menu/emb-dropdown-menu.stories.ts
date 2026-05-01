type DropdownMenuStoryArgs = {
  firstItem: string;
  open: boolean;
  secondItem: string;
  thirdItem: string;
  triggerLabel: string;
};

const meta = {
  title: "Composites/Dropdown Menu",
  args: {
    firstItem: "Edit",
    open: true,
    secondItem: "Duplicate",
    thirdItem: "Archive",
    triggerLabel: "Actions"
  },
  argTypes: {
    open: {
      control: "boolean"
    }
  },
  render: ({ firstItem, open, secondItem, thirdItem, triggerLabel }: DropdownMenuStoryArgs) => `
    <emb-dropdown-menu aria-label="${triggerLabel}" ${open ? "open" : ""}>
      <span slot="trigger">${triggerLabel}</span>
      <emb-menu-item>${firstItem}</emb-menu-item>
      <emb-menu-item>${secondItem}</emb-menu-item>
      <emb-menu-item>${thirdItem}</emb-menu-item>
    </emb-dropdown-menu>
  `
};

export default meta;

export const Default = {};
