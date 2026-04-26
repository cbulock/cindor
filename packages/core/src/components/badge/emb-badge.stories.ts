type BadgeStoryArgs = {
  label: string;
  tone: "neutral" | "accent" | "success";
};

const meta = {
  title: "Components/Badge",
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
  render: ({ label, tone }: BadgeStoryArgs) => `<emb-badge tone="${tone}">${label}</emb-badge>`
};

export default meta;

export const Default = {};

export const Success = {
  args: {
    label: "Live",
    tone: "success"
  }
};
