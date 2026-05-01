type ChipStoryArgs = {
  label: string;
  tone: "neutral" | "accent" | "success";
};

const meta = {
  title: "Primitives/Chip",
  args: {
    label: "Selected file",
    tone: "neutral"
  },
  render: ({ label, tone }: ChipStoryArgs) => `
    <cindor-chip tone="${tone}">${label}</cindor-chip>
  `
};

export default meta;

export const Default = {};
