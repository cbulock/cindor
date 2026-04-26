type TooltipStoryArgs = {
  open: boolean;
  text: string;
  triggerLabel: string;
};

const meta = {
  title: "Components/Tooltip",
  args: {
    open: false,
    text: "Shows extra context",
    triggerLabel: "Hover me"
  },
  render: ({ open, text, triggerLabel }: TooltipStoryArgs) =>
    `<emb-tooltip ${open ? "open" : ""} text="${text}"><emb-button>${triggerLabel}</emb-button></emb-tooltip>`
};

export default meta;

export const Default = {};
