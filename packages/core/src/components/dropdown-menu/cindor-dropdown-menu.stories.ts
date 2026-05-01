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
    <cindor-dropdown-menu aria-label="${triggerLabel}" ${open ? "open" : ""}>
      <span slot="trigger">${triggerLabel}</span>
      <cindor-menu-item>${firstItem}</cindor-menu-item>
      <cindor-menu-item>${secondItem}</cindor-menu-item>
      <cindor-menu-item>${thirdItem}</cindor-menu-item>
    </cindor-dropdown-menu>
  `
};

export default meta;

export const Default = {};
