type TooltipStoryArgs = {
  open: boolean;
  text: string;
  triggerLabel: string;
};

const meta = {
  title: "Components/Tooltip",
  args: {
    open: false,
    text: "Explain why this action is disabled until the required setup is complete.",
    triggerLabel: "Why is this locked?"
  },
  render: ({ open, text, triggerLabel }: TooltipStoryArgs) =>
    `<cindor-tooltip ${open ? "open" : ""} text="${text}"><cindor-button>${triggerLabel}</cindor-button></cindor-tooltip>`
};

export default meta;

export const Default = {};
