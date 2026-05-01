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
    `<cindor-tooltip ${open ? "open" : ""} text="${text}"><cindor-button>${triggerLabel}</cindor-button></cindor-tooltip>`
};

export default meta;

export const Default = {};
