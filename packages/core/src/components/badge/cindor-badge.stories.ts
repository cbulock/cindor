type BadgeStoryArgs = {
  label: string;
  tone: "neutral" | "accent" | "success";
};

const meta = {
  title: "Primitives/Badge",
  args: {
    label: "Active",
    tone: "neutral"
  },
  argTypes: {
    tone: {
      control: "radio",
      options: ["neutral", "accent", "success"]
    }
  },
  render: ({ label, tone }: BadgeStoryArgs) => `<cindor-badge tone="${tone}">${label}</cindor-badge>`
};

export default meta;

export const Default = {};

export const Success = {
  args: {
    label: "Live",
    tone: "success"
  }
};
