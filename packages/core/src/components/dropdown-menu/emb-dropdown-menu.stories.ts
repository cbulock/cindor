type DropdownMenuStoryArgs = {
  firstItem: string;
  open: boolean;
  secondItem: string;
  thirdItem: string;
  triggerLabel: string;
};

const meta = {
  title: "Components/Dropdown Menu",
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
    <emb-dropdown-menu ${open ? "open" : ""}>
      <emb-button slot="trigger">${triggerLabel}</emb-button>
      <emb-button variant="ghost">${firstItem}</emb-button>
      <emb-button variant="ghost">${secondItem}</emb-button>
      <emb-button variant="ghost">${thirdItem}</emb-button>
    </emb-dropdown-menu>
  `
};

export default meta;

export const Default = {};
