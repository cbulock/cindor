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
    <emb-popover ${open ? "open" : ""}>
      <emb-button slot="trigger">${triggerLabel}</emb-button>
      <p>${content}</p>
    </emb-popover>
  `
};

export default meta;

export const Default = {};
