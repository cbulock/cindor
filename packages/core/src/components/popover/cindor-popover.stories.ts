type PopoverStoryArgs = {
  content: string;
  open: boolean;
  triggerLabel: string;
};

const meta = {
  title: "Components/Popover",
  args: {
    content: "Popover content built on native disclosure behavior.",
    open: true,
    triggerLabel: "Open popover"
  },
  argTypes: {
    open: {
      control: "boolean"
    }
  },
  render: ({ content, open, triggerLabel }: PopoverStoryArgs) => `
    <cindor-popover ${open ? "open" : ""}>
      <cindor-button slot="trigger">${triggerLabel}</cindor-button>
      <p>${content}</p>
    </cindor-popover>
  `
};

export default meta;

export const Default = {};
